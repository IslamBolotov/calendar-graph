import axios from 'axios';
import './App.css';
import { useEffect, useState } from 'react';
import {
  subYears,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfDay,
  endOfWeek,
  startOfDay,
  format,
  addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

const BASE_URL = 'https://dpg.gg/test/calendar.json';

const getClassName = (contributions) => {
  if (contributions >= 30) {
    return 'high';
  }
  if (contributions >= 20) {
    return 'meduim';
  }
  if (contributions >= 10) {
    return 'normal';
  }
  if (contributions >= 1) {
    return 'low';
  }
  return ''
};

const daysOfWeek = ['Пн', '', 'Ср', '', 'Пт', '', ''];
const description = [
  { text: 'no', class: '' },
  { text: '1-9', class: 'low' },
  { text: '10-19', class: 'normal' },
  { text: '20-29', class: 'medium' },
  { text: '30+', class: 'high' },
]

function App() {
  const [allDays, setAllDays] = useState([]);
  const [monthNames, setMonthNames] = useState([]);

  const getCurrentYearDays = (data) => {
    const yearStart = new Date();
    const oneYearLater = subYears(yearStart, 1);
    const weeks = eachWeekOfInterval({ start: oneYearLater, end: yearStart }, { weekStartsOn: 1 });

    const groupedDays = weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: startOfDay(weekStart), end: endOfDay(weekEnd) });
      const days = daysInWeek.map((item) => {
        const formatDay = format(item, 'yyyy-MM-dd');
        return { date: item, contributions: data[formatDay] || 0 }
      })
      return { week: weekStart, days };
    });
  
    return groupedDays;
  };

  const getMonthNames = () => {
    const currentDate = new Date();
    const monthNames = [];
    for (let i = 0; i < 12; i++) {
      const date = addMonths(currentDate, i);
      const monthName = format(date, 'LLL', { locale: ru });
      monthNames.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
    }
    return monthNames;
  }

  const init = async () => {
    const { data } = await axios.get(BASE_URL);
    const yearDays = getCurrentYearDays(data);
    setAllDays(yearDays);
    const names = getMonthNames();
    setMonthNames(names);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className='App'>
      <div className='months'>
        {monthNames.map((item) => (
          <span key={item} className='month_name'>{item}</span>
        ))}
      </div>
      <div className="activity">
        <div className='days_of_week'>
          {daysOfWeek.map((item, index) => (
            <div key={index} className='day_of_week'>{item}</div>
          ))}
        </div>
        {allDays.map((item, index) => (
          <div className='weeks' key={index}>
            {item?.days?.map((day) => (
              <div
                key={day.date}
                className={'day ' + getClassName(day.contributions)}
              >
                <div className='tooltip_text'>
                  <span className='tooltip_text-contributions'>{day.contributions || 'no'} contributions</span><br/>
                  <span className='tooltip_text-date'>{format(day.date, 'EEEE, LLLL d, yyyy', { locale: ru })}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className='description'>
        <div className='description_text'>Меньше</div>
        {description.map((item) => (
          <div key={item.text} className={'day ' + item.class}>
            <div className='tooltip_text'>
              <span className='tooltip_text-contributions'>{item.text} contributions</span><br/>
            </div>
          </div>
        ))}
        <div className='description_text'>Больше</div>
      </div>
    </div>
  );
}

export default App;
