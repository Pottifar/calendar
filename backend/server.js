// Import dependencies
import mysql from 'mysql2'
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001; // Make sure port 3001 is not used by anything else

// Make sure the react app is hosted on port 3000, change if necessery
const corsOptions = {
    origin: 'http://localhost:3000',
};
  
app.use(cors(corsOptions)); // Allow requests only from the specified origin
app.use(express.json()); // Parse JSON data in the request body

// These variables should be exchanged for enviermental varibales so the log in is not hard coded in
// the application. If the application was to be deployed, this should be fixed.
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root', // Swap out root with the username you have set up for your MySQL Server
    password: 'root', // Swap out root with the password you have set up for your MySQL Server
    database: 'bookingdb'
}).promise() // Creating a connection pool for MySQL and enabling Promises for database operations.

// Function to get all bookings on a specific date
export async function getBookingsOnDate(date) {
    const [rows] = await pool.query("SELECT * FROM booking WHERE date = ? ORDER BY startTime", [date]);
    return rows;
}

// Function to get all bookings on a specific user
export async function getBookingForUser(name){
    const [rows] = await pool.query("SELECT * FROM booking WHERE userName = ? ORDER BY date, startTime", [name]);
    return rows
}

// Function to delete a booking
export async function deleteBooking(id){
    const [rows] = await pool.query("DELETE FROM booking WHERE id = ?", [id]);
    return rows
}

// Function to create a new booking
export async function createBooking(name, date, startTime, endTime) {
    // We create a booking and then test if it overlaps with another booking. If so, delete it
    await pool.query('INSERT INTO booking(userName, date, startTime, endTime) VALUES(?, ?, ?, ?)', [name, date, startTime, endTime]);
    const [newestBooking] = await pool.query("SELECT * FROM booking WHERE userName = ? AND date = ? AND startTime = ? AND endTime = ?", [name, date, startTime, endTime]);
    const newestBookingId = newestBooking[(newestBooking.length - 1)].id;

    // Check if time is avaliable
    const isAvaliable = await checkIfAvaliable(newestBookingId, startTime, endTime);

    if(isAvaliable === false){
        // Deletes booking if it overlaps another
        await deleteBooking(newestBookingId)
        return "time overlap"
    }
}

// Update booking
export async function updateBooking(id, startTime, endTime) {
    const isAvaliable = await checkIfAvaliable(id, startTime, endTime)
    if(isAvaliable === true){
        await pool.query('UPDATE booking SET startTime = ?, endTime = ? WHERE id = ?', [startTime, endTime, id]);
    } else {
        return "time overlap"
    }
}

// This function takes in information about a new booking or new update, then checks if the there is any
// other bookings during that time. Returns false if there is overlap
async function checkIfAvaliable(id, startTime, endTime){
    // The times need to be in the proper format of HH:MM:SS to properly compere them later in the function
    startTime = startTime + ":00";
    endTime = endTime + ":00";

    const [row] = await pool.query("SELECT date FROM booking WHERE id = ?", [id]);
    if (!row.length) {
      console.log("Booking not found with the provided id");
      return false;
    }
    const dateValue = row[0].date;

    const [startingTimes] = await pool.query("SELECT startTime FROM booking WHERE date = ? AND id != ?", [dateValue, id]);
    const [endingTimes] = await pool.query("SELECT endTime FROM booking WHERE date = ?", [dateValue]);

    // Arrays to track starting times and ending times on that particular day
    const startingTimesArray = []
    const endingTimesArray = []
    // We move them into a array instead of an object so that they are easier to work with
    for(let i = 0; i < startingTimes.length; i++){
        startingTimesArray.push(startingTimes[i].startTime)
    }
    for(let i = 0; i < endingTimes.length; i++){
        endingTimesArray.push(endingTimes[i].endTime)
    }

    // We test to see if our values overlap with any existing meeting times
    for(let i = 0; i < startingTimesArray.length; i++){
        if ((startTime >= startingTimesArray[i] && startTime < endingTimesArray[i]) ||
            (endTime > startingTimesArray[i] && endTime <= endingTimesArray[i]) ||
            (startTime <= startingTimesArray[i] && endTime >= endingTimesArray[i])) {
        }
    }
    
    return true
}

// Update a booking by ID (PATCH request)
app.patch('/api/updateBooking/:id', async (req, res) => {
    const id = req.params.id;
    const { startTime, endTime } = req.body;
  
    try {
      // Call the function to update the booking in the database
      const text = await updateBooking(id, startTime, endTime);
      res.status(200).json({ message: text });
  
      // Respond with the updated booking
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ error: 'An error occurred while updating the booking.' });
    }
  });
  
// Delete a booking by ID (DELETE request)
app.delete('/api/deleteBooking/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      // Call the function to delete the booking from the database
      await deleteBooking(id);
  
      // Respond with the deleted booking
      res.json({ message: 'Booking deleted successfully!' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({ error: 'An error occurred while deleting the booking.' });
    }
});
  

// API endpoint to get bookings by the date
app.get('/api/getBookingsByDate', async (req, res) => {
    const { date } = req.query; // Get the 'date' from the query parameters

    try {
        const bookings = await getBookingsOnDate(date); // Calls function to get bookings for the date
        res.setHeader('Content-Type', 'application/json');
        res.send(bookings); // Sends back the bookings
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'An error occurred while fetching bookings.' });
    }
});

// API endpoint to get bookings by the User Name
app.get('/api/getBookingForUser', async (req, res) => {
    const { name } = req.query; // Get the 'name' from the query parameters

    try {
        const bookings = await getBookingForUser(name); // Calls function to get bookings for the user
        res.setHeader('Content-Type', 'application/json');
        res.send(bookings); // Sends back the bookings
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'An error occurred while fetching bookings.' });
    }
});

// API endpoint to create a booking
app.post('/api/createBooking', async (req, res) => {
    const { name, date, startTime, endTime } = req.body; // Get the values from the request body
    try {
        // Check if all required data is present
        if (!name || !date || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required data.' });
        }
  
        const text = await createBooking(name, date, startTime, endTime);
        res.status(200).json({ message: text });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'An error occurred while creating the booking.' });
    }
});

// Listens for API calls
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});