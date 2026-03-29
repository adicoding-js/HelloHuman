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
    socket.emit("findMatch");
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
        var random = Math.random();
        var roundtype = random < 0.33 ?"chat" : random < 0.66 ? "doodle" : "question";
        if (roundtype == "doodle") {
            document.getElementById("doodleScreen").style.display = "block";
            document.getElementById("msgbox").style.display = "none";
            document.getElementById("typingIndicator").style.display = "none";
            document.getElementById("myInput").style.display = "none";
            document.getElementById("sendButton").style.display = "none";
        } else if (roundtype == "question") {
            document.getElementById("doodleScreen").style.display = "none";
            document.getElementById("msgbox").style.display = "none";
            document.getElementById("typingIndicator").style.display = "none";
            document.getElementById("myInput").style.display = "none";
            document.getElementById("questionScreen").style.display = "block";
            document.getElementById("sendButton").style.display = "none";
            var questions = ["Describe the internet to someone who has never seen it.","Which year would you time travel to and why?","What's something you find interesting that most people don't?","If you could have a conversation with any fictional character, who would it be and why?","What's a skill you wish you had and why?","If you could instantly learn any language, which one would you choose and why?","What's a memorable dream you've had recently?","If you could live in any fictional universe, which one would it be and why?","What's a piece of advice you would give to your younger self?","If you could have any superpower, what would it be and how would you use it?"];
            document.getElementById("question").innerHTML = questions[Math.floor(Math.random() * questions.length)];
        } else {
                document.getElementById("doodleScreen").style.display = "none";
                document.getElementById("msgbox").style.display = "block";
                document.getElementById("myInput").style.display = "";
                document.getElementById("sendButton").style.display = "";
                InputLocked(false);
                playerturn = true;
        }
        startTimer();       
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
    if (room) {
        socket.emit("chatMsg", {room: room, msg: x });
    } else {
        playerturn = false;
        InputLocked(true);
        getAireply(x);
    }
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
    if (room) {
        socket.emit("submitVote", { room: room, vote: x });
        document.getElementById("resultsScreen").style.display = "block";
        document.getElementById("resultText").innerHTML = "Waiting for other player...";
    } else {
        var opp = "ai";
        var endString = "";
        if (x == opp) {
            endString = "You were right! The opponent was an AI.";
            addScore();
            localStorage.setItem("score", Score);
        } else {
            endString = "Wrong! The opponent was actually an AI.";
        }
        document.getElementById("resultsScreen").style.display = "block";
        document.getElementById("resultText").innerHTML = endString;
    }
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
    document.getElementById("doodleScreen").style.display = "none";
    document.getElementById("msgbox").style.display = "block";
    document.getElementById("myInput").style.display = "";
    document.getElementById("sendButton").style.display = "";
    document.getElementById("questionScreen").style.display = "none";
    document.getElementById("questionsInput").value + "";
    document.getElementById("questionResultsScreen").style.display = "none";
    startMatchmaking();
}

var painting = false;
var ctx = document.getElementById("doodleCanvas").getContext("2d");

document.getElementById("doodleCanvas").onmousedown = function(e) {
    painting = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}
document.getElementById("doodleCanvas").onmousemove = function(e) {
    if (!painting) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}
document.getElementById("doodleCanvas").onmouseup = function() {painting = false;}
document.getElementById("doodleCanvas").onmouseleave = function() {painting = false;}

var cnv = document.getElementById("doodleCanvas");

cnv.addEventListener("touchstart", function (e) {
        e.preventDefault();
        painting = true;
        var t = e.touches[0];
        var r=cnv.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(t.clientX - r.left, t.clientY - r.top);
}, {passive: false})

cnv.addEventListener("touchmove", function(e) {
    e.preventDefault();
    if (!painting) return;
    var t = e.touches[0];
    var r=cnv.getBoundingClientRect();
    ctx.lineTo(t.clientX-r.left, t.clientY - r.top);
    ctx.stroke();
}, {passive: false})

cnv.addEventListener("touchend", function() {painting = false;})

function submitQuestionAnswer() {
    var ans = document.getElementById("questionsInput").value;
    if (!ans) return;
    document.getElementById("questionScreen").style.display = "none";
    clearInterval(roundTimer);
    document.getElementById("titleText").innerHTML = "Game Window";
    var theQuestion = document.getElementById("question").innerHTML;
    fetch("/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "qwen/qwen3-8b",
            max_tokens: 80,
            messages: [
                { role: "system", content: "/no_think answer the question in 1-2 sentences. casual, lowercase, like a real person. no punctuation at end." },
                { role: "user", content: theQuestion }
            ]
        })
    })
    .then(function(r) { return r.json() })
    .then(function(data) {
        var aiAns = data.choices[0].message.content;
        var coin = Math.random() < 0.5;
        document.getElementById("answerA").innerHTML = ans;
        document.getElementById("answerB").innerHTML = aiAns;
        document.getElementById("chatScreen").style.display = "none";
        document.getElementById("questionResultsScreen").style.display = "block";
    })
}

function goToVote() {
    document.getElementById("questionResultsScreen").style.display = "none";
    document.getElementById("voteScreen").style.display = "block";
}

var socket = io();
var room = null;

socket.on("connect", function() {
    console.log("connected to server", socket.id)
})
socket.on("matchFound", function(data) {
    console.log("match found", data.room)
    room = data.room;
    clearInterval(barTimer);
    document.getElementById("matchMakingScreen").style.display = "none";
    document.getElementById("chatScreen").style.display = "block";
    document.getElementById("doodleScreen").style.display = "none";
    document.getElementById("msgbox").style.display = "block";
    document.getElementById("myInput").style.display = "";
    document.getElementById("sendButton").style.display = "";
    InputLocked(false);
    playerturn = true;
})
socket.on("timerTick", function(data) {
    if (!room) return;
    document.getElementById("titleText").innerHTML = "Game Window - " + data.t + "s";
})

socket.on("timerDone", function() {
    if (!room) return;
    clearInterval(roundTimer);
    document.getElementById("chatScreen").style.display = "none";
    document.getElementById("questionScreen").style.display = "none";
    document.getElementById("questionResultsScreen").style.display = "none";
    document.getElementById("voteScreen").style.display = "block";
    document.getElementById("titleText").innerHTML = "Game Window";
})

socket.on("chatMsg", function(data) {
    var msgbox = document.getElementById("msgbox");
    var d = document.createElement("div");
    d.innerHTML = "Stranger: " + data.msg;
    msgbox.appendChild(d);
    msgbox.scrollTop = msgbox.scrollHeight;
})

socket.on("voteResults", function(data) {
    var myVote = data.votes[socket.id];
    var keys = Object.keys(data.votes);
    var otherKey = keys[0] == socket.id ? keys[1] : keys[0];
    var otherVote = data.votes[otherKey];
    var opp = "human";
    var endString = "";
    if (myVote == opp) {
        endString = "You were right! The opponent was a Human.";
        addScore();
        localStorage.setItem("score", Score);
    } else {
        endString = "Wrong! The opponent was actually a Human.";
    }
    endString += "<br><small style='font:11px Tahoma;color:#666;'>They voted: " + otherVote + "</small>";
    document.getElementById("resultText").innerHTML = endString;
})