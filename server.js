require("dotenv").config();
var express = require("express")
var app = express()
app.use(express.json())
app.use(express.static("."))

app.post("/ai", function(req, res) {
    fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + process.env.API_KEY
        },
        body: JSON.stringify(req.body)
    })
    .then(function(r) { return r.json() })
    .then(function(data) { res.json(data) })
})

app.listen(3000)
console.log("running on 3000")