const mediasoupClient = require("mediasoup-client");
const uuidGenerator = require("uuid");

let userId;
let formData;

document.addEventListener("DOMContentLoaded", function() { 

    connectToWebSocketServer();
   // Getting webpage elements
    divRoomSelection = document.getElementById("roomSelection");

    document.querySelector('form').addEventListener('submit', (e) => {
        formData = new FormData(e.target);
        
        createIncident();

        document.getElementById("creation").style.display = "none";
        document.getElementById("existing").style.display = "block";
    });

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

            if (msg.res === "login") {
                console.log("login msg type");
                sendCmd("getUpdates", {});
            } else if (msg.res === "incident") {
                console.log("incident msg type");
                updateIncidentPanel(msg.data);
            } else if (msg.res === "getUpdates" || msg.res === "newUpdate") {
                console.log("update msg type");
                updateUpdatesSection(msg.data);
            }
        };
    };
}

function createIncident() {
    const data = {
        address: formData.get("incident-addr"),
        name: formData.get("incident-name"),
        desc: formData.get("incident-desc"),
        severity: "S" + formData.get("incident-sev"),
        incident: "true"
    };
    sendCmd("createIncident", data);
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
    // document.getElementById("incidentSafety").style.display = "block";
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
