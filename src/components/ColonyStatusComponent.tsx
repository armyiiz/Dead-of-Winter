import useGameStore from '../store';

const ColonyStatusComponent = () => {
  const morale = useGameStore(state => state.morale);
  const waste = useGameStore(state => state.waste);
  const foodCount = useGameStore(state => state.colonyInventory.filter(item => item.type === 'FOOD').length);
  const ratCount = Math.floor(waste / 3);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h2>สถานะที่หลบภัย (Colony Status)</h2>
      <p>ขวัญกำลังใจ (Morale): {morale}</p>
      <p>อาหาร (Food): {foodCount}</p>
      <p>ขยะ (Waste): {waste}</p>
      <p>หนู (Rats): {ratCount}</p>
    </div>
  );
};

export default ColonyStatusComponent;
