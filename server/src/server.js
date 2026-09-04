 
import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`,
    );
  });
};

startServer();