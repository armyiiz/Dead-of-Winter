import useGameStore from '../store';

const CrisisComponent = () => {
  const { currentCrisis } = useGameStore();

  if (!currentCrisis) {
    return <div>กำลังจั่วการ์ดวิกฤต...</div>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', backgroundColor: '#4a2a2a' }}>
      <h2>วิกฤตการณ์ปัจจุบัน (Current Crisis)</h2>
      <h3>{currentCrisis.title}</h3>
      <p>{currentCrisis.story}</p>
      <div>
        <strong>ต้องการ:</strong>
        <ul>
          {currentCrisis.requirements.map((req, index) => (
            <li key={index}>{req.type}: {req.amount}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CrisisComponent;
