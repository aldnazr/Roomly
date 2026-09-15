import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import "dotenv/config";
import db from "./db";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
