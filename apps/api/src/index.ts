import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3060;

app.use(cors({ origin: "http://localhost:5174", credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
