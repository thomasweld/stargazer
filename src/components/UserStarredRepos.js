import React from "react";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";
import get from "lodash.get";

const UserStarredRepos = ({ cursor }) => {
  const GET_USER_STARRED_REPOS = gql`
    query($cursor: String) {
      viewer {
        login
        name
        starredRepositories(last: 10, before: $cursor) {
          pageInfo {
            hasPreviousPage
            startCursor
          }
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  `;
  return (
    <Query
      query={GET_USER_STARRED_REPOS}
      variables={{
        cursor: null
      }}
    >
      {({ data, error, loading, fetchMore }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error :(</div>;
        if (get(data, "viewer.starredRepositories.edges.length")) {
          return (
            <React.Fragment>
              <h4>My Starred Repos:</h4>
              {data.viewer.starredRepositories.edges.map(edge => (
                <p style={{ fontWeight: "bold" }} key={edge.node.id}>
                  ☆ {edge.node.name}
                </p>
              ))}
              {get(
                data,
                "viewer.starredRepositories.pageInfo.hasPreviousPage"
              ) && (
                <button
                  onClick={() =>
                    fetchMore({
                      variables: {
                        cursor: get(
                          data,
                          "viewer.starredRepositories.pageInfo.startCursor"
                        )
                      },
                      updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return {
                          ...prev,
                          viewer: {
                            ...prev.viewer,
                            starredRepositories: {
                              ...prev.viewer.starredRepositories,
                              pageInfo:
                                fetchMoreResult.viewer.starredRepositories
                                  .pageInfo,
                              edges: [
                                ...prev.viewer.starredRepositories.edges,
                                ...fetchMoreResult.viewer.starredRepositories
                                  .edges
                              ]
                            }
                          }
                        };
                      }
                    })
                  }
                >
                  Load More...
                </button>
              )}
            </React.Fragment>
          );
        }
        return null;
      }}
    </Query>
  );
};

export default UserStarredRepos;
