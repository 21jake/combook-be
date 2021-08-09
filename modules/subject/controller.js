const Subject = require('./model');

const factory = require('../handlersFactory');

const removeEntity = factory.removeEntity(Subject);

const getEntities = factory.getEntities(Subject);

const getEntity = factory.getEntity(Subject);

const createEntity = factory.createEntity(Subject);

const updateEntity = factory.updateEntity(Subject);

module.exports = {
  createEntity,
  getEntities,
  removeEntity,
  updateEntity,
  getEntity,
};
