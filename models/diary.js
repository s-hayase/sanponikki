'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Diary = sequelize.define(
  'diary',
  {
    diaryId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
      },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['date']
      }
    ]
  }
);

module.exports = Diary;