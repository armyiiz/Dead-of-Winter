import useGameStore from '../store';

const StarvationModal = () => {
  const { survivors, pendingStarvationWounds, resolveStarvation } = useGameStore();

  // Only render survivors at the compound who are not dead
  const potentialTargets = survivors.filter(s => s.locationId === 'L001' && s.hp > 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ backgroundColor: 'white', padding: '20px', border: '2px solid red' }}>
        <h2>อาหารไม่เพียงพอ!</h2>
        <p>คุณต้องเลือกผู้รอดชีวิต {pendingStarvationWounds} คนเพื่อรับบาดแผลจากการอดอาหาร</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {potentialTargets.map(survivor => (
            <button key={survivor.id} onClick={() => resolveStarvation(survivor.id)}>
              {survivor.name} (HP: {survivor.hp})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarvationModal;
