const Sequelize = require('sequelize')
const db = require('../db')

const Quotes = db.define('quotes', {
  open: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  high: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  low: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  close: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  date: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

module.exports = Quotes
