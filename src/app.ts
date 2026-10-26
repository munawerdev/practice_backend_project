import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import userRoutes from "./routes/user.routes.js";

import testRoutes from "./routes/test.route.js";

const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/test", testRoutes);

export { app };
