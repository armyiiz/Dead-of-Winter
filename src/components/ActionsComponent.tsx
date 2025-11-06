import useGameStore from '../store';

interface ActionsProps {
  selectedDice: number | null;
  isRerollMode: boolean;
  setRerollMode: (value: boolean) => void;
  onActionUsed: () => void;
}

const ActionsComponent = ({ selectedDice, isRerollMode, setRerollMode, onActionUsed }: ActionsProps) => {
  const { selectedSurvivorId, attack, search, buildBarricade, cleanWaste, depositItems, survivors, activeDebuffs, hasRerolledThisTurn } = useGameStore();
  const selectedSurvivor = survivors.find(s => s.id === selectedSurvivorId);
  const isAttackDebuffed = activeDebuffs.some(d => d.type === 'ATTACK_DIFFICULTY_UP');
  const attackRequirement = isAttackDebuffed ? 4 : 3;

  const handleAction = (action: (survivorId: string, diceValue: number) => void) => {
    if (selectedSurvivorId && selectedDice) {
      action(selectedSurvivorId, selectedDice);
      onActionUsed(); // Clear the selected dice
    }
  };

  const handleCleanWaste = () => {
    if (selectedDice) {
      // Assuming cleanWaste takes the survivor ID and dice value similar to other actions
      // If its signature is different, this needs adjustment.
      // Based on store.ts, it seems to only take diceValue, which might be a bug.
      // For now, let's assume it should take survivorId too for consistency.
      if (selectedSurvivorId) {
         cleanWaste(selectedSurvivorId, selectedDice);
         onActionUsed(); // Clear the selected dice
      }
    }
  }

  if (!selectedSurvivor) {
    return <p>กรุณาเลือกผู้รอดชีวิตเพื่อสั่งการ</p>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
      <h3>แอ็กชันสำหรับ: {selectedSurvivor.name}</h3>
      {isRerollMode && <p style={{ color: 'cyan' }}>โหมดทอยเต๋าใหม่: กรุณาเลือกลูกเต๋าจาก Dice Pool</p>}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => handleAction(attack)} disabled={!selectedDice || selectedDice < attackRequirement || isRerollMode}>
          โจมตี (ต้องการ {attackRequirement}+)
        </button>
        <button onClick={() => handleAction(search)} disabled={!selectedDice || isRerollMode}>ค้นหา</button>
        <button onClick={() => handleAction(buildBarricade)} disabled={!selectedDice || isRerollMode}>สร้าง</button>

        {selectedSurvivor.locationId === 'L001' && (
          <>
            <button onClick={handleCleanWaste} disabled={!selectedDice || isRerollMode}>เก็บกวาดขยะ</button>
            <button onClick={() => depositItems(selectedSurvivor.id)} disabled={isRerollMode}>ฝากของ (ฟรี)</button>
          </>
        )}

        {/* Chloe's Skill (Lucky Break) */}
        {selectedSurvivor.id === 'S009' && (
          <button onClick={() => setRerollMode(true)} disabled={hasRerolledThisTurn || isRerollMode}>
            ใช้สกิลทอยเต๋าใหม่ (ฟรี)
          </button>
        )}
      </div>
       {selectedDice && <p>ลูกเต๋าที่เลือก: {selectedDice}</p>}
    </div>
  );
};

export default ActionsComponent;
