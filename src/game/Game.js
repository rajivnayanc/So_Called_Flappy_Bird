import { Bird } from './entities/Bird.js';
import { Pipe } from './entities/Pipe.js';
import { Cloud } from './entities/Cloud.js';

export class Game {
    constructor(canvas, cloudImg) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.cloudImg = cloudImg;
        
        this.birds = [];
        this.pipes = [];
        this.clouds = [];
        
        this.lastPipeTime = 0;
        this.lastCloudTime = 0;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.birds = [];
        this.pipes = [];
        this.clouds = [];
        const birdCount = 30;
        for (let i = 0; i < birdCount; i++) {
            this.birds.push(new Bird(this.width, this.height));
        }
        
        this.keydownHandler = (e) => {
            if (e.keyCode === 32) {
                this.birds.forEach(bird => bird.flap());
            }
        };
        window.addEventListener('keydown', this.keydownHandler);
    }

    generatePillars() {
        let top_length = Math.round(Math.random() * this.height / 2 + 100);
        let gap = Math.round(Math.random() * 40 + 180);
        let bottom_length = this.height - gap - top_length;
        
        let top = new Pipe(this.width, -5, top_length, 10, gap);
        let bottom = new Pipe(this.width, this.height + 5 - bottom_length, bottom_length, 10, gap);
        return [top, bottom];
    }

    start() {
        if (!this.animationId) {
            this.animate(0);
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        window.removeEventListener('keydown', this.keydownHandler);
    }

    animate(timestamp) {
        this.animationId = requestAnimationFrame((t) => this.animate(t));

        // Clear canvas
        this.ctx.save();
        this.ctx.fillStyle = "#1FD8FF";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();

        // Spawn Clouds
        if (timestamp - this.lastCloudTime > 1500) {
            let y = Math.random() * 400 + 50;
            let width = Math.random() * 300 + 100;
            this.clouds.push(new Cloud(this.width, y, width, 8, this.cloudImg));
            this.lastCloudTime = timestamp;
        }

        // Update Clouds
        this.clouds.forEach(cloud => cloud.update(this.ctx));

        // Spawn Pipes
        if (timestamp - this.lastPipeTime > 1000) {
            this.pipes.push(...this.generatePillars());
            this.lastPipeTime = timestamp;
        }

        // Filter Pipes
        this.pipes = this.pipes.filter(p => p.xpos + p.width > 0);

        // Update Pipes and Collisions
        this.pipes.forEach(pipe => {
            pipe.update(this.ctx);
            
            let top_pillar = (pipe.ypos <= 0);
            
            this.birds = this.birds.filter(bird => {
                let collision = false;
                if (top_pillar) {
                    let a = bird.x + bird.radius;
                    let b = bird.y - bird.radius;
                    if ((a > pipe.xpos) && (a < (pipe.xpos + pipe.width)) && b <= (pipe.ypos + pipe.length)) {
                        collision = true;
                    }
                } else {
                    let a = bird.x + bird.radius;
                    let b = bird.y + bird.radius;
                    if ((a > pipe.xpos) && (a < (pipe.xpos + pipe.width)) && b >= pipe.ypos) {
                        collision = true;
                    }
                }
                return !collision;
            });
        });

        // Update Birds
        this.birds.forEach(bird => {
            bird.think();
            bird.update(this.ctx, this.pipes);
        });
        
        // Auto restart if empty
        if (this.birds.length === 0) {
             this.init();
        }
    }
}