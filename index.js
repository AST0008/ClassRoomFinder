const XLSX = require("xlsx");
const express = require("express");
const path = require("path");
const app = express();
const PORT = 8000;

const workbook = XLSX.readFile("sample.xlsx");
const sheet = workbook.Sheets["Sheet1"];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Read data as an array of arrays

app.use(express.static(path.join(__dirname, "public")));

// let input = 'ch23b008';

app.get("/classroom/:roll", (req, res) => {
  const input = req.params.roll;
  let classroom = null;

  for (let i = 1; i < data.length; i++) {
    // Start from 2 to skip header rows
    let roll = data[i][0]; // A column (Roll Number)
    classroom = data[i][1]; // B column (Class Room)

    if (roll === input) {
      console.log(`The ClassRoom of ${input} is` + classroom);
      break;
    }
    if (roll !== input) {
      classroom = null;
    }
  }

  if (classroom) {
    res.json({ RollNumber: input, Classroom: classroom });
    classroom = null;
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
