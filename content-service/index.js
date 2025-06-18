const express=require("express");
const app=express();
const dotenv=require("dotenv");
const cors=require("cors");
const cookieParser=require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const contentRoute=require("./routes/content-route");
const ConnetDB=require("./models/connection");

dotenv.config({path:"./config.env"});

app.use(express.json());

app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(
    cors({
      origin: "http://localhost:5173", // React app URL
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
      allowedHeaders: "Content-Type",
    })
  );

app.use("/storage/video", express.static("storage/video"));

app.use("/storage/image", express.static("storage/image"));
app.use("/api/content",contentRoute);

ConnetDB();


// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// Store users in rooms
const rooms = {}; // roomId => { instructorSocketId, instructorEmail, students: [{ socketId, email }] }

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  // Instructor starts live
  socket.on("start-live", ({ roomId, email }) => {
    console.log(`🎥 Instructor ${email} started live in room: ${roomId}`);

    socket.join(roomId);
    rooms[roomId] = {
      instructorSocketId: socket.id,
      instructorEmail: email,
      students: []
    };

    // Optional: notify others
    io.to(roomId).emit("instructor-online", { email });
  });

  // Student joins room
  socket.on("join-room", ({ roomId, email }) => {
    console.log(`🎓 Student ${email} joined room: ${roomId}`);

    socket.join(roomId);

    if (rooms[roomId]) {
      rooms[roomId].students.push({ socketId: socket.id, email });
      io.to(rooms[roomId].instructorSocketId).emit("student-joined", {
        studentSocketId: socket.id,
        email
      });
    } else {
      rooms[roomId] = {
        instructorSocketId: null,
        students: [{ socketId: socket.id, email }]
      };
    }
  });

  // Relay WebRTC offer
  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("remote-offer", { offer, instructorSocketId: socket.id });
  });

  // Relay WebRTC answer
  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", { answer });
  });

  // Relay ICE candidates
  socket.on("ice-candidate", ({ candidate, to }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  // Group chat message
  socket.on("chat-message", ({ roomId, email, message }) => {
    console.log(`💬 Message from ${email} in room ${roomId}: ${message}`);
    io.to(roomId).emit("chat-message", {
      email,
      message,
      timestamp: Date.now()
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (room.instructorSocketId === socket.id) {
        io.to(roomId).emit("instructor-left");
        delete rooms[roomId];
        break;
      }

      const index = room.students.findIndex(s => s.socketId === socket.id);
      if (index !== -1) {
        room.students.splice(index, 1);
        io.to(room.instructorSocketId).emit("student-left", {
          socketId: socket.id
        });
        break;
      }
    }
  });
});

server.listen(process.env.PORT,()=>{
    console.log(`Content service is running on port ${process.env.PORT}`);
});