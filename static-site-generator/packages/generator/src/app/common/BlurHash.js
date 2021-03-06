// from https://github.com/woltapp/react-blurhash
import React, { PureComponent } from 'react'

import BlurhashCanvas from './BlurHashCanvas'

const canvasStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: '100%',
}

export default class Blurhash extends PureComponent {
  static defaultProps = {
    height: 128,
    width: 128,
    resolutionX: 32,
    resolutionY: 32,
  }

  componentDidUpdate() {
    if (this.props.resolutionX <= 0) {
      throw new Error('resolutionX must be larger than zero')
    }

    if (this.props.resolutionY <= 0) {
      throw new Error('resolutionY must be larger than zero')
    }
  }

  render() {
    const { hash, height, width, punch, resolutionX, resolutionY, style, ...rest } = this.props

    return (
      <div {...rest} style={{ display: 'inline-block', height, width, ...style, position: 'relative' }}>
        <BlurhashCanvas hash={hash} height={resolutionY} width={resolutionX} punch={punch} style={canvasStyle} />
      </div>
    )
  }
}
