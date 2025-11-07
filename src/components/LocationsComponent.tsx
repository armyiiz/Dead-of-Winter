import useGameStore from '../store';

interface LocationsComponentProps {
  selectedDice: number | null;
  onActionUsed: () => void;
}

const LocationsComponent: React.FC<LocationsComponentProps> = ({ selectedDice, onActionUsed }) => {
  const { locations, selectedSurvivorId, moveSurvivor, survivors } = useGameStore();
  const selectedSurvivor = survivors.find(s => s.id === selectedSurvivorId);

  const handleMove = (locationId: string) => {
    if (selectedSurvivorId && selectedDice) {
      moveSurvivor(selectedSurvivorId, locationId, selectedDice);
      onActionUsed(); // Clear the selected dice
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h2>สถานที่ (Locations)</h2>
      {locations.map(location => (
        <div
          key={location.id}
          className={`location-card location-${location.id}`} // Add a class for easier selection
          style={{ border: '1px solid #555', padding: '5px', marginBottom: '5px' }}
        >
          <h4>{location.name}</h4>
          <p>จำนวนซอมบี้: {location.zombies} / {location.zombieSlots}</p>
          <p>เครื่องกีดขวาง: {location.barricades}</p>
          {selectedSurvivorId && selectedSurvivor?.locationId !== location.id && (
            <button onClick={() => handleMove(location.id)} disabled={!selectedDice}>
              เดินทางมาที่นี่ (ใช้ลูกเต๋า: {selectedDice || 'เลือกก่อน'})
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default LocationsComponent;
