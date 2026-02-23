import { Entity } from '../../engine/Entity.js';

export class Cloud extends Entity {
    constructor(x, y, width, speed, paths) {
        super(x, y, width, 0.6 * width);
        this.zIndex = -10;
        this.paths = paths;
        this.speed = speed;

        // Pre-create Path2D objects and calculate bounds for better performance
        this.pathObjects = paths.map(p => {
            const matches = p.path.match(/-?\d+(\.\d+)?/g);
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;

            if (matches) {
                for (let i = 0; i < matches.length; i += 2) {
                    let px = parseFloat(matches[i]);
                    let py = parseFloat(matches[i + 1]);
                    if (px < minX) minX = px;
                    if (px > maxX) maxX = px;
                    if (py < minY) minY = py;
                    if (py > maxY) maxY = py;
                }
            }
            return {
                path2d: new Path2D(p.path),
                fill: p.fill,
                minX, maxX, minY, maxY,
                centerX: (minX + maxX) / 2
            };
        });
    }

    draw(ctx) {
        if (!this.pathObjects) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Scale paths to fit the requested width
        // The original SVG paths are roughly ~400 units wide
        let scale = this.width / 400;
        ctx.scale(scale, scale);

        let main = this.pathObjects[0];

        for (let i = 0; i < this.pathObjects.length; i++) {
            const p = this.pathObjects[i];
            ctx.save();
            if (i > 0 && main.maxY !== -Infinity && p.maxY !== -Infinity) {
                // Align bottom section to the bottom and center of the first (main) section
                let offsetX = main.centerX - p.centerX;
                let offsetY = main.maxY - p.maxY;
                ctx.translate(offsetX, offsetY);
            }
            ctx.fillStyle = p.fill;
            ctx.fill(p.path2d);
            ctx.restore();
        }

        ctx.restore();
    }

    update(ctx) {
        this.x -= this.speed / 2;
        this.draw(ctx);

        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
    }
}
