import React, { useState } from 'react';
import useGameStore from '../store';
import { Crossroad, CrossroadChoice } from '../types';
import DicePoolComponent from './DicePoolComponent';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{currentCrossroad.title}</h2>
        <p className="mb-4">{currentCrossroad.setup}</p>
        {spendDiceChoice ? (
          <div>
            <DicePoolComponent selectedDice={selectedDice} onSelectDice={setSelectedDice} isRerollMode={false} setRerollMode={() => {}} />
            <button onClick={handleSpendDice} disabled={!selectedDice} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
              Confirm Dice Selection
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {currentCrossroad.choices.map((choice, index) => {
              const isEnabled = checkRequirements(choice);
              return (
                <button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  disabled={!isEnabled}
                  className={`w-full font-bold py-2 px-4 rounded ${
                    isEnabled
                      ? 'bg-blue-500 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  }`}
                >
                  {choice.text}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossroadsModal;
