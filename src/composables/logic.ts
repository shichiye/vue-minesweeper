import type { Ref } from 'vue'
import type { BlockState } from '~/types'

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  gameState: 'play' | 'lost' | 'won'
}

export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(
    public width: number,
    public height: number,
  ) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  reset() {
    this.state.value = {
      mineGenerated: false,
      gameState: 'play',
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width },
          (_, x): BlockState => ({
            x,
            y,
            adjacentMines: 0,
            revealed: false,
          }),
        ),
      ),
    }
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    for (const row of state) {
      for (const block of row) {
        if (Math.abs(initial.x - block.x) < 2 || Math.abs(initial.y - block.y) < 2)
          continue

        block.mine = Math.random() < 0.2
      }
    }

    this.updateNumbers()
  }

  updateNumbers() {
    this.board.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return
        this.getSiblings(block)
          .forEach((b) => {
            if (b.mine)
              block.adjacentMines += 1
          })
      })
    })
  }

  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return

    this.getSiblings(block).forEach((s) => {
      if (s.revealed)
        return

      s.revealed = true
      this.expendZero(s)
    })
  }

  onRightClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return

    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return

    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block)
      this.state.value.mineGenerated = true
    }

    block.revealed = true

    if (block.mine) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
      return
    }

    this.expendZero(block)
  }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined

      return this.state.value.board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  showAllMines() {
    this.state.value.board.flat().forEach((block) => {
      if (block.mine)
        block.revealed = true
    })
  }

  checkGameState() {
    if (!this.state.value.mineGenerated)
      return

    const blocks = this.state.value.board.flat()

    if (blocks.every(block => block.revealed || (block.flagged && block.mine))) {
      if (blocks.some(block => block.flagged && !block.mine)) {
        this.state.value.gameState = 'lost'
        this.showAllMines()
      }
      else { this.state.value.gameState = 'won' }
    }
  }
}
