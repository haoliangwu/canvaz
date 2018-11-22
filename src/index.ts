import RectShape from "@shapes/Rect";
import DraggableCanvas from "@panels/DraggableCanvas";
import CircleShape from "@shapes/Circle";
import HollowCircleShape from "@shapes/HollowCircle";

const $canvas = document.querySelector('#canvas') as HTMLCanvasElement

const draggableCanvas = new DraggableCanvas($canvas)

const rect1 = new RectShape({
  fillStyle: 'yellow',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  originPoint: { x: 50, y: 100 },
  highlight: {
    strokeStyle: 'gray',
    fillStyle: 'yellow'
  },
  hoverSlot: {
    strokeStyle: 'red',
    fillStyle: 'red',
  }
})

const rect2 = new RectShape({
  fillStyle: 'red',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 100,
  height: 100,
  originPoint: { x: 300, y: 100 },
  highlight: {
    strokeStyle: 'gray',
    fillStyle: 'red'
  },
  hoverSlot: {
    strokeStyle: 'yellow',
    fillStyle: 'yellow',
  }
})

const circle1 = new CircleShape({
  fillStyle: 'green',
  lineWidth: 8,
  strokeStyle: 'black',
  radius: 40,
  centerPoint: { x: 150, y: 300 },
  highlight: {
    strokeStyle: 'gray',
    fillStyle: 'green'
  }
})

const circle2 = new HollowCircleShape({
  lineWidth: 8,
  strokeStyle: 'black',
  radius: 40,
  centerPoint: { x: 330, y: 300 },
  highlight: {
    strokeStyle: 'gray',
    fillStyle: 'gray'
  }
})

draggableCanvas.registerShape(rect1)
draggableCanvas.registerShape(rect2)
draggableCanvas.registerShape(circle1)
draggableCanvas.registerShape(circle2)

draggableCanvas.mount()
