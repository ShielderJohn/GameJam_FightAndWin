// Variables
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    server = require('http').Server(app),
    port = 9090,
    io = require('socket.io')(server),
    players = [],
    playerNicknames = [];

// Settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Start server
server.listen(port, function () {
    console.log('Server started, listening on ' + port);
});

io.on('connection', function (socket) {
    console.log('New player connected!');

    // If there are 2 players already, do nothing
    if (players.length < 2) {

        // Add player to the array of players
        console.log(socket.id);

        var newPlayer = {
            id: socket.id,
            playerNumber: players.length + 1,
            player: null
        };

        players.push(newPlayer);

        io.sockets.emit('new player', { id: socket.id, playerNumber: players.length, players: players });
        
        // Workaround for passing player1 nickname to player2
        if (newPlayer.playerNumber == 2) {
            io.to(newPlayer.id).emit('enemy nickname', playerNicknames[0]);
        }
    }

    socket.on('updating player', function (data) {
        socket.broadcast.emit('update players', data.player);
    });

    socket.on('updating health', function (health) {
        socket.broadcast.emit('update health', health);
    });

    socket.on('playing sound', function (src) {
        socket.broadcast.emit('play sound', src);
    });

    socket.on('nickname', function (nickname) {
        if (playerNicknames.length < 2) {
            playerNicknames.push(nickname);
        }

        socket.broadcast.emit('enemy nickname', nickname);
    });

    socket.on('updating money', function (enemyMoney) {
        socket.broadcast.emit('update money', enemyMoney);
    });

    // Disconnection
    // socket.on('disconnect', function() {
    //      Handle
    // });
});
