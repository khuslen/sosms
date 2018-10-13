const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
// const database = require("./database");
const http = require("http");
// const fs = require("fs");
const WebSocketServer = require("ws").Server;

let users = {};

MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;

    const db = client.db("userList");

    db.collection("Users").find({}).toArray(function(err, data) {
        users = data;
    });
});

// WebSocket Server
const httpsServer = http.createServer(function (request, response) {
    // console.log("request", request.url);
    let userId = request.url.split("?")[1];
    userId = userId.split("=")[1];
    // console.log("userId", userId);
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end("Hello " + userId);
});
httpsServer.listen(8000);

const wss = new WebSocketServer({
  server: httpsServer
});

wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        const msg = JSON.parse(message);
        console.log("RECEIVED", msg);
        switch (msg.req) {
            case "login":
            login(ws, msg);
            break;
            case "getUserInfo":
            getUserInfo(ws, msg);
            break;
            case "confirmSafety":
            confirmSafety(ws, msg);
            break;
            default:
            break;
        }
    });
    try {
        // ws.send(JSON.stringify({"res": "Connected to server"}));
        ws.send(JSON.stringify({
            "res": "incident",
            "data": {
                "address": "1 Office Street",
                "name": "Fire on Level 14",
                "desc": "An electrical fire has broken out in the Level 14 Server Room at 7:51am AEST this morning.",
                "severity": "S2",
                "incident": "true"
            }
        }));
    } catch (err) {
        console.log(err);
    }
});

function sendUpdates(ws, updates) {
    ws.send(JSON.stringify({
        "res": "updates",
        "data": {
            "updates": [
                {
                    "time": "7:51AM 14/10/2018",
                    "text": "Incident occurred."
                },
                {
                    "time": "7:53AM 14/10/2018",
                    "text": "Evacuation commenced."
                },
                {
                    "time": "7:53AM 14/10/2018",
                    "text": "Emergency services have been contacted."
                },
                {
                    "time": "8:03AM 14/10/2018",
                    "text": "Emergency services have arrived."
                }
            ]
        }
    }))
}

function reply(ws, response) {
    ws.send(JSON.stringify({"res": response}));
}

function login(ws, msg) {

}

function getUserInfo(ws, msg) {
    // console.log(users);
    reply(ws, users);
}

function confirmSafety(ws, msg) {
    if (msg.reply !== "Y" && msg.reply !== "N") {
        reply(ws, "Please send a valid response!");
    } else if (msg.reply === "Y") {

    } else if (msg.reply === "N") {

    }
}

function broadcast(msg, senderId) {
  
}
