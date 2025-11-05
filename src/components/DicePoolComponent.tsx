import useGameStore from '../store';

interface DicePoolProps {
  selectedDice: number | null;
  onSelectDice: (value: number) => void;
}

const DicePoolComponent = ({ selectedDice, onSelectDice }: DicePoolProps) => {
  const { actionDice } = useGameStore();

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h2>ลูกเต๋า (Dice Pool)</h2>
      {actionDice.length > 0 ? (
        <div style={{ display: 'flex', gap: '10px' }}>
          {actionDice.map((die, index) => (
            <div
              key={index}
              onClick={() => onSelectDice(die)}
              style={{
                border: selectedDice === die ? '2px solid cyan' : '1px solid white',
                width: '30px',
                height: '30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              {die}
            </div>
          ))}
        </div>
      ) : (
        <p>ไม่มีลูกเต๋าให้ใช้</p>
      )}
    </div>
  );
};

export default DicePoolComponent;
