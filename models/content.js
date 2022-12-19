'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Content = sequelize.define(
  'content',
  {
    diaryId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
      },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Content;