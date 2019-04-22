const Sequelize = require('sequelize')
const db = require('../db')

const Price = db.define('price', {
  askPrice: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  bidPrice: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  exchange: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

module.exports = Price
