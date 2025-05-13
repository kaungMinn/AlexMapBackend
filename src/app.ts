import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
import dotenv from 'dotenv';
import connectDB from './db/connect';
import mongoose from 'mongoose';
import { corsOption } from './cors/corsOption';
import { authRouter } from './routes/authRoutes';
import cookieParser from 'cookie-parser';
import { nodeRouter } from './routes/nodeRoutes';
import { errorHandler } from './middleware/errorHandler';

// Middleware
dotenv.config();
app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: false
}));

//DB
connectDB();

// Basic route
app.use('/map/v1/auth/', authRouter);
app.use("/map/v1/node", nodeRouter)

// Start server
const PORT = process.env.PORT || 3000;

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDb");
    app.listen(PORT, () => {
        console.log(`Server running on port:${PORT}`);
      });
});

//Error Handler
app.use(errorHandler)