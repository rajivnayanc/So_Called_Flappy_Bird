import { Entity } from '../../engine/Entity.js';

export class Bird extends Entity {
    constructor(canvasWidth, canvasHeight, color = '#F4D03F') {
        // x, y, width, height (using radius * 2 for width/height)
        const isMobile = canvasWidth < 600;
        super(canvasWidth / 6, canvasHeight / 2, 50, 50);
        this.zIndex = 10;
        this.canvasHeight = canvasHeight;
        this.radius = isMobile ? 20 : 25;
        this.gravity = isMobile ? 0.5 : 1;
        this.flapStrength = isMobile ? -8 : -12;
        this.velocity = 0;
        this.score = 0;
        this.tick = 0;
        this.color = color;
        this.label = null; // Display name
    }

    draw(ctx) {
        // Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Eye
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y - 12, 5, 0, Math.PI * 2, false);
        ctx.fillStyle = '#FFF';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x + 12, this.y - 12, 2, 0, Math.PI * 2, false);
        ctx.fillStyle = '#000';
        ctx.fill();

        // Beak
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y - 5);
        ctx.lineTo(this.x + 35, this.y);
        ctx.lineTo(this.x + 15, this.y + 10);
        ctx.fillStyle = '#FF8C00';
        ctx.fill();
        ctx.stroke();

        // Wing
        ctx.beginPath();
        ctx.ellipse(this.x - 5, this.y + 5, 12, 8, Math.PI / 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.stroke();

        // Label
        if (this.label) {
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';

            // Stroke for visibility against any background
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeText(this.label, this.x, this.y - this.radius - 15);

            // Text fill
            ctx.fillStyle = '#000000';
            ctx.fillText(this.label, this.x, this.y - this.radius - 15);
        }
    }

    flap() {
        this.velocity = this.flapStrength;
    }

    update(ctx) {
        this.draw(ctx);

        if ((this.y + this.velocity + this.radius) >= this.canvasHeight) {
            this.velocity = 0;
        }

        this.y += this.velocity;
        this.velocity += this.gravity;

        this.tick += 1;
        if (this.tick % 20 === 0) this.score += 1;
    }

    // Custom collision bounds for circle vs rect
    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
}
