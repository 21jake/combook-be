const mongoose = require('mongoose');

const tuitionSchema = new mongoose.Schema(
  {
    semester: {
      type: mongoose.Schema.ObjectId,
      ref: 'Semester',
      required: [true, 'Tuition must belong to a semester'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Tuition must belong to a user'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tuitionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'semester',
    select: 'name',
  });
  next();
});

tuitionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

const Tuition = mongoose.model('Tuition', tuitionSchema);

module.exports = Tuition;
