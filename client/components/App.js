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
    // var ws = new SockJS('http://3.93.103.201:8085/xchange/')
    // var client = Stomp.over(ws)
    // client.debug = () => {}
    // client.connect({}, connectCallback, errorCallback)

    // var connectCallback = function() {
    //   // called back after the client is connected and authenticated to the STOMP server
    //   console.log('SUCCESSFULLY LOGGED IN')
    // }

    // var errorCallback = function(error) {
    //   // display the error's message header:
    //   console.log('THERE WAS AN ERROR')
    //   alert(error.headers.message)
    // }

    // var subscription = setTimeout(
    //   () => client.subscribe('/topic/orderbook/BTCUSDT', callback),
    //   1000
    // )

    // var callback = function(message) {
    //   // // called when the client receives a STOMP message from the server
    //   var quote = JSON.parse(message.body)
    //   console.log('askPrice:', quote.askPrice, 'bidPrice:', quote.bidPrice)

    // }
    this.prices = []
    this.prevPrices = []
    this.state = {
      date: `${new Date().getFullYear()} ${new Date().getMonth() +
        1} ${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}`,
      open: 35.85,
      high: Math.max(this.prices) || 0,
      low: Math.min(this.prices) || 0,
      close: 36.82,
      diff: [],
      updated: false
    }
    this.callback = this.callback.bind(this)
  }

  async componentDidMount() {
    try {
      const { data } = await axios.get('/api/quotes')
      // dispatch(getProduct(res.data))
      console.log('PRICESSS', data)
    } catch (err) {
      console.log('ERRORRED')
      console.error(err)
    }

    // var ws = new SockJS('http://3.93.103.201:8085/xchange/')
    // var client = Stomp.over(ws)
    // client.debug = () => {}
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

    // var callback = function(message) {
    //   // // called when the client receives a STOMP message from the server
    //   var quote = JSON.parse(message.body)
    //   console.log('askPrice:', quote.askPrice, 'bidPrice:', quote.bidPrice)
    // }
  }

  shouldComponentUpdate() {
    return this.state.diff.length > 0
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
          close: this.state.diff[0],
          high: Math.max(...this.prices),
          low: Math.min(...this.prices)
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
      this.setState({
        updated: true
      })
      let data = await axios.post('/api/quotes/add', {
        open: this.state.open,
        high: this.state.high,
        low: this.state.low,
        close: this.state.close
      })
    }
    if (new Date().getSeconds() === 1) {
      this.setState({
        updated: false
      })
    }
  }

  findDiff(prevPrices, prices) {
    let diff = prices.filter(price => prevPrices.indexOf(price) < 0)
    // console.log('DIFFS', diff)
    return diff
  }

  componentWillUnmount() {
    client.unsubscribe()
  }

  render() {
    // console.log(this.state.date)
    const options = {
      theme: 'light2', // "light1", "light2", "dark1", "dark2"
      animationEnabled: false,
      exportEnabled: true,
      title: {
        text: 'BTCUSDT Bid Prices'
      },
      axisX: {
        valueFormatString: 'YYYYMMDD HH:MM'
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
              x: new Date('2019 4 2 2:40'),
              y: [5300, 5555.5, 5054, 5200]
            },
            {
              x: new Date(this.state.date),
              y: [
                this.state.open,
                this.state.high,
                this.state.low,
                this.state.close
              ]
            }
            // { x: new Date('2017-03-01'), y: [35.85, 36.3, 34.66, 36.07] },
            // { x: new Date('2017-04-01'), y: [36.19, 37.5, 35.21, 36.15] },
            // { x: new Date('2017-05-01'), y: [36.11, 37.17, 35.02, 36.11] },
            // { x: new Date('2017-06-01'), y: [36.12, 36.57, 33.34, 33.74] },
            // { x: new Date('2017-07-01'), y: [33.51, 35.86, 33.23, 35.47] },
            // { x: new Date('2017-08-01'), y: [35.66, 36.7, 34.38, 35.07] },
            // { x: new Date('2017-09-01'), y: [35.24, 38.15, 34.93, 38.08] },
            // { x: new Date('2017-10-01'), y: [38.12, 45.8, 38.08, 45.49] },
            // { x: new Date('2017-11-01'), y: [45.97, 47.3, 43.77, 44.84] },
            // { x: new Date('2017-12-01'), y: [44.73, 47.64, 42.67, 46.16] }
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
