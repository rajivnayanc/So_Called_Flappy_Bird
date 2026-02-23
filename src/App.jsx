import { useState } from 'react';
import PlayMode from './components/PlayMode';
import TrainMode from './components/TrainMode';
import './App.css';

const App = () => {
  const [mode, setMode] = useState('PLAY'); // 'PLAY' or 'TRAIN'

  return (
    <div className="app-container">
      {mode === 'PLAY' ? (
        <PlayMode onSwitchMode={() => setMode('TRAIN')} />
      ) : (
        <TrainMode onSwitchMode={() => setMode('PLAY')} />
      )}
    </div>
  );
};

export default App;
