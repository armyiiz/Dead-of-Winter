import useGameStore from '../store';

const SurvivorsComponent = () => {
  const { survivors, selectSurvivor, selectedSurvivorId } = useGameStore();

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h2>ผู้รอดชีวิต (Survivors)</h2>
      {survivors.map(survivor => (
        <div
          key={survivor.id}
          style={{
            border: survivor.id === selectedSurvivorId ? '2px solid cyan' : '1px solid #555',
            padding: '5px',
            marginBottom: '5px'
          }}
        >
          <h4>{survivor.name}</h4>
          <p>HP: {survivor.hp} / {survivor.hp}</p>
          <p>ตำแหน่ง: {survivor.locationId}</p>
          <p><strong>สกิล: {survivor.skill.name}</strong> - {survivor.skill.description}</p>
          <button onClick={() => selectSurvivor(survivor.id)}>
            {survivor.id === selectedSurvivorId ? 'เลือกแล้ว' : 'เลือก'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SurvivorsComponent;
