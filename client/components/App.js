import React, { Component } from 'react'
import axios from 'axios'
import SockJS from 'sockjs-client'
var Stomp = require('stompjs')

import CanvasJSReact from '../../public/assets/canvasjs.react'
var CanvasJS = CanvasJSReact.CanvasJS
var CanvasJSChart = CanvasJSReact.CanvasJSChart

var ws = new SockJS('http://3.93.103.201:8085/xchange/')
var client = Stomp.over(ws)
client.debug = () => {}

class App extends Component {
  constructor() {
    super()
    this.pastDataPoints = []
    this.prices = []
    this.prevPrices = []
    this.state = {
      date: `${new Date().getFullYear()} ${new Date().getMonth() +
        1} ${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}`,
      open: 0,
      high: Number.NEGATIVE_INFINITY,
      low: Number.POSITIVE_INFINITY,
      close: 0,
      diff: [],
      updated: false,
      historical: []
    }
    this.callback = this.callback.bind(this)
  }

  async componentDidMount() {
    // get quotes from DB. Add them to pastdatapoints and set as historical state. Take the close price of the prev quote and set it to the new open price
    try {
      const { data } = await axios.get('/api/quotes')
      data.forEach(entry => {
        this.pastDataPoints.push({
          x: new Date(entry.date),
          y: [entry.open, entry.high, entry.low, entry.close]
        })
      })
      this.setState({
        historical: [...this.pastDataPoints]
      })
      this.setState({
        open: this.state.historical[0].y[3]
      })
    } catch (err) {
      console.log('ERRORRED')
      console.error(err)
    }

    client.connect({}, connectCallback, errorCallback)

    var connectCallback = function() {
      // called back after the client is connected and authenticated to the STOMP server
      console.log('SUCCESSFULLY LOGGED IN')
    }

    var errorCallback = function(error) {
      // display the error's message header:
      console.log('THERE WAS AN ERROR')
      alert(error.headers.message)
    }

    var subscription = setTimeout(
      () => client.subscribe('/topic/orderbook/BTCUSDT', this.callback),
      1000
    )
  }

  async callback(message) {
    // // called when the client receives a STOMP message from the server
    var quote = JSON.parse(message.body)

    // add bid prices to a temporary newPrice array
    let newPrices = []
    for (let price in quote.bidPrice) {
      newPrices.push(price)
    }

    // If there are values in the price array, move them to prevPrice array and compare to newPrices. Add the differences to diff state. For all these diffs, set the largest to high, the smallest to low, and the lastest to close.
    if (this.prices.length > 0) {
      this.prevPrices = [...this.prices]
      this.prices = newPrices
      this.setState({
        diff: this.findDiff(this.prevPrices, this.prices)
      })
      if (this.state.diff.length > 0) {
        if (this.state.open === 0) {
          this.setState({
            open: this.state.diff[0] * 1
          })
        }
        this.setState({
          close: this.state.diff[0] * 1
        })
      }
      if (Math.max(...this.state.diff) > this.state.high) {
        this.setState({
          high: Math.max(...this.state.diff)
        })
      }
      if (Math.min(...this.state.diff) < this.state.low) {
        this.setState({
          low: Math.min(...this.state.diff)
        })
      }
    } else {
      for (let price in quote.bidPrice) {
        this.prices.push(price)
      }
    }

    // if seconds is 0, post to DB the date and price, then add the datapoint to historical, which will remain displayed in chart. Leave close price in the diff array and make the old closeprice tne new high, low, open price
    if (new Date().getSeconds() === 0 && !this.state.updated) {
      let data = await axios.post('/api/quotes/add', {
        open: this.state.open,
        high: this.state.high,
        low: this.state.low,
        close: this.state.close,
        date: this.state.date
      })
      this.setState({
        updated: true,
        historical: [
          ...this.state.historical,
          {
            x: new Date(this.state.date),
            y: [
              this.state.open,
              this.state.high,
              this.state.low,
              this.state.close
            ]
          }
        ],
        diff: [this.state.close],
        high: this.state.close,
        low: this.state.close,
        open: this.state.close
      })
    }
    if (new Date().getSeconds() === 1) {
      this.setState({
        date: `${new Date().getFullYear()} ${new Date().getMonth() +
          1} ${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}`,
        updated: false
      })
    }
  }

  findDiff(prevPrices, prices) {
    let diff = prices.filter(price => prevPrices.indexOf(price) < 0)
    return diff
  }

  componentWillUnmount() {
    client.unsubscribe()
  }

  render() {
    const options = {
      theme: 'light2', // "light1", "light2", "dark1", "dark2"
      animationEnabled: false,
      exportEnabled: true,
      title: {
        text: 'BTCUSDT Bid Prices'
      },
      axisX: {
        valueFormatString: 'YYYYMMDD hh:mm'
      },
      axisY: {
        includeZero: false,
        prefix: '$',
        title: 'Price (in USD)'
      },
      data: [
        {
          type: 'candlestick',
          showInLegend: true,
          name: 'BTCUSDT',
          yValueFormatString: '$###0.00',
          xValueFormatString: 'MMMM YY',
          dataPoints: [
            {
              x: new Date(this.state.date),
              y: [
                this.state.open,
                this.state.high,
                this.state.low,
                this.state.close
              ]
            },
            ...this.state.historical
          ]
        }
      ]
    }
    return (
      <div>
        <CanvasJSChart options={options} onRef={ref => (this.chart = ref)} />
      </div>
    )
  }
}
export default App
