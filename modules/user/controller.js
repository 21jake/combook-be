const User = require('./model');
const factory = require('../handlersFactory');

const getEntities = factory.getEntities(User);
const removeEntity = factory.removeEntity(User);
const getEntity = factory.getEntity(User);
const updateEntity = factory.updateEntity(User);

module.exports = {
  getEntities,
  removeEntity,
  getEntity,
  updateEntity,
};
