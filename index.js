const XLSX = require("xlsx");
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8000;

// Initialize student map
let studentMap = new Map();

try {
  const workbook = XLSX.readFile("ADRE2024.xlsx");
  const sheet = workbook.Sheets["Sheet1"];
  if (!sheet) {
    throw new Error("Sheet1 not found in the Excel file.");
  }
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Assuming first row is headers
  for (let i = 1; i < data.length; i++) {
    const roll = data[i][1]?.toString().trim(); // B column (Roll Number)
    const classroom = data[i][2]?.toString().trim(); // C column (Class Room)
    if (roll && classroom) {
      studentMap.set(roll, classroom);
    }
  }

  console.log(`Loaded ${studentMap.size} students from Excel.`);
} catch (error) {
  console.error("Error reading Excel file:", error.message);
  process.exit(1);
}

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API endpoint
app.get("/classroom/:roll", (req, res) => {
  const input = req.params.roll.toString().trim();

  // Validate input (example: numeric only)
  if (!/^\d+$/.test(input)) {
    return res.status(400).json({ message: "Invalid roll number format" });
  }

  const classroom = studentMap.get(input);

  if (classroom) {
    console.log(`The Classroom of ${input} is ${classroom}`);
    res.json({ RollNumber: input, Classroom: classroom });
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
