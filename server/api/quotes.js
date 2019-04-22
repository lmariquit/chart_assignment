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

router.post('/add', async (req, res, next) => {
  let open = req.body.open
  let high = req.body.high
  let low = req.body.low
  let close = req.body.close

  try {
    const added = await Quotes.create({
      high,
      low,
      open,
      close
    })
    res.status(201).json(added)
  } catch (err) {
    next(err)
  }
})
