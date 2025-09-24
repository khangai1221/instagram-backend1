import express from "express";

const PORT = 3000;
<<<<<<< HEAD
=======

>>>>>>> 9674ad582012adae77fe7310df0412ecd7bf5bd1
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
<<<<<<< HEAD
  res.send("go to postman to use post to create new account")
});

app.post("/signup", (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).send({ message: "Body required" });
  }

  if (!body.credential) {
    return res.status(400).send({ message: "Credential required" });
  }
  let credentialType;
  if (!body.password) {
    return res.status(400).send({ message: "Password required" });
  }

  const password = body.password;

  if (password.length < 8) {
    return res.status(400).send({ message: "Password must be at least 8 characters long" });
  }

  if (!/[0-9]/.test(password)) {
    return res.status(400).send({ message: "Password must include at least one number" });
  }

  if (!/[a-z]/.test(password)) {
    return res.status(400).send({ message: "Password must include at least one lowercase letter" });
  }

  if (!/[A-Z]/.test(password)) {
    return res.status(400).send({ message: "Password must include at least one uppercase letter" });
  }

  if (!/[!@#$%^&*()\-=+_.]/.test(password)) {
    return res.status(400).send({ message: "Password must include at least one special character (!@#$%^&*()-=_+.)" });
  }


=======
  res.send("Hi mom");
});

app.post("/signup", (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Body required" });
  }
  const body = req.body;
  if (!body.credential) {
    return res.status(400).send({ message: "Credential required" });
  }
  if (!body.password) {
    return res.status(400).send({ message: "Password required" });
  }
>>>>>>> 9674ad582012adae77fe7310df0412ecd7bf5bd1
  if (!body.fullname) {
    return res.status(400).send({ message: "Fullname required" });
  }
  if (!body.username) {
    return res.status(400).send({ message: "Username required" });
  }
<<<<<<< HEAD
  if (body.credential.includes("@")) {
    credentialType = "email";
  } else {
    credentialType = "phone";
  }

  console.log(`Credential type: ${credentialType}`);
  console.log(`Credential value: ${body.credential}`);
  console.log(`Password value: ${body.password}`);
  console.log(`Username value: ${body.username}`);
  console.log(`Fullname value: ${body.fullname}`);


  return res.send({ message: "Welcome to Instagram" });
});
=======

  return res.send({ message: "Welcome to instagram" });
});

>>>>>>> 9674ad582012adae77fe7310df0412ecd7bf5bd1
app.listen(PORT, () => {
  console.log(`Your app is running on http://localhost:${PORT}`);
});
