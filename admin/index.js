const uuidGenerator = require("uuid");

let userId;
let incident = {
    name: "Fire on Level 14",
    address: "1 Office Street",
    sev: 1,
    type: "Fire",
    desc: "some words about the incident"
};

document.addEventListener("DOMContentLoaded", function() { 

    connectToWebSocketServer();

    sendBtn = document.getElementById("sendBtn");

    // Registering click events for buttons
    sendBtn.onclick = function() {
        console.log("Send button clicked");
        const updateInfoElement = document.getElementById("updateInfo");
        const updateInfo = updateInfoElement.value;

        if (updateInfo === "") {
            console.log("Update info required!");
        } else {
            const msgData = {
                update: updateInfo
            };
        const reqId = sendCmd("sendUpdate", msgData);
        }
    }
}, false);

let ws;
function connectToWebSocketServer() {
    ws = new WebSocket("ws://localhost:8000");
    ws.onopen = function() {
        console.log("Connected!");

        // Sending message to server
        userId = "admin";

        const data = {
            userId: userId
        };
        const reqId = sendCmd("login", data);

        ws.onmessage = function(message) {
            const msg = JSON.parse(message.data);
            console.log("Received from server:", msg);

            if (msg.res === "login") {
                sendCmd("getUpdates", {});
            } else if (msg.res === "incident") {
                updateIncidentPanel(msg.data);
            } else if (msg.res === "getUpdates") {
                updateUpdatesSection(msg.data);
            } else if (msg.res === "newUpdate") {
                updateUpdatesSection(msg.data);
            }
        };
    };
}

function updateIncidentPanel(msgData) {
    document.getElementById("incidentPanelTitle").innerHTML = "Current Incidents at " + msgData.address;
    if (msgData.incident) {
        document.getElementById("incidentDesc").innerHTML = "\
            <h3>" + msgData.name.toUpperCase() + "</h3>\
            <div class=\"ui clearing divider\"></div>\
            <p>" + msgData.desc + "</p>\
        ";
        
        const panels = document.getElementsByClassName("incidentPanel");
    }
    document.getElementById("updatePanel").style.display = "block"; // delete this later and use proper updateUpdatesSection()
}

function updateUpdatesSection(msgData) {
    document.getElementById("updatePanel").style.display = "block";

    let allUpdates = "";

    for (let i = msgData.updates.length - 1; i >= 0; i--) {
        allUpdates += "<div class=\"step\">\
            <div class=\"title\"><i class=\"info circle icon\"></i> " + msgData.updates[i].time + "</div>\
            <div class=\"description\">" + msgData.updates[i].text + "</div>\
            </div>\
        ";
    }

    document.getElementById("updates").innerHTML = allUpdates;
}

function sendCmd(req, data) {
    const reqId = uuidGenerator.v4();
    const msg = {
        req: req,
        reqId: reqId,
        userId: userId,
        data: data
    };
    ws.send(JSON.stringify(msg));
    return reqId;
}
