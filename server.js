import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import * as url from "url";
import bcrypt from "bcryptjs";
import * as jwtJsDecode from "jwt-js-decode";
import base64url from "base64url";
import SimpleWebAuthnServer from "@simplewebauthn/server";

// Get the current directory path
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// Create an instance of the Express application
const app = express();

// Parse incoming requests with JSON payloads
app.use(express.json());

// Create a database adapter
const adapter = new JSONFile(__dirname + "/auth.json");

// Create a lowdb instance with the adapter
const db = new Low(adapter);

// Read the data from the database
await db.read();

// If the data is empty, set it to an object with an empty users array
db.data ||= { users: [] };

// Set the Relying Party ID
const rpID = "localhost";

// Set the protocol
const protocol = "http";

// Set the port number
const port = 5050;

// Set the expected origin
const expectedOrigin = `${protocol}://${rpID}:${port}`;

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse incoming requests with JSON payloads
app.use(express.json());

// Parse URL-encoded bodies
app.use(
  express.urlencoded({
    extended: true,
  })
);

function findUser(email) {
  const result = db.data.users.filter((user) => user.email === email);
  if (result.length === 0) return null /*Or undefined */;
  return result[0];
}

// ADD HERE THE REST OF THE ENDPOINTS
app.post("/auth/login", (req, res) => {
  const user = findUser(req.body.email);

  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    res.send({ ok: false, message: "Data is invalid" });
    return;
  } else {
    res.send({
      ok: true,
      name: user.name,
      email: user.email,
    });
  }
});

app.post("/auth/register", (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  // TODO : Add data validation !!!

  const user = {
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  };

  if (findUser(user.email)) {
    res.send({ ok: false, message: "User already exists" });
    return;
  } else {
    db.data.users.push(user);
    db.write();
    res.send({ ok: true, message: "User created" });
  }
});

// Define a route that matches any URL path
// and sends the "index.html" file as the response
app.get("*", (req, res) => {
  // Send the "index.html" file from the "public" directory
  res.sendFile(__dirname + "/public/index.html");
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message to the console indicating that the server is listening
  console.log(`App listening on port ${port}`);
});
