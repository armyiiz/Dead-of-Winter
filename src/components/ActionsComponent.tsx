import useGameStore from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Button from './ui/button';

interface ActionsProps {
  selectedDice: number | null;
  isRerollMode: boolean;
  setRerollMode: (value: boolean) => void;
  onActionUsed: () => void;
}

const ActionsComponent = ({ selectedDice, isRerollMode, setRerollMode, onActionUsed }: ActionsProps) => {
  const { selectedSurvivorId, attack, search, buildBarricade, cleanWaste, depositItems, survivors, locations, activeDebuffs, hasRerolledThisTurn } = useGameStore();
  const selectedSurvivor = survivors.find(s => s.id === selectedSurvivorId);
  const currentLocation = locations.find(l => l.id === selectedSurvivor?.locationId);
  const isAttackDebuffed = activeDebuffs.some(d => d.type === 'ATTACK_DIFFICULTY_UP');
  const attackRequirement = isAttackDebuffed ? 4 : 3;

  const handleAction = (action: (survivorId: string, diceValue: number) => void) => {
    if (selectedSurvivorId && selectedDice) {
      action(selectedSurvivorId, selectedDice);
      onActionUsed(); // Clear the selected dice
    }
  };

  const handleCleanWaste = () => {
    if (selectedDice && selectedSurvivorId) {
      cleanWaste(selectedSurvivorId, selectedDice);
      onActionUsed();
    }
  };

  if (!selectedSurvivor) {
    return (
      <Card className="bg-surface">
        <CardHeader>
          <CardTitle>คำสั่ง (Actions)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">กรุณาเลือกผู้รอดชีวิตเพื่อสั่งการ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface">
      <CardHeader>
        <CardTitle>คำสั่งสำหรับ {selectedSurvivor.name}</CardTitle>
        {isRerollMode && (
          <p className="text-sm text-muted">โหมดทอยเต๋าใหม่: กรุณาเลือกลูกเต๋าจาก Dice Pool</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleAction(attack)}
            disabled={!selectedDice || selectedDice < attackRequirement || isRerollMode || currentLocation?.zombies === 0}
          >
            โจมตี (ต้องการ {attackRequirement}+)
          </Button>
          <Button onClick={() => handleAction(search)} disabled={!selectedDice || isRerollMode}>
            ค้นหา
          </Button>
          <Button onClick={() => handleAction(buildBarricade)} disabled={!selectedDice || isRerollMode}>
            สร้างเครื่องกีดขวาง
          </Button>

          {selectedSurvivor.locationId === 'L001' && (
            <>
              <Button onClick={handleCleanWaste} disabled={!selectedDice || isRerollMode}>
                เก็บกวาดขยะ
              </Button>
              <Button onClick={() => depositItems(selectedSurvivor.id)} disabled={isRerollMode}>
                ฝากของ (ฟรี)
              </Button>
            </>
          )}

          {selectedSurvivor.id === 'S009' && (
            <Button onClick={() => setRerollMode(true)} disabled={hasRerolledThisTurn || isRerollMode}>
              ใช้สกิลทอยเต๋าใหม่ (ฟรี)
            </Button>
          )}
        </div>
        {selectedDice && <p className="text-sm text-muted">ลูกเต๋าที่เลือก: {selectedDice}</p>}
      </CardContent>
    </Card>
  );
};

export default ActionsComponent;
