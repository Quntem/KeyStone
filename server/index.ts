import express from "express";
import {router as adminRouter} from "./admin.ts";
import {router as authRouter} from "./auth.ts";
import cookieParser from "cookie-parser";
import {router as webRouter} from "./web.ts";
import {router as appRouter} from "./app.ts";
import https from "https";
import fs from "fs";

var app = express();
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
// app.use("/app", webRouter);
app.use("/app", appRouter);
app.use("/static", express.static("./server/web/static"));

// app.listen(7045, () => {
//     console.log("Server started on port 7045");
// });

https.createServer({
    key: fs.readFileSync("./https/key.key"),
    cert: fs.readFileSync("./https/cert.crt")
}, app).listen(7045, () => {
    console.log("Server started on port 7045");
});
