import express from "express";
import path from "path";

const app = express();
const dirname = import.meta.dirname;
app.use(express.json());

// app.use("/static", express.static(path.join(dirname, "./assets")));

app.get("/file", (req, res) => {
  res.sendFile(path.join(dirname, "./image.png"));
});

app.get("/", (req, res) => {
  res.status(200);
  res.send("welcome");
  console.log("it works");
});
app.get("/another", (req, res) => {
  res.status(404).send("this is error but correct");
});
app.post("/post", (req, res) => {
  console.log(`incoming data: ${req.body}`);
  console.log("this works too");
  res.status(200).send("sending back it works");
});
app.post("/name", (req, res) => {
  let { name } = req.body;
  console.log(name);
  res.status(200).send("done");
});

//  DATABASE

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "backenddb",
  password: "MohdSaad@123",
  dialect: "postgres",
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("error acquired", err.stack);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("error executing query");
    }
    console.log("connected to database");
  });
});

app.get("/testdata", (req, res) => {
  console.log("test data: ");
  pool.query("Select * from test").then((testdata) => {
    console.log(testdata);
    res.send(testdata.rows);
  });
});

app.listen(4000, (err) => {
  if (!err) console.log("server is running fine");
  else console.log("server is chaotic");
});
