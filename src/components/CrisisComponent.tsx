import useGameStore from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const CrisisComponent = () => {
  const { currentCrisis } = useGameStore();

  if (!currentCrisis) {
    return <div>กำลังจั่วการ์ดวิกฤต...</div>;
  }

  return (
    <Card className="bg-surface">
      <CardHeader>
        <CardTitle>วิกฤตการณ์ปัจจุบัน (Current Crisis)</CardTitle>
        <p className="text-sm text-muted">{currentCrisis.title}</p>
      </CardHeader>
      <CardContent className="text-sm text-muted flex flex-col gap-3">
        <p>{currentCrisis.story}</p>
        <div>
          <strong className="text-xs uppercase tracking-wide text-muted">สิ่งที่ต้องการ</strong>
          <ul className="inline-list mt-2">
            {currentCrisis.requirements.map((req, index) => (
              <li key={index}>
                {req.type}: {req.amount}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrisisComponent;
