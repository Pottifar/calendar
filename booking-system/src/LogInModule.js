import React from 'react';

const LogInModule = ({ onUsernameProvided }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredUsername = e.target.elements.username.value.trim();
    if (enteredUsername !== '') {
      onUsernameProvided(enteredUsername);
    }
  };

  return (
    <div>
      <h1 className='userNameHeader'>Log in for Booking</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" className='usernameInput' placeholder="Username" required />
        <button className='submitUsername' type="submit">Log in</button>
      </form>
    </div>
  );
};

export default LogInModule;
