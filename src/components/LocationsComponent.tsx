import useGameStore from '../store';

const LocationsComponent = () => {
  const { locations, selectedSurvivorId, moveSurvivor } = useGameStore();

  const handleMove = (locationId: string) => {
    if (selectedSurvivorId) {
      moveSurvivor(selectedSurvivorId, locationId);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h2>สถานที่ (Locations)</h2>
      {locations.map(location => (
        <div key={location.id} style={{ border: '1px solid #555', padding: '5px', marginBottom: '5px' }}>
          <h4>{location.name}</h4>
          <p>จำนวนซอมบี้: {location.zombies} / {location.zombieSlots}</p>
          <p>เครื่องกีดขวาง: {location.barricades}</p>
          {selectedSurvivorId && (
            <button onClick={() => handleMove(location.id)}>
              เดินทางมาที่นี่
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default LocationsComponent;
