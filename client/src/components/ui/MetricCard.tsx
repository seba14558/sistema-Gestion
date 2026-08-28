import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  icon: LucideIcon;
  color: 'purple' | 'blue' | 'cyan' | 'emerald' | 'amber';
  trend?: number;
  index?: number;
}

const colorMap = {
  purple: { border: 'border-l-accent-purple', bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
  blue: { border: 'border-l-accent-blue', bg: 'bg-accent-blue/10', text: 'text-accent-blue' },
  cyan: { border: 'border-l-accent-cyan', bg: 'bg-accent-cyan/10', text: 'text-accent-cyan' },
  emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  amber: { border: 'border-l-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500' }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix = '$',
  icon: Icon,
  color,
  trend,
  index = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const formatter = new Intl.NumberFormat('es-AR');
  const styles = colorMap[color];

  return (
    <div 
      className={`glass-card p-6 border-l-4 ${styles.border} animate-slide-up flex flex-col justify-between`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${styles.bg}`}>
          <Icon className={`w-6 h-6 ${styles.text}`} />
        </div>
      </div>
      
      <div>
        <div className="text-3xl font-bold text-white mb-2">
          {prefix}{formatter.format(Math.floor(displayValue))}
        </div>
        
        {trend !== undefined && (
          <div className="flex items-center text-sm">
            {trend >= 0 ? (
              <span className="flex items-center text-emerald-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{trend}%
              </span>
            ) : (
              <span className="flex items-center text-red-400">
                <TrendingDown className="w-4 h-4 mr-1" />
                {trend}%
              </span>
            )}
            <span className="text-gray-500 ml-2">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};
