const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: {
        values: ['Khối 10', 'Khối 11', 'Khối 12'],
      },
      required: [true, 'name field is required'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate (JUST LIKE SQL)
// Specify relationships in schema model and populate when querying
gradeSchema.virtual('classes', {
  ref: 'Class',
  foreignField: 'grade',
  localField: '_id',
});
/* 
Dont forget:
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
*/

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
