const Dummy = require('./model');

const factory = require('../handlersFactory');

const removeEntity = factory.removeEntity(Dummy);

const getEntities = factory.getEntities(Dummy);

const getEntity = factory.getEntity(Dummy);

const createEntity = factory.createEntity(Dummy);

const updateEntity = factory.updateEntity(Dummy);

module.exports = {
  createEntity,
  getEntities,
  removeEntity,
  updateEntity,
  getEntity,
};
