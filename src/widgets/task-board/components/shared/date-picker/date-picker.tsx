import IconButton from '@shared/uikit/icon-button';
import { ReactComponent as TimerIcon } from '@images/icons/timer.svg';
import { ReactComponent as CloseIcon } from '@images/icons/close.svg';
import Calendar from '@shared/uikit/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { useState } from 'react';
import { toDate } from '@shared/lib/utils/date/to-date';
import { format } from 'date-fns';
import classNames from 'classnames';
import styles from "./styles.module.scss";

type DatePickerProps = {
  className?: string;
  disabled?: boolean;
  value: Date | number | null;
  onChange: (date: Date | null) => void;
};

function DatePicker({ disabled, value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState<boolean>(false);

  const date = value ? toDate(value) : null;

  const handleDateChange = (newDate: Date | null) => {
    setOpen(false);
    onChange(newDate);
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={classNames("flex items-center px-1 h-6 rounded-md cursor-pointer hover:bg-backgroundHover",{
        [styles.datePickerWrapper]: value,
      }, className)}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          {date ? (
            <div>
              <button
                disabled={disabled}
                className='text-xs'
                type='button'
              >
                <time
                  className={className}
                  title={date.toLocaleString()}
                  dateTime={date.toISOString()}
                >
                  {format(date, "dd/MM/yyyy")}
                </time>
              </button>
            </div>
          ) : (
            <IconButton
              className={className}
              variant='transparent'
              disabled={disabled}
              aria-label='Pick the date'
            >
              <TimerIcon />
            </IconButton>
          )}
        </PopoverTrigger>
        <PopoverContent>
          <Calendar onSelect={handleDateChange} />
        </PopoverContent>
      </Popover>
      {value && (
        <IconButton
          variant='transparent'
          disabled={disabled}
          size='xs'
          aria-label='Remove the date'
          onClick={() => handleDateChange(null)}
        >
          <CloseIcon />
        </IconButton>
      )}
    </div>
  );
}

export default DatePicker;
