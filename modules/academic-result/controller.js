const Result = require('./model');

const factory = require('../handlersFactory');

const removeEntity = factory.removeEntity(Result);

const getEntities = factory.getEntities(Result);

const getEntity = factory.getEntity(Result);

const createEntity = factory.createEntity(Result);

const updateEntity = factory.updateEntity(Result);

module.exports = {
  createEntity,
  getEntities,
  removeEntity,
  updateEntity,
  getEntity,
};
