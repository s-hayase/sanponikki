'use strict';
const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@db/sanponikki'
);

module.exports = {
  sequelize,
  DataTypes
};