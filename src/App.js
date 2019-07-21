import React, { useReducer, useEffect } from "react";
import octocat from "./Octocat.png";
import "./App.css";
import axios from "axios";

function reducer(state, action) {
  switch (action.type) {
    case "loginSuccess":
      return {
        token: action.token,
        loggedIn: true
      };
    default:
      throw new Error();
  }
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, { loggedIn: false });

  const getAccessToken = async code => {
    try {
      if (code) {
        const res = await axios.get(
          `${process.env.REACT_APP_GATEKEEPER_URL}/${code}`
        );
        if (res && res.data && res.data.token) {
          dispatch({ type: "loginSuccess", token: res.data.token });
          return;
        } else {
          console.log(res.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      getAccessToken(code);
    }
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={octocat} className="App-logo" alt="logo" />
        {!state.loggedIn && (
          <React.Fragment>
            <p>Login with GitHub to get started.</p>
            <a
              className="App-link"
              href={`https://github.com/login/oauth/authorize?client_id=${
                process.env.REACT_APP_GITHUB_CLIENT_ID
              }&scope=user`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Login
            </a>
          </React.Fragment>
        )}
        {state.loggedIn && <p>loggedIn success</p>}
      </header>
    </div>
  );
};

export default App;
