import useGameStore from '../store';
import { Survivor } from '../types';

const SurvivorsComponent = () => {
  const { survivors, selectSurvivor, selectedSurvivorId, useSkill, useUsableItem } = useGameStore();

  const handleUseSkill = (survivor: Survivor) => {
    if (survivor.id === 'S003') { // Elena's First Aid
      // For simplicity, let's find a wounded target at the same location, or self
      const potentialTargets = survivors.filter(s => s.locationId === survivor.locationId && s.hp < 3);
      const target = potentialTargets.find(t => t.id !== survivor.id) || (survivor.hp < 3 ? survivor : null);
      if (target) {
        useSkill(survivor.id, target.id);
      } else {
        alert("ไม่มีเป้าหมายให้รักษาในบริเวณนี้");
      }
    } else {
      useSkill(survivor.id);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h2>ผู้รอดชีวิต (Survivors)</h2>
      {survivors.map(survivor => (
        <div
          key={survivor.id}
          style={{
            border: survivor.id === selectedSurvivorId ? '2px solid cyan' : '1px solid #555',
            padding: '10px',
            marginBottom: '10px',
            opacity: survivor.hp <= 0 ? 0.5 : 1,
          }}
        >
          <h4>{survivor.name} {survivor.hp <= 0 ? '(เสียชีวิต)' : ''}</h4>
          <p>HP: {survivor.hp}</p>
          <p>ตำแหน่ง: {survivor.locationId}</p>
          <p><strong>สกิล: {survivor.skill.name}</strong> - {survivor.skill.description}</p>
          {(survivor.id === 'S003' || survivor.id === 'S008') && (
            <button
              onClick={() => handleUseSkill(survivor)}
              disabled={survivor.id !== selectedSurvivorId || survivor.hp <= 0}
            >
              ใช้สกิล (ฟรี)
            </button>
          )}

          <div>
            <strong>ของในตัว:</strong>
            {survivor.personalInventory.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                {survivor.personalInventory.map(item => (
                  <li key={item.id}>
                    {item.name}
                    {item.usable && (
                       <button
                         onClick={() => useUsableItem(survivor.id, item.id)}
                         disabled={survivor.id !== selectedSurvivorId || survivor.hp <= 0}
                         style={{ marginLeft: '10px' }}
                       >
                         ใช้
                       </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: '5px 0' }}>ไม่มี</p>
            )}
          </div>

          <button
            onClick={() => selectSurvivor(survivor.id)}
            disabled={survivor.hp <= 0}
          >
            {survivor.id === selectedSurvivorId ? 'เลือกแล้ว' : 'เลือก'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SurvivorsComponent;
