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

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
