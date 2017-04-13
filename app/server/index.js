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
    replays: replays
  })

  client.on('gameOver', function (data) {
    replays.push(data.replay)
    client.broadcast.emit('newReplay', {
      replay: data.replay
    })
    fs.writeFile(replaysFile, JSON.stringify(replays), 'utf-8')
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

app.get('/api/replays', function (req, res) {
  var n = parseInt(req.query.n)
  if (n > replays.length) {
    res.send({
      replays: replays
    })
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

    res.send({
      replays: send
    })
  }
})

app.use(function (req, res, next) {
  res.send('Oops')
})

server.listen(config.port, function () {
  console.log('App listening on port ' + config.port)
})

module.exports = app
