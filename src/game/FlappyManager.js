import { Engine } from '../engine/Engine.js';
import { Bird } from './entities/Bird.js';
import { AIBird } from './entities/AIBird.js';
import { Pipe } from './entities/Pipe.js';
import { Cloud } from './entities/Cloud.js';
import cloudPaths from './data/cloud_paths.json';

export class FlappyManager extends Engine {
    constructor(canvas) {
        super(canvas);

        this.birds = [];
        this.pipes = [];
        this.clouds = [];

        this.lastPipeTime = null;
        this.lastCloudTime = null;

        this.mode = 'PLAY'; // 'PLAY' | 'TRAIN'
        this.onGameOver = null; // Callback when play mode ends
        this.onNewGeneration = null; // Callback when train mode starts new gen
        this.onTrainScoreChange = null; // Callback when train mode reaches new best score

        // Setup engine tick
        this.onTick = (timestamp, ctx) => this.handleTick(timestamp, ctx);
    }

    stop() {
        if (this.mode === 'TRAIN' && this.birds.length > 0) {
            // Find the best among alive and dead birds in the current run
            const allBirds = [...this.birds, ...this.deadBirds];
            if (allBirds.length > 0) {
                const bestBird = allBirds.reduce((prev, current) => (prev.score > current.score) ? prev : current, { score: -1 });
                const savedBest = parseInt(localStorage.getItem('flappyAIBestScore') || '0', 10);
                if (bestBird.score >= savedBest && bestBird.w1) {
                    localStorage.setItem('flappyAIBestScore', bestBird.score.toString());
                    localStorage.setItem('flappyBestW1', JSON.stringify(bestBird.w1));
                    localStorage.setItem('flappyBestW2', JSON.stringify(bestBird.w2));
                    localStorage.setItem('flappyBestThreshold', bestBird.threshold.toString());
                    if (this.onTrainScoreChange) {
                        this.onTrainScoreChange(bestBird.score);
                    }
                }
            }
        }
        super.stop();
    }

    setMode(mode) {
        this.mode = mode;
    }

    cleanup() {
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        if (this.clickHandler) {
            this.canvas.removeEventListener('mousedown', this.clickHandler);
            this.canvas.removeEventListener('touchstart', this.clickHandler);
            this.clickHandler = null;
        }
    }

    init(population = null, playAgainstAI = false, aiThreshold = 0.5) {
        this.cleanup();
        this.clearEntities();
        this.birds = [];
        this.deadBirds = [];
        this.pipes = [];
        this.clouds = [];
        this.lastPipeTime = null;
        this.lastCloudTime = null;

        if (this.mode === 'PLAY') {
            const playerBird = new Bird(this.width, this.height, '#F4D03F');
            playerBird.label = 'P1';
            this.birds.push(playerBird);
            this.addEntity(playerBird);

            if (playAgainstAI) {
                const w1Str = localStorage.getItem('flappyBestW1');
                const w2Str = localStorage.getItem('flappyBestW2');
                const threshStr = localStorage.getItem('flappyBestThreshold');

                if (w1Str && w2Str) {
                    try {
                        const w1 = JSON.parse(w1Str);
                        const w2 = JSON.parse(w2Str);
                        // If threshStr is undefined/null (from an older save), default to 0.5 safely instead of parsing NaN
                        const memoryThreshold = threshStr ? parseFloat(threshStr) : 0.5;

                        const aiBird = new AIBird(this.width, this.height, w1, w2, memoryThreshold);
                        aiBird.color = 'rgba(150, 0, 255, 0.7)'; // Distinct purple opponent
                        aiBird.zIndex = 4;
                        this.birds.push(aiBird);
                        this.addEntity(aiBird);
                    } catch (e) {
                        console.error('Failed to load AI weights', e);
                    }
                }
            }

            this.keydownHandler = (e) => {
                if (e.keyCode === 32 || e.key === ' ') {
                    if (this.birds[0]) this.birds[0].flap();
                }
            };
            window.addEventListener('keydown', this.keydownHandler);

            // Mouse click/touch support for play mode
            this.clickHandler = (e) => {
                // Prevent default behavior for touch to avoid double firing or scrolling
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
                if (this.birds[0]) this.birds[0].flap();
            };
            this.canvas.addEventListener('mousedown', this.clickHandler);
            this.canvas.addEventListener('touchstart', this.clickHandler, { passive: false });

        } else if (this.mode === 'TRAIN') {
            const birdCount = population ? population.length : 30;
            for (let i = 0; i < birdCount; i++) {
                let aiBird;
                if (population && population[i]) {
                    aiBird = new AIBird(this.width, this.height, population[i].w1, population[i].w2, aiThreshold);
                } else {
                    aiBird = new AIBird(this.width, this.height, null, null, aiThreshold);
                }
                this.birds.push(aiBird);
                this.addEntity(aiBird);
            }
        }
    }

    generatePillars() {
        const isMobile = this.width < 600;

        // Desktop uses old logic (gap ~180-220, top logic), Mobile uses forgiving logic + dynamic gap
        let gap = isMobile ? Math.max(200, this.height * 0.25) : Math.round(Math.random() * 40 + 180);
        let top_length = isMobile ? Math.max(50, Math.round(Math.random() * (this.height - gap - 100)))
            : Math.round(Math.random() * this.height / 2 + 100);
        let bottom_length = this.height - gap - top_length;

        let speed = isMobile ? 5 : 10;
        let top = new Pipe(this.width, -5, top_length, speed, gap, isMobile);
        let bottom = new Pipe(this.width, this.height + 5 - bottom_length, bottom_length, speed, gap, isMobile);
        return [top, bottom];
    }



    handleTick(timestamp, ctx) {
        if (this.lastCloudTime === null) this.lastCloudTime = timestamp;
        if (this.lastPipeTime === null) this.lastPipeTime = timestamp;

        // Clear canvas with blue background
        this.clearCanvas();

        // Remove deleted entities (pipes/clouds off screen)
        this.entities = this.entities.filter(e => !e.markedForDeletion);
        this.pipes = this.pipes.filter(e => !e.markedForDeletion);
        this.clouds = this.clouds.filter(e => !e.markedForDeletion);

        // Spawn Clouds
        if (timestamp - this.lastCloudTime > 1500) {
            let y = Math.random() * 400 + 50;
            let width = Math.random() * 300 + 200; // Increased base size

            // Select random cloud path
            const cloudPathGroup = cloudPaths[Math.floor(Math.random() * cloudPaths.length)];

            let cloud = new Cloud(this.width, y, width, 8, cloudPathGroup);
            this.clouds.push(cloud);
            this.addEntity(cloud);
            this.lastCloudTime = timestamp;
        }

        // Spawn Pipes
        const spawnDelay = (this.width < 600) ? 1600 : 1000;
        if (timestamp - this.lastPipeTime > spawnDelay) {
            const newPipes = this.generatePillars();
            this.pipes.push(...newPipes);
            this.addEntities(newPipes);
            this.lastPipeTime = timestamp;
        }

        // Check Collisions and Update Birds
        const deadBirdsThisFrame = [];
        this.birds = this.birds.filter(bird => {
            let collision = false;

            // Check ground/ceiling collision
            if (bird.y + bird.radius >= this.height || bird.y - bird.radius <= 0) {
                collision = true;
            } else {
                // Check pipe collision using AABB
                const birdRect = {
                    x: bird.x - bird.radius,
                    y: bird.y - bird.radius,
                    width: bird.radius * 2,
                    height: bird.radius * 2
                };
                for (let pipe of this.pipes) {
                    if (Engine.checkCollision(birdRect, pipe)) {
                        collision = true;
                        break;
                    }
                }
            }

            if (collision) {
                deadBirdsThisFrame.push(bird);
                if (this.mode === 'TRAIN') {
                    this.deadBirds.push(bird);
                }
                this.removeEntity(bird);
            }
            return !collision;
        });

        // Handle Game Over Logic
        if (deadBirdsThisFrame.length > 0) {
            // Check best score and save AI weights if inside TRAIN mode
            if (this.mode === 'TRAIN') {
                const bestDead = deadBirdsThisFrame.reduce((prev, current) => (prev.score > current.score) ? prev : current, { score: -1 });
                const savedBest = parseInt(localStorage.getItem('flappyAIBestScore') || '0', 10);
                if (bestDead.score >= savedBest && bestDead.w1) {
                    localStorage.setItem('flappyAIBestScore', bestDead.score.toString());
                    localStorage.setItem('flappyBestW1', JSON.stringify(bestDead.w1));
                    localStorage.setItem('flappyBestW2', JSON.stringify(bestDead.w2));
                    localStorage.setItem('flappyBestThreshold', bestDead.threshold.toString());
                    if (this.onTrainScoreChange) {
                        this.onTrainScoreChange(bestDead.score);
                    }
                }
            }

            if (this.mode === 'PLAY') {
                const playerDied = deadBirdsThisFrame.find(b => b.label === 'P1');
                if (playerDied) {
                    this.stop();
                    if (this.onGameOver) {
                        this.onGameOver(playerDied.score);
                    }
                }
            } else if (this.mode === 'TRAIN' && this.birds.length === 0) {
                // All birds are dead, handle generation reset externally
                if (this.onNewGeneration) {
                    this.onNewGeneration(this.deadBirds); // Passing ALL dead birds for the generation
                }
            }
        }

        // AIBirds must actively think each frame
        this.birds.forEach(bird => {
            if (bird instanceof AIBird) {
                bird.think(this.pipes);
            }
        });
    }
}
