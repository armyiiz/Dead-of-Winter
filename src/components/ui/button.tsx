import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'primary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'default' | 'sm' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: '',
  primary: 'ui-button--primary',
  danger: 'ui-button--danger',
  ghost: 'ui-button--ghost',
  outline: 'ui-button--outline',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: '',
  sm: 'ui-button--sm',
  lg: 'ui-button--lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn('ui-button', variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
