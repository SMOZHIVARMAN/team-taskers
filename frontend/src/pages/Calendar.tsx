import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, X, Clock, User, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { taskApi } from '@/services/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  workspaceName?: string;
  assignedBy?: string;
  assignee?: string;
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      
      const response = await taskApi.getByDateRange(start, end);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate empty cells for first day alignment
  const firstDayOfMonth = startOfMonth(currentDate);
  const startDay = firstDayOfMonth.getDay();

  const statusColors = {
    pending: 'bg-muted-foreground',
    in_progress: 'bg-warning',
    completed: 'bg-success',
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage your scheduled tasks</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft size={20} />
          </Button>
          <span className="text-lg font-semibold min-w-[160px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-xl overflow-hidden">
        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for alignment */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] p-2 bg-muted/30" />
          ))}

          {/* Days */}
          {days.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "min-h-[120px] p-2 border-t border-l border-border/50 cursor-pointer transition-all duration-200",
                  !isSameMonth(day, currentDate) && "opacity-50",
                  isToday(day) && "bg-primary/5",
                  isSelected && "bg-primary/10 ring-1 ring-primary/50",
                  "hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-2",
                    isToday(day) && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1",
                        task.status === 'completed' ? "bg-success/20 text-success" :
                        task.status === 'in_progress' ? "bg-warning/20 text-warning" :
                        "bg-muted text-muted-foreground"
                      )}
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusColors[task.status])} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedDate && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40"
            onClick={() => setSelectedDate(null)}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 animate-scale-in">
            <div className="glass rounded-xl p-6 m-4 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(null)}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-3">
                {selectedDateTasks.length > 0 ? (
                  selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-lg bg-muted/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-medium">{task.title}</h4>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full shrink-0",
                            task.status === 'completed' ? "bg-success/20 text-success" :
                            task.status === 'in_progress' ? "bg-warning/20 text-warning" :
                            "bg-muted text-muted-foreground"
                          )}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {task.workspaceName && (
                          <span className="inline-flex items-center gap-1">
                            <FolderKanban size={12} />
                            {task.workspaceName}
                          </span>
                        )}
                        {task.assignedBy && (
                          <span className="inline-flex items-center gap-1">
                            <User size={12} />
                            Assigned by {task.assignedBy}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            {format(new Date(task.dueDate), 'h:mm a')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto mb-2" size={32} />
                    <p>No tasks scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarPage;
