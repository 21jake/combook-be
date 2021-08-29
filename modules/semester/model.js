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
    grade: {
      type: mongoose.Schema.ObjectId,
      ref: 'Grade',
      required: [true, 'Semester must belong to a Grade'],
    },
    fee: {
      type: Number,
      required: [true, 'fee field is required'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

semesterSchema.virtual('tuitions', {
  ref: 'Tuition',
  foreignField: 'semester',
  localField: '_id',
});

semesterSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'grade',
    select: 'name',
  });
  next();
});

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
