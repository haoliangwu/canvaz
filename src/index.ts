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
  startPoint: { x: 50, y: 50 }
})

const rect2 = new RectShape({
  fillStyle: 'red',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 250, y: 250 }
})

// const line = new StraightLine({
//   strokeStyle: 'black',
//   startPoint: { x: 200, y: 200},
//   endPoint: {x: 250, y: 250}
// })

draggableCanvas.register(rect1)
draggableCanvas.register(rect2)
draggableCanvas.draw()

function onMouseDown(event: MouseEvent) {
  const { clientX, clientY } = event
  const mousePoint = { x: clientX, y: clientY }

  if(!draggableCanvas.startConnect(mousePoint)){
    draggableCanvas.startDrag(mousePoint)
  }

  $canvas.addEventListener('mousemove', onMouseMove)
}

function onMouseMove(event: MouseEvent) {
  const { clientX, clientY } = event
  const mousePoint = { x: clientX, y: clientY }

  draggableCanvas.connect(mousePoint)
  draggableCanvas.drag(mousePoint)
}

function onMouseUp(event: MouseEvent) {
  const { clientX, clientY } = event
  const mousePoint = { x: clientX, y: clientY }

  draggableCanvas.endConnect(mousePoint)
  draggableCanvas.endDrag(mousePoint)
  $canvas.removeEventListener('mousemove', onMouseMove)
}


$canvas.addEventListener('mousedown', onMouseDown)

document.addEventListener('mouseup', onMouseUp)