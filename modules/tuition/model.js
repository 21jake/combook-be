const mongoose = require('mongoose');

const tuitionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Tuition must belong to a user'],
    },
    semester: {
      type: mongoose.Schema.ObjectId,
      ref: 'Semester',
      required: [true, 'Tuition must belong to a semester'],
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
  this.find({ active: { $ne: false } });

  this.populate('user').populate('semester');
  next();
});

const Tuition = mongoose.model('Tuition', tuitionSchema);

module.exports = Tuition;
