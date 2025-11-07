import React, { useState } from 'react';
import useGameStore from '../store';
import { CrossroadChoice } from '../types';
import DicePoolComponent from './DicePoolComponent';
import Button from './ui/button';

const CrossroadsModal: React.FC = () => {
  const { currentCrossroad, resolveCrossroad, survivors, selectedSurvivorId } = useGameStore();
  const [spendDiceChoice, setSpendDiceChoice] = useState<CrossroadChoice | null>(null);
  const [selectedDice, setSelectedDice] = useState<number | null>(null);

  if (!currentCrossroad) {
    return null;
  }

  const checkRequirements = (choice: CrossroadChoice) => {
    if (!choice.requires) return true;

    const activeSurvivor = survivors.find(s => s.id === selectedSurvivorId);

    switch (choice.requires.type) {
      case 'SURVIVOR_PRESENT':
        return survivors.some(s => s.locationId === activeSurvivor?.locationId && s.id === choice.requires.id);
      case 'SURVIVOR_ABSENT':
        return !survivors.some(s => s.locationId === activeSurvivor?.locationId && s.id === choice.requires.id);
      case 'CHECK_SURVIVOR_COUNT':
        const [operator, value] = choice.requires.value!.split(' ');
        if (operator === '<') return survivors.length < parseInt(value);
        if (operator === '>') return survivors.length > parseInt(value);
        return survivors.length === parseInt(value);
      default:
        return true;
    }
  };

  const handleChoice = (choice: CrossroadChoice) => {
    if (choice.action.type === 'SPEND_DIE_FOR_REWARD') {
      setSpendDiceChoice(choice);
    } else {
      resolveCrossroad(choice);
    }
  };

  const handleSpendDice = () => {
    if (spendDiceChoice && selectedDice) {
      resolveCrossroad({ ...spendDiceChoice, action: { ...spendDiceChoice.action, value: selectedDice } });
      setSpendDiceChoice(null);
      setSelectedDice(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur flex items-center justify-center z-50">
      <div className="ui-modal max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{currentCrossroad.title}</h2>
        <p className="text-sm text-muted mb-4">{currentCrossroad.setup}</p>
        {spendDiceChoice ? (
          <div className="flex flex-col gap-3">
            <DicePoolComponent
              selectedDice={selectedDice}
              onSelectDice={setSelectedDice}
              isRerollMode={false}
              setRerollMode={() => {}}
            />
            <Button variant="primary" onClick={handleSpendDice} disabled={!selectedDice}>
              ยืนยันการใช้ลูกเต๋า
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {currentCrossroad.choices.map((choice, index) => {
              const isEnabled = checkRequirements(choice);
              return (
                <Button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  disabled={!isEnabled}
                  className="w-full"
                  variant={isEnabled ? 'primary' : 'outline'}
                >
                  {choice.text}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossroadsModal;
