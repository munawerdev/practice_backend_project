import dotenv from "dotenv";
import { app } from "./app.ts";
import connectDB from "./db/index.ts";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error: string) => {
    console.error("Error connecting to MongoDB", error);
  });
