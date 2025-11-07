import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => {
  return <div className={cn('ui-card', className)} {...props} />;
};

export const CardHeader = ({ className, ...props }: CardProps) => {
  return <div className={cn('ui-card-header', className)} {...props} />;
};

export const CardTitle = ({ className, ...props }: CardProps) => {
  return <h3 className={cn('ui-card-title', className)} {...props} />;
};

export const CardDescription = ({ className, ...props }: CardProps) => {
  return <p className={cn('ui-card-description', className)} {...props} />;
};

export const CardContent = ({ className, ...props }: CardProps) => {
  return <div className={cn('ui-card-content', className)} {...props} />;
};

export const CardFooter = ({ className, ...props }: CardProps) => {
  return <div className={cn('ui-card-footer', className)} {...props} />;
};
