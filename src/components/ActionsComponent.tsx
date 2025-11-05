import useGameStore from '../store';

interface ActionsProps {
  selectedDice: number | null;
}

const ActionsComponent = ({ selectedDice }: ActionsProps) => {
  const { selectedSurvivorId, attack, search, buildBarricade, cleanWaste, depositItems, survivors } = useGameStore();
  const selectedSurvivor = survivors.find(s => s.id === selectedSurvivorId);

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
        <button onClick={() => handleAction(attack)} disabled={!selectedDice || selectedDice < 3}>โจมตี (ต้องการ 3+)</button>
        <button onClick={() => handleAction(search)} disabled={!selectedDice}>ค้นหา</button>
        <button onClick={() => handleAction(buildBarricade)} disabled={!selectedDice}>สร้าง</button>

        {selectedSurvivor.locationId === 'L001' && (
          <>
            <button onClick={handleCleanWaste} disabled={!selectedDice}>เก็บกวาดขยะ</button>
            <button onClick={() => depositItems(selectedSurvivor.id)}>ฝากของ (ฟรี)</button>
          </>
        )}
      </div>
       {selectedDice && <p>ลูกเต๋าที่เลือก: {selectedDice}</p>}
    </div>
  );
};

export default ActionsComponent;
