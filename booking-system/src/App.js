import './App.css';
import LogInModule from './LogInModule';
import Calendar from './Calendar';
import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [showContent, setShowContent] = useState(false);

  const handleUsernameProvided = (enteredUsername) => {
    setUsername(enteredUsername);
    setShowContent(true);
  };

  return (
    <div className="App">
      {!showContent ? (
        <LogInModule onUsernameProvided={handleUsernameProvided} />
      ) : (
        <>
          <Calendar userName={username}/>
        </>
      )}
    </div>
  );
}

export default App;
