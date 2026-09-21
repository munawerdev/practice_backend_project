import dotenv from "dotenv";
import connectDB from "./db/index.ts";
import { app } from "./app.ts";

dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });
