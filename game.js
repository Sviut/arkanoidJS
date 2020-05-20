let game = {
  running: true,
  ctx: null,
  ball: null,
  platform: null,
  blocks: [],
  rows: 4,
  cols: 8,
  width: 640,
  height: 380,
  score: 0,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null
  },
  init() {
    this.ctx = document.getElementById('myCanvas').getContext('2d')
    this.setEvents()
  },
  setEvents() {
    window.addEventListener("keydown", event => {

      if (event.code === 'Space') {
        this.platform.fire()
      } else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        this.platform.start(event.code)
      }
    }),
      window.addEventListener("keyup", event => {
        this.platform.stop()
      })
  },
  preLoad(callback) {
    let loaded = 0;
    const required = Object.keys(this.sprites).length
    const imageLoad = () => {
      loaded++
      if (loaded >= required) {
        callback()
      }
    }

    for (const key in this.sprites) {
      this.sprites[key] = new Image()
      this.sprites[key].src = `img/${key}.png`
      this.sprites[key].addEventListener('load', imageLoad)
    }
  },
  create() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          active: true,
          width: 60,
          height: 20,
          x: 64 * col + 65,
          y: 24 * row + 35,
        })
      }
    }
  },
  update() {
    this.collideBlocks()
    this.collidePlatform()
    this.ball.collideWorldBounds()
    this.platform.collideWorldBounds()
    this.platform.move()
    this.ball.move()
  },
  addScore() {
    this.score++
    if (this.score >= this.blocks.length) {
      this.end('You won!')
    }
  },
  collideBlocks() {
    for (let block of this.blocks) {
      if (this.ball.collide(block) && block.active) {
        this.ball.bumpBlock(block)
        this.addScore()
      }
    }
  },
  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform)
    }
  },
  run() {
    if (this.running) {
      window.requestAnimationFrame(() => {
        this.update()
        this.render()
        this.run()
      })
    }
  },
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.drawImage(this.sprites.background, 0, 0)
    this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height)
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y)
    this.renderBlocks()
  },
  renderBlocks() {
    for (const block of game.blocks) {
      if (block.active) {
        this.ctx.drawImage(this.sprites.block, block.x, block.y)
      }
    }
  },
  start() {
    this.init()
    this.preLoad(() => {
      this.create()
      this.run()
    })
  },
  end(message) {
    this.running = false
    alert(message)
    window.location.reload()
  },
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
}

game.ball = {
  dx: 0,
  dy: 0,
  velocity: 3,
  x: 320,
  y: 280,
  width: 20,
  height: 20,
  start() {
    this.dy = -this.velocity
    this.dx = game.random(-this.velocity, this.velocity)
  },
  move() {
    if (this.dy) {
      this.y += this.dy
    }
    if (this.dx) {
      this.x += this.dx
    }
  },
  collide(element) {
    let x = this.x + this.dx
    let y = this.y + this.dy

    return x + this.width > element.x &&
      x < element.x + element.width &&
      y + this.height > element.y &&
      y < element.y + element.height
  },
  bumpBlock(block) {
    this.dy *= -1
    block.active = false

  },
  bumpPlatform(platform) {
    if (platform.dx) {
      this.x += platform.dx
    }
    if (this.dy > 0) {
      this.dy = -this.velocity
      let touchX = this.x + this.width / 2
      this.dx = this.velocity * platform.getTouchOffset(touchX)
    }
  },
  collideWorldBounds() {
    let x = this.x + this.dx
    let y = this.y + this.dy

    let ballLeft = x
    let ballRight = ballLeft + this.width
    let ballTop = y
    let ballBottom = ballTop + this.height

    const worldLeft = 0
    const worldRight = game.width
    const worldTop = 0
    const worldBottom = game.height

    if (ballLeft < worldLeft) {
      this.x = 0
      this.dx = this.velocity
    } else if (ballRight > worldRight) {
      this.x = worldRight - this.width
      this.dx = -this.velocity
    } else if (ballTop < worldTop) {
      this.y = 0
      this.dy = this.velocity
    } else if (ballBottom > worldBottom) {
      game.end('You lose!')
    }
  }
}

game.platform = {
  width: 100,
  height: 14,
  velocity: 6,
  dx: 0,
  x: 280,
  y: 300,
  ball: game.ball,
  fire() {
    if (this.ball) {
      this.ball.start()
      this.ball = null
    }
  },
  move() {
    if (this.dx) {
      this.x += this.dx
      if (this.ball) {
        this.ball.x += this.dx
      }
    }
  },
  start(direction) {
    if (direction === 'ArrowLeft') {
      this.dx = -this.velocity
    } else if (direction === 'ArrowRight') {
      this.dx = this.velocity
    }
  },
  stop() {
    this.dx = 0
  },
  getTouchOffset(x) {
    let diff = (this.x + this.width) - x
    let offset = this.width - diff
    let result = 2 * offset / this.width
    return result - 1
  },
  collideWorldBounds() {
    let x = this.x + this.dx

    let platformLeft = x
    let platformRight = platformLeft + this.width

    const worldLeft = 0
    const worldRight = game.width

    if (platformLeft < worldLeft || platformRight > worldRight) {
      this.dx = 0
    }
  }
}

window.addEventListener("load", () => {
  game.start()
})


