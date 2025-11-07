import useGameStore from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

const ColonyStatusComponent = () => {
  const morale = useGameStore(state => state.morale);
  const waste = useGameStore(state => state.waste);
  const foodCount = useGameStore(state => state.colonyInventory.filter(item => item.type === 'FOOD').length);
  const ratCount = Math.floor(waste / 3);

  return (
    <Card className="bg-surface">
      <CardHeader>
        <CardTitle>สถานะที่หลบภัย (Colony Status)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div>
          <div className="text-muted mb-2">ขวัญกำลังใจ (Morale)</div>
          <Progress value={morale} max={10} />
          <div className="text-xs text-muted mt-2">{morale} / 10</div>
        </div>
        <div className="inline-list">
          <div>อาหาร: {foodCount}</div>
          <div>ขยะ: {waste}</div>
          <div>หนู: {ratCount}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColonyStatusComponent;
