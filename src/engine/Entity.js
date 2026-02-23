export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zIndex = 0;
        this.markedForDeletion = false; // Flag to easily remove entities
    }

    // To be overridden by subclasses
    draw(ctx) {
        // Default draw
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // To be overridden by subclasses
    update(ctx, ...args) {
        this.draw(ctx);
    }

    // Get AABB bounds
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
