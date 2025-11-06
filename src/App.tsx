import { useEffect, useState } from 'react'; // Import useState
import useGameStore from './store';
import SurvivorsComponent from './components/SurvivorsComponent';
import LocationsComponent from './components/LocationsComponent';
import ColonyStatusComponent from './components/ColonyStatusComponent';
import CrisisComponent from './components/CrisisComponent';
import DicePoolComponent from './components/DicePoolComponent';
import ActionsComponent from './components/ActionsComponent';
import ActionLogComponent from './components/ActionLogComponent';
import CrossroadsModal from './components/CrossroadsModal';

import StarvationModal from './components/StarvationModal'; // Import the new component

function App() {
  const { setupGame, gameStatus, nextPhase, currentDay, currentPhase, pendingStarvationWounds, currentCrossroad } = useGameStore();
  const [selectedDice, setSelectedDice] = useState<number | null>(null);
  const [isRerollMode, setRerollMode] = useState(false);

  // Function to clear selected dice after an action is used
  const handleActionUsed = () => {
    setSelectedDice(null);
  };

  // Setup game on initial render
  useEffect(() => {
    setupGame();
  }, [setupGame]);

  // Reset selected dice and reroll mode when phase changes
  useEffect(() => {
    setSelectedDice(null);
    setRerollMode(false);
  }, [currentPhase]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Sarabun, sans-serif', display: 'flex', gap: '20px' }}>
      {pendingStarvationWounds > 0 && <StarvationModal />}
      {currentCrossroad && <CrossroadsModal />}
      <div style={{ flex: 1 }}>
        <LocationsComponent selectedDice={selectedDice} onActionUsed={handleActionUsed} />
        <SurvivorsComponent />
      </div>
      <div style={{ flex: 1 }}>
        <h1>The Last Compound</h1>
        <p>สถานะเกม: {gameStatus} | วันที่: {currentDay} | เฟส: {currentPhase}</p>

        {gameStatus === 'Playing' && (
          <button
            onClick={nextPhase}
            style={{ marginBottom: '10px', padding: '10px' }}
            disabled={pendingStarvationWounds > 0}
          >
            {pendingStarvationWounds > 0 ? 'รอแก้ไขการอดอาหาร...' : 'ไปยังเฟสถัดไป (Next Phase)'}
          </button>
        )}

        {gameStatus === 'Won' && <h2 style={{ color: 'green' }}>คุณชนะแล้ว!</h2>}
        {gameStatus === 'Lost' && <h2 style={{ color: 'red' }}>คุณแพ้แล้ว!</h2>}

        <ColonyStatusComponent />
        <CrisisComponent />
        <DicePoolComponent
          selectedDice={selectedDice}
          onSelectDice={setSelectedDice}
          isRerollMode={isRerollMode}
          setRerollMode={setRerollMode}
        />
        <ActionsComponent
          selectedDice={selectedDice}
          isRerollMode={isRerollMode}
          setRerollMode={setRerollMode}
          onActionUsed={handleActionUsed}
        />
        <ActionLogComponent />
      </div>
    </div>
  );
}

export default App;
