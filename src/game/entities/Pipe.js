export class Pipe {
    constructor(xpos, ypos, length, speed, gap) {
        this.ypos = ypos;
        this.xpos = xpos;
        this.length = length;
        this.speed = speed;
        this.width = 150;
        this.gap = gap;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#3DE80E';
        ctx.fillRect(this.xpos, this.ypos, this.width, this.length);
        ctx.fillStyle = '#6FFFD8';
        ctx.fillRect(this.xpos + 5, this.ypos + 5, this.width - 10, this.length - 10);
        ctx.restore();
    }

    update(ctx) {
        this.xpos -= this.speed;
        this.draw(ctx);
    }
}