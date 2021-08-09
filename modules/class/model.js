const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  grade: {
    type: mongoose.Schema.ObjectId,
    ref: 'Grade',
    required: [true, 'Class must belong to a grade'],
  },
  teacher_in_charge: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Class must have a teacher in charge'],
  },
  name: {
    type: String,
    validate: {
      validator: function(value) {
        // Only when creating a new document
        const regex = /[0-1][0-9][ABC]/g;
        return regex.test(value);
      },
      message: 'Invalid name for class',
    },
    required: [true, 'name field is required'],
  },
});

// TODO: Do not allow dupicative name for class

classSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'grade',
    select: 'name',
  }).populate({
  path: 'teacher_in_charge',
    select: 'name',
  });
  next();
});

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
