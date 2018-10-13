const mediasoupClient = require("mediasoup-client");
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
   // Getting webpage elements
    divRoomSelection = document.getElementById("roomSelection");

    yesBtn = document.getElementById("yesBtn");
    noBtn = document.getElementById("noBtn");

    // Registering click events for buttons
    yesBtn.onclick = function() {
        console.log("Yes button clicked");

        const msgData = {
            safe: "Y"
        };
        const reqId = sendCmd("safetyBtn", msgData);
    }

    noBtn.onclick = function() {
        console.log("No button clicked");

        const msgData = {
            safe: "N"
        };
        const reqId = sendCmd("safetyBtn", msgData);
    }

    workBtn = document.getElementById("workBtn");
    homeBtn = document.getElementById("homeBtn");
    
    workBtn.onclick = function() {
        console.log("Yes, at Work");

        const msgData = {
            location: "W"
        };
        const reqId = sendCmd("locationBtn", msgData);
    }

    homeBtn.onclick = function() {
        console.log("No, not at Work");

        const msgData = {
            location: "H"
        };
        const reqId = sendCmd("locationBtn", msgData);
    }
}, false);

let ws;
function connectToWebSocketServer() {
    ws = new WebSocket("ws://localhost:8000");
    ws.onopen = function() {
        console.log("Connected!");

        // Sending message to server
        userId = getUserId();

        const data = {
            userId: userId
        };
        const reqId = sendCmd("login", data);

        ws.onmessage = function(message) {
            const msg = JSON.parse(message.data);
            console.log("Received from server:", msg);

            if (msg.res == "incident") {
                updateIncidentPanel(msg.data);
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
    document.getElementById("incidentExtras").style.display = "block";
}

function getUserId() {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)  {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === "userId") {
            return sParameterName[1];
        }
    }
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
