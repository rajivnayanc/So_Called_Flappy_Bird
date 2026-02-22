export class Cloud {
    constructor(x, y, width, speed, img) {
        this.cloud_img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 0.6 * this.width;
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
    }
}