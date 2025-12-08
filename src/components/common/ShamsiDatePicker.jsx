import { useState, useRef, useEffect } from 'react';
import {
  parseShamsiDate,
  getDaysInShamsiMonth,
  getShamsiYearRange,
  persianMonthsEnglish,
  getCurrentShamsiDate
} from '../../utils/persianDate';
import './ShamsiDatePicker.css';

const ShamsiDatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  label,
  id,
  disabled = false,
  minYear = 1300,
  maxYear = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);
  const containerRef = useRef(null);

  // Initialize view from value or current date
  useEffect(() => {
    const parsed = parseShamsiDate(value);
    if (parsed) {
      setViewYear(parsed.jy);
      setViewMonth(parsed.jm);
    } else {
      const current = getCurrentShamsiDate();
      setViewYear(current?.jy || 1403);
      setViewMonth(current?.jm || 1);
    }
  }, [value]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const years = getShamsiYearRange(minYear, maxYear);
  const daysInMonth = viewYear && viewMonth ? getDaysInShamsiMonth(viewYear, viewMonth) : 30;

  const handleDateSelect = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const parsed = parseShamsiDate(value);
  const displayValue = parsed
    ? `${parsed.jy}/${String(parsed.jm).padStart(2, '0')}/${String(parsed.jd).padStart(2, '0')}`
    : '';

  // Generate calendar days
  const renderDays = () => {
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected = parsed && parsed.jy === viewYear && parsed.jm === viewMonth && parsed.jd === d;
      days.push(
        <button
          key={d}
          type="button"
          className={`day-btn ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(d)}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="shamsi-datepicker" ref={containerRef}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="input-wrapper">
        <input
          id={id}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          readOnly
          disabled={disabled}
          className="date-input"
        />
        {value && !disabled && (
          <button type="button" className="clear-btn" onClick={handleClear}>
            &times;
          </button>
        )}
        <span className="calendar-icon" onClick={() => !disabled && setIsOpen(!isOpen)}>
          📅
        </span>
      </div>

      {isOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button type="button" className="nav-btn" onClick={handlePrevMonth}>
              &lt;
            </button>
            <div className="month-year-selects">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value))}
              >
                {persianMonthsEnglish.map((month, i) => (
                  <option key={i} value={i + 1}>{month}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value))}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button type="button" className="nav-btn" onClick={handleNextMonth}>
              &gt;
            </button>
          </div>

          <div className="weekday-headers">
            <span>Sh</span>
            <span>Ye</span>
            <span>Do</span>
            <span>Se</span>
            <span>Ch</span>
            <span>Pa</span>
            <span>Jo</span>
          </div>

          <div className="days-grid">
            {renderDays()}
          </div>

          <div className="calendar-footer">
            <button
              type="button"
              className="today-btn"
              onClick={() => {
                const today = getCurrentShamsiDate();
                if (today) {
                  setViewYear(today.jy);
                  setViewMonth(today.jm);
                  handleDateSelect(today.jd);
                }
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShamsiDatePicker;
