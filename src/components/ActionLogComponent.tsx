import useGameStore from '../store';

const ActionLogComponent = () => {
  const { actionLog } = useGameStore();

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px', height: '200px', overflowY: 'scroll' }}>
      <h3>บันทึกเหตุการณ์ (Action Log)</h3>
      <ul>
        {actionLog.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default ActionLogComponent;
