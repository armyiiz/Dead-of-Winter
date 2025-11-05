import useGameStore from '../store';

interface ActionsProps {
  selectedDice: number | null;
}

const ActionsComponent = ({ selectedDice }: ActionsProps) => {
  const { selectedSurvivorId, attack, search, buildBarricade, cleanWaste, depositItems, survivors, activeDebuffs } = useGameStore();
  const selectedSurvivor = survivors.find(s => s.id === selectedSurvivorId);
  const isAttackDebuffed = activeDebuffs.some(d => d.type === 'ATTACK_DIFFICULTY_UP');
  const attackRequirement = isAttackDebuffed ? 4 : 3;

  const handleAction = (action: (survivorId: string, diceValue: number) => void) => {
    if (selectedSurvivorId && selectedDice) {
      action(selectedSurvivorId, selectedDice);
    }
  };

  const handleCleanWaste = () => {
    if(selectedDice){
       cleanWaste(selectedDice);
    }
  }


  if (!selectedSurvivor) {
    return <p>กรุณาเลือกผู้รอดชีวิตเพื่อสั่งการ</p>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
      <h3>แอ็กชันสำหรับ: {selectedSurvivor.name}</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => handleAction(attack)} disabled={!selectedDice || selectedDice < attackRequirement}>
          โจมตี (ต้องการ {attackRequirement}+)
        </button>
        <button onClick={() => handleAction(search)} disabled={!selectedDice}>ค้นหา</button>
        <button onClick={() => handleAction(buildBarricade)} disabled={!selectedDice}>สร้าง</button>

        {selectedSurvivor.locationId === 'L001' && (
          <>
            <button onClick={handleCleanWaste} disabled={!selectedDice}>เก็บกวาดขยะ</button>
            <button onClick={() => depositItems(selectedSurvivor.id)}>ฝากของ (ฟรี)</button>
          </>
        )}

        {/* --- NOTE TO UI DEVELOPER: Survivor-specific skill buttons would go here --- */}

        {/* Example for Marco's Skill (Fleet-Footed). His skill allows moving without an exposure roll.
            The move button itself in another component would need to check if the survivor is Marco
            and perhaps change its text or behavior, highlighting that any dice can be used.
            No specific button here, as it modifies the "Move" action. */}

        {/* Example for Chloe's Skill (Lucky Break) */}
        {selectedSurvivor.id === 'S009' && (
          <>
            {/*
              const { rerollDice, hasRerolledThisTurn } = useGameStore(); // Add to component state
              <button onClick={() => rerollDice(someDiceValue)} disabled={hasRerolledThisTurn}>ทอยเต๋าใหม่ (ฟรี)</button>
              This requires selecting a dice from the POOL, not the single 'selectedDice'.
              The UI needs a way to select a dice from the dice pool and pass it to rerollDice.
            */}
          </>
        )}

      </div>
       {selectedDice && <p>ลูกเต๋าที่เลือก: {selectedDice}</p>}
    </div>
  );
};

export default ActionsComponent;
