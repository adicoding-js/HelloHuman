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
        playerturn = true;
        InputLocked(false);
    }
}

var playerturn = true;
function InputLocked(locked) {
    var inputField = document.getElementById("myInput");
    var sendButton = document.getElementById("sendButton");
    inputField.disabled = locked;
    sendButton.disabled = locked;
    if (locked) {
        inputField.style.backgroundColor = "#d0d0d0";
        sendButton.style.opacity = "1";
    }
}


function sendMessage() {
    if (!playerturn) { console.log("Not User's Turn"); return;}
    var x = document.getElementById("myInput").value;
    console.log("sending", x)
    var msgbox = document.getElementById("msgbox");
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML ="You: " + x;
    msgbox.appendChild(tempDiv);
    document.getElementById("myInput").value = "";
    msgbox.scrollTop = msgbox.scrollHeight;
    playerturn = false;
    InputLocked(true);
    getAireply(x);
}

function getAireply(playerMessage) {
    document.getElementById("typingIndicator").style.display = "block";
    fetch("/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "qwen/qwen3-8b",
            max_tokens: 80,
            messages: [
                { role: "system", content: "/no_think you are a real person chatting online. keep replies very short, 1 sentence max usually. lowercase. no punctuation at the end. typos sometimes. say 'lol' or 'idk' or 'ngl' occasionally but not every message. sometimes just reply with one word. never ask more than one question. if something is boring just say so. never say you're an AI. never say certainly, absolutely, of course, great, happy to help. you get distracted. you have a vibe." },
                { role: "user", content: playerMessage }
            ]
        })
    })
    .then(function(response) { return response.json() })
    .then(function(data) {
        console.log(data)
        if (!data.choices) { console.log("api error", data); return; }
        var content = data.choices[0].message.content || data.choices[0].message.reasoning_content;
        var typingDelay = content.length * 38;
        typingDelay = Math.min(typingDelay, 3500);
        typingDelay = Math.max(typingDelay, 600);
        setTimeout(function() {
            document.getElementById("typingIndicator").style.display = "none";
            var msgbox = document.getElementById("msgbox");
            var replyDiv = document.createElement("div");
            replyDiv.innerHTML = "Stranger: " + content;
            msgbox.appendChild(replyDiv);
            msgbox.scrollTop = msgbox.scrollHeight;
            playerturn = true;
            InputLocked(false);
            console.log("ai replied, player turn now")
        }, typingDelay);
    })
    .catch(function(err) {
        console.log("fetch failed", err)
        document.getElementById("typingIndicator").style.display = "none";
        playerturn = true;
        InputLocked(false);
    })
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
    playerturn = true;
    InputLocked(true);
    startMatchmaking();
}