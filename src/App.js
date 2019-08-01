import React, { useReducer, useEffect } from "react";
import octocat from "./Octocat.png";
import "./App.css";
import axios from "axios";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";

import Avatar from "./components/Avatar";
import UserStarredRepos from "./components/UserStarredRepos";
import SearchRepos from "./components/SearchRepos";

const client = new ApolloClient({
  uri: "https://api.github.com/graphql",
  request: operation => {
    const token = localStorage.getItem("token");
    if (token) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
    }
  }
});

function reducer(state, action) {
  switch (action.type) {
    case "loginSuccess":
      return {
        token: action.token,
        loggedIn: true
      };
    case "logout":
      return {
        loggedIn: false
      };
    case "search":
      return {
        ...state,
        query: action.query
      };
    default:
      throw new Error();
  }
}

const App = () => {
  const token = localStorage.getItem("token");
  const initialState = token ? { loggedIn: true, token } : { loggedIn: false };
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log("App state", state);
  const getAccessToken = async code => {
    try {
      if (code) {
        const res = await axios.get(
          `${process.env.REACT_APP_GATEKEEPER_URL}/${code}`
        );
        if (res && res.data && res.data.token) {
          localStorage.setItem("token", res.data.token);
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

  const search = e => {
    console.log(e.target.value);
    dispatch({ type: "search", query: e.target.value });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && !state.loggedIn) {
      getAccessToken(code);
    }
  });

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <header className="App-header">
          <h1 style={{ margin: 40 }}>☆ GitHub Stargazer App ☆</h1>
          <hr
            style={{
              width: "80%",
              marginTop: 40
            }}
          />
          {!state.loggedIn && (
            <React.Fragment>
              <img src={octocat} className="App-logo" alt="logo" />
              <p>Login with GitHub to get started.</p>
              <a
                className="App-link"
                href={`https://github.com/login/oauth/authorize?client_id=${
                  process.env.REACT_APP_GITHUB_CLIENT_ID
                }&scope=user%20public_repo`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Login
              </a>
            </React.Fragment>
          )}
          {state.loggedIn && (
            <React.Fragment>
              <Avatar />
              <hr
                style={{
                  width: "80%",
                  marginTop: 40
                }}
              />
              <UserStarredRepos cursor={null} />
              <hr
                style={{
                  width: "80%",
                  marginTop: 40
                }}
              />
              <h2 style={{ marginTop: 40 }}>Search</h2>
              <div style={{ fontSize: 20 }}>
                <label>Search for repos: </label>
                <input
                  type="text"
                  name="searchRepos"
                  id="searchRepos"
                  onChange={search}
                  style={{ fontSize: 20, margin: 10 }}
                />
              </div>
              {state.query && <SearchRepos queryProp={state.query} />}
              <p
                className="App-link"
                onClick={() => {
                  localStorage.clear();
                  dispatch({ type: "logout" });
                }}
              >
                Logout
              </p>
            </React.Fragment>
          )}
        </header>
      </div>
    </ApolloProvider>
  );
};

export default App;
