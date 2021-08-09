const mongoose = require('mongoose');
const validator = require('validator');
const { compare, hash } = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name field is required'],
      maxLength: [50, "Name can't exceed 50 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'teacher', 'parent'],
      },
      default: 'parent',
    },
    email: {
      type: String,
      unique: [true, 'this email is taken'],
      lowercase: true,
      required: [true, 'email field is required'],
      validate: [validator.isEmail, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'password field is required'],
      minLength: [5, 'Password must be at least 5 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'passwordConfirm field is required'],
      validate: [confirmPasswordValidator, `password doesn't match`],
    },
    subject: {
      type: mongoose.Schema.ObjectId,
      ref: 'Subject',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('tuitions', {
  ref: 'Tuition',
  foreignField: 'user',
  localField: '_id',
});

// ONLY WORKS ON CREATE() AND SAVE()
// IF UPDATE, USE SAVE()
function confirmPasswordValidator(value) {
  return value === this.password;
}

// DOCUMENT MIDDLEWARE: ONLY RUN WHEN save() OR create()
userSchema.pre('save', async function(next) {
  // ONLY RUN THIS FUNCTION IF PASSWORD IS MODIFIED
  if (!this.isModified('password')) {
    return next();
  } else {
    // PASSWORD ENCRYPTION
    const saltLength = 12;
    this.password = await hash(this.password, saltLength);

    // REMOVE PASSWORD
    this.passwordConfirm = undefined;
    next();
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  } else {
    // Set passwordChangedAt one second is earlier than when the jwt issued
    // Ensure the token always issued after the password has been updated
    this.passwordChangedAt = Date.now() - 1000;
  }
});

userSchema.pre(/^find/, async function(next) {
  this.find({ active: { $ne: false } });
  this.populate({
    path: 'subject',
    select: 'name',
  });
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfterTokenIssued = function(JWTIssuedAt) {
  if (this.passwordChangedAt) {
    const unixChangedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    const isChanged = JWTIssuedAt < unixChangedTime;
    return isChanged;
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
