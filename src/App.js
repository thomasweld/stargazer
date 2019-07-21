import React from "react";
import octocat from "./Octocat.png";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={octocat} className="App-logo" alt="logo" />
        <p>Login with GitHub to get started.</p>
        <a
          className="App-link"
          href={`https://github.com/login/oauth/authorize?client_id=${
            process.env.REACT_APP_GITHUB_CLIENT_ID
          }&scope=public_repo`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Login
        </a>
      </header>
    </div>
  );
}

export default App;
