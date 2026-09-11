import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Circle, Workflow } from 'lucide-react';
import { ProgressNode } from '@/hooks/useAdvancedGamification';
import { AppIcon } from '@/lib/iconMap';

interface ProgressTreeProps {
  nodes: ProgressNode[];
}

export function ProgressTree({ nodes }: ProgressTreeProps) {
  const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);

  return (
    <Card className="p-6 shadow-sm border border-border bg-card">
      <h3 className="font-bold text-lg mb-6 flex items-center">
        <Workflow size={20} className="mr-2 text-primary" />
        Progress Tree
      </h3>
      
      <div className="space-y-6">
        {sortedNodes.map((node, index) => {
          const canProgress = node.isUnlocked && !node.isCompleted;
          
          return (
            <div key={node.id} className="relative">
              {/* Connection line to previous node */}
              {index > 0 && (
                <div className="absolute -top-6 left-6 w-0.5 h-6 bg-border"></div>
              )}
              
              <div className={`relative p-4 rounded-lg border transition-all duration-300 ${
                node.isCompleted 
                  ? 'bg-secondary/10 border-green-200/50 shadow-md' 
                  : node.isUnlocked 
                  ? 'bg-muted/40 border-primary/20 shadow-md' 
                  : 'bg-muted/20 border-muted/30'
              }`}>
                {/* Level indicator */}
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      node.isCompleted ? 'bg-green-100 text-green-700 border-green-200' : 
                      node.isUnlocked ? 'bg-primary/10 text-primary border-primary/30' : 
                      'bg-muted/20 text-muted-foreground border-muted/30'
                    }`}
                  >
                    Level {node.level}
                  </Badge>
                </div>
                
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    node.isCompleted 
                      ? 'bg-secondary shadow-sm' 
                      : node.isUnlocked 
                      ? 'bg-primary shadow-sm' 
                      : 'bg-muted/40'
                  } ${node.isCompleted ? 'animate-scale-in' : ''}`}>
                    {node.isCompleted ? (
                      <CheckCircle2 size={24} className="text-white" />
                    ) : node.isUnlocked ? (
                      <Circle size={24} className="text-white" />
                    ) : (
                      <Lock size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AppIcon
                        name={node.icon}
                        size={20}
                        className={node.isUnlocked ? 'text-foreground' : 'text-muted-foreground opacity-50'}
                      />
                      <h4 className={`font-bold text-lg ${
                        node.isCompleted ? 'text-green-700' : 
                        node.isUnlocked ? 'text-foreground' : 
                        'text-muted-foreground'
                      }`}>
                        {node.title}
                      </h4>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      node.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {node.description}
                    </p>
                    
                    {/* Prerequisites */}
                    {node.prerequisites.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Prerequisites:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {node.prerequisites.map((prereq, i) => {
                            const prereqNode = nodes.find(n => n.id === prereq);
                            return (
                              <Badge 
                                key={prereq} 
                                variant="outline" 
                                className="text-xs"
                              >
                                {prereqNode?.title || prereq}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Progress bar for active nodes */}
                    {canProgress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(node.progressPercent)}%</span>
                        </div>
                        <Progress value={node.progressPercent} className="h-2" />
                      </div>
                    )}
                    
                    {/* Rewards */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {node.isCompleted ? 'Rewards Earned:' : 'Rewards:'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {node.rewards.map((reward, i) => (
                          <span 
                            key={i} 
                            className={`text-xs px-2 py-1 rounded-full ${
                              node.isCompleted 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-muted/30 text-muted-foreground border border-muted/30'
                            }`}
                          >
                            {reward}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}