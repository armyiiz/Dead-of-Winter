import useGameStore from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Button from './ui/button';

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
    <Card className="bg-surface">
      <CardHeader>
        <CardTitle>สถานที่ (Locations)</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        <div className="flex flex-col gap-3">
          {locations.map(location => {
            const isCurrent = selectedSurvivor?.locationId === location.id;
            return (
              <div
                key={location.id}
                className={`location-card border rounded-lg p-3 ${isCurrent ? 'border-strong bg-surface-muted' : 'bg-surface-elevated'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{location.name}</h4>
                  <span className="status-pill">{location.id}</span>
                </div>
                <div className="text-sm text-muted">
                  <p>จำนวนซอมบี้: {location.zombies} / {location.zombieSlots}</p>
                  <p>เครื่องกีดขวาง: {location.barricades}</p>
                </div>
                {selectedSurvivorId && !isCurrent && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMove(location.id)}
                      disabled={!selectedDice}
                      className="w-full"
                    >
                      เดินทางมาที่นี่ (ใช้ลูกเต๋า: {selectedDice || 'เลือกก่อน'})
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationsComponent;
