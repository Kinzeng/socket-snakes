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
  client.emit('init', replays)
  client.on('gameOver', function (replay) {
    replays.push(replay)
    client.broadcast.emit('newReplay', replay)
    fs.writeFile(replaysFile, JSON.stringify(replays), 'utf-8')
  })
})

app.get('/replays', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'replays.html'))
})

app.use(function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

app.use(function (err, req, res, next) {
  return res.json({
    error: err.status,
    message: err.message
  })
})

server.listen(config.port, function () {
  console.log('App listening on port ' + config.port)
})

module.exports = app
