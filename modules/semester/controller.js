const Semester = require('./model');

const factory = require('../handlersFactory');

const removeEntity = factory.removeEntity(Semester);

const getEntities = factory.getEntities(Semester);

const getEntity = factory.getEntity(Semester);

const createEntity = factory.createEntity(Semester);

const updateEntity = factory.updateEntity(Semester);

module.exports = {
  createEntity,
  getEntities,
  removeEntity,
  updateEntity,
  getEntity,
};
