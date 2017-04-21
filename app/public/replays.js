window.addEventListener('keydown', function (e) {
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault()
  }
}, false)

var snake

var UP = 0
var DOWN = 1
var LEFT = 2
var RIGHT = 3
var direction
var score
var curColor
var food
var gameOver

var replay
var replayIndex
var replaySnake

var allReplays
var numReplays = 20
var maxLength

var socket = io.connect('http://localhost:8080')
socket.on('init', function (data) {
  setReplays(data.replays)
})
socket.on('newReplay', function (data) {
  allReplays.push(data.replay)
  if (allReplays.length > numReplays) {
    allReplays.shift()
  }

  setReplays(allReplays)
})
socket.on('deleteReplays', function (data) {
  setReplays([])
})

function setup () {
  createCanvas(600, 400)
  frameRate(20)
}

function draw () {
  background(0)
  if (replayIndex <= maxLength) {
    allReplays.forEach(function (replay) {
      if (replay.points[replayIndex]) {
        var color = replay.color
        var curReplay = replay.points[replayIndex]
        var replayFood = curReplay.food
        drawSnake(JSON.parse(curReplay.snake), color)
        drawFood(replayFood)
      }
    })
    replayIndex++
  } else {
    replayIndex = 0
  }
}

function keyPressed () {
  if (keyCode === 32) {
    replay = true
    replayIndex = 0
  }
}

function setReplays (replays) {
  allReplays = replays
  maxLength = allReplays.reduce(function (max, cur) {
    return Math.max(max, cur.points.length)
  }, 0)
}

function onNumChange () {
  numReplays = parseInt(document.getElementById('num').value)
  fetchReplays(numReplays)
}

function fetchReplays (num) {
  getJson('/api/replays?n=' + num, function (data) {
    setReplays(data.replays)
  })
}

function getJson (url, callback) {
  var req = new window.XMLHttpRequest()
  req.addEventListener('load', function () {
    callback(JSON.parse(this.responseText))
  })
  req.open('GET', url, true)
  req.send()
}

function deleteJson (url, callback) {
  var req = new window.XMLHttpRequest()
  req.addEventListener('load', function () {
    callback(JSON.parse(this.responseText))
  })
  req.open('DELETE', url, true)
  req.send()
}
