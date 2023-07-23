import React, { useState } from 'react';

// Formats time from HH:MM:SS to HH:MM
const formatTime = (timeString) => {
  if (!timeString) {
    return '00:00';
  }

  const [hours, minutes] = timeString.split(':');
  const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  return formattedTime;
};


const EditOrDelete = ({ appointment, fetchAppointments }) => {  
  const [editedStartTime, setEditedStartTime] = useState(formatTime(appointment.startTime));
  const [editedEndTime, setEditedEndTime] = useState(formatTime(appointment.endTime));
  const [showLabelTimeError2, setShowLabelTimeError2] = useState(false); // Set initial state to show the label
  const [showLabelOverlapError2, setShowLabelOverlapError2] = useState(false); // Set initial state to show the label
  const [showLabelClosedError2, setShowLabelClosedError2] = useState(false); // Set initial state to show the label
  const [showLabelNotOpenError2, setShowLabelNotOpenError2] = useState(false); // Set initial state to show the label

  const isAfter17 = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = parseInt(hours) * 60 + parseInt(minutes);
    const afterTime = (17 * 60) + 1; // 17:00 in minutes

  
    return time >= afterTime;
  };

  const isBefore7 = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = parseInt(hours) * 60 + parseInt(minutes);
    const beforeTime = (7 * 60) + 1; // 17:00 in minutes

  
    return time <= beforeTime;
  };

  // Function to handle form submission for editing the booking
  const handleEditSubmit = async (e) => {
    
    e.preventDefault();

    // Resets all error tests to test again
    setShowLabelTimeError2(false);
    setShowLabelOverlapError2(false);
    setShowLabelClosedError2(false);
    setShowLabelNotOpenError2(false);

    if (isBefore7(editedStartTime) || isBefore7(editedStartTime)) {
      setShowLabelNotOpenError2(true);
    } else {
      // Tests if the booking is after 17:00
      if (isAfter17(editedStartTime) || isAfter17(editedEndTime)) {
          setShowLabelClosedError2(true);
      } else {
        // Tests if meeting ends before it starts or is equal
        if(editedStartTime <= editedEndTime){

          try {
              const response = await fetch(`http://localhost:3001/api/updateBooking/${appointment.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  startTime: editedStartTime,
                  endTime: editedEndTime,
                }),
              });

            if (response.ok) {
              let data = await response.json();
                  data = data.message;
                  if(data == "time overlap"){
                      // Meeting overlaps with another meeting
                      setShowLabelOverlapError2(true);
                  } else {
              // Handle booking updated successfully
              console.log('Booking updated successfully!');
              // Call the onCancelEdit callback to notify the parent component
              // that editing is canceled.
              // After successful booking deletion, update the appointments for the selected day
              fetchAppointments();
                  }
            } else {
              // Handle error
              console.error('Error updating booking:', response.statusText);
            }
          } catch (error) {
            console.error('Error updating booking:', error);
          } 
        } else {
          // Meeting is finished before it starts or starts and ends at the same time
          setShowLabelTimeError2(true);
      }
      }
    }
  
  };

  async function handleDeleteBooking() {
    const shouldDelete = window.confirm('Are you sure you want to delete this booking?');
    if (!shouldDelete) return;
  
    try {
        const response = await fetch(`http://localhost:3001/api/deleteBooking/${appointment.id}`, {
            method: 'DELETE',
            headers: {
            'Content-Type': 'application/json',
            },
      });
  
      if (response.ok) {
        // Handle booking deleted successfully
        console.log('Booking deleted successfully!');
        // After successful booking deletion, update the appointments for the selected day
        fetchAppointments();
      } else {
        // Handle error
        console.error('Error deleting booking:', response.statusText);
      }
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  }

  return (
    <div>
      <form onSubmit={handleEditSubmit}>
        <label>Edit Booking</label>
        <br />
        <label>Start time: </label>
        <input type="time" value={editedStartTime} onChange={(e) => setEditedStartTime(e.target.value)} required />
        <br />
        <label>End time: </label>
        <input type="time" value={editedEndTime} onChange={(e) => setEditedEndTime(e.target.value)} required />
        <br />
        <button type="submit">Save Changes</button>
        <button type="button" onClick={handleDeleteBooking}>Delete</button>
      </form>
      { showLabelTimeError2 && <label className='timeErrorBooking'>WRONG TIME.</label>}
      { showLabelOverlapError2 && <label className='timeErrorBooking'>OVERLAP.</label>}
      { showLabelClosedError2 && <label className='timeErrorBooking'>TOO LATE.</label>}
      { showLabelNotOpenError2 && <label className='timeErrorBooking'>TOO EARLY.</label>}
    </div>
  );
};

export default EditOrDelete;