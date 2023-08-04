import bodyParser from "body-parser";
import express from "express";
import moment from "moment";
import { appConfig } from "./config/app.js";
import dbConnection from "./lib/database/connect.js";
import corsMiddleware from "./middlewares/corsMiddleware.js";
import apiRoutes from "./routes/apiRoutes.js";
import { Server } from "socket.io";
import { createServer } from 'http';
import cronController from "./controllers/v1/cronController.js";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(corsMiddleware);

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Hello from CA Exchange API!",
    metadata: {
      utc_time: moment().utc().format("DD-MM-YYYY HH:mm:ss z"),
      server_time: moment().format("DD-MM-YYYY HH:mm:ss"),
    },
  });
});

dbConnection();

app.listen(appConfig.PORT, () => {
  console.log(`Server running on port: ${appConfig.PORT}`);
});

const server = createServer(app);
const io = new Server(server)

io.on('connection', (socket) => {
  console.log('New connection')
  // Call the function with the received parameters
  socket.on('sendParams', (params) => {
    setInterval(() => {
      const data = cronController.getMatchOdds(params);
      socket.emit('getMatchOdds', data);
    }, 1000);
  });
  socket.on("disconnect", () => console.log("Client disconnected"));
})