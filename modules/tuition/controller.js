const Tuition = require('./model');

const factory = require('../handlersFactory');

const removeEntity = factory.removeEntity(Tuition);

const getEntities = factory.getEntities(Tuition);

const getEntity = factory.getEntity(Tuition);

const createEntity = factory.createEntity(Tuition);

const updateEntity = factory.updateEntity(Tuition);

module.exports = {
  createEntity,
  getEntities,
  removeEntity,
  updateEntity,
  getEntity,
};
