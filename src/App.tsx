import { useEffect, useState } from 'react'; // Import useState
import useGameStore from './store';
import SurvivorsComponent from './components/SurvivorsComponent';
import LocationsComponent from './components/LocationsComponent';
import ColonyStatusComponent from './components/ColonyStatusComponent';
import CrisisComponent from './components/CrisisComponent';
import DicePoolComponent from './components/DicePoolComponent';
import ActionsComponent from './components/ActionsComponent';
import ActionLogComponent from './components/ActionLogComponent';

function App() {
  const { setupGame, gameStatus, nextPhase, currentDay, currentPhase } = useGameStore();
  const [selectedDice, setSelectedDice] = useState<number | null>(null);

  // Setup game on initial render
  useEffect(() => {
    setupGame();
  }, [setupGame]);

  // Reset selected dice when phase changes
  useEffect(() => {
    setSelectedDice(null);
  }, [currentPhase]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Sarabun, sans-serif', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <LocationsComponent />
        <SurvivorsComponent />
      </div>
      <div style={{ flex: 1 }}>
        <h1>The Last Compound</h1>
        <p>สถานะเกม: {gameStatus} | วันที่: {currentDay} | เฟส: {currentPhase}</p>

        {gameStatus === 'Playing' && (
          <button onClick={nextPhase} style={{ marginBottom: '10px', padding: '10px' }}>
            ไปยังเฟสถัดไป (Next Phase)
          </button>
        )}

        {gameStatus === 'Won' && <h2 style={{ color: 'green' }}>คุณชนะแล้ว!</h2>}
        {gameStatus === 'Lost' && <h2 style={{ color: 'red' }}>คุณแพ้แล้ว!</h2>}

        <ColonyStatusComponent />
        <CrisisComponent />
        <DicePoolComponent selectedDice={selectedDice} onSelectDice={setSelectedDice} />
        <ActionsComponent selectedDice={selectedDice} />
        <ActionLogComponent />
      </div>
    </div>
  );
}

export default App;
