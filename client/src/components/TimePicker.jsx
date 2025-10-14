import { useState } from 'react';

const TimePicker = ({ value, onChange, className = '', placeholder = '', step = 60 }) => {
  const [hours, setHours] = useState(() => {
    if (!value) return '';
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    return match ? match[1] : '';
  });
  
  const [minutes, setMinutes] = useState(() => {
    if (!value) return '';
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    return match ? match[2] : '';
  });

  const handleHoursChange = (e) => {
    const val = e.target.value;
    setHours(val);
    if (val && minutes) {
      onChange(`${val.padStart(2, '0')}:${minutes}`);
    } else if (val === '' && minutes === '') {
      onChange('');
    }
  };

  const handleMinutesChange = (e) => {
    const val = e.target.value;
    setMinutes(val);
    if (hours && val) {
      onChange(`${hours.padStart(2, '0')}:${val}`);
    } else if (hours === '' && val === '') {
      onChange('');
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <select
        value={hours}
        onChange={handleHoursChange}
        className="input-field w-16 text-center p-2"
      >
        <option value="">--</option>
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {i.toString().padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="text-white font-bold">:</span>
      <select
        value={minutes}
        onChange={handleMinutesChange}
        className="input-field w-16 text-center p-2"
      >
        <option value="">--</option>
        {Array.from({ length: 60 / (step / 60) }, (_, i) => {
          const minute = i * (step / 60);
          return (
            <option key={minute} value={minute.toString().padStart(2, '0')}>
              {minute.toString().padStart(2, '0')}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default TimePicker;
