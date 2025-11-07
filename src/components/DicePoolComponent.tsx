import useGameStore from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

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
    <Card className={cn('bg-surface', isRerollMode && 'border-strong shadow-lg')}>
      <CardHeader>
        <CardTitle>ลูกเต๋า (Dice Pool)</CardTitle>
        {isRerollMode && <CardDescription>เลือกเต๋าเพื่อใช้สกิลทอยใหม่</CardDescription>}
      </CardHeader>
      <CardContent>
        {actionDice.length > 0 ? (
          <div className="dice-pool">
            {actionDice.map((die, index) => (
              <button
                type="button"
                key={`${die}-${index}`}
                onClick={() => handleDiceClick(die)}
                className={cn(
                  'dice-token',
                  selectedDice === die && !isRerollMode && 'active',
                  isRerollMode && 'reroll'
                )}
              >
                {die}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">ไม่มีลูกเต๋าให้ใช้</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DicePoolComponent;
