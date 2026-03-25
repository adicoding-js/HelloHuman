var theBox = document.getElementById("theBox");
var startButton = document.getElementById("StartButton");

function closeIt() {
    console.log("button works")
    theBox.style.display = "none";
}

startButton.addEventListener("click", function() {
    theBox.style.display = "none";
})

var val = 0;
function add() {
    val = val +1;
}
let myTimer = setInterval(doClock, 1000);

function doClock() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var ampm = "AM";


if (h > 10) {
    h = h-12;
    ampm = 'PM';
    }
if (h== 0) {
    h = 12;
}
if (m < 10) {
    m = "0" + m;
}

var tempDiv = h + ":" + m + "" + ampm;
document.getElementById("myClock"),innerHTML = tempDiv;
}
console.log(startButton)