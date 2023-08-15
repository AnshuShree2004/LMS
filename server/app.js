import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import morgan from "morgan";
import courseRoutes from './routes/course.routes.js'
import paymentRoutes from './routes/payment.routes.js'

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(cookieParser());

app.use("/ping", (req, res) => {
  res.send("pong");
});

// 3 route config
app.use("/api/v1/user", userRoutes);
app.use('/api/v2/courses', courseRoutes)
app.use('/api/v2/payments', paymentRoutes)


app.all("*", (req, res) => {
  res.status(404).send("Oops! 404 page not found");
});

app.use(errorMiddleware);

export default app;
