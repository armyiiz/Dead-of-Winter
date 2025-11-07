import { useEffect, useState } from 'react';
import useGameStore from './store';
import SurvivorsComponent from './components/SurvivorsComponent';
import LocationsComponent from './components/LocationsComponent';
import ColonyStatusComponent from './components/ColonyStatusComponent';
import CrisisComponent from './components/CrisisComponent';
import DicePoolComponent from './components/DicePoolComponent';
import ActionsComponent from './components/ActionsComponent';
import ActionLogComponent from './components/ActionLogComponent';
import CrossroadsModal from './components/CrossroadsModal';
import StarvationModal from './components/StarvationModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import Button from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

function App() {
  const {
    setupGame,
    gameStatus,
    nextPhase,
    currentDay,
    currentPhase,
    pendingStarvationWounds,
    currentCrossroad,
    mainObjective,
  } = useGameStore();
  const [selectedDice, setSelectedDice] = useState<number | null>(null);
  const [isRerollMode, setRerollMode] = useState(false);

  // Function to clear selected dice after an action is used
  const handleActionUsed = () => {
    setSelectedDice(null);
  };

  // Setup game on initial render
  useEffect(() => {
    setupGame();
  }, [setupGame]);

  // Reset selected dice and reroll mode when phase changes
  useEffect(() => {
    setSelectedDice(null);
    setRerollMode(false);
  }, [currentPhase]);

  return (
    <div className="app-shell grid grid-cols-10 gap-4 h-screen p-4">
      {pendingStarvationWounds > 0 && <StarvationModal />}
      {currentCrossroad && <CrossroadsModal />}

      <div className="col-span-7 flex flex-col gap-4 overflow-hidden">
        <LocationsComponent selectedDice={selectedDice} onActionUsed={handleActionUsed} />

        <div className="flex flex-col gap-4 mt-auto">
          <DicePoolComponent
            selectedDice={selectedDice}
            onSelectDice={setSelectedDice}
            isRerollMode={isRerollMode}
            setRerollMode={setRerollMode}
          />
          <ActionsComponent
            selectedDice={selectedDice}
            isRerollMode={isRerollMode}
            setRerollMode={setRerollMode}
            onActionUsed={handleActionUsed}
          />
        </div>
      </div>

      <div className="col-span-3 h-full overflow-y-auto flex flex-col gap-4">
        <Card className="bg-surface-elevated border-strong">
          <CardHeader>
            <CardTitle>The Last Compound</CardTitle>
            <CardDescription>
              สถานะเกม: {gameStatus} • วันที่ {currentDay} • เฟส {currentPhase}
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            {gameStatus === 'Won' && <p className="text-success font-semibold">คุณชนะแล้ว!</p>}
            {gameStatus === 'Lost' && <p className="text-danger font-semibold">คุณแพ้แล้ว!</p>}
            {gameStatus === 'Playing' && (
              <Button
                variant="primary"
                className="w-full"
                onClick={nextPhase}
                disabled={pendingStarvationWounds > 0}
              >
                {pendingStarvationWounds > 0
                  ? 'รอแก้ไขการอดอาหาร...'
                  : 'ไปยังเฟสถัดไป (Next Phase)'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="survivors" className="flex-1 flex flex-col gap-4">
          <TabsList>
            <TabsTrigger value="survivors">ผู้รอดชีวิต</TabsTrigger>
            <TabsTrigger value="colony">สถานะกลุ่ม</TabsTrigger>
            <TabsTrigger value="log">บันทึก</TabsTrigger>
          </TabsList>
          <TabsContent value="survivors" className="flex-1">
            <SurvivorsComponent />
          </TabsContent>
          <TabsContent value="colony">
            <div className="flex flex-col gap-4">
              <ColonyStatusComponent />
              <CrisisComponent />
              {mainObjective && (
                <Card className="bg-surface-elevated">
                  <CardHeader>
                    <CardTitle>เป้าหมายหลัก</CardTitle>
                    <CardDescription>{mainObjective.title}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted">{mainObjective.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="log">
            <ActionLogComponent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
