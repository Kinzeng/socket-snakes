var fs = require('fs')
var path = require('path')
var express = require('express')
var config = require('../../config')
var middleware = require('./middleware')

var app = middleware(express())
var server = require('http').Server(app)
var io = require('socket.io')(server)

var replaysFile = path.join(__dirname, '..', '..', 'replays.json')
var replays = JSON.parse(fs.readFileSync(replaysFile, 'utf-8'))
io.on('connection', function (client) {
  client.emit('init', {
    replays: getRandomReplays(20)
  })

  client.on('gameOver', function (data) {
    // save the replay
    replays.push(data.replay)
    client.broadcast.emit('newReplay', {
      replay: data.replay
    })
    fs.writeFile(replaysFile, JSON.stringify(replays), 'utf-8')

    // send the most similar replay
    if (replays.length > 1) {
      client.emit('similar', {
        replay: getSimilarReplay(data.replay)
      })
    }
  })
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

app.get('/replays', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'replays.html'))
})

function rand (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function getRandomReplays (n) {
  if (n > replays.length) {
    return replays
  } else {
    var indices = []
    var send = []
    var num = 0
    while (num < n) {
      var i = rand(0, replays.length)
      if (indices.indexOf(i) === -1) {
        indices.push(i)
        send.push(replays[i])
        num++
      }
    }

    return send
  }
}

function getSimilarReplay (compare) {
  var minDelta = Number.MAX_VALUE
  var minIndex = 0
  replays.forEach(function (replay, i) {
    var delta = 0
    for (var j = 0; j < Math.max(replay.points.length, compare.points.length); j++) {
      var snake = JSON.parse(replay.points[Math.min(j, replay.points.length - 1)].snake)
      var compareSnake = JSON.parse(compare.points[Math.min(j, compare.points.length - 1)].snake)
      var dx = snake[0][0] - compareSnake[0][0]
      var dy = snake[0][1] - compareSnake[0][1]

      // var snakeMin = Math.min(snake.length, compareSnake.length)
      // snake.forEach(function (coords, j) {
      //   if (j < snakeMin) {
      //     var dx = coords[0] - compareSnake[j][0]
      //     var dy = coords[1] - compareSnake[j][1]
      //     var d = Math.sqrt((dx * dx) + (dy * dy))
      //     delta += d
      //   }
      // })
      var d = Math.sqrt((dx * dx) + (dy * dy))
      delta += d
    }

    if (delta !== 0 && delta < minDelta) {
      minDelta = delta
      minIndex = i
    }
  })

  return replays[minIndex]
}

app.get('/api/replays', function (req, res) {
  var n = parseInt(req.query.n)
  res.send({
    replays: getRandomReplays(n)
  })
})

// app.delete('/api/replays', function (req, res) {
//   replays = []
//   fs.writeFile(replaysFile, JSON.stringify([]), 'utf-8', function (err) {
//     if (!err) {
//       io.emit('deleteReplays')
//     }
//   })
// })

app.use(function (req, res, next) {
  res.send('Oops')
})

server.listen(config.port, function () {
  console.log('App listening on port ' + config.port)
})

module.exports = app
