import pkg from "pg";
const { Client } = pkg;
import express from "express";

const app = express();

const con = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "MohdSaad@123",
  database: "backenddb",
});
con.connect().then(() => console.log("connected"));

app.post("/postdata", (req, res) => {
  con.query(`insert into test values(4, name)`, [req.body], (err, res) => {
    if (!err) console.log(res.rows);
    else console.log(err);
  });
});

fetchdata();
app.connect(2000, (err) => console.log(err));
