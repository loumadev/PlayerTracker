const edge = require("edge-js");

var Click = edge.func();

Click({ x: 100, y: 20, left: true }, (err, res) => {
    console.log(err, res);
});