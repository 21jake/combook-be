const { pickBy } = require('lodash');
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const removeEntity = Model =>
  catchAsyncError(async (req, res, next) => {
    const { _id } = req.params;
    const document = await Model.findByIdAndDelete(_id);
    if (!document) {
      next(new AppError(`Entity doesn't exist`, 404));
      return;
    }
    res.status(200).json({ success: true, _id });
  });

const updateEntity = Model =>
  catchAsyncError(async (req, res, next) => {
    const { _id } = req.params;
    const entity = await Model.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entity) {
      next(new AppError(`Entity doesn't exist`, 404));
      return;
    }
    res.status(200).json({ success: true, data: { entity } });
  });

const getEntity = (Model, populateOptions) =>
  catchAsyncError(async (req, res, next) => {
    const { _id } = req.params;
    let query = Model.findById(_id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const entity = await query;

    if (!entity) {
      next(new AppError(`Entity doesn't exist`, 404));
      return;
    }
    res.status(200).json({ success: true, data: { entity } });
  });

const getEntities = Model =>
  catchAsyncError(async (req, res, next) => {
    const fetchQuery = new APIFeatures(Model.find(), pickBy(req.query))
      .filter()
      .sort()
      .paginate();
    const entities = await fetchQuery.query;
    // const entities = await fetchQuery.query.explain();

    res.status(200).json({ success: true, data: { total: entities.length, entities } });
  });

const createEntity = Model =>
  catchAsyncError(async (req, res, next) => {
    const entity = await Model.create(req.body);
    res.status(201).json({ success: true, data: { entity } });
  });

const factory = {
  removeEntity,
  updateEntity,
  getEntity,
  getEntities,
  createEntity,
};

module.exports = factory;
