const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      validate: {
        validator: function(value) {
          const regex = /^Học Kỳ? [0-6]/gm;
          return regex.test(value);
        },
      },
      required: [true, 'name field is required'],
    },
    fee: {
      type: Number,
      required: [true, 'fee field is required'],
    },
    grade: {
      type: mongoose.Schema.ObjectId,
      ref: 'Grade',
      required: [true, 'Tuition must belong to a semester'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

semesterSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });

  this.populate('grade');
  next();
});

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
