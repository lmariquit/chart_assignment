import React, { Component } from 'react'
import axios from 'axios'
var Stomp = require('stompjs')
// import CanvasJS from 'canvasjs'

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
      open: 5260,
      high: Math.max(this.prices) || 0,
      low: Math.min(this.prices) || 0,
      close: 0,
      diff: [],
      updated: false,
      historical: []
    }
    this.callback = this.callback.bind(this)
  }

  async componentDidMount() {
    try {
      const { data } = await axios.get('/api/quotes')
      console.log('PRICESSS', data)
      data.forEach(entry => {
        this.pastDataPoints.push({
          x: new Date(entry.date),
          y: [entry.open, entry.high, entry.low, entry.close]
        })
      })
      this.setState({
        historical: [...this.pastDataPoints]
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
    console.log('askPrice:', quote.askPrice, 'bidPrice:', quote.bidPrice)

    let newPrices = []
    for (let price in quote.bidPrice) {
      newPrices.push(price)
    }

    if (this.prices) {
      this.prevPrices = [...this.prices]
      this.prices = newPrices
      this.setState({
        diff: this.findDiff(this.prevPrices, this.prices)
      })
      if (this.state.diff.length > 0) {
        this.setState({
          close: this.state.diff[0] * 1,
          high: Math.max(...this.state.diff),
          low: Math.min(...this.state.diff)
        })
      }
      console.log(this.state)
    } else {
      for (let price in quote.bidPrice) {
        this.prices.push(price)
      }
    }
    console.log('aweoifj', new Date().getSeconds())
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
        diff: [],
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
    console.log('historical!!!', this.state.historical)
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
        {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
      </div>
    )
  }
}
export default App
