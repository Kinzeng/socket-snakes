# Socket Snakes

This is the code for my final project for OART-UT 20: Creative Computing. The basic idea of the project is to illustrate how we interact with people on a daily basis through a simple snake game. After finishing the game, you can see the replays of people who have played before you and how your snake might have intertwined with theirs without you even knowing it.

Documentation for the replays data structure

[
  {
    points: [
      {
        snake: "[coords, coords, coords]",
        food: coords
      },
      {
        snake: "[coords, coords, coords]",
        food: coords
      },
      {
        snake: "[coords, coords, coords]",
        food: coords
      },
    ],
    "color": [r, g, b]
  },
  {
    points: [
      {
        snake: "[coords, coords, coords]",
        food: coords
      },
      {
        snake: "[coords, coords, coords]",
        food: coords
      },
      {
        snake: "[coords, coords, coords]",
        food: coords
      },
    ],
    "color": [r, g, b]
  }
]

To run this project locally:
  * clone this repository to your machine: `git clone https://github.com/Kinzeng/socket-snakes.git`
  * move into the project folder: `cd socket-snakes`
  * install dependencies: `npm install`
  * run the server: `npm start`
  * open [http://localhost:8080](http://localhost:8080) in a web browser
