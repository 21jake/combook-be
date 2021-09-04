const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tuition = require('./model');
const User = require('../user/model');

const factory = require('../handlersFactory');
const catchAsyncError = require('../../utils/catchAsyncError');
const AppError = require('../../utils/appError');
//const AppError = require('../../utils/appError');

const removeEntity = factory.removeEntity(Tuition);

const getEntities = factory.getEntities(Tuition);

const getEntity = factory.getEntity(Tuition);

const createEntity = factory.createEntity(Tuition);

const updateEntity = factory.updateEntity(Tuition);

const getCheckoutSession = catchAsyncError(async (req, res, next) => {
  const tuition = await Tuition.findById(req.params._id);
  console.log(tuition);

  if (tuition) {
    tuition.isPaid = true;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/`,
      cancel_url: `${req.protocol}://${req.get('host')}/`,
      customer_email: tuition.user.email,
      client_reference_id: req.params._id,
      line_items: [
        {
          name: `${tuition.semester.name}`,
          amount: tuition.semester.fee,
          currency: 'vnd',
          quantity: 1,
        },
      ],
    });
    const updateTuition=await tuition.save();

    res.status(200).json({
      status: 'success',
      session,
      updateTuition,
    });
  } else {
    res.status(404);
    throw new AppError('Tuition not found');
  }
});

const createTuitionCheckout = async session => {
  const tuition = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.display_items[0].amount / 100;
  await Tuition.create({ tuition, user, price });
};

module.exports = {
  createEntity,
  getEntities,
  removeEntity,
  updateEntity,
  getEntity,
  getCheckoutSession,
  createTuitionCheckout,
};
