import { useEffect, useRef, useState } from 'react';
import { FlappyManager } from './game/FlappyManager';
import { nextGeneration } from './game/utils/genetic_algorithm';
import './App.css';

const App = () => {
  const canvasRef = useRef(null);
  const managerRef = useRef(null);

  const [mode, setMode] = useState('PLAY'); // 'PLAY' or 'TRAIN'
  const [gameState, setGameState] = useState('START'); // 'START', 'RUNNING', 'GAMEOVER', 'PAUSED'
  const [playAgainstAI, setPlayAgainstAI] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [generation, setGeneration] = useState(1);

  // Load best score on mount
  useEffect(() => {
    const savedBest = localStorage.getItem('flappyBestScore');
    if (savedBest) {
      setBestScore(parseInt(savedBest, 10));
    }
  }, []);

  // Sync score state with manager
  useEffect(() => {
    const interval = setInterval(() => {
      if (managerRef.current && gameState === 'RUNNING') {
        const birds = managerRef.current.getEntities();
        if (birds.length > 0) {
          // Find highest score among alive birds
          let currentScore = 0;
          birds.forEach(b => {
            if (b.score && b.score > currentScore) currentScore = b.score;
          });
          setScore(currentScore);

          if (currentScore > bestScore) {
            setBestScore(currentScore);
            localStorage.setItem('flappyBestScore', currentScore.toString());
          }
        }
      }
    }, 100); // UI update rate
    return () => clearInterval(interval);
  }, [gameState, bestScore]);

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
      if (finalScore > bestScore) {
        setBestScore(finalScore);
        localStorage.setItem('flappyBestScore', finalScore.toString());
      }
    };

    manager.onNewGeneration = (deadBirds) => {
      setGeneration(prev => prev + 1);
      const nextGenPopulation = nextGeneration(deadBirds);
      manager.init(nextGenPopulation);
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

    managerRef.current.setMode(mode);
    if (mode === 'TRAIN') {
      setGeneration(1);
    }

    managerRef.current.init(null, mode === 'PLAY' ? playAgainstAI : false);
    managerRef.current.start();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setGameState('START');
    if (managerRef.current) {
      managerRef.current.stop();
      managerRef.current.clearCanvas();
    }
  };

  return (
    <div className="app-container">
      <canvas id="myCanvas" ref={canvasRef}></canvas>

      {/* Sticky Top Score UI */}
      <div className="hud">
        {(gameState === 'RUNNING' || gameState === 'PAUSED') && (
          <button className="exit-btn" onClick={() => switchMode(mode)}>X</button>
        )}
        <div className="hud-stat">Best Score: {bestScore}</div>
        <div className="hud-stat">Score: {score}</div>
        {mode === 'TRAIN' && (
          <div className="hud-stat">Generation: {generation}</div>
        )}
      </div>

      {/* Overlays */}
      {gameState === 'START' && (
        <div className="overlay">
          <div className="panel">
            <img src="/favicon.svg" className="popup-logo" alt="Logo" />
            <h1>So Called Flappy Bird</h1>
            {mode === 'PLAY' && bestScore > 0 && <h3>Best Score: {bestScore}</h3>}
            <div className="mode-selector">
              <button
                className={mode === 'PLAY' ? 'active' : ''}
                onClick={() => switchMode('PLAY')}
              >
                Play Mode
              </button>
              <button
                className={mode === 'TRAIN' ? 'active' : ''}
                onClick={() => switchMode('TRAIN')}
              >
                Train Mode
              </button>
            </div>

            {mode === 'PLAY' && (
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
            )}

            <button className="start-btn" onClick={startGame}>
              {mode === 'PLAY' ? 'Start Game' : 'Start Training'}
            </button>

            {mode === 'PLAY' && <p className="help-text">Press Space or Click or Tap to flap.<br />Press Escape to Pause.</p>}
          </div>
        </div>
      )}

      {gameState === 'PAUSED' && (
        <div className="overlay">
          <div className="panel">
            <img src="/favicon.svg" className="popup-logo" alt="Logo" />
            <h1>Paused</h1>
            {mode === 'PLAY' && <h3>Best Score: {bestScore}</h3>}
            <button className="start-btn" onClick={() => {
              managerRef.current.start();
              setGameState('RUNNING');
            }}>Resume</button>
            <button className="mode-btn" onClick={() => switchMode(mode)}>Quit to Menu</button>
          </div>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="overlay">
          <div className="panel">
            <img src="/favicon.svg" className="popup-logo" alt="Logo" />
            <h1>Game Over</h1>
            <div className="score-display">
              <h2>Score: {score}</h2>
              {mode === 'PLAY' && <h3>Best Score: {bestScore}</h3>}
            </div>
            <button className="start-btn" onClick={startGame}>Play Again</button>
            <button className="mode-btn" onClick={() => switchMode(mode === 'PLAY' ? 'TRAIN' : 'PLAY')}>
              Switch Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
