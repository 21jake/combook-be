const Class = require('./model');

const factory = require('../handlersFactory');

const removeEntity = factory.removeEntity(Class);

const getEntities = factory.getEntities(Class);

const getEntity = factory.getEntity(Class);

const createEntity = factory.createEntity(Class);

const updateEntity = factory.updateEntity(Class);

module.exports = {
  createEntity,
  getEntities,
  removeEntity,
  updateEntity,
  getEntity,
};
