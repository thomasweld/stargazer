import React from "react";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";

const UserStarredRepos = ({ cursor }) => {
  const GET_USER_STARRED_REPOS = gql`
    {
      viewer {
        login
        name
        starredRepositories(first: 10, after: ${cursor}) {
          edges {
            cursor
            node {
              id
              name
              primaryLanguage {
                id
                name
                color
              }
            }
          }
        }
      }
    }
  `;
  return (
    <Query query={GET_USER_STARRED_REPOS}>
      {({ loading, error, data }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error :(</div>;
        if (
          data &&
          data.viewer &&
          data.viewer.starredRepositories &&
          data.viewer.starredRepositories.edges &&
          data.viewer.starredRepositories.edges.length
        ) {
          console.log(data);
          return data.viewer.starredRepositories.edges.map(edge => (
            <p style={{ fontWeight: "bold" }} key={edge.node.id}>
              ☆ {edge.node.name}
            </p>
          ));
        }
        return null;
      }}
    </Query>
  );
};

export default UserStarredRepos;
