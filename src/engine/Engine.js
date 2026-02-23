export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.entities = [];
        this.animationId = null;
        this.isRunning = false;
        this.onTick = null; // Optional callback per frame

        // Handle canvas resize
        this.resizeHandler = () => {
            if (this.canvas) {
                this.width = this.canvas.width;
                this.height = this.canvas.height;
            }
        };
        window.addEventListener('resize', this.resizeHandler);
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    addEntities(entities) {
        this.entities.push(...entities);
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    clearEntities() {
        this.entities = [];
    }

    getEntities() {
        return this.entities;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animationId = requestAnimationFrame((t) => this.animate(t));
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', this.resizeHandler);
    }

    clearCanvas() {
        this.ctx.save();
        this.ctx.fillStyle = "#1FD8FF"; // Default sky blue (can be overridden)
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }

    animate(timestamp) {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame((t) => this.animate(t));

        // Let subclass or external script handle frame logic (e.g. spawns, clearing canvas)
        if (this.onTick) {
            this.onTick(timestamp, this.ctx);
        } else {
            this.clearCanvas();
        }

        // Update all entities (sorted by zIndex to handle draw order, Clouds behind Pipes behind Birds)
        this.entities.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        this.entities.forEach(entity => {
            entity.update(this.ctx);
        });
    }

    // AABB Collision Detection utility
    static checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
}
