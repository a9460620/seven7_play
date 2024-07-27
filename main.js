var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-container'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var backgroundMusic;
var buttonSound;
var hitSound;
var npc;
var requiredAssets = [
    { type: 'image', key: 'background', url: 'assets/background.png' },
    { type: 'image', key: 'npc', url: 'assets/npc.png' },
    { type: 'image', key: 'leftHit', url: 'assets/leftHit.png' },
    { type: 'image', key: 'rightHit', url: 'assets/rightHit.png' },
    { type: 'audio', key: 'backgroundMusic', url: 'assets/東北玩泥巴.mp3' },
    { type: 'audio', key: 'buttonSound', url: 'assets/鋼板之神語音.mp3' },
    { type: 'audio', key: 'hitSound', url: 'assets/hitSound.mp3' }
];

var gameStarted = false;
var score = 0;
var timerText;
var gameTimer;
var startButton;
var leftKeyPressed = false;
var rightKeyPressed = false;

function preload() {
    requiredAssets.forEach(asset => {
        if (asset.type === 'image') {
            this.load.image(asset.key, asset.url);
        } else if (asset.type === 'audio') {
            this.load.audio(asset.key, asset.url);
        }
    });

    this.load.on('loaderror', function (file) {
        console.warn('資源加載失敗:', file.src);
    });
}

function create() {
    // 禁用右鍵菜單
    this.input.mouse.disableContextMenu();

    // 檢查所有資源是否加載成功
    this.load.on('complete', () => {
        requiredAssets.forEach(asset => {
            if (asset.type === 'image' && !this.textures.exists(asset.key)) {
                console.warn('缺少圖片資源:', asset.key);
            }
            if (asset.type === 'audio' && !this.sound.get(asset.key)) {
                console.warn('缺少音頻資源:', asset.key);
            }
        });
    });

    var width = this.sys.game.config.width;
    var height = this.sys.game.config.height;

    this.add.image(width / 2, height / 2, 'background').setOrigin(0.5);
    backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
    buttonSound = this.sound.add('buttonSound', { volume: 0.5 });
    hitSound = this.sound.add('hitSound', { volume: 0.5 });

    backgroundMusic.play();

    startButton = document.createElement('button');
    startButton.innerText = '開始遊戲';
    startButton.className = 'custom-btn'; // 使用自定義樣式
    startButton.style.position = 'absolute';
    startButton.style.left = '50%';
    startButton.style.top = '40%';
    startButton.style.transform = 'translate(-50%, -50%)';
    startButton.onclick = startGame.bind(this); // 綁定上下文
    document.getElementById('phaser-container').appendChild(startButton);

    timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#FFF' });

    this.input.keyboard.on('keydown-LEFT', (event) => {
        if (!leftKeyPressed) {
            handleInput.call(this, 'left');
            leftKeyPressed = true;
        }
    });

    this.input.keyboard.on('keydown-RIGHT', (event) => {
        if (!rightKeyPressed) {
            handleInput.call(this, 'right');
            rightKeyPressed = true;
        }
    });

    this.input.keyboard.on('keyup-LEFT', (event) => {
        leftKeyPressed = false;
    });

    this.input.keyboard.on('keyup-RIGHT', (event) => {
        rightKeyPressed = false;
    });

    // 監聽滑鼠事件
    this.input.on('pointerdown', pointer => handlePointer.call(this, pointer));
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        score = 0;
        startButton.style.display = 'none';

        var width = this.sys.game.config.width;
        var height = this.sys.game.config.height;

        npc = this.add.image(width / 2, height / 2 - 100, 'npc').setOrigin(0.5);

        gameTimer = this.time.addEvent({
            delay: 60000,
            callback: endGame,
            callbackScope: this
        });

        updateTimer.call(this);
    }
}

function update() {
    if (gameStarted) {
        updateTimer.call(this);
    }
}

function updateTimer() {
    var remainingTime = Math.ceil((gameTimer.delay - gameTimer.getElapsed()) / 1000);
    timerText.setText('時間: ' + remainingTime + 's\n分數: ' + score);
}

function handleInput(direction) {
    if (gameStarted) {
        // 隨機位置
        var x = Phaser.Math.Between(npc.x - npc.width / 2, npc.x + npc.width / 2);
        var y = Phaser.Math.Between(npc.y - npc.height / 2, npc.y + npc.height / 2);
        // 隨機旋轉角度
        var rotation = Phaser.Math.FloatBetween(0, 2 * Math.PI);
        var hitImage = this.add.image(x, y, direction === 'left' ? 'leftHit' : 'rightHit').setOrigin(0.5).setRotation(rotation);
        hitSound.play();
        score++;
        this.time.delayedCall(900, () => hitImage.destroy(), [], this);
    }
}

function handlePointer(pointer) {
    if (pointer.leftButtonDown()) {
        handleInput.call(this, 'left');
    } else if (pointer.rightButtonDown()) {
        handleInput.call(this, 'right');
    }
}

function endGame() {
    gameStarted = false;
    timerText.setText('遊戲結束\n分數: ' + score);
    startButton.style.display = 'block';
    score = 0;
}

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
