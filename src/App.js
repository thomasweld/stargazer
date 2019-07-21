import React, { useReducer, useEffect } from "react";
import octocat from "./Octocat.png";
import "./App.css";
import axios from "axios";
import ApolloClient, { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";

const GET_AVATAR = gql`
  query {
    viewer {
      avatarUrl
    }
  }
`;

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
          {state.loggedIn && (
            <React.Fragment>
              <Query query={GET_AVATAR}>
                {({ loading, error, data }) => {
                  if (loading) return <div>Loading...</div>;
                  if (error) return <div>Error :(</div>;
                  return (
                    <img
                      style={{
                        padding: "24px",
                        width: "80%",
                        maxWidth: "200px",
                        height: "auto"
                      }}
                      src={data.viewer.avatarUrl}
                      alt="sampleImage"
                    />
                  );
                }}
              </Query>
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
