import React from 'react';
import useGameStore from '../store';
import { Crossroad, CrossroadChoice } from '../types';

const CrossroadsModal: React.FC = () => {
  const { currentCrossroad, resolveCrossroad } = useGameStore();

  if (!currentCrossroad) {
    return null;
  }

  const handleChoice = (choice: CrossroadChoice) => {
    resolveCrossroad(choice);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{currentCrossroad.title}</h2>
        <p className="mb-4">{currentCrossroad.setup}</p>
        <div className="space-y-2">
          {currentCrossroad.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoice(choice)}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossroadsModal;
