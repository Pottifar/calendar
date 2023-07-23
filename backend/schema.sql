CREATE TABLE Booking(
    id INT NOT NULL AUTO_INCREMENT,
    userName VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    
    PRIMARY KEY (id) 
)