const router = require('express').Router()
const { Quotes } = require('../db/models')

module.exports = router

// api/quotes
router.get('/', async (req, res, next) => {
  try {
    const allQuotes = await Quotes.findAll()
    res.json(allQuotes)
  } catch (err) {
    console.log('ERRORED')
    next(err)
  }
})
