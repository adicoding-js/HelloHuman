require("dotenv").config();

var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var waitingPlayer = null;

app.use(express.json());
app.use(express.static("."));

app.post("/ai", function(req, res) {
    fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + process.env.API_KEY
        },
        body: JSON.stringify(req.body)
    })
    .then(r => r.json())
    .then(data => res.json(data));
});
var voteData = {};
var doodleData = {};
var answerData = {};

io.on("connection", function(socket) {
    console.log("someone connected", socket.id)

    socket.on("findMatch", function() {
        if (waitingPlayer == null) {
            waitingPlayer = socket;
            console.log("waiting for the other player", socket.id)
        } else {
            var room = "room_" + Date.now();
            socket.join(room);
            waitingPlayer.join(room);
            var r2 = Math.random();
var roundtype = r2 < 0.33 ? "chat" : r2 < 0.66 ? "doodle" : "question";
var questions = ["Describe the internet to someone who has never seen it.","Which year would you time travel to and why?","What's something you find interesting that most people don't?","If you could have a conversation with any fictional character, who would it be and why?","What's a skill you wish you had and why?","If you could instantly learn any language, which one would you choose and why?","What's a memorable dream you've had recently?","If you could live in any fictional universe, which one would it be and why?","What's a piece of advice you would give to your younger self?","If you could have any superpower, what would it be and how would you use it?"];
var question = questions[Math.floor(Math.random() * questions.length)];
io.to(room).emit("matchFound", { room: room, roundtype: roundtype, question: question });
            console.log("match made", room)
            waitingPlayer = null;
            var t = 30;
            var rt = setInterval(function() {
                t = t-1;
                io.to(room).emit("timerTick", { t: t});
                if ( t<= 0) {
                    clearInterval(rt);
                    io.to(room).emit("timerDone");
                }
            }, 1000);
        }
    })

    socket.on("chatMsg", function(data) {
        socket.to(data.room).emit("chatMsg", { msg: data.msg });
    })

    socket.on("submitVote", function(data) {
        var r = data.room;
        if (!voteData[r]) voteData[r] = {};
        voteData[r][socket.id] = data.vote;
        console.log("vote in", r, voteData[r]);
        var keys = Object.keys(voteData[r]);
        if (keys.length == 2) {
            io.to(r).emit("voteResults", { votes: voteData[r] });
            voteData[r] = {};
        }
        })

    socket.on("disconnect", function() {
        if (waitingPlayer == socket) waitingPlayer = null;
        console.log("player left", socket.id)
    })
    socket.on("submitDoodle", function(data) {
    var r = data.room;
    if (!doodleData[r]) doodleData[r] = {};
    doodleData[r][socket.id] = data.img;
    var keys = Object.keys(doodleData[r]);
    if (keys.length == 2) {
        io.to(r).emit("doodleResults", { imgs: doodleData[r] });
        doodleData[r] = {};
    }
    })
    socket.on("submitAnswer", function(data) {
        var r = data.room;
        if (!answerData[r]) answerData[r] = {};
        answerData[r][socket.id] = data.answer;
        var keys = Object.keys(answerData[r]);
        if (keys.length == 2) {
            io.to(r).emit("answerResults", { answers: answerData[r] });
            answerData[r] = {};
        }
    })

})

http.listen(process.env.PORT || 3000);
console.log("running");