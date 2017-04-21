function drawSnake (snake, color) {
  snake.forEach(function (coords) {
    drawEllipseSegment(coords, color)
  })
}

function drawSquareSegment (coords, color) {
  stroke(color[0], color[1], color[2])
  fill(color[0], color[1], color[2])
  rect(coords[0] + 1, coords[1] + 1, 8, 8)
}

function drawEllipseSegment (coords, color) {
  noFill()
  strokeWeight(2)
  for (var i = 0; i < 10; i++) {
    stroke(color[0], color[1], color[2], (10 - i) * 10)
    ellipse(coords[0] + 5, coords[1] + 5, i + 1, i + 1)
  }
  strokeWeight(1)
}

function drawFood (food, color) {
  drawEllipseSegment(food, color || [255, 0, 0])
}

function rand (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
