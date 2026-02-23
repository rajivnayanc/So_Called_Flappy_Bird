import { Entity } from '../../engine/Entity.js';

export class Cloud extends Entity {
    constructor(x, y, width, speed, img) {
        super(x, y, width, 0.6 * width);
        this.zIndex = -10;
        this.cloud_img = img;
        this.speed = speed;
    }

    draw(ctx) {
        if (this.cloud_img) {
            ctx.drawImage(this.cloud_img, this.x, this.y, this.width, this.height);
        }
    }

    update(ctx) {
        this.x -= this.speed / 2;
        this.draw(ctx);

        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
    }
}
