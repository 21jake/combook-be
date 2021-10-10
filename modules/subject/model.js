const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name field is required'],
  },
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
