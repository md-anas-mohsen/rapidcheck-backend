const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const logger = require("./middlewares/logReqRes");

const users = require("./routes/user");
const classes = require("./routes/class");

const errorMiddleware = require("./middlewares/errors");
const logErrorMiddleware = require("./middlewares/logErrors");

morgan.token("body", (req, res) => JSON.stringify(req.body));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      "\nrequest: ",
      tokens.body(req, res),
    ].join(" ");
  })
);

app.use("/api/users", users);
app.use("/api/classes", classes);

// app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API - Boilerplate",
  });
});

app.use(logErrorMiddleware);
app.use(errorMiddleware);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

module.exports = app;
