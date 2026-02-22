import neural_network from '../utils/neural_network.js';
import { rgba_val } from '../utils/utils.js';

export class Bird {
    constructor(canvasWidth, canvasHeight) {
        this.canvasHeight = canvasHeight;
        this.y = canvasHeight / 2;
        this.x = canvasWidth / 6;
        this.radius = 25;
        this.gravity = 1;
        this.velocity = 0;
        this.score = 0;
        this.tick = 0;
        this.x1 = 0;
        this.x2 = 0;
        this.w1 = [];
        this.w2 = [];
        this.color = rgba_val();

        for (let i = 0; i < 18; i++) this.w1.push(Math.random() * 2 - 1);
        for (let i = 0; i < 6; i++) this.w2.push(Math.random() * 2 - 1);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    flap() {
        this.velocity = -12;
    }

    think() {
        let pred = neural_network(this.x1, this.x2, this.w1, this.w2);
        // Handle mathjs matrix output
        let val = (pred._data) ? pred._data[0] : (Array.isArray(pred) ? pred[0] : pred);
        if (val > 0.5) {
            this.flap();
        }
    }

    update(ctx, pipes) {
        this.draw(ctx);
        
        if ((this.y + this.velocity + this.radius) >= this.canvasHeight) {
            this.velocity = 0;
        }
        
        this.y += this.velocity;
        this.velocity += this.gravity;

        for (let i = 0; i < pipes.length; i++) {
            let pipe = pipes[i];
            if (this.x < pipe.xpos + pipe.width) {
                this.x1 = pipe.xpos + pipe.width - this.x;
                if (pipe.ypos <= 0) {
                    this.x2 = this.y - (pipe.ypos + pipe.length + pipe.gap / 2);
                } else {
                    this.x2 = pipe.ypos + pipe.gap / 2 - this.y;
                }
                break;
            }
        }

        this.tick += 1;
        if (this.tick % 20 === 0) this.score += 1;
    }
}