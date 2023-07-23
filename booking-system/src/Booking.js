import React, { useState, useEffect } from 'react';
import EditOrDelete from './EditOrDelete';
import Calendar from './Calendar';

// Used to display the name of the month, not the number
const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
];

const Booking = ({ selectedDate, userName, isLoading }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showLabelTimeError, setShowLabelTimeError] = useState(false); // Set initial state to hide the label
    const [showLabelOverlapError, setShowLabelOverlapError] = useState(false); // Set initial state to hide the label
    const [showLabelClosedError, setShowLabelClosedError] = useState(false); // Set initial state to hide the label
    const [showLabelNotOpenError, setShowLabelNotOpenError] = useState(false); // Set initial state to hide the label

  useEffect(() => {
    // Fetch appointments whenever selectedDate changes
    fetchAppointments();
  }, [selectedDate]);

  const handleBackButtonClick = () => {
    setShowCalendar(true); // Set the showCalendar state to true when the back button is clicked
    isLoading(true); // Shows the Loading... label
  };

  const isAfter17 = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = parseInt(hours) * 60 + parseInt(minutes);
    const afterTime = (17 * 60) + 1; // 17:00 in minutes
  
    return time >= afterTime;
  };

  const isBefore7 = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = parseInt(hours) * 60 + parseInt(minutes);
    const beforeTime = (7 * 60) + 1; // 07:00 in minutes

    return time <= beforeTime;
  };

  async function handleCreateBooking() {
    // Resets all error test values
    setShowLabelTimeError(false);
    setShowLabelOverlapError(false);
    setShowLabelClosedError(false);
    setShowLabelNotOpenError(false);

    // Tests if the booking is before 07:00
    if (isBefore7(startTime) || isBefore7(endTime)) {
        setShowLabelNotOpenError(true);
    } else {

        // Tests if the booking is after 17:00
        if (isAfter17(startTime) || isAfter17(endTime)) {
            setShowLabelClosedError(true);
        } else {

            // Tests if meeting ends before it starts or is equal
            if(endTime >= startTime){
                try {
                  const response = await fetch('http://localhost:3001/api/createBooking', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                      body: JSON.stringify({
                      name: userName,
                      date: `${selectedDate.year}-${(selectedDate.month + 1).toString().padStart(2, '0')}-${selectedDate.day.toString().padStart(2, '0')}`,
                      startTime: startTime,
                      endTime: endTime,
                    }),
                });

                if (response.ok) {
                    let data = await response.json();
                    data = data.message;
                    if(data == "time overlap"){
                        // Meeting overlaps with another meeting
                        setShowLabelOverlapError(true);
                    } else {

                        // Handle booking created successfully
                        console.log('Booking created successfully!');
                        // After successful booking creation, update the appointments for the selected day
                        fetchAppointments();
                    }
                } else {
                    // Handle error
                    console.error('Error creating booking:', response.statusText);
                }
                } catch (error) {
                console.error('Error creating booking:', error);
                }
            } else {
                // Meeting is finished before it starts or starts and ends at the same time
                setShowLabelTimeError(true);
            }
        }
    }
  }

  async function fetchAppointments() {
    if (!selectedDate) return;

      try {
        const selectedDateFormatted = `${selectedDate.year}-${(selectedDate.month + 1).toString().padStart(2, '0')}-${selectedDate.day.toString().padStart(2, '0')}`;
        const response = await fetch(`http://localhost:3001/api/getBookingsByDate?date=${selectedDateFormatted}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAppointments(data);
        } else {
          console.error('Error fetching appointments:', response.statusText);
        }

      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    }
    const dateRightFormat = `${monthNames[(selectedDate.month)]} ${selectedDate.day.toString().padStart(2, '0')} ${selectedDate.year}`;

    return (
      <div>
        {showCalendar ? (
          <div>
            <Calendar selectedDate={selectedDate} userName={userName} onBackButtonClick={handleBackButtonClick} />
          </div>
        ) : (
        <div>
            <button className='backButton' onClick={handleBackButtonClick}>&lt;</button>

            {appointments.length === 0 ? (
                <div>
                    <h1>Date: {dateRightFormat}</h1>
                    <h3 className="noAppointment">No appointments have been made yet.</h3>
                </div>
            ) : (
                <>
                <br />
                
                <h3>Date: {dateRightFormat}</h3>
                <table className="dayTable">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Time</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.userName}</td>
                        <td>
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </td>
                        <td>
                          <EditOrDelete fetchAppointments={fetchAppointments} appointment={appointment} />
                        </td>
                    </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}

          {/* BOOK MEETING TABEL AND HEADER */}
          <h2>Book your Meeting</h2>
          <form>
            <label className='bookingName'>Book meeting for: {userName}</label>
            <table className="tableBooking">
              <tr>
                <td>
                  <label className='bookingStartTime'>Start time: </label>
                </td>
                <td>
                  <input className='bookingStartTimeInput' type="time" min="07:00" max="17:00" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </td>
              </tr>
              <tr>
                <td>
                  <label className='bookingEndTime'>End time: </label>
                </td>
                <td>
                  <input className='bookingEndTimeInput' type="time" min="07:00" max="17:00" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </td>
              </tr>
            </table>

            <button type="button" className='bookBtn' onClick={handleCreateBooking}>
              Book Room
            </button>

            <br />
            {/* ERROR LABELS */}
            { showLabelTimeError && <label className='timeError'>Incorrect start or end time.</label>}
            { showLabelOverlapError && <label className='timeError'>Meeting overlaps another meeting.</label>}
            { showLabelClosedError && <label className='timeError'>No bookings after 17:00.</label>}
            { showLabelNotOpenError &&  <label className='timeError'>No bookings before 7:00.</label>}
          </form>
        </div>
      )}
    </div>
  );
};

// Function that formatts time from HH:MM:SS to HH:MM
const formatTime = (timeString) => {
    if (!timeString) {
      return '00:00';
    }
  
    const [hours, minutes] = timeString.split(':');
    const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    return formattedTime;
};  

export default Booking;
