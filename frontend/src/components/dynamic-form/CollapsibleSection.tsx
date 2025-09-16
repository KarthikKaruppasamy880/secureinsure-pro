import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface SectionContainerProps {
  title: string;
  level: number;
  fields: React.ReactNode[];
  errorCount?: number;
  className?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  level,
  fields,
  errorCount = 0,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(level <= 2); // Auto-expand top levels
  
  const getLevelStyles = () => {
    switch (level) {
      case 1:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
      case 2:
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 3:
        return 'border-l-4 border-l-purple-500 bg-purple-50';
      case 4:
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  const getLevelIcon = () => {
    switch (level) {
      case 1:
        return '📋';
      case 2:
        return '📁';
      case 3:
        return '📂';
      case 4:
        return '📄';
      default:
        return '📄';
    }
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <Card className={`${getLevelStyles()} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getLevelIcon()}</span>
            <span className="font-medium">{title}</span>
            {errorCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
