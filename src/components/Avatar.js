import React from "react";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";

const GET_AVATAR = gql`
  query {
    viewer {
      avatarUrl
    }
  }
`;

const Avatar = () => {
  return (
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
  );
};

export default Avatar;
