// from https://github.com/woltapp/react-blurhash
import React, { PureComponent } from 'react'
import { decode } from 'blurhash'

export default class BlurhashCanvas extends PureComponent {
  static defaultProps = {
    height: 128,
    width: 128,
  }

  componentDidUpdate() {
    this.draw()
  }

  handleRef = (canvas) => {
    this.canvas = canvas
    this.draw()
  }

  draw = () => {
    const { hash, height, punch, width } = this.props

    if (this.canvas) {
      const pixels = decode(hash, width, height, punch)

      const ctx = this.canvas.getContext('2d')
      const imageData = ctx.createImageData(width, height)
      imageData.data.set(pixels)
      ctx.putImageData(imageData, 0, 0)
    }
  }

  render() {
    const { hash, height, width, ...rest } = this.props

    return <canvas {...rest} height={height} width={width} ref={this.handleRef} />
  }
}
