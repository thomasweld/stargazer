import React, { useReducer, useEffect } from "react";
import octocat from "./Octocat.png";
import "./App.css";
import axios from "axios";
import ApolloClient, { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";

import Avatar from "./components/Avatar";

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
    dispatch({ type: "search", query: e.target.value });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && !state.loggedIn) {
      getAccessToken(code);
    }
  });

  const SEARCH = gql`
    {
      search(type: REPOSITORY, first: 10, query: ${state.query}) {
        nodes {
          ... on Repository {
            id
            nameWithOwner
            url
            descriptionHTML
          }
        }
      }
    }
  `;

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
              <Avatar />
              <input type="text" onChange={search} />
              {state.query && (
                <Query query={SEARCH}>
                  {({ loading, error, data }) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error :(</div>;
                    if (
                      data &&
                      data.search &&
                      data.search.nodes &&
                      data.search.nodes.length
                    ) {
                      console.log(data);
                      return data.search.nodes.map(node => (
                        <p key={node.id}>{node.url}</p>
                      ));
                    }
                    return null;
                  }}
                </Query>
              )}
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
