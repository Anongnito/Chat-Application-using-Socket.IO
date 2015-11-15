/**
 * Created by Anongnito on 10/11/2015.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var people = {};
var socketID = {};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    socket.on("join", function (name) {
        people[socket.id] = name;
        socketID[name] = socket;
        socket.emit("connected", "You have connected to the server.");
        io.emit("connected", name + " has joined the server.");
        io.emit("update-people", people);
    });

    socket.on('disconnect', function () {
        io.emit('disconnect', people[socket.id] + " has disconnected.");
        delete people[socket.id];
        io.emit("update-people", people);
    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', people[socket.id], msg);
    });

    socket.on('typing', function () {
        io.emit('typing', people[socket.id] + ' is typing');
    });
    socket.on('stoppedTyping', function () {
        io.emit('stoppedTyping');
    });

    socket.on('private message', function (name, msg, isError) {
        if (socketID[name]) {
            socketID[name].emit('private message', 'From ' + people[socket.id] + ': ' + msg);
            socketID[people[socket.id]].emit('private message', 'To ' + name + ': ' + msg);
        } else if (isError == true) {
            socketID[people[socket.id]].emit('private message', 'This function does not exist.');
        } else {
            socketID[people[socket.id]].emit('private message', 'This user does not exist');
        }

    })

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

