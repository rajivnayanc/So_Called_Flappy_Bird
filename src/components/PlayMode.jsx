import { useEffect, useRef, useState } from 'react';
import { FlappyManager } from '../game/FlappyManager';

const PlayMode = ({ onSwitchMode }) => {
    const canvasRef = useRef(null);
    const managerRef = useRef(null);

    const [gameState, setGameState] = useState('START'); // 'START', 'RUNNING', 'GAMEOVER', 'PAUSED'
    const [playAgainstAI, setPlayAgainstAI] = useState(false);
    const [score, setScore] = useState(0);
    const [bestPlayScore, setBestPlayScore] = useState(0);

    // Load best scores on mount
    useEffect(() => {
        const savedPlayBest = localStorage.getItem('flappyBestScore');
        if (savedPlayBest) {
            setBestPlayScore(parseInt(savedPlayBest, 10));
        }
    }, []);

    // Sync score state with manager
    useEffect(() => {
        const interval = setInterval(() => {
            if (managerRef.current && gameState === 'RUNNING') {
                const birds = managerRef.current.birds;
                if (birds && birds.length > 0) {
                    // Find highest score among active birds
                    let maxScore = -1;
                    birds.forEach(b => {
                        if (b.label === 'P1' && b.score !== undefined && b.score > maxScore) maxScore = b.score;
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

        manager.onGameOver = (finalScore) => {
            setGameState('GAMEOVER');
            setScore(finalScore);
            setBestPlayScore(prevBest => {
                if (finalScore > prevBest) {
                    localStorage.setItem('flappyBestScore', finalScore.toString());
                    return finalScore;
                }
                return prevBest;
            });
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            manager.stop();
            if (manager.cleanup) manager.cleanup();
        };
    }, []);

    const startGame = () => {
        setScore(0);
        setGameState('RUNNING');

        managerRef.current.setMode('PLAY');
        managerRef.current.init(null, playAgainstAI, 0.5);
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
                <div className="hud-stat">Best Score: {bestPlayScore}</div>
                <div className="hud-stat">Score: {score}</div>
            </div>

            {/* Overlays */}
            {gameState === 'START' && (
                <div className="overlay">
                    <div className="panel">
                        <img src={`${import.meta.env.BASE_URL}favicon.svg`} className="popup-logo" alt="Logo" />
                        <h1>So Called Flappy Bird</h1>
                        {bestPlayScore > 0 && <h3>Best Score: {bestPlayScore}</h3>}
                        <div className="mode-selector">
                            <button className="active">Play Mode</button>
                            <button onClick={onSwitchMode}>Train Mode</button>
                        </div>

                        <div className="ai-toggle">
                            <label>
                                <input type="checkbox" checked={playAgainstAI} onChange={e => {
                                    if (e.target.checked && !localStorage.getItem('flappyBestW1')) {
                                        alert('No AI data found! Run Training Mode first to generate the best AI.');
                                        setPlayAgainstAI(false);
                                    } else {
                                        setPlayAgainstAI(e.target.checked);
                                    }
                                }} />
                                Compete against Best AI
                            </label>
                        </div>

                        <button className="start-btn" onClick={startGame}>Start Game</button>
                        <p className="help-text">Press Space or Click or Tap to flap.<br />Press Escape to Pause.</p>
                    </div>
                </div>
            )}

            {gameState === 'PAUSED' && (
                <div className="overlay">
                    <div className="panel">
                        <img src={`${import.meta.env.BASE_URL}favicon.svg`} className="popup-logo" alt="Logo" />
                        <h1>Paused</h1>
                        <h3>Best Score: {bestPlayScore}</h3>
                        <button className="start-btn" onClick={() => {
                            managerRef.current.start();
                            setGameState('RUNNING');
                        }}>Resume</button>
                        <button className="mode-btn" onClick={handleQuitToMenu}>Quit to Menu</button>
                    </div>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="overlay">
                    <div className="panel">
                        <img src={`${import.meta.env.BASE_URL}favicon.svg`} className="popup-logo" alt="Logo" />
                        <h1>Game Over</h1>
                        <div className="score-display">
                            <h2>Score: {score}</h2>
                            {bestPlayScore > 0 && <h3>Best Score: {bestPlayScore}</h3>}
                        </div>
                        <button className="start-btn" onClick={startGame}>Play Again</button>
                        <button className="mode-btn" onClick={onSwitchMode}>Switch Mode</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PlayMode;
