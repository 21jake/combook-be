const Grade = require('./model');

const factory = require('../handlersFactory');

const removeEntity = factory.removeEntity(Grade);

const getEntities = factory.getEntities(Grade);

const getEntity = factory.getEntity(Grade, 'classes');

const createEntity = factory.createEntity(Grade);

const updateEntity = factory.updateEntity(Grade);

module.exports = {
  createEntity,
  getEntities,
  removeEntity,
  updateEntity,
  getEntity,
};
