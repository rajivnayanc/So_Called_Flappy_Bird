import { useEffect, useRef, useState } from 'react';
import { FlappyManager } from '../game/FlappyManager';
import { nextGeneration } from '../game/utils/genetic_algorithm';

const TrainMode = ({ onSwitchMode }) => {
    const canvasRef = useRef(null);
    const managerRef = useRef(null);

    const [gameState, setGameState] = useState('START'); // 'START', 'RUNNING', 'PAUSED'
    const [score, setScore] = useState(0);
    const [bestTrainScore, setBestTrainScore] = useState(0);
    const [aiThreshold, setAiThreshold] = useState(0.5); // '0.5', '0.7', '0.9'
    const aiThresholdRef = useRef(aiThreshold);
    const [generation, setGeneration] = useState(1);

    // Load best scores on mount
    useEffect(() => {
        const savedTrainBest = localStorage.getItem('flappyAIBestScore');
        if (savedTrainBest) {
            setBestTrainScore(parseInt(savedTrainBest, 10));
        }
    }, []);

    // Sync ref with state
    useEffect(() => {
        aiThresholdRef.current = aiThreshold;
    }, [aiThreshold]);

    // Sync score state with manager
    useEffect(() => {
        const interval = setInterval(() => {
            if (managerRef.current && gameState === 'RUNNING') {
                const birds = managerRef.current.birds;
                if (birds && birds.length > 0) {
                    // Find highest score among active birds
                    let maxScore = -1;
                    birds.forEach(b => {
                        if (b.score !== undefined && b.score > maxScore) maxScore = b.score;
                    });

                    if (maxScore !== -1) {
                        setScore(prev => Math.max(prev, maxScore));
                    }
                }
            }
        }, 100); // UI update rate
        return () => clearInterval(interval);
    }, [gameState]);

    useEffect(() => {
        const canvas = canvasRef.current;

        // Handle resizing
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (managerRef.current) {
                managerRef.current.width = canvas.width;
                managerRef.current.height = canvas.height;
            }
        };
        window.addEventListener('resize', handleResize);

        const manager = new FlappyManager(canvas);
        managerRef.current = manager;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setGameState(prev => {
                    if (prev === 'RUNNING') {
                        manager.stop();
                        return 'PAUSED';
                    } else if (prev === 'PAUSED') {
                        manager.start();
                        return 'RUNNING';
                    }
                    return prev;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        manager.onNewGeneration = (deadBirds) => {
            setScore(0);
            setGeneration(prev => prev + 1);
            const nextGenPopulation = nextGeneration(deadBirds);
            manager.init(nextGenPopulation, false, aiThresholdRef.current);
        };

        manager.onTrainScoreChange = (newBest) => {
            setBestTrainScore(newBest);
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            manager.stop();
            if (manager.cleanup) manager.cleanup();
        };
    }, []);

    const startTraining = () => {
        setScore(0);
        setGameState('RUNNING');
        setGeneration(1);

        managerRef.current.setMode('TRAIN');
        managerRef.current.init(null, false, aiThreshold);
        managerRef.current.start();
    };

    const handleQuitToMenu = () => {
        managerRef.current.stop();
        managerRef.current.clearCanvas();
        setGameState('START');
    };

    return (
        <>
            <canvas id="myCanvas" ref={canvasRef}></canvas>

            {/* Sticky Top Score UI */}
            <div className="hud">
                {(gameState === 'RUNNING' || gameState === 'PAUSED') && (
                    <button className="exit-btn" onClick={handleQuitToMenu}>X</button>
                )}
                <div className="hud-stat">Best Score: {bestTrainScore}</div>
                <div className="hud-stat">Score: {score}</div>
                <div className="hud-stat">Generation: {generation}</div>
            </div>

            {/* Overlays */}
            {gameState === 'START' && (
                <div className="overlay">
                    <div className="panel">
                        <img src={`${import.meta.env.BASE_URL}favicon.svg`} className="popup-logo" alt="Logo" />
                        <h1>So Called Flappy Bird</h1>
                        {bestTrainScore > 0 && <h3>Best AI Score: {bestTrainScore}</h3>}
                        <div className="mode-selector">
                            <button onClick={onSwitchMode}>Play Mode</button>
                            <button className="active">Train Mode</button>
                        </div>

                        <div className="ai-toggle">
                            <label>
                                AI Threshold:
                                <select value={aiThreshold} onChange={e => setAiThreshold(parseFloat(e.target.value))}>
                                    <option value={0.5}>Low (0.5)</option>
                                    <option value={0.7}>Medium (0.7)</option>
                                    <option value={0.9}>High (0.9)</option>
                                </select>
                            </label>
                        </div>

                        <button className="start-btn" onClick={startTraining}>Start Training</button>
                        <p className="help-text">Press Escape to Pause.</p>
                    </div>
                </div>
            )}

            {gameState === 'PAUSED' && (
                <div className="overlay">
                    <div className="panel">
                        <img src={`${import.meta.env.BASE_URL}favicon.svg`} className="popup-logo" alt="Logo" />
                        <h1>Paused</h1>
                        <h3>Best AI Score: {bestTrainScore}</h3>
                        <button className="start-btn" onClick={() => {
                            managerRef.current.start();
                            setGameState('RUNNING');
                        }}>Resume</button>
                        <button className="mode-btn" onClick={handleQuitToMenu}>Quit to Menu</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default TrainMode;
