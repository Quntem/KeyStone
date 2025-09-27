import express from "express";
import {router as adminRouter} from "./admin.ts";
import {router as authRouter} from "./auth.ts";
import cookieParser from "cookie-parser";
import {router as webRouter} from "./web.ts";
import cors from "cors";

var app = express();
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000",
}));

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/app", webRouter);

app.listen(7045, () => {
    console.log("Server started on port 7045");
});