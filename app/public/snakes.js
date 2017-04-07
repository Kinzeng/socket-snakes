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
socket.on('init', function (replays) {
  allReplays = replays
})
socket.on('newReplay', function (replay) {
  allReplays.push(replay)
})

function setup () {
  createCanvas(600, 400)
  frameRate(20)
  reset()
  generateFood()
  maxLength = 0
}

function draw () {
  background(255)
  if (replay) {
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
      replay = false
    }
  } else {
    var head = snake[0]

    stroke(0)
    fill(0)
    text(score, 10, 15)
    drawSnake(snake, curColor)
    drawFood(food)

    if (!gameOver) {
      // shift all the segments ahead one square
      for (var i = snake.length - 1; i >= 0; i--) {
        if (i > 0) {
          snake[i] = [snake[i - 1][0], snake[i - 1][1]]
        } else {
          switch (direction) {
            case UP: snake[i][1] -= 10; break
            case DOWN: snake[i][1] += 10; break
            case LEFT: snake[i][0] -= 10; break
            case RIGHT: snake[i][0] += 10; break
          }
        }
      }

      if (head[0] === food[0] && head[1] === food[1]) {
        snake.push([-10, -10])
        score++
        generateFood()
      }

      replaySnake.push([JSON.stringify(snake), food])

      snake.forEach(function (coords, i) {
        if (i !== 0 && coords[0] === head[0] && coords[1] === head[1]) {
          finishGame()
        }
      })
      if (head[0] < 0 || head[0] >= width || head[1] < 0 || head[1] >= height) {
        finishGame()
      }
    } else {
      stroke(0)
      fill(0)
      textAlign(CENTER)
      textSize(20)
      text('Game Over!', width / 2, 60)
      textSize(16)
      text('Score: ' + score, width / 2, 80)
      text('Press space to restart', width / 2, 100)
      text('Press R to view replay', width / 2, 120)
    }
  }
}

function keyPressed () {
  var head = snake[0]
  var next = snake[1] || head
  if (keyCode === 38 && directionFrom(head, next) !== DOWN) {
    direction = UP
  } else if (keyCode === 40 && directionFrom(head, next) !== UP) {
    direction = DOWN
  } else if (keyCode === 37 && directionFrom(head, next) !== RIGHT) {
    direction = LEFT
  } else if (keyCode === 39 && directionFrom(head, next) !== LEFT) {
    direction = RIGHT
  } else if (keyCode === 32 && gameOver) {
    reset()
  } else if (keyCode === 82 && gameOver) {
    replay = true
    replayIndex = 0
  }
}

function reset () {
  gameOver = false
  replay = []
  direction = RIGHT
  snake = [[0, 0]]
  score = 0
  curColor = [rand(0, 150), rand(0, 150), rand(0, 150)]
  replay = false
  replayIndex = 0
  replaySnake = []
}

function onSnake (coords) {
  return snake.reduce(function(on, cur) {
    if (cur[0] === coords[0] && cur[1] === coords[1]) {
      return true
    } else {
      return on
    }
  }, false)
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

function rand (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function generateFood () {
  food = [rand(0, width / 10) * 10, rand(0, height / 10) * 10]
  while (onSnake(food)) {
    food = [rand(0, width / 10) * 10, rand(0, height / 10) * 10]
  }
}

function directionFrom (coords1, coords2) {
  if (coords1[0] < coords2[0]) {
    return LEFT
  } else if (coords1[0] > coords2[0]) {
    return RIGHT
  } else if (coords1[1] < coords2[1]) {
    return UP
  } else if (coords1[1] > coords2[1]) {
    return DOWN
  } else {
    return -1
  }
}

function finishGame () {
  gameOver = true
  allReplays.push([replaySnake, curColor])
  maxLength = Math.max(maxLength, replaySnake.length)
  // send request to server, push replaySnake
  socket.emit('gameOver', [replaySnake, curColor])
}
