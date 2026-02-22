import { useEffect, useRef } from 'react';
import { Game } from './game/Game';

const App = () => {
  const canvasRef = useRef(null);
  const cloudRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cloudImg = cloudRef.current;
    
    // Handle resizing
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const game = new Game(canvas, cloudImg);
    game.start();

    return () => {
      game.stop();
    };
  }, []);
  return <>
    <img src="cloud.png" id="cloud" ref={cloudRef} style={{ display: 'none' }} alt="cloud" />
    <canvas id="myCanvas" ref={canvasRef}>
    </canvas>
    </>
};

export default App;
