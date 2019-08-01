import React from "react";
import { gql } from "apollo-boost";
import { Query, Mutation } from "react-apollo";
import get from "lodash.get";

const SearchRepos = props => {
  const SEARCH = gql`
    query($queryString: String!, $after: String) {
      search(type: REPOSITORY, query: $queryString, first: 10, after: $after) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          ... on Repository {
            id
            nameWithOwner
            url
            description
            viewerHasStarred
          }
        }
      }
    }
  `;

  const ADD_STAR = gql`
    mutation AddStar($repositoryId: ID!) {
      addStar(input: { starrableId: $repositoryId }) {
        starrable {
          id
        }
      }
    }
  `;

  return (
    <Query
      query={SEARCH}
      variables={{
        queryString: props.queryProp,
        after: null
      }}
      key="querySearch"
    >
      {({ data, error, loading, fetchMore }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error :(</div>;
        if (get(data, "search.nodes.length")) {
          return (
            <React.Fragment>
              <div>Search results below...</div>
              {data.search.nodes.map((node, index) => (
                <Mutation
                  mutation={ADD_STAR}
                  query={SEARCH}
                  variables={{
                    queryString: props.queryProp,
                    after: null
                  }}
                  update={(cache, { data: { AddStar } }) => {
                    const data = cache.readQuery({
                      query: SEARCH,
                      variables: { queryString: props.queryProp, after: null }
                    });
                    const newData = { ...data };
                    const i = data.search.nodes
                      .map(function(e) {
                        return e.id;
                      })
                      .indexOf(node.id);
                    if (i) {
                      data.search.nodes[i] = {
                        ...data.search.nodes[i],
                        viewerHasStarred: true
                      };
                      cache.writeQuery({
                        query: SEARCH,
                        variables: {
                          queryString: props.queryProp,
                          after: null
                        },
                        data: newData
                      });
                    }
                  }}
                  key={`${node.nameWithOwner}_${index}`}
                >
                  {(AddStar, { loading, error }) => (
                    <div className="repoListing">
                      <div key={`${node.nameWithOwner}_${index}`}>
                        <a
                          href={node.url}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {node.nameWithOwner}
                        </a>
                        <h4>{node.viewerHasStarred ? "★" : "☆"}</h4>
                        <button
                          onClick={e => {
                            AddStar({
                              variables: {
                                repositoryId: node.id
                              }
                            });
                          }}
                        >
                          ADD STAR
                        </button>
                        {loading && <p>Loading...</p>}
                        {error && <p>Error :(</p>}
                      </div>
                    </div>
                  )}
                </Mutation>
              ))}
              {get(data, "search.pageInfo.hasNextPage") && (
                <button
                  onClick={() =>
                    fetchMore({
                      variables: {
                        queryString: props.queryProp,
                        after: get(data, "search.pageInfo.endCursor")
                      },
                      updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return {
                          search: {
                            ...prev.search,
                            nodes: [
                              ...prev.search.nodes,
                              ...fetchMoreResult.search.nodes
                            ],
                            pageInfo: fetchMoreResult.search.pageInfo
                          }
                        };
                      }
                    })
                  }
                  style={{ margin: 10 }}
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

export default SearchRepos;
