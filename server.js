// server.js
import express from "express";
import { Pool } from "pg";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { config } from "dotenv";

config();
const app = express();
const port = process.env.PORT || 7001;

// Postgres pool setup (configure with your own creds or use env vars)
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(process.cwd(), "public")));

// Ensure table exists (run once, or manage via migrations)
const createTable = `
CREATE TABLE IF NOT EXISTS survey_results (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  gender TEXT,
  age TEXT,
  college_degree TEXT,
  occupation TEXT,
  vr_access TEXT,
  -- add all your rating columns here, e.g. trust_analyze_2d INT, trust_imagination_2d INT, ...
  trust_analyze_2d INT,
  trust_imagination_2d INT,
  trust_view_2d INT,
  trust_materials_2d INT,
  trust_details_2d INT,
  trust_developer_2d INT,
  conversation_presence_2d INT,
  conversation_buy_decision_2d INT,
  conversation_action_2d INT,
  uncertainty_real_presence_2d INT,
  uncertainty_clarity_2d INT,
  uncertainty_details_decision_2d INT,
  uncertainty_enough_details_2d INT,
  trust_analyze_vr INT,
  trust_imagination_vr INT,
  trust_materials_vr INT,
  trust_details_vr INT,
  trust_developer_vr INT,
  conversation_presence_vr INT,
  conversation_buy_decision_vr INT,
  conversation_action_vr INT,
  uncertainty_real_presence_vr INT,
  uncertainty_clarity_vr INT,
  uncertainty_details_decision_vr INT,
  uncertainty_enough_details_vr INT
);
`;
pool
  .query(createTable)
  .catch((err) => console.error("Table creation error", err.stack));

app.post("/survey", async (req, res) => {
  const d = req.body;
  try {
    const insertQuery = `
      INSERT INTO survey_results(
        gender, age, college_degree, occupation, vr_access,
        trust_analyze_2d, trust_imagination_2d, trust_view_2d,
        trust_materials_2d, trust_details_2d, trust_developer_2d,
        conversation_presence_2d, conversation_buy_decision_2d, conversation_action_2d,
        uncertainty_real_presence_2d, uncertainty_clarity_2d,
        uncertainty_details_decision_2d, uncertainty_enough_details_2d,
        trust_analyze_vr, trust_imagination_vr, trust_materials_vr,
        trust_details_vr, trust_developer_vr,
        conversation_presence_vr, conversation_buy_decision_vr, conversation_action_vr,
        uncertainty_real_presence_vr, uncertainty_clarity_vr,
        uncertainty_details_decision_vr, uncertainty_enough_details_vr
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,
        $24,$25,$26,$27,$28,$29,$30
      ) RETURNING id;
    `;
    const values = [
      d.Gender,
      d.Age,
      d["College Degree"],
      d.Occupation,
      d["VR Access"],
      d["Trust Analyze 2D"],
      d["Trust Imagination 2D"],
      d["Trust View 2D"],
      d["Trust Materials 2D"],
      d["Trust Details 2D"],
      d["Trust Developer 2D"],
      d["Conversation Presence 2D"],
      d["Conversation Buy Decision 2D"],
      d["Conversation Action 2D"],
      d["Uncertainty Real Presence 2D"],
      d["Uncertainty Clarity 2D"],
      d["Uncertainty Details Decision 2D"],
      d["Uncertainty Enough Details 2D"],
      d["Trust Analyze VR"],
      d["Trust Imagination VR"],
      d["Trust Materials VR"],
      d["Trust Details VR"],
      d["Trust Developer VR"],
      d["Conversation Presence VR"],
      d["Conversation Buy Decision VR"],
      d["Conversation Action VR"],
      d["Uncertainty Real Presence VR"],
      d["Uncertainty Clarity VR"],
      d["Uncertainty Details Decision VR"],
      d["Uncertainty Enough Details VR"],
    ];
    const result = await pool.query(insertQuery, values);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
