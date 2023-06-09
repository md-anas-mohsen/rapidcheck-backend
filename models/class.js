const mongoose = require("mongoose");

const classSchema = mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, "Provide course code"],
  },
  teacherId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Teacher",
    required: [true, "Provide teacher Id"],
  },
  classDescription: {
    type: String,
    required: [true, "Provide class description"],
    maxLength: [100, "Cannot exceed 100 characters"],
  },
  className: {
    type: String,
    unique: true,
    required: [true, "Provide class name"],
    maxLength: [25, "Cannot exceed 25 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Class", classSchema);
