import { useEffect, useRef } from 'react';
import useGameStore from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const ActionLogComponent = () => {
  const { actionLog } = useGameStore();
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [actionLog]);

  return (
    <Card className="bg-surface">
      <CardHeader>
        <CardTitle>บันทึกเหตุการณ์ (Action Log)</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={logRef} className="action-log">
          <ul>
            {actionLog.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionLogComponent;
