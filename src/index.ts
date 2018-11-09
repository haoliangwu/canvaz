import RectShape from "@shapes/Rect";
import DraggableCanvas from "@panels/DraggableCanvas";

const $canvas = document.querySelector('#canvas') as HTMLCanvasElement

const draggableCanvas = new DraggableCanvas($canvas)

const rect1 = new RectShape({
  fillStyle: 'yellow',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 50, y: 100 },
  highlightBorder: 'gray'
})

const rect2 = new RectShape({
  fillStyle: 'red',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 300, y: 100 },
  highlightBorder: 'gray'
})

draggableCanvas.register(rect1)
draggableCanvas.register(rect2)
draggableCanvas.draw()