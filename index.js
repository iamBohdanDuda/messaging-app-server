const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server: server });


wss.on('connection', function (ws) {    
    ws.on('message', (message) => {
        const mess = JSON.parse(message);
        switch (mess.type) {
            case 'new_message':
                wss.clients.forEach(client => {
                    const { receiverId, text, date } = mess;
                    if (client.userId === receiverId) {
                        client.send(JSON.stringify({ type: 'new_message', senderId: ws.userId, receiverId, text, date }));
                        ws.send(JSON.stringify({ type: 'new_message', senderId: ws.userId, receiverId, text, date }))
                    }
                })
                break;
        
            case 'new_user_connected':
                ws.username = mess.username;
                ws.userId = Date.now();

                
                wss.clients.forEach(cl => {
                    if (cl.userId !== ws.userId) {
                        ws.send(JSON.stringify({ type: 'get_users_list', username: cl.username, userId: cl.userId }))
                    }
                })
                
                wss.clients.forEach(client => {
                    if (client.userId !== ws.userId) {
                        client.send(JSON.stringify({ type: 'new_user_connected', username: ws.username, userId: ws.userId }))
                    }
                });
                break;
            default:
                break;
        }
    })

    ws.on('close', function () {
        wss.clients.forEach(client => {
            client.send(JSON.stringify({ type: 'user_disconnected', userId: ws.userId }))
        });
    });
});



server.listen(5000, () => console.log('started af port 5000'));