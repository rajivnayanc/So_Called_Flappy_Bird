import { Bird } from './Bird.js';
import neural_network from '../utils/neural_network.js';
import { rgba_val } from '../utils/utils.js';

export class AIBird extends Bird {
    threshold = 0.7;
    constructor(canvasWidth, canvasHeight, w1 = null, w2 = null) {
        super(canvasWidth, canvasHeight, rgba_val());
        this.zIndex = 5;
        this.label = 'AI';

        this.x1 = 0;
        this.x2 = 0;

        // Initialize neural network weights
        this.w1 = w1 ? [...w1] : [];
        this.w2 = w2 ? [...w2] : [];

        if (!w1) {
            for (let i = 0; i < 18; i++) this.w1.push(Math.random() * 2 - 1);
        }
        if (!w2) {
            for (let i = 0; i < 6; i++) this.w2.push(Math.random() * 2 - 1);
        }
    }

    think(pipes) {
        // Find closest top pipe (top pipe is always first in the pairs generated)
        let closestPipe = null;
        for (let i = 0; i < pipes.length; i++) {
            let pipe = pipes[i];
            if (pipe.ypos <= 0 && this.x < pipe.xpos + pipe.width) {
                closestPipe = pipe;
                break;
            }
        }

        if (closestPipe) {
            this.x1 = closestPipe.xpos + closestPipe.width - this.x;
            // The uniform gap center is based on the top pipe's bottom edge + gap / 2
            let gapCenterY = closestPipe.ypos + closestPipe.length + closestPipe.gap / 2;
            this.x2 = this.y - gapCenterY;
        }

        let pred = neural_network(this.x1, this.x2, this.w1, this.w2);
        // Handle mathjs matrix output
        let val = (pred._data) ? pred._data[0] : (Array.isArray(pred) ? pred[0] : pred);
        if (val > this.threshold) {
            this.flap();
        }
    }

}
