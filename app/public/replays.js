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
var maxLength

var socket = io.connect('http://localhost:8080')
socket.on('init', function (data) {
  allReplays = data.replays
  maxLength = allReplays.reduce(function (max, cur) {
    return Math.max(max, cur[0].length)
  }, 0)
})
socket.on('newReplay', function (replay) {
  allReplays.push(replay)
})

function setup () {
  createCanvas(600, 400)
  frameRate(20)
}

function draw () {
  background(255)
  if (replayIndex <= maxLength) {
    allReplays.forEach(function (replay) {
      if (replay[0][replayIndex]) {
        var color = replay[1]
        var curReplay = replay[0][replayIndex]
        var replayFood = curReplay[1]
        drawSnake(JSON.parse(curReplay[0]), color)
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

function drawSnake (snake, color) {
  stroke(color[0], color[1], color[2])
  fill(color[0], color[1], color[2])
  snake.forEach(function (coords) {
    rect(coords[0] + 1, coords[1] + 1, 8, 8)
  })
}

function drawFood (food) {
  stroke(255, 0, 0)
  fill(255, 0, 0)
  rect(food[0] + 1, food[1] + 1, 8, 8)
}

function fetchReplays (num) {
  getJson('/api/replays?n=' + num, function (data) {
    allReplays = data.replays
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
