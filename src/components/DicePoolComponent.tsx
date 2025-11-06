import useGameStore from '../store';

interface DicePoolProps {
  selectedDice: number | null;
  onSelectDice: (value: number) => void;
  isRerollMode: boolean;
  setRerollMode: (value: boolean) => void;
}

const DicePoolComponent = ({ selectedDice, onSelectDice, isRerollMode, setRerollMode }: DicePoolProps) => {
  const { actionDice, rerollDice } = useGameStore();

  const handleDiceClick = (die: number) => {
    if (isRerollMode) {
      rerollDice(die);
      setRerollMode(false); // Exit reroll mode after using the skill
    } else {
      onSelectDice(die);
    }
  };

  return (
    <div style={{ border: isRerollMode ? '2px solid cyan' : '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h2>ลูกเต๋า (Dice Pool)</h2>
      {actionDice.length > 0 ? (
        <div style={{ display: 'flex', gap: '10px' }}>
          {actionDice.map((die, index) => (
            <div
              key={index}
              onClick={() => handleDiceClick(die)}
              style={{
                border: selectedDice === die && !isRerollMode ? '2px solid cyan' : '1px solid white',
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
