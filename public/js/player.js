function Player(imageSource, spriteWidth, spriteHeight, x, y, width, height) {
    // Dimensions
    this.x = (x === null) ? 0 : x;
    this.y = (y === null) ? 0 : y;
    this.width = (width === null) ? 0 : width;
    this.height = (height === null) ? this.width : height;

    // Image
    this.image = new Image();
    this.image.src = imageSource;

    // Sound
    this.sound = new Audio();
    this.sound.src = '';

    // Acceleration vector
    this.vx = 0;
    this.vy = 0;

    // Jump
    this.jumping = false;

    // Sprite
    this.spriteX = 0;
    this.spriteY = 0;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;

    // Methods
    this.paint = function (ctx) {
        if (ctx === null) {
            window.console.warn('Missing ctx parameter');
        }
        else {
            ctx.drawImage(this.image, this.spriteX, this.spriteY, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    };

    this.intersects = function (player) {
        if (player === null) {
            window.console.warn('Missing player parameter');
        }
        else {
            return (this.x < player.x + player.width && this.x + this.width > player.x && this.y < player.y + player.height && this.y + this.height > player.y);
        }
    };

    this.isNear = function (player, playerNumber) {
        if (player === null) {
            window.console.warn('Missing player parameter');
        }
        else if (playerNumber == 1) {
            return (player.x - (this.x + this.width) <= 0 && player.x >= this.x);
        }
        else {
            return ((player.x + player.width) - this.x >= 0 && player.x <= this.x);
        }
    };
}
