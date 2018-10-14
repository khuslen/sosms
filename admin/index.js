const uuidGenerator = require("uuid");

let userId;

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
            }
        };
    };
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
