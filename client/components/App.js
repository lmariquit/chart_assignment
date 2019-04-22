import React, { Component } from 'react'
import axios from 'axios'
var Stomp = require('stompjs')
// import CanvasJS from 'canvasjs'

import CanvasJSReact from '../../public/assets/canvasjs.react'
var CanvasJS = CanvasJSReact.CanvasJS
var CanvasJSChart = CanvasJSReact.CanvasJSChart

class App extends Component {
  constructor() {
    super()
    var ws = new SockJS('http://3.93.103.201:8085/xchange/')
    var client = Stomp.over(ws)
    client.debug = () => {}
    client.connect({}, connectCallback, errorCallback)
    console.log('AHHHHHHHH')

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
      () => client.subscribe('/topic/orderbook/BTCUSDT', callback),
      1000
    )

    var callback = function(message) {
      // // called when the client receives a STOMP message from the server
      var quote = JSON.parse(message.body)
      console.log('QUOTE!!!', quote)
      console.log('askPrice:', quote.askPrice, 'bidPrice:', quote.bidPrice)
    }

    // client.onopen = function() {
    //   console.log('open')
    //   client.send('test')
    // }

    // client.onmessage = function(e) {
    //   console.log('message', e.data)
    //   client.close()
    // }

    // client.subscribe('/topic/orderbook/BTCUSDT', function(message) {
    //   console.log(message)
    // })

    // client.onclose = function() {
    //   console.log('close')
    // }
  }

  addToDb() {
    try {
      const res = await axios.get('/api/products')
      dispatch(getProduct(res.data))
    } catch (err) {
      console.error(err)
    }
  }


  render() {
    const options = {
      theme: 'light2', // "light1", "light2", "dark1", "dark2"
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: 'Intel Corporation Stock Price -  2017'
      },
      axisX: {
        valueFormatString: 'MMM'
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
          name: 'Intel Corporation',
          yValueFormatString: '$###0.00',
          xValueFormatString: 'MMMM YY',
          dataPoints: [
            { x: new Date('2017-01-01'), y: [36.61, 38.45, 36.19, 36.82] },
            { x: new Date('2017-02-01'), y: [36.82, 36.95, 34.84, 36.2] },
            { x: new Date('2017-03-01'), y: [35.85, 36.3, 34.66, 36.07] },
            { x: new Date('2017-04-01'), y: [36.19, 37.5, 35.21, 36.15] },
            { x: new Date('2017-05-01'), y: [36.11, 37.17, 35.02, 36.11] },
            { x: new Date('2017-06-01'), y: [36.12, 36.57, 33.34, 33.74] },
            { x: new Date('2017-07-01'), y: [33.51, 35.86, 33.23, 35.47] },
            { x: new Date('2017-08-01'), y: [35.66, 36.7, 34.38, 35.07] },
            { x: new Date('2017-09-01'), y: [35.24, 38.15, 34.93, 38.08] },
            { x: new Date('2017-10-01'), y: [38.12, 45.8, 38.08, 45.49] },
            { x: new Date('2017-11-01'), y: [45.97, 47.3, 43.77, 44.84] },
            { x: new Date('2017-12-01'), y: [44.73, 47.64, 42.67, 46.16] }
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
