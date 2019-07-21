import React from "react";
import octocat from "./Octocat.png";
import "./App.css";
import axios from "axios";

const getAccessToken = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    let accessToken;
    if (code) {
      accessToken = await axios.post(
        `http://localhost:9999/authenticate/?code=${code}`
        // http://stargazer-gatekeeper.herokuapp.com/authenticate
        // instance of https://github.com/prose/gatekeeper
        // {},
        // { headers: { "Access-Control-Allow-Origin": "*" } }
      );
      console.log(accessToken);
    }

    console.log("getAccessToken", accessToken);
    return accessToken;
  } catch (e) {
    console.error(e);
  }
};

function App() {
  getAccessToken();

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
