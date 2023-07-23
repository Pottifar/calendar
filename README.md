<h1>SET UP PROJECT</h1>

To make this React app with a Node.js backend run on your machine, please make sure you have the 
following installed:

    Node.js
    React
    MySQL Server
    Any browser (Google Chrome recommended)

Navigate to the project folder named backend with Command Prompt/Terminal and type in:

    npm install mysql2
    npm install express
    npm install cors

This will install the necessery dependencies for the server to run.

Ensure that your PC initiates the MySQL server on boot; if not, you can set it up using the 
MySQL Workbench.

Watch this guide on how to set up the MySQL server: https://www.youtube.com/watch?v=u96rVINbAUI

Now you need to setup a database.

To do so, open the connection in MySQL Workbench and in the Query tab type in (can also be done with the MySQL shell):

    CREATE DATABASE booking;

    USE booking;

    CREATE TABLE booking(
        id INT NOT NULL AUTO_INCREMENT,
        userName VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        
        PRIMARY KEY (id) 
    )

The Query to create the table is also located in the backend folder. See schema.sql

This will create the database, select it and then create the table. Make sure there are no typos,
application only works if the name of all fields are correct and the name of the database is correct
and the name of the table.

-----------------------
!!!----IMPORTANT----!!!
-----------------------

In the server.js file (located in the backend folder), username is set to root, and password is also root. 
Change these depending on how you set up the MySQL Server. Very often the password will be empty.

user is on line 21, password is line 22.

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root', <------ CHANGE TO YOUR MYSQL SERVER USERNAME
    password: 'root', <------ CHANGE TO YOUR MYSQL SERVER PASSWORD
    database: 'bookingdb'
}).promise()


Now, follow these steps to start the application:

Open a Command Prompt/Terminal and navigate to the backend project folder:

    cd C:/Users/YOUR_USER_NAME/Desktop/Jostein Harrang - Fullstack developer case - Booking System - 24.07.2023/backend

Replace YOUR_USER_NAME with your username and adjust the path accordingly based on the project's location.

Start the Node.js server:

    node server.js

Open another Command Prompt/Terminal and navigate to the frontend project folder called booking-system:

    cd C:/Users/YOUR_USER_NAME/Desktop/Jostein Harrang - Fullstack developer case - Booking System - 24.07.2023/booking-system/

Start the React application:

    npm start

The application should now open in your default web browser and be ready for you to use.

Important project files are:
    Frontend files in ./booking-system/:
        Booking.js
        Calendar.js
        EditOrDelete.js
        LogInModule.js
        App.js
        App.css
        ./booking-system/public/index.html (cahnged the title and added a Icon)
        ./booking-system/public/pageIcon.png
    
    Backend files in ./backend/:
        server.js
        schema.sql
        package.json

DISCLAIMER:
This application has been developed for desktop use only, NOT recommended for mobile use yet.
