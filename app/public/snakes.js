window.addEventListener('keydown', function (e) {
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault()
  }
}, false)

var snake

var DUP = 0
var DDOWN = 1
var DLEFT = 2
var DRIGHT = 3
var direction
var score
var curColor
var food
var gameOver
var gameOverText = [
  'Socket Snakes',
  'Press space to begin'
]

var replay
var replayIndex
var replaySnake

var allReplays
var maxLength

function setSpeed (speed) {
  frameRate(parseInt(speed))
}

var socket = io.connect('/')
socket.on('similar', function (data) {
  allReplays.push(data.replay)
  maxLength = Math.max(maxLength, data.replay.points.length)
})

function setup () {
  var canvas = createCanvas(600, 400)
  canvas.parent('sketch')
  frameRate(20)
  reset(true)
  generateFood()
  maxLength = 0
}

function draw () {
  background(0)
  if (replay) {
    if (replayIndex <= maxLength) {
      allReplays.forEach(function (replay) {
        var color = replay.color
        var curReplay
        var replayFood
        if (replay.points[replayIndex]) {
          curReplay = replay.points[replayIndex]
          replayFood = curReplay.food
        } else {
          curReplay = replay.points[replay.points.length - 1]
          replayFood = curReplay.food
        }
        drawSnake(JSON.parse(curReplay.snake), color)
        drawFood(replayFood, color)
      })
      replayIndex++
    } else {
      finishReplay()
    }
  } else {
    var head = snake[0]

    fill(255)
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
            case DUP: snake[i][1] -= 10; break
            case DDOWN: snake[i][1] += 10; break
            case DLEFT: snake[i][0] -= 10; break
            case DRIGHT: snake[i][0] += 10; break
          }
        }
      }

      if (head[0] === food[0] && head[1] === food[1]) {
        snake.push([-10, -10])
        score++
        generateFood()
      }

      replaySnake.push({
        snake: JSON.stringify(snake),
        food: food
      })

      snake.forEach(function (coords, i) {
        if (i !== 0 && coords[0] === head[0] && coords[1] === head[1]) {
          finishGame()
        }
      })
      if (head[0] < 0 || head[0] >= width || head[1] < 0 || head[1] >= height) {
        finishGame()
      }
    } else {
      fill(255)
      textAlign(CENTER)

      gameOverText.forEach(function (display, i) {
        if (i === 0) {
          textSize(20)
        } else {
          textSize(16)
        }

        text(display, width / 2, (20 * i) + 60)
      })
    }
  }
}

function keyPressed () {
  var head = snake[0]
  var next = snake[1] || head
  if (keyCode === 38 && directionFrom(head, next) !== DDOWN) {
    direction = DUP
  } else if (keyCode === 40 && directionFrom(head, next) !== DUP) {
    direction = DDOWN
  } else if (keyCode === 37 && directionFrom(head, next) !== DRIGHT) {
    direction = DLEFT
  } else if (keyCode === 39 && directionFrom(head, next) !== DLEFT) {
    direction = DRIGHT
  } else if (keyCode === 32 && gameOver) {
    reset(false)
  } else if (keyCode === 82 && gameOver && allReplays.length > 0) {
    startReplay()
  }
}

function reset (over) {
  gameOver = over
  replay = []
  direction = (rand(0, 2) * 2) + 1
  snake = [[0, 0]]
  score = 0
  curColor = [rand(150, 256), rand(150, 256), rand(150, 256)]
  replay = false
  replayIndex = 0
  replaySnake = []
  document.getElementById('afterPlay').style.display = 'none'
  document.getElementById('afterReplay').style.display = 'none'
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

function generateFood () {
  food = [rand(0, width / 10) * 10, rand(0, height / 10) * 10]
  while (onSnake(food)) {
    food = [rand(0, width / 10) * 10, rand(0, height / 10) * 10]
  }
}

function directionFrom (coords1, coords2) {
  if (coords1[0] < coords2[0]) {
    return DLEFT
  } else if (coords1[0] > coords2[0]) {
    return DRIGHT
  } else if (coords1[1] < coords2[1]) {
    return DUP
  } else if (coords1[1] > coords2[1]) {
    return DDOWN
  } else {
    return -1
  }
}

function finishGame () {
  gameOver = true
  if (JSON.parse(replaySnake[replaySnake.length - 1].snake).length > 10) {
    var rep = {
      points: replaySnake,
      color: curColor
    }
    allReplays = [rep]
    maxLength = Math.max(maxLength, replaySnake.length)
    socket.emit('gameOver', {
      replay: rep
    })

    gameOverText = [
      'Game Over!',
      'Score: ' + score,
      'Press space to restart'
      // 'Press R to view the most similar replay'
    ]
    document.getElementById('afterPlay').style.display = 'block'
  } else {
    allReplays = []
    gameOverText = [
      'Game Over!',
      'Score: ' + score,
      'You didn\'t last long enough to save a replay',
      'Press space to restart'
    ]
  }
}

function startReplay () {
  replay = true
  replayIndex = 0
}

function finishReplay () {
  replay = false
  document.getElementById('afterPlay').style.display = 'none'
  document.getElementById('afterReplay').style.display = 'block'
}
