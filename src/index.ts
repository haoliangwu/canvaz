import RectShape from "@shapes/Rect";
import DraggableCanvas from "@panels/DraggableCanvas";
import CircleShape from "@shapes/Circle";

const $canvas = document.querySelector('#canvas') as HTMLCanvasElement

const draggableCanvas = new DraggableCanvas($canvas)

const rect1 = new RectShape({
  fillStyle: 'yellow',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 50, y: 100 },
  highlightStrokeStyle: 'gray'
})

const rect2 = new RectShape({
  fillStyle: 'red',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 300, y: 100 },
  highlightStrokeStyle: 'gray'
})

const circle1 = new CircleShape({
  fillStyle: 'green',
  lineWidth: 8,
  strokeStyle: 'black',
  radius: 40,
  centerPoint: { x: 150, y: 300 },
  highlightStrokeStyle: 'gray'
})

draggableCanvas.register(rect1)
draggableCanvas.register(rect2)
draggableCanvas.register(circle1)
draggableCanvas.draw()