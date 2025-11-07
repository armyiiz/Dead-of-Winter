import useGameStore from '../store';
import { Survivor } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import Button from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';
import { useToast } from './ui/toast';

const SurvivorsComponent = () => {
  const { survivors, selectSurvivor, selectedSurvivorId, useSkill, useUsableItem } = useGameStore();
  const { toast } = useToast();

  const handleUseSkill = (survivor: Survivor) => {
    if (survivor.id === 'S003') {
      const potentialTargets = survivors.filter(s => s.locationId === survivor.locationId && s.hp < 3);
      const target = potentialTargets.find(t => t.id !== survivor.id) || (survivor.hp < 3 ? survivor : null);
      if (target) {
        useSkill(survivor.id, target.id);
      } else {
        toast({
          variant: 'danger',
          title: 'ไม่สามารถใช้สกิล',
          description: 'ไม่มีเป้าหมายให้รักษาในบริเวณนี้',
        });
      }
    } else {
      useSkill(survivor.id);
    }
  };

  return (
    <div className="survivor-grid">
      {survivors.map(survivor => {
        const isSelected = survivor.id === selectedSurvivorId;
        const isDown = survivor.hp <= 0;
        return (
          <Card
            key={survivor.id}
            className={cn(
              'survivor-card bg-surface-elevated border-strong',
              isSelected && 'shadow-lg border-primary',
              isDown && 'disabled'
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{survivor.name}</CardTitle>
                <span className={cn('status-pill', isDown ? 'downed' : 'alive')}>
                  {isDown ? 'เสียชีวิต' : 'พร้อมรบ'}
                </span>
              </div>
              <CardDescription>HP {survivor.hp} • พื้นที่ {survivor.locationId}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm text-muted">
                <span>สถานะ: {survivor.status}</span>
                <span>สกิล: {survivor.skill.name}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant={isSelected ? 'primary' : 'outline'}
                onClick={() => selectSurvivor(survivor.id)}
                disabled={isDown}
              >
                {isSelected ? 'เลือกแล้ว' : 'เลือกผู้รอดชีวิต'}
              </Button>
              {(survivor.id === 'S003' || survivor.id === 'S008') && (
                <Button
                  size="sm"
                  onClick={() => handleUseSkill(survivor)}
                  disabled={!isSelected || isDown}
                >
                  ใช้สกิล (ฟรี)
                </Button>
              )}
              <Popover>
                <PopoverTrigger>
                  <Button size="sm" variant="outline" disabled={survivor.personalInventory.length === 0}>
                    ของติดตัว
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="ui-popover__title">ของติดตัว</div>
                  {survivor.personalInventory.length > 0 ? (
                    <div className="ui-popover__list">
                      {survivor.personalInventory.map(item => (
                        <div key={item.id} className="ui-popover__item">
                          <div className="text-sm font-semibold">{item.name}</div>
                          <div className="text-xs text-muted">{item.description}</div>
                          {item.usable && (
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => useUsableItem(survivor.id, item.id)}
                              disabled={!isSelected || isDown}
                            >
                              ใช้ไอเท็ม
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">ไม่มีไอเท็มพกติดตัว</p>
                  )}
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger>
                  <Button size="sm" variant="ghost">
                    รายละเอียดสกิล
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="ui-popover__title">{survivor.skill.name}</div>
                  <p className="text-sm text-muted">{survivor.skill.description}</p>
                </PopoverContent>
              </Popover>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default SurvivorsComponent;
