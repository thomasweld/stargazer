import React from "react";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";

const Avatar = () => {
  const GET_AVATAR = gql`
    query {
      viewer {
        avatarUrl
        login
        name
      }
    }
  `;
  return (
    <Query query={GET_AVATAR}>
      {({ loading, error, data }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error :(</div>;
        return (
          <div>
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
            <h3>
              @{data.viewer.login} | {data.viewer.name}
            </h3>
          </div>
        );
      }}
    </Query>
  );
};

export default Avatar;
