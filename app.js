const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const chalk = require("chalk");
const logger = require("./middlewares/logReqRes");
const cors = require("cors");
const path = require("path");

const users = require("./routes/user");
const classes = require("./routes/class");
const assessments = require("./routes/assessment");
const courses = require("./routes/course");

const errorMiddleware = require("./middlewares/errors");
const logErrorMiddleware = require("./middlewares/logErrors");

const { enqueueTestJob } = require("./utils/queueHelper");

morgan.token("body", (req, res) => JSON.stringify(req.body));

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  morgan(function (tokens, req, res) {
    return [
      chalk.yellow(tokens.method(req, res)),
      chalk.cyan(chalk.underline(tokens.url(req, res))),
      chalk.magenta(chalk.bold(tokens.status(req, res))),
      "\nContent length:",
      tokens.res(req, res, "content-length"),
      "\nResponse time:",
      chalk.underline(`${tokens["response-time"](req, res)} ms`),
      chalk.cyan("\nrequest: "),
      chalk.cyan(tokens.body(req, res)),
    ].join(" ");
  })
);

app.use("/api/users", users);
app.use("/api/classes", classes);
app.use("/api/assessments", assessments);
app.use("/api/course", courses);

// app.use(logger);

app.get("/", async (req, res) => {
  // await enqueueTestJob();

  res.status(200).json({
    success: true,
    message: "Welcome to the RapidCheck API",
  });
});

app.get("/playground", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/playground.html"));
});

app.get("/sample-assessment", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/sampleAssessment.html"));
});

app.use(logErrorMiddleware);
app.use(errorMiddleware);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

module.exports = app;
