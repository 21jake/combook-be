const mongoose = require('mongoose');

const scoreSchema = { type: Number, min: 1, max: 10, default: null };

const resultSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: [true, 'Result must belong to a subject'],
  },
  semester: {
    type: mongoose.Schema.ObjectId,
    ref: 'Semester',
    required: [true, 'Result must belong to a semester'],
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Result must belong to a student'],
  },

  // Kiểm tra miệng
  score_type_1: scoreSchema,

  // Kiểm tra 15 phút
  score_type_2: scoreSchema,

  // Kiểm tra 45 phút
  score_type_3: scoreSchema,

  // Kiểm tra Học kỳ
  score_type_4: scoreSchema,
});

resultSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'subject',
    select: 'name',
  }).populate({
    path: 'semester',
    select: 'name',
  }).populate({
    path: 'student',
    select: 'name',
  });
  next();
});

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
