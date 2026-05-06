import { ApolloServer } from "@apollo/server";
import gql from "graphql-tag";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PubSub } from "graphql-subscriptions";

const gqlserver = async () => {
  try {
    const NEW_USER = "newUser";
    const pubsub = new PubSub();

    const typeDefs = gql`
      type Query {
        hello: String
        how: String!
      }

      type Mutation {
        get(id: Int!): String!
        put: String!
        register(username: String!): User!
      }

      type Subscription {
        newUser: User!
      }

      type User {
        username: String!
      }
    `;

    const resolvers = {
      Query: {
        hello: () => "Hello World",
        how: () => "how are you",
      },
      Mutation: {
        get: (_, { id }) => `got the response ${id}`,
        put: () => "updated the response",
        register: (_, { username }, { pubsub }) => {
          const user = { username }; // matches User type
          pubsub.publish(NEW_USER, { newUser: user });
          return user;
        },
      },
      Subscription: {
        newUser: {
          subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(NEW_USER),
        },
      },
    };

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({ pubsub }),
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
    });

    console.log(`Server running at ${url}`);
  } catch (err) {
    console.error(err);
  }
};

gqlserver();
