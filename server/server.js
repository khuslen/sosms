const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
// const database = require("./database");
const http = require("http");
// const fs = require("fs");
const WebSocketServer = require("ws").Server;

// Twilio
const accountSid = 'AC38223b55b9e26c080f83b927eb319804';
const authToken = '1538f540ab6ef424b4ac1a18e353ebd5';
const twilioClient = require('twilio')(accountSid, authToken);

let users = {};

let connectedClient;

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
            case "safetyBtn":
                safetyBtn(ws, msg);
                break;
            case "locationBtn":
                locationBtn(ws, msg);
                break;
            case "sendSms":
                sendSms(ws, msg);
                break;
            case "sendUpdate":
                sendUpdate(ws, msg);
                break;
            case "getUpdates":
                getUpdates(ws, msg);
                break;
            default:
                break;
        }
    });
    try {
        const data = {
            address: "1 Office Street",
            name: "Fire on Level 14",
            desc: "An electrical fire has broken out in the Level 14 Server Room at 7:51am AEST this morning.",
            severity: "S2",
            incident: "true"
        };
        reply(ws, "incident", data);
    } catch (err) {
        console.log(err);
    }
});

function getUpdates(ws, updates) {
    const data = {
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
    };
    reply(ws, "getUpdates", data);
}

function reply(ws, res, data) {
    if (ws) {
        ws.send(JSON.stringify({
          res: res,
          data: data
        }));
    }
}

function login(ws, msg) {
    if (!msg.data.hasOwnProperty("userId")) {
        reply(ws, "login", "Please provide user ID!");
    } else {
        ws.userId = msg.data.userId;
        reply(ws, "login", "Successful login!");
    }
}

function getUserInfo(ws, msg) {
    reply(ws, "getUserInfo", users);
}

function safetyBtn(ws, msg) {
    if (msg.data.safe !== "Y" && msg.data.safe !== "N") {
        reply(ws, "error", "Please send a valid safety response!");
    } else if (msg.data.safe === "Y") {
        reply(ws, "safetyBtn", {
            info: `Thank you for marking yourself as safe. Please
                  continue to follow the instructions of your local
                  Fire Warden.`
        });
    } else if (msg.data.safe === "N") {
        reply(ws, "safetyBtn", {
            info: `Please continue to follow the instructions of
                  your local Fire Warden.`
        });
    }
}

function locationBtn(ws, msg) {
    if (msg.data.location !== "W" && msg.data.location !== "H") {
        reply(ws, "error", "Please send a valid location response!");
    } else if (msg.data.location === "W") {
        reply(ws, "locationBtn", {
            info: `Please follow the instructions of your local
                  Fire Warden. Continue to monitor updates via SMS and through
                  the online Emergency Updates page. Thank you.`,
            fireWardens: [
                {
                    name: "Joshua Bennett",
                    location: "Level 1"
                },
                {
                    name: "Suzanne Smythe",
                    location: "Level 2"
                },
                {
                    name: "John Ramsey",
                    location: "Level 3"
                },
                {
                    name: "Aiden Sampson",
                    location: "Level 4"
                },
            ]
        });
    } else if (msg.data.location === "H") {
        reply(ws, "locationBtn", {
            info: `Please do not come into work today. Further 
                  updates will be given via SMS and on the online Emergency 
                  Updates page. Thank you.`,
        });
    }
}

function sendSms(ws, msg) {
    const destination = msg.data.to;
    const messageBody = msg.data.body;
    
    const twilioNumber = '+61427702894';

    twilioClient.messages
      .create({
        body: messageBody,
        from: twilioNumber,
        to: destination
      })
      .then(message => {
        console.log(message.sid);
        reply(ws, "sendSms", "Message successfully sent!");
      })
      .done();
}

function sendUpdate(ws, msg) {
    const updateInfo = msg.data.update;
    reply(connectedClient, "newUpdate", updateInfo);
}
