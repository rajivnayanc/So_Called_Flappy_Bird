import { useEffect } from 'react';
import {init, animate} from './main_old'

const App = () => {
  useEffect(() => {
    init();
    animate();
  }, []);
  return <>
    <img src="cloud.png" id="cloud" />
    <canvas id="myCanvas">
    </canvas>
    </>
};

export default App;
