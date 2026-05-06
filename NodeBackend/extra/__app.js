import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import axios from "axios";

const startServer = async () => {
  const app = express();
  const port = 5050;

  const server = new ApolloServer({
    typeDefs: `
      type User{
        id: ID!
        name: String!
        username: String!
        email: String!
        phone: String!
        website: String!
      }
      type Todo {
        id: ID!
        title: String!
        completed: Boolean
        user: User
      }

      type Query {
        getTodos: [Todo]
        getAllUsers: [User]
        getUser(id: ID!): User
      }
    `,
    resolvers: {
      Todo: {
        user: async (todo) =>
          (
            await axios.get(
              `https://jsonplaceholder.typicode.com/users/${todo.id}`,
            )
          ).data,
      },
      Query: {
        getTodos: async () =>
          (await axios.get("https://jsonplaceholder.typicode.com/todos")).data,

        getAllUsers: async () =>
          (await axios.get("https://jsonplaceholder.typicode.com/users")).data,

        getUser: async (parent, { id }) =>
          (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`))
            .data,
      },
    },
  });

  await server.start();

  app.use(cors());

  // IMPORTANT: attach express.json() directly here
  app.use("/graphql", express.json(), expressMiddleware(server));

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`);
  });
};

startServer();
