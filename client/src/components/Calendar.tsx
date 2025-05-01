import { isSameDay, isSameMonth, format, isToday } from 'date-fns';
import { Appointment } from '@shared/schema';

interface CalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  appointments: Appointment[];
  onDateClick: (day: Date) => void;
  isLoading?: boolean;
}

export const Calendar = ({ currentMonth, selectedDate, appointments, onDateClick, isLoading = false }: CalendarProps) => {
  // Helper function to get the days in a month
  const getDaysInMonth = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    const day = startDate.getDay();
    
    // Move to the start of the week (Sunday)
    startDate.setDate(startDate.getDate() - day);
    
    const endDate = new Date(monthEnd);
    // If the last day is not Saturday, extend to the end of the week
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }
    
    const days = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };
  
  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => isSameDay(new Date(appointment.date), day));
  };
  
  // Format the day for display
  const formatDay = (day: Date) => {
    return format(day, 'd');
  };
  
  // Generate calendar cells
  const days = getDaysInMonth();
  const weeks = [];
  let week = [];
  
  for (let i = 0; i < days.length; i++) {
    week.push(days[i]);
    
    if (week.length === 7 || i === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-700"></div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-2">
        <div className="text-center text-sm font-medium text-slate-500">Sun</div>
        <div className="text-center text-sm font-medium text-slate-500">Mon</div>
        <div className="text-center text-sm font-medium text-slate-500">Tue</div>
        <div className="text-center text-sm font-medium text-slate-500">Wed</div>
        <div className="text-center text-sm font-medium text-slate-500">Thu</div>
        <div className="text-center text-sm font-medium text-slate-500">Fri</div>
        <div className="text-center text-sm font-medium text-slate-500">Sat</div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelectedDay = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const dayAppointments = getAppointmentsForDay(day);
            
            return (
              <div 
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[100px] border border-slate-200 p-1 text-sm cursor-pointer ${
                  !isCurrentMonth ? 'text-slate-400' : ''
                } ${
                  isSelectedDay ? 'bg-primary-50' : ''
                } ${
                  isCurrentDay && !isSelectedDay ? 'border-primary-500' : ''
                }`}
                onClick={() => onDateClick(day)}
              >
                <div className={`text-right ${
                  isSelectedDay ? 'font-medium text-primary-700' : ''
                }`}>
                  {formatDay(day)}
                </div>
                <div className="mt-1 space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div 
                      key={appointment.id}
                      className={`text-xs p-1 rounded truncate ${
                        appointment.type === 'follow-up' 
                          ? 'bg-blue-100 text-blue-800' 
                          : appointment.type === 'new-patient' 
                            ? 'bg-purple-100 text-purple-800'
                            : appointment.type === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                      }`}
                    >
                      <div className="truncate">{appointment.title.split(':')[0]}</div>
                      <div>{format(new Date(appointment.date), 'h:mm a')}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-center text-slate-500">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};


