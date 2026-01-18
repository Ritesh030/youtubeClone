import express from "express";
const app = express();

import { PORT } from "./constants.js"
import connectDB  from "./db/index.js";


app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`);
  connectDB();
})




/*
import express from "express";
const app = express();

// Database connection --> we will use IIFE for making database connection. 
// always use try catch block for handling error because database connection may fail due to several reasons.
// always use async await for handling asynchronous code because database connection take time because it is in another continent.
( async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    app.on("error", (error) => {
      console.log("ERRR", error);
      throw error
    })

    app.listen(process.env.PORT, () => {
      console.log(`App listening on PORT ${PORT}`);
    })
  }
  catch (error) {
    console.log("ERROR: ", error);
    throw err
  }
})()
*/