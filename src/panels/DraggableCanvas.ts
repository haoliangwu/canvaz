import BaseCanvas, { BaseCanvasOptions, BaseConvasMode } from "@panels/BaseCanvas";
import { BehaviorSubject } from "rxjs";
import DraggablePlugin from "@plugins/DraggablePlugin";

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
    super(canvas, Object.assign({ shadow: true }, options))

    const draggablePlugin = new DraggablePlugin()
    this.registerPlugin(draggablePlugin.id, draggablePlugin)
  }
}