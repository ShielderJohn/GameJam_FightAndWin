// Whole game script
var Game = (function () {
    // Registration
    var nicknameInput = document.getElementById('nickname'),
        playButton = document.getElementById('play_button'),
        canvasElement = document.getElementById('canvas');

    playButton.addEventListener('click', _startGame);

    function _startGame(event) {
        ownNickname = nicknameInput.value;
        canvasElement.classList.remove('hidden');
        socket.emit('nickname', ownNickname);

        _init();
    }

    // Registration
    var ownNickname = '',
        ownMoney = 10,
        enemyNickname = '',
        enemyMoney = 10;

    // Multiplayer
    var socket = io(),
        id = 0,
        playerNumber = 0,
        players = [];

    // Time variables
    var currentFrame = 0,
        walkFrame = null,
        jumpFrame = null,
        punchFrame = null,
        kickFrame = null;

    // Basic variables
    var canvas = null,
        ctx = null,
        ownPlayer = null,
        enemyPlayer = null,
        lastPressed = null,
        pressing = [];

    // Color variables
    var colorBlack = '#222',
        colorGreen = '#48BF84';

    // Movement related variables
    var speed = 5,
        gravity = 0.65,
        friction = 0.8,
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40;

    // Fight related variables
    var ownHealth = 100,
        enemyHealth = 100,
        damage = 5,
        lifeRatio = 0.01,
        lifeBarWidth = (720 - 40) * 0.4,
        lifeBarHeight = 20,
        KEY_PUNCH = 87,
        KEY_KICK = 69;

    // Sprite variables
    var standardWidth = 102,
        standardHeight = 102,
        standardSpriteX = 0,
        standardSpriteY = 0,
        standardSpriteWidth = 102,
        standardSpriteHeight = 102,
        // Walk
        walkWidth = 102,
        walkHeight = 102,
        walkSpriteX = 218,
        walk1SpriteY = 0,
        walk2SpriteY = 109,
        walkSpriteWidth = 102,
        walkSpriteHeight = 102,
        walkMaxFrame = 15,
        walkHalfMaxFrame = 8,
        // Jump
        jumpWidth = 102,
        jumpHeight = 97,
        jumpSpriteX = 109,
        jumpSpriteY = 0,
        jumpSpriteWidth = 102,
        jumpSpriteHeight = 97,
        // Punch
        punchWidth = 102,
        punchSpriteX = 0,
        punchSpriteY = 109,
        punchSpriteWidth = 102,
        // Kick
        kickWidth = 108,
        kickSpriteX = 109,
        kickSpriteY = 109,
        kickSpriteWidth = 108;


    // Bind events
    // window.addEventListener('load', _init, false);
    document.addEventListener('keydown', _recognizePressedKey, false);
    document.addEventListener('keyup', _stopPressedKey, false);

    // --------------------------------------------------
    // Main functions
    // --------------------------------------------------
    function _init() {
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        _run();
    }

    function _run() {
        requestAnimationFrame(_run);
        requestAnimationFrame(_paint);
        _act();

        currentFrame++;
        if (currentFrame == 6) currentFrame = 0;
    }

    function _act() {
        _move();
        _applyRestrictions();
        _fight();
    }

    function _paint() {
        // Reset canvas
        ctx.drawImage(Scene.background, 0, 0, canvas.width, canvas.height);

        // HP Bars background
        ctx.fillStyle = colorBlack;
        ctx.fillRect(20, 20, lifeBarWidth, lifeBarHeight);
        ctx.fillRect(700, 20, -lifeBarWidth, lifeBarHeight);

        if (playerNumber == 1) {
            // HP Bar
            ctx.fillStyle = colorGreen;
            ctx.fillRect(22, 22, (lifeBarWidth - 4) * (lifeRatio * ownHealth), lifeBarHeight - 4);
            ctx.fillRect(698, 22, -((lifeBarWidth - 4) * (lifeRatio * enemyHealth)), lifeBarHeight - 4);

            // Nickname and money left
            ctx.fillStyle = colorBlack;
            ctx.fillRect(20, 20 + lifeBarHeight + 2, 150, 15);
            ctx.fillRect(428, 20 + lifeBarHeight + 2, 150, 15);

            ctx.fillStyle = 'white';
            ctx.font = '10pt Tahoma';
            ctx.fillText(ownNickname + ' : ' + ownMoney + '$', 24, 20 + lifeBarHeight + 13);
            ctx.fillText(enemyNickname + ' : ' + enemyMoney + '$', 432, 20 + lifeBarHeight + 13);
        }
        else if (playerNumber == 2) {
            // HP Bar
            ctx.fillStyle = colorGreen;
            ctx.fillRect(22, 22, (lifeBarWidth - 4) * (lifeRatio * enemyHealth), lifeBarHeight - 4);
            ctx.fillRect(698, 22, -((lifeBarWidth - 4) * (lifeRatio * ownHealth)), lifeBarHeight - 4);

            // Nickname and money left
            ctx.fillStyle = colorBlack;
            ctx.fillRect(20, 20 + lifeBarHeight + 2, 150, 15);
            ctx.fillRect(428, 20 + lifeBarHeight + 2, 150, 15);

            ctx.fillStyle = 'white';
            ctx.font = '10pt Tahoma';
            ctx.fillText(ownNickname + ' : ' + ownMoney + '$', 432, 20 + lifeBarHeight + 13);
            ctx.fillText(enemyNickname + ' : ' + enemyMoney + '$', 24, 20 + lifeBarHeight + 13);
        }

        // Paint ownPlayer
        ownPlayer.paint(ctx);

        // Paint enemyPlayer
        enemyPlayer.paint(ctx);
    }


    // --------------------------------------------------
    // Movement related functions
    // --------------------------------------------------
    function _move() {
        _resetSprite();
        _emitUpdatingPlayer();

        // Move left
        if (pressing[KEY_LEFT] && !pressing[KEY_RIGHT]) {
            walkFrame += 1;

            if (walkFrame >= walkMaxFrame) {
                walkFrame = 0;
            }

            // ownPlayer.x -= speed;
            if (ownPlayer.vx > -speed) {
                ownPlayer.vx--;
            }

            if (!ownPlayer.jumping) {
                ownPlayer.spriteX = walkSpriteX;

                if (walkFrame <= walkHalfMaxFrame) {
                    ownPlayer.spriteY = walk1SpriteY;
                }
                else {
                    ownPlayer.spriteY = walk2SpriteY;
                }
            }
        }

        // Move right
        if (pressing[KEY_RIGHT] && !pressing[KEY_LEFT]) {
            walkFrame += 1;

            if (walkFrame >= walkMaxFrame) {
                walkFrame = 0;
            }

            // ownPlayer.x -= speed;
            if (ownPlayer.vx < speed) {
                ownPlayer.vx++;
            }

            if (!ownPlayer.jumping) {
                ownPlayer.spriteX = walkSpriteX;

                if (walkFrame <= walkHalfMaxFrame) {
                    ownPlayer.spriteY = walk1SpriteY;
                }
                else {
                    ownPlayer.spriteY = walk2SpriteY;
                }
            }
        }

        // Jump
        if (ownPlayer.jumping && lastPressed == KEY_UP) {
            lastPressed = null;
        }

        if (!ownPlayer.jumping && lastPressed == KEY_UP) {
            ownPlayer.sound.src = 'sounds/jump.mp3';
            ownPlayer.sound.play();
            _emitPlaySound('sounds/jump.mp3');

            // animate character
            ownPlayer.width = jumpWidth;
            ownPlayer.height = jumpHeight;
            ownPlayer.spriteX = jumpSpriteX;
            ownPlayer.spriteY = jumpSpriteY;
            ownPlayer.spriteWidth = jumpSpriteWidth;

            jumpFrame = currentFrame;
            ownPlayer.jumping = true;
            ownPlayer.vy = -speed * 2;

            lastPressed = null;
        }

        // Friction and gravity
        ownPlayer.vx *= friction;
        ownPlayer.vy += gravity;
        ownPlayer.x += ownPlayer.vx;
        ownPlayer.y += ownPlayer.vy;
    }

    function _applyRestrictions() {

        // Stop moving if out of bounds
        if (ownPlayer.x > canvas.width - ownPlayer.width) {
            ownPlayer.x = canvas.width - ownPlayer.width;
        }

        if (ownPlayer.x < 0) {
            ownPlayer.x = 0;
        }

        if (ownPlayer.y > Scene.ground) {
            ownPlayer.jumping = false;
            ownPlayer.y = Scene.ground;
        }
    }


    // --------------------------------------------------
    // Fight related functions
    // --------------------------------------------------
    function _fight() {
        _punch();
        _kick();
    }

    function _punch() {
        if (lastPressed == KEY_PUNCH && !pressing[KEY_LEFT] && !pressing[KEY_RIGHT]) {
            punchFrame = currentFrame;

            // Animate character
            ownPlayer.width = punchWidth;
            ownPlayer.spriteX = punchSpriteX;
            ownPlayer.spriteY = punchSpriteY;
            ownPlayer.spriteWidth = punchSpriteWidth;

            // Hit or miss depending on position
            if (ownPlayer.isNear(enemyPlayer, playerNumber) && ownPlayer.y <= enemyPlayer.y) {
                ownPlayer.sound.src = 'sounds/hit.mp3';
                ownPlayer.sound.play();
                _emitPlaySound('sounds/hit.mp3');

                // Take damage
                if (enemyHealth - damage > 0) {
                    enemyHealth -= damage;
                    enemyMoney = enemyMoney - 0.5;
                }
                else {
                    enemyHealth = 0;
                    enemyMoney = 0;

                    enemyPlayer.sound.src = 'sounds/death.mp3';
                    enemyPlayer.sound.play();
                    _emitPlaySound('sounds/death.mp3');
                }

                _emitUpdateHealth();
                _emitUpdateMoney();
            }
            else {
                ownPlayer.sound.src = 'sounds/woosh.mp3';
                ownPlayer.sound.play();
                _emitPlaySound('sounds/woosh.mp3');
            }

            lastPressed = null;
        }
    }

    function _kick() {
        if (lastPressed == KEY_KICK && !pressing[KEY_LEFT] && !pressing[KEY_RIGHT]) {

            kickFrame = currentFrame;

            // Animate character
            ownPlayer.width = kickWidth;
            ownPlayer.spriteX = kickSpriteX;
            ownPlayer.spriteY = kickSpriteY;
            ownPlayer.spriteWidth = kickSpriteWidth;

            // Hit or miss depending on position
            if (ownPlayer.isNear(enemyPlayer, playerNumber) && ownPlayer.y <= enemyPlayer.y) {
                ownPlayer.sound.src = 'sounds/hit.mp3';
                ownPlayer.sound.play();
                _emitPlaySound('sounds/hit.mp3');

                if (enemyHealth - damage > 0) {
                    enemyHealth -= damage;
                    enemyMoney = enemyMoney - 0.5;
                }
                else {
                    enemyHealth = 0;
                    enemyMoney = 0;

                    enemyPlayer.sound.src = 'sounds/death.mp3';
                    enemyPlayer.sound.play();
                    _emitPlaySound('sounds/death.mp3');
                }

                _emitUpdateHealth();
                _emitUpdateMoney();
            }
            else {
                ownPlayer.sound.src = 'sounds/woosh.mp3';
                ownPlayer.sound.play();
                _emitPlaySound('sounds/woosh.mp3');
            }

            lastPressed = null;
        }
    }


    // --------------------------------------------------
    // Helper functions
    // --------------------------------------------------
    function _resetSprite() {
        if (!ownPlayer.jumping) {
            // Reset after moving
            if (!pressing[KEY_RIGHT] && !pressing[KEY_LEFT] && walkFrame !== null) {
                ownPlayer.width = standardWidth;
                ownPlayer.height = standardHeight;
                ownPlayer.spriteX = standardSpriteX;
                ownPlayer.spriteY = standardSpriteY;
                ownPlayer.spriteWidth = standardSpriteWidth;
                ownPlayer.spriteHeight = standardSpriteHeight;

                walkFrame = null;
            }

            // Reset after punching
            if (punchFrame !== null && punchFrame - currentFrame === 0) {
                ownPlayer.width = standardWidth;
                ownPlayer.height = standardHeight;
                ownPlayer.spriteX = standardSpriteX;
                ownPlayer.spriteY = standardSpriteY;
                ownPlayer.spriteWidth = standardSpriteWidth;

                punchFrame = null;
            }

            // Reset after kicking
            if (kickFrame !== null && kickFrame - currentFrame === 0) {
                ownPlayer.width = standardWidth;
                ownPlayer.height = standardHeight;
                ownPlayer.spriteX = standardSpriteX;
                ownPlayer.spriteY = standardSpriteY;
                ownPlayer.spriteWidth = standardSpriteWidth;
                ownPlayer.spriteHeight = standardSpriteHeight;

                kickFrame = null;
            }

            // Reset after jumping
            if (jumpFrame !== null) {
                ownPlayer.width = standardWidth;
                ownPlayer.height = standardHeight;
                ownPlayer.spriteX = standardSpriteX;
                ownPlayer.spriteY = standardSpriteY;
                ownPlayer.spriteWidth = standardSpriteWidth;
                ownPlayer.spriteHeight = standardSpriteHeight;

                jumpFrame = null;
            }

            // Pressing right and left at the same time will
            // make the character look weird, so when pressing
            // those two keys, reset sprite
            if (pressing[KEY_RIGHT] && pressing[KEY_LEFT]) {
                ownPlayer.width = standardWidth;
                ownPlayer.height = standardHeight;
                ownPlayer.spriteX = standardSpriteX;
                ownPlayer.spriteY = standardSpriteY;
                ownPlayer.spriteWidth = standardSpriteWidth;
                ownPlayer.spriteHeight = standardSpriteHeight;

                walkFrame = null;
            }
        }
    }

    function _recognizePressedKey(evt) {
        if (!pressing[evt.keyCode]) {
            lastPressed = evt.keyCode;
        }

        pressing[evt.keyCode] = true;
    }

    function _stopPressedKey(evt) {
        pressing[evt.keyCode] = false;
    }

    // Request animation frame
    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 17);
        };
    }());


    // --------------------------------------------------
    // Receive socket functions
    // --------------------------------------------------
    socket.on('new player', function (info) {
        id = info.id;
        playerNumber = playerNumber !== 0 ? playerNumber : info.playerNumber;
        players = info.players;

        // Player 1 (left player)
        if (playerNumber == 1) {
            if (ownPlayer === 'undefined' || ownPlayer === null) {
                ownPlayer = new Player('img/player1.png', standardSpriteWidth, standardSpriteHeight, Scene.spawnPlayer1, Scene.ground, standardWidth, standardHeight);
            }

            if (players.length > 1) {
                enemyPlayer = new Player('img/player2.png', standardSpriteWidth, standardSpriteHeight, Scene.spawnPlayer2, Scene.ground, standardWidth, standardHeight);
            }
        }

        // Player 2 (right player)
        else if (playerNumber == 2) {
            ownPlayer = new Player('img/player2.png', standardSpriteWidth, standardSpriteHeight, Scene.spawnPlayer2, Scene.ground, standardWidth, standardHeight);

            enemyPlayer = new Player('img/player1.png', standardSpriteWidth, standardSpriteHeight, Scene.spawnPlayer1, Scene.ground, standardWidth, standardHeight);
        }

    });

    socket.on('update players', function (data) {
        enemyPlayer.x = (data.x === null) ? 0 : data.x;
        enemyPlayer.y = (data.y === null) ? 0 : data.y;
        enemyPlayer.width = (data.width === null) ? 0 : data.width;
        enemyPlayer.height = (data.height === null) ? enemyPlayer.width : data.height;

        // Acceleration vector
        enemyPlayer.vx = data.vx;
        enemyPlayer.vy = data.vy;

        // Jump
        enemyPlayer.jumping = data.jumping;

        // Sprite
        enemyPlayer.spriteX = data.spriteX;
        enemyPlayer.spriteY = data.spriteY;
        enemyPlayer.spriteWidth = data.spriteWidth;
        enemyPlayer.spriteHeight = data.spriteHeight;
    });

    socket.on('update health', function (health) {
        ownHealth = health;
    });

    socket.on('play sound', function (src) {
        enemyPlayer.sound.src = src;
        enemyPlayer.sound.play();
    });

    socket.on('enemy nickname', function (nickname) {
        enemyNickname = nickname;
    });

    socket.on('update money', function (money) {
        ownMoney = money;
    });

    function _emitUpdatingPlayer() {
        socket.emit('updating player', { id: id, playerNumber: playerNumber, player: ownPlayer });
    }

    function _emitUpdateHealth() {
        socket.emit('updating health', enemyHealth);
    }

    function _emitPlaySound(src) {
        socket.emit('playing sound', src);
    }

    function _emitUpdateMoney() {
        socket.emit('updating money', enemyMoney);
    }

})();
