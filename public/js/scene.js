var Scene = (function () {
    // Variables
    var background = new Image(),
        ground = 265,
        spawnPlayer1 = 134,
        spawnPlayer2 = 474;

    // Set background image source
    background.src = 'img/background2.png';

    // Return publics
    return {
        background: background,
        ground: ground,
        spawnPlayer1: spawnPlayer1,
        spawnPlayer2: spawnPlayer2
    };
})();
