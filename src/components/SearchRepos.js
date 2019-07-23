import React from "react";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";
import get from "lodash.get";

const SearchRepos = props => {
  const SEARCH = gql`
    query($queryString: String!) {
      search(query: $queryString, type: REPOSITORY, first: 10) {
        repositoryCount
        edges {
          node {
            ... on Repository {
              name
              description
              stargazers {
                totalCount
              }
            }
          }
        }
      }
    }
  `;
  return (
    <Query
      query={SEARCH}
      variables={{
        queryString: props.queryProp
      }}
      key="querySearch"
    >
      {({ data, error, loading }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error :(</div>;
        if (get(data, "search.edges.length")) {
          return (
            <React.Fragment>
              <div>Search results below...</div>
              {data.search.edges.map((edge, index) => (
                <div
                  key={`${edge.node.name}_${index}`}
                  style={{
                    fontWeight: "bold",
                    borderBottom: "1px solid grey",
                    padding: 6,
                    maxWidth: "80%"
                  }}
                >
                  <h5>☆ {edge.node.name}</h5>
                  <div>{edge.node.description}</div>
                </div>
              ))}
            </React.Fragment>
          );
        }
        return null;
      }}
    </Query>
  );
};

export default SearchRepos;
