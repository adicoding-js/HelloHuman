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
            io.to(room).emit("matchFound", { room: room });
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
})

http.listen(process.env.PORT || 3000);
console.log("running");