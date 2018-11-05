import RectShape from "@shapes/Rect";
import DraggableCanvas from "@panels/DraggableCanvas";

const $canvas = document.querySelector('#canvas') as HTMLCanvasElement

const draggableCanvas = new DraggableCanvas($canvas, {
  onMouseDown(event: MouseEvent) {
    const { clientX, clientY } = event
    const mousePoint = { x: clientX, y: clientY }

    if (!draggableCanvas.startConnect(mousePoint)) {
      draggableCanvas.startDrag(mousePoint)
    }
  },
  onMouseMove(event: MouseEvent) {
    const { clientX, clientY } = event
    const mousePoint = { x: clientX, y: clientY }

    draggableCanvas.connect(mousePoint)
    draggableCanvas.drag(mousePoint)
  },
  onMouseUp(event: MouseEvent) {
    const { clientX, clientY } = event
    const mousePoint = { x: clientX, y: clientY }

    draggableCanvas.endConnect(mousePoint)
    draggableCanvas.endDrag(mousePoint)
  }
})

const rect1 = new RectShape({
  fillStyle: 'yellow',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 50, y: 100 }
})

const rect2 = new RectShape({
  fillStyle: 'red',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  startPoint: { x: 300, y: 100 }
})

draggableCanvas.register(rect1)
draggableCanvas.register(rect2)
draggableCanvas.draw()