var theBox = document.getElementById("theBox");
var startButton = document.getElementById("startButton");

function closeIt() {
    console.log("button works")
    theBox.style.display = "none";
}

startButton.addEventListener("click", function() {
    theBox.style.display = "block";
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


if (h >= 12) {
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
document.getElementById("myClock").innerHTML = tempDiv;
}
console.log(startButton)

var barWidth = 0;
var barTimer;

function startMatchmaking() {
    console.log("Finding Players")
    document.getElementById("mainScreen").style.display = "none";
    document.getElementById("matchMakingScreen").style.display = "block";
    barWidth = 0;
    barTimer = setInterval(doBar, 80);
}

function doBar() {
    barWidth = barWidth + 1;
    var px = barWidth * 3;
    document.getElementById("theBar").style.width = px + "px";
    document.getElementById("barNum").innerHTML = barWidth + "%";
    console.log("bar", barWidth)
    if (barWidth >= 100) { 
        clearInterval(barTimer);
        console.log("DONE")
        document.getElementById("matchMakingScreen").style.display = "none";
        document.getElementById("chatScreen").style.display = "block";
        startTimer();
    }
}

function sendMessage() {
    var x = document.getElementById("myInput").value;
    console.log("sending", x)
    var msgbox = document.getElementById("msgbox");
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML ="You: " + x;
    msgbox.appendChild(tempDiv);
    document.getElementById("myInput").value = "";
    msgbox.scrollTop = msgbox.scrollHeight;
}

var timeLeft = 30;
var roundTimer;

function startTimer() {
    timeLeft = 30;
    roundTimer = setInterval(doTimer, 1000);
}

function doTimer () {
    timeLeft = timeLeft - 1;
    document.getElementById("titleText").innerHTML = "Game Window - " + timeLeft + "s";
    console.log("timer", timeLeft)
if (timeLeft <= 0) {
    clearInterval(roundTimer);
    console.log("timer over")
    document.getElementById("chatScreen").style.display = "none";
    document.getElementById("voteScreen").style.display = "block";
    document.getElementById("titleText").innerHTML = "Game Window";
}}

function doVote(x) {
    console.log("voted", x)
    document.getElementById("voteScreen").style.display = "none";
    document.getElementById("resultsScreen").style.display = "block";
    

     var opp = "ai";
    var endString = "";
    if (x == opp) {
        endString = "You were right! The opponent was an AI.";
        console.log("correct")
        addScore();
        localStorage.setItem("score", Score);
    } else {
        endString = "Wrong! The opponent was actually an AI.";
        console.log("wrong")
    }
    document.getElementById("resultText").innerHTML = endString;
}

var Score = localStorage.getItem("score") ? parseInt(localStorage.getItem("score")) : 0;
document.getElementById("scoreDisplay").innerHTML = Score;
function addScore() {
    Score = Score + 1;
    document.getElementById("scoreDisplay").innerHTML = Score;
}

function playagain() {
    console.log("here")
    document.getElementById("resultsScreen").style.display = "none";
    document.getElementById("msgbox").innerHTML = "";
    startMatchmaking();
}