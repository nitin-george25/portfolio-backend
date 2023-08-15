const express = require("express");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
var cors = require("cors");

const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

const emailConfig = {
  service: "Gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

app.post("/add-lead", async (req, res) => {
  const { email, firstName, lastName, contact, company, budget, message } =
    req.body;

  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views/"),
  };

  transporter.use("compile", hbs(handlebarOptions));

  const mailOptions = {
    from: emailConfig.auth.user,
    to: process.env.USER_EMAIL,
    subject: "New Contact Recieved!",
    template: "contact",
    context: {
      firstName,
      email,
      lastName,
      contact,
      company,
      budget: budget ?? "",
      message,
    },
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while sending the email." });
    }

    res.json({ success: true, data: info });
  });
});

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
