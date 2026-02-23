import { Entity } from '../../engine/Entity.js';

export class Pipe extends Entity {
    constructor(xpos, ypos, length, speed, gap, isMobile = false) {
        let width = isMobile ? 80 : 150;
        super(xpos, ypos, width, length);
        this.zIndex = -5;
        this.speed = speed;
        this.gap = gap;
        // Legacy props for compatibility (if needed)
        this.ypos = ypos;
        this.xpos = xpos;
        this.length = length;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#3DE80E';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#6FFFD8';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        ctx.restore();
    }

    update(ctx) {
        this.x -= this.speed;
        this.xpos = this.x; // Keep sync
        this.draw(ctx);

        // Mark for deletion if off screen
        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
    }
}
