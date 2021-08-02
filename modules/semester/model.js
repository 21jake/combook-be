const mongoose = require('mongoose');

const semesterSchedule = new mongoose.Schema({
  name: {
    type: String,
    enum: {
      values: ['Kì 1,Kì 2'],
    },
    required: [true, 'name field is required'],
  },
  fee: {
    type: Number,
    required: [true, 'fee field is required'],
  },
});

const Semester = mongoose.model('Semester', semesterSchedule);

module.exports = Semester;
