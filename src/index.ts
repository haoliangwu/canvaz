import DraggableCanvas from "./DraggableCanvas";
import RectShape from "./shapes/Rect";
import StraightLine from "./shapes/StraightLine";

const $canvas = document.querySelector('#canvas') as HTMLCanvasElement

const draggableCanvas = new DraggableCanvas($canvas)
const rect = new RectShape({
  fillStyle: 'yellow',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 50, y: 50 }
})

// const line = new StraightLine({
//   strokeStyle: 'black',
//   startPoint: { x: 200, y: 200},
//   endPoint: {x: 250, y: 250}
// })

draggableCanvas.register(rect)
draggableCanvas.draw()

function onMouseDown(event: MouseEvent) {
  const { clientX, clientY } = event
  const mousePoint = { x: clientX, y: clientY }

  if(draggableCanvas.startConnect(mousePoint)){
    console.log('start connect')
  } else {
    draggableCanvas.startDrag(mousePoint)
  }

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

document.addEventListener('mouseup', onMouseUp)