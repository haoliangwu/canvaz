import BaseCanvas, { BaseCanvasOptions, BaseConvasMode } from "@panels/BaseCanvas";

export interface DraggableCanvasOptions extends BaseCanvasOptions {
}

export interface DraggableConvasMode extends BaseConvasMode {
  dragging?: boolean
}

export default class DraggableCanvas extends BaseCanvas {
  mode: DraggableConvasMode = {
    dragging: false
  }

  constructor(canvas: HTMLCanvasElement, options?: DraggableCanvasOptions) {
    super(canvas, Object.assign({}, options, {
      ...options
    }))
  }
}