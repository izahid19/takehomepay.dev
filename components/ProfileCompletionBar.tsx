import { CheckCircle2, Circle } from 'lucide-react';

interface ProfileCompletionBarProps {
  completion: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfileCompletionBar({ 
  completion, 
  showLabel = true, 
  size = 'md',
  className = '' 
}: ProfileCompletionBarProps) {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const isComplete = completion >= 100;
  const isGood = completion >= 80;

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className={`flex justify-between items-center ${textSizeClasses[size]} font-medium`}>
          <span className="text-muted-foreground flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground/50" />
            )}
            Profile Completion
          </span>
          <span className={`font-bold ${
            isComplete ? 'text-emerald-500' : 
            isGood ? 'text-primary' : 
            'text-amber-500'
          }`}>
            {completion}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-muted rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div 
          className={`${heightClasses[size]} transition-all duration-700 ease-out rounded-full ${
            isComplete ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
            isGood ? 'bg-gradient-to-r from-primary to-primary/80' :
            'bg-gradient-to-r from-amber-500 to-amber-600'
          }`}
          style={{ width: `${Math.min(completion, 100)}%` }}
        />
      </div>
      
      {showLabel && (
        <p className="text-[10px] text-muted-foreground italic text-right">
          {isComplete ? '✨ Your profile is fully optimized!' : 
           isGood ? 'Great! You can generate proposals.' :
           'Complete 80% to unlock proposal generation.'}
        </p>
      )}
    </div>
  );
}
