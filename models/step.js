'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Step = sequelize.define(
  'step',
  {    
    diaryId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
    },
    step: {
      type: DataTypes.INTEGER
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Step;