import useGameStore from '../store';

const ColonyStatusComponent = () => {
  const { morale, food, waste, rats } = useGameStore();

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h2>สถานะที่หลบภัย (Colony Status)</h2>
      <p>ขวัญกำลังใจ (Morale): {morale}</p>
      <p>อาหาร (Food): {food}</p>
      <p>ขยะ (Waste): {waste}</p>
      <p>หนู (Rats): {rats}</p>
    </div>
  );
};

export default ColonyStatusComponent;
