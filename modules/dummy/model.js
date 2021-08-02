const mongoose = require('mongoose');

const dummySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name field is required'],
  },
  age: {
    type: Number,
    required: [true, 'age field is required'],
  },
  job: {
    type: String,
    required: [true, 'job field is required'],
  },
  isMale: {
    type: Boolean,
    required: [true, 'isMale field is required'],
  },
});

const Dummy = mongoose.model('Dummy', dummySchema);

module.exports = Dummy;
