import useGameStore from '../store';
import Button from './ui/button';

const StarvationModal = () => {
  const { survivors, pendingStarvationWounds, resolveStarvation } = useGameStore();

  // Only render survivors at the compound who are not dead
  const potentialTargets = survivors.filter(s => s.locationId === 'L001' && s.hp > 0);

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur flex items-center justify-center z-50">
      <div className="ui-modal max-w-lg">
        <h2 className="text-2xl font-bold mb-2 text-danger">อาหารไม่เพียงพอ!</h2>
        <p className="text-sm text-muted">
          คุณต้องเลือกผู้รอดชีวิต {pendingStarvationWounds} คนเพื่อรับบาดแผลจากการอดอาหาร
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {potentialTargets.map(survivor => (
            <Button key={survivor.id} variant="danger" onClick={() => resolveStarvation(survivor.id)}>
              {survivor.name} (HP: {survivor.hp})
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarvationModal;
