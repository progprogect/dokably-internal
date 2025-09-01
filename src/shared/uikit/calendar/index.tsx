import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays } from 'date-fns';
import classNames from 'classnames';

const Calendar = ({ selectedDate, onSelect }: { selectedDate?: Date; onSelect?: (date: Date) => void }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = React.useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfMonth = (monthStart.getDay() + 6) % 7;
  const prevMonthDays =
    firstDayOfMonth > 0
      ? Array.from({ length: firstDayOfMonth }, (_, i) => subDays(monthStart, firstDayOfMonth - i))
      : [];

  const lastDayOfMonth = (monthEnd.getDay() + 6) % 7;
  const nextMonthDays =
    lastDayOfMonth < 6 ? Array.from({ length: 6 - lastDayOfMonth }, (_, i) => addDays(monthEnd, i + 1)) : [];

  const allDays = [...prevMonthDays, ...monthDays, ...nextMonthDays];
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const previousYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth()));
  };

  const nextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth()));
  };

  const selectMonth = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month));
    setIsMonthPickerOpen(false);
  };

  return (
    <div
      contentEditable={false}
      tabIndex={-1}
      role='none'
      className='w-64 bg-white rounded-s shadow-lg p-4 select-none-all'
    >
      <div className='flex items-center'>
        <span
          className='text-sml text-center flex-grow font-medium cursor-pointer'
          onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
        >
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className='flex'>
          <button
            onClick={previousYear}
            className='p-2 text-text40 rounded hover:text-white hover:bg-fontBlue transition-colors'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
          <button
            onClick={nextYear}
            className='p-2 text-text40 rounded hover:text-white hover:bg-fontBlue transition-colors'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>

      {isMonthPickerOpen && (
        <div className='grid grid-cols-3 gap-2 mt-2'>
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              onClick={() => selectMonth(i)}
              className='p-2 text-text rounded hover:text-white hover:bg-fontBlue transition-colors'
            >
              {format(new Date(currentMonth.getFullYear(), i), 'MMM')}
            </button>
          ))}
        </div>
      )}

      {!isMonthPickerOpen && (
        <div className='grid grid-cols-7 gap-0'>
          {weekDays.map((day) => (
            <div
              key={day}
              className='w-8 h-8 flex items-center justify-center text-sm font-normal text-text40'
            >
              {day}
            </div>
          ))}

          {allDays.map((day, index) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isHovered = hoveredDate && isSameDay(day, hoveredDate);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={index}
                onClick={() => onSelect?.(day)}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                className={classNames(
                  'relative h-8 w-8 flex items-center justify-center text-base p-2 text-text rounded hover:text-white hover:bg-fontBlue transition-colors font-normal',
                  {
                    'text-text40': !isCurrentMonth,
                    'text-text': isCurrentMonth && !isSelected && !isHovered,
                    'bg-fontBlue text-white': isSelected,
                    'bg-white text-fontBlue': isHovered && !isSelected,
                    'border border-text40 rounded-full': isToday,
                  },
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Calendar;
