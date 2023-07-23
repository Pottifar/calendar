import React, { useState, useEffect } from 'react';
import Booking from './Booking';

// Used to display the name of the month, not the number
const monthNames = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getStartingDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const Calendar = ({ userName }) => {
  const d = new Date();
  const [currentYear, setCurrentYear] = useState(d.getFullYear()); // Initialize the currentYear state
  const [currentMonth, setCurrentMonth] = useState(d.getMonth()); // Initialize the currentMonth state
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [appointmentsUser, setAppointmentsUser] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define a useEffect hook to fetch data when the component is mounted
  useEffect(() => {
    // Fetch data only if the component is mounted (loading is true)
    if (loading === true) {
      fetchAppointmentsForUser();
    }
    // The dependency array is empty, so this effect will only run once on component mount
  }, []);

  // This function takes care of when the user clicks on a particular day
  const handleDateSelection = (value) => {
    setSelectedDate({
      year: currentYear,
      month: currentMonth,
      day: value,
    });
    setShowBooking(true); // Show the booking form when a date is selected
  };

  // Allows the user to go back to previous months
  const prevMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = (prevMonth - 1 + 12) % 12;
      if (newMonth === 11) {
        setCurrentYear((prevYear) => prevYear - 1); // Decrease year if moving from January to December
      }
      return newMonth;
    });
    setSelectedDate(null); // Reset selectedDate when changing months
  };

  // Allows the user to go to next month
  const nextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = (prevMonth + 1) % 12;
      if (newMonth === 0) {
        setCurrentYear((prevYear) => prevYear + 1); // Increase year if moving from December to January
      }
      return newMonth;
    });
    setSelectedDate(null); // Reset selectedDate when changing months
  };

  const renderCalendarDays = (handleDateSelection) => {
    const totalDaysInMonth = getDaysInMonth(currentYear, currentMonth);
    const startingDayOfMonth = getStartingDayOfMonth(currentYear, currentMonth);

    const calendarDays = [];

    // Add rows for each week
    for (let week = 0; week < 6; week++) {
      const weekCells = [];

      // Add cells for the days of the week
      for (let day = 1; day < 8; day++) {
        const dayNumber = (week * 7) + day - startingDayOfMonth + 1;
        if (dayNumber <= 0 || dayNumber > totalDaysInMonth) {
          // Add empty cells for days before the starting day or after the last day of the month
          weekCells.push(<td key={`empty-${day}-${week}`}></td>);
        } else {
          weekCells.push(
            <td key={`day-${dayNumber}`}>
              <button className="tableBtn" onClick={() => handleDateSelection(dayNumber)}>
                {dayNumber}
              </button>
            </td>
          );
        }
      }

      // Add the week row to the calendar
      calendarDays.push(<tr key={`week-${week}`}>{weekCells}</tr>);
    }

    return calendarDays;
  };

  // Calls the backend end point for retreving all of the specific users bookings
  async function fetchAppointmentsForUser() {
    try {
      const response = await fetch(`http://localhost:3001/api/getBookingForUser?name=${userName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointmentsUser(data);
      } else {
        console.error('Error fetching appointments:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false); // Set loading to false after the fetch is complete, regardless of success or failure
    }
  }

  // When the page is reloaded, the user is taken to the Log In screen, therefor we can just 
  // reload the page to log out
  function reloadPage(){
    window.location.reload()
  }

  return (
    <div> 
      {showBooking ? (
        <Booking selectedDate={selectedDate} userName={userName} isLoading={setLoading}/>
      ) : (
        <>
        <button onClick={reloadPage} className='logOutBtn'>&lt;</button>
        <h1>Welcome, {userName}!</h1>
        <p>Click on a day to see the available bookings.</p>
          <div className="calendarHeader">
            <button className="prev" onClick={prevMonth}>PREV</button>
            <p className="monthYear"><b>{monthNames[currentMonth]} {currentYear}</b></p>
            <button className="next" onClick={nextMonth}>NEXT</button>
          </div>

          <table className="bookingTable">
            <thead>
              <tr>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
                <th>Sunday</th>
              </tr>
            </thead>
            <tbody>
              {renderCalendarDays(handleDateSelection)}
            </tbody>
          </table>

        {/* This next bit is a bit confusing.
        First, we check if we are still loading. If we are, we display Loading....
        If we are not loading, we check if we have any apointments (if appointmentsUser is empty or not)
        and then we either display the table with bookings, or we tell the user there are no bookings. */}

          <h3>Your bookings:</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {appointmentsUser.length === 0 ? (
                    <div>
                        <h3 className="noAppointment">You have no upcoming appointments.</h3>
                    </div>
                ) : (
                  <>
                  
                    <table className="dayTable">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Time</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsUser.map((appointmentUser) => (
                          <tr key={appointmentUser.id}>
                            <td>{appointmentUser.userName}</td>
                            <td>
                              {formatTime(appointmentUser.startTime)} - {formatTime(appointmentUser.endTime)}
                            </td>
                            <td>
                              {formatDate(appointmentUser.date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
            </>
        )}
        </>
      )}
    </div>
  );
};

// This function formatts the time to remove the SS from HH:MM:SS. We only care about HH:MM
const formatTime = (timeString) => {
  if (!timeString) {
    return '00:00';
  }

  const [hours, minutes] = timeString.split(':');
  const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  return formattedTime;
};

const formatDate = (dateString) => {
  if (!dateString) {
    return 'EMPTY';
  }

  const [year, month, day] = dateString.split('-');
  let formattedDate = `${monthNames[parseInt(month - 1)]} ${parseInt(day) + 1} ${year}`;
  formattedDate = formattedDate.replace('T22:00:00.000Z', '')
  return formattedDate;

}

export default Calendar;