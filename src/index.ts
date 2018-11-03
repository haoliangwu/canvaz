import DraggableCanvas from "./DraggableCanvas";
import RectShape from "./shapes/Rect";

const $canvas = document.querySelector('#canvas') as HTMLCanvasElement

const draggableCanvas = new DraggableCanvas($canvas)
const rect = new RectShape({
  fillStyle: 'yellow',
  lineWidth: 7,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 50, y: 50 }
})

draggableCanvas.register(rect)
draggableCanvas.draw()

function onMouseDown(event: MouseEvent) {
  const { clientX, clientY } = event
  const mousePoint = { x: clientX, y: clientY }

  draggableCanvas.startDrag(mousePoint)
  $canvas.addEventListener('mousemove', onMouseMove)
}

function onMouseMove(event: MouseEvent) {
  const { clientX, clientY } = event
  const mousePoint = { x: clientX, y: clientY }

  draggableCanvas.drag(mousePoint)
}

function onMouseUp(event: MouseEvent) {
  draggableCanvas.endDrag()
  $canvas.removeEventListener('mousemove', onMouseMove)
}


$canvas.addEventListener('mousedown', onMouseDown)

$canvas.addEventListener('mouseup', onMouseUp)