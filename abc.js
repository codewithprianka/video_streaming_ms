console.log("ready for starting");
var a =30;
var b = 20;
Promise.resolve()
.then(() => {
    console.log("Promise resolved");
})
process.nextTick(() => {
    console.log("Next tick executed");
});
setImmediate(() => {
    console.log("Immediate executed");
});
setTimeout(() => {
    console.log("Timeout executed");
}, 0);  
function add(x, y) {
    return x + y;
}
console.log("code executed");
var c=add(a, b);

console.log("Sum:", c);



// const express = require('express');
// const app=express();

// app.get('/user', (req, res,next) => {
//     res.send('Hello World!');
//     next();
// },(req, res,next) => {
//     res.send('1st Hello World!');
//     next();
// },(req, res,next) => {
//     res.send('2nd Hello World!');
//     next();
// },(req, res,next) => {
//     res.send('3rd Hello World!');
//     next();
// },(req, res,next) => {
//     res.send('4th Hello World!');
//     next();
// });


// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });

//will ignore all get from 2nd cz res.send() have been sent once.
//dont use it then next() will work