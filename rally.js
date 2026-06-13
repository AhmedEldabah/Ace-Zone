const canvas = document.getElementById('matchCanvas');
const ctx = canvas.getContext('2d');

const rallyCountEl = document.getElementById('rallyCount');
const maxRallyEl = document.getElementById('maxRally');
const speedSlider = document.getElementById('speedSlider');
const intensitySlider = document.getElementById('intensitySlider');
const resetBtn = document.getElementById('resetBtn');

let gameSpeed = 1;
let baseHitPower = 12;
let rallyCount = 0;
let maxRally = 0;

const gravity = 0.25;
const netX = canvas.width / 2;
const floorY = canvas.height - 60;
const wallLeft = 40;
const wallRight = canvas.width - 40;

const ball = {
    x: netX,
    y: 150,
    vx: 4,
    vy: 0,
    radius: 6,
    color: '#e1ff00',
    reset: function() {
        this.x = netX;
        this.y = 100;
        this.vx = Math.random() > 0.5 ? 4 : -4;
        this.vy = 0;
        if (rallyCount > maxRally) {
            maxRally = rallyCount;
            maxRallyEl.textContent = maxRally;
        }
        rallyCount = 0;
        rallyCountEl.textContent = rallyCount;
    }
};

class Player {
    constructor(x, side) {
        this.homeX = x;
        this.x = x;
        this.y = floorY;
        this.side = side;
        this.height = 70;
        this.speed = 4.5;
        this.swingProgress = 0;
        this.isSwinging = false;
    }

    update(ballObj) {
        const isBallComing = (this.side === 'left' && ballObj.vx < 0) || (this.side === 'right' && ballObj.vx > 0);

        if (isBallComing) {
            let targetX = ballObj.x + (this.side === 'left' ? 25 : -25);

            if (this.side === 'left') {
                targetX = Math.max(wallLeft + 20, Math.min(netX - 30, targetX));
            } else {
                targetX = Math.max(netX + 30, Math.min(wallRight - 20, targetX));
            }

            if (this.x < targetX - 5) this.x += this.speed * gameSpeed;
            else if (this.x > targetX + 5) this.x -= this.speed * gameSpeed;
        } else {
            if (Math.abs(this.x - this.homeX) > 5) {
                this.x += (this.homeX - this.x) * 0.03 * gameSpeed;
            }
        }

        const distanceToBall = Math.hypot(ballObj.x - this.x, ballObj.y - (this.y - this.height / 2));
        if (distanceToBall < 55 && !this.isSwinging) {
            if ((this.side === 'left' && ballObj.vx < 0) || (this.side === 'right' && ballObj.vx > 0)) {
                this.isSwinging = true;
                this.swingProgress = 0;
                this.hitBall(ballObj);
            }
        }

        if (this.isSwinging) {
            this.swingProgress += 0.15 * gameSpeed;
            if (this.swingProgress >= Math.PI) {
                this.isSwinging = false;
                this.swingProgress = 0;
            }
        }
    }

    hitBall(ballObj) {
        rallyCount++;
        rallyCountEl.textContent = rallyCount;

        const direction = this.side === 'left' ? 1 : -1;

        ballObj.vx = direction * (baseHitPower * (0.8 + Math.random() * 0.4));
        ballObj.vy = -(4 + Math.random() * 5);
    }

    draw() {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        const headRadius = 8;
        const headY = this.y - this.height;
        const torsoTop = headY + headRadius;
        const torsoBottom = this.y - 30;

        ctx.beginPath();
        ctx.arc(this.x, headY, headRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x, torsoTop);
        ctx.lineTo(this.x, torsoBottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x, torsoBottom);
        ctx.lineTo(this.x - 12, this.y);
        ctx.moveTo(this.x, torsoBottom);
        ctx.lineTo(this.x + 12, this.y);
        ctx.stroke();

        let armSpread = this.side === 'left' ? 15 : -15;
        let racketAngle = 0;

        if (this.isSwinging) {
            racketAngle = (this.side === 'left')
                ? -Math.PI / 4 + Math.sin(this.swingProgress) * Math.PI
                : Math.PI / 4 - Math.sin(this.swingProgress) * Math.PI;
        } else {
            racketAngle = this.side === 'left' ? -Math.PI / 6 : Math.PI / 6;
        }

        ctx.beginPath();
        ctx.moveTo(this.x, torsoTop + 10);
        ctx.lineTo(this.x - armSpread / 1.5, torsoTop + 22);
        ctx.stroke();

        const handX = this.x + Math.cos(racketAngle) * 20;
        const handY = (torsoTop + 12) + Math.sin(racketAngle) * 12;

        ctx.beginPath();
        ctx.moveTo(this.x, torsoTop + 10);
        ctx.lineTo(handX, handY);
        ctx.stroke();

        const racketLength = 22;
        const racketEndX = handX + Math.cos(racketAngle) * racketLength;
        const racketEndY = handY + Math.sin(racketAngle) * racketLength;

        ctx.lineWidth = 4;
        ctx.strokeStyle = '#8a94a6';
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(racketEndX, racketEndY);
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = varColor('--accent-color');
        ctx.fillStyle = 'rgba(204, 255, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(racketEndX, racketEndY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

const playerLeft = new Player(180, 'left');
const playerRight = new Player(canvas.width - 180, 'right');

function varColor(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function drawCourt() {
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0c0f');
    gradient.addColorStop(1, '#13171c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f2010';
    ctx.fillRect(wallLeft, floorY, wallRight - wallLeft, canvas.height - floorY);

    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';

    ctx.strokeRect(wallLeft, floorY - 140, 2, 140);
    ctx.strokeRect(wallRight, floorY - 140, 2, 140);

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(wallLeft, floorY);
    ctx.lineTo(wallRight, floorY);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#5a6578';
    ctx.beginPath();
    ctx.moveTo(netX, floorY);
    ctx.lineTo(netX, floorY - 32);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(netX - 2, floorY - 30, 4, 30);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(netX - 4, floorY - 30);
    ctx.lineTo(netX + 4, floorY - 30);
    ctx.stroke();
}

function updatePhysics() {
    for (let i = 0; i < gameSpeed * 10; i++) {
        ball.x += (ball.vx / 10);
        ball.y += (ball.vy / 10);
    }

    ball.vy += gravity * gameSpeed;

    if (ball.y + ball.radius >= floorY) {
        ball.y = floorY - ball.radius;
        ball.vy = -ball.vy * 0.82;
    }

    if (ball.x - ball.radius <= wallLeft) {
        ball.x = wallLeft + ball.radius;
        ball.vx = -ball.vx * 0.9;
    }

    if (ball.x + ball.radius >= wallRight) {
        ball.x = wallRight - ball.radius;
        ball.vx = -ball.vx * 0.9;
    }

    if (ball.x > netX - 4 && ball.x < netX + 4 && ball.y > floorY - 30) {
        ball.reset();
    }

    if (ball.y > canvas.height || ball.x < 0 || ball.x > canvas.width) {
        ball.reset();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    playerLeft.update(ball);
    playerRight.update(ball);
    updatePhysics();

    drawCourt();
    playerLeft.draw();
    playerRight.draw();

    ctx.shadowBlur = 12;
    ctx.shadowColor = ball.color;
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    requestAnimationFrame(loop);
}

speedSlider.addEventListener('input', (e) => {
    gameSpeed = parseFloat(e.target.value);
});

intensitySlider.addEventListener('input', (e) => {
    baseHitPower = parseInt(e.target.value);
});

resetBtn.addEventListener('click', () => {
    ball.reset();
});

loop();
