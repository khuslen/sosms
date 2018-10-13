const mediasoupClient = require("mediasoup-client");
const uuidGenerator = require("uuid");

let btnLogin;
let userId;

document.addEventListener("DOMContentLoaded", function() { 
   // Getting webpage elements
    divRoomSelection = document.getElementById("roomSelection");

    inputRoom = document.getElementById("room");
    inputName = document.getElementById("name");

    btnLogin = document.getElementById("loginBtn");
    // Registering a click event for the login button
    btnLogin.onclick = function() {
        console.log("Login button triggered");
        connectToWebSocketServer();
    }
}, false);

let ws;
function connectToWebSocketServer() {
    ws = new WebSocket("ws://localhost:8000");
    ws.onopen = function() {
        console.log("Connected!");

        // Sending message to server
        // TODO: Read userId from URL
        const data = {
            userId: userId
        };
        const reqId = sendCmd("login", data);

        ws.onmessage = function(message) {
            const msg = JSON.parse(message.data);
            console.log("Received from server:", msg);
        };
    };
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
