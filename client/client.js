const mediasoupClient = require("mediasoup-client");
const uuidGenerator = require("uuid");

let userId;

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

        document.getElementById("safe").style.display = "block";
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

            if (msg.res === "login") {
                console.log("login msg type");
                sendCmd("getUpdates", {});
                sendCmd("getIncident", {});
            } else if (msg.res === "incident") {
                console.log("incident msg type");
                updateIncidentPanel(msg.data);
            } else if (msg.res === "getUpdates" || msg.res === "newUpdate") {
                console.log("update msg type");
                updateUpdatesSection(msg.data);
            } else if (msg.res === "safetyBtn") {
                console.log("safetyBtn msg type");
                updateSafetyInstructions(msg.data);
            } else if (msg.res === "locationBtn") {
                console.log("locationBtn msg type");
                updateLocationInstructions(msg.data);
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
    document.getElementById("incidentSafety").style.display = "block";
}

function updateSafetyInstructions(msgData) {
    document.getElementById("safe").innerHTML = msgData.info;
}

function updateLocationInstructions(msgData) {
    let htmlString = msgData.info + "\
    <br>\
    <br>\
    <table class=\"ui unstackable very basic table\">\
        <thead>\
            <tr><th>Fire Warden</th>\
            <th>Level</th>\
        </tr></thead>\
    ";

    for (let i = 0; i < msgData.fireWardens.length; i++) {
        htmlString += "\
            <tr>\
                <td>\
                    " + msgData.fireWardens[i].name + "\
                </td>\
                <td>\
                    " + msgData.fireWardens[i].location + "\
                </td>\
            </tr>\
        ";
    }

    htmlString += "\
        </tbody>\
    </table>";

    document.getElementById("work").innerHTML = htmlString;
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
