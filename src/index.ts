import RectShape from "@shapes/Rect";
import DraggableCanvas from "@panels/DraggableCanvas";
import CircleShape from "@shapes/Circle";
import HollowCircleShape from "@shapes/HollowCircle";
import ShapePickerCanvas from "@panels/ShapePickerCanvas";
import ConnectablePlugin from "@plugins/ConnectablePlugin";
import HoverPlugin from "@plugins/HoverPlugin";

const $canvas = document.querySelector('#canvas') as HTMLCanvasElement
const $picker = document.querySelector('#picker') as HTMLCanvasElement

const draggableCanvas = new DraggableCanvas($canvas, {
  plugins: [
    new HoverPlugin(),
    new ConnectablePlugin(),
  ]
})
const pickerCanvas = new ShapePickerCanvas($picker, {
  target: draggableCanvas
})

const rect1 = new RectShape({
  fillStyle: 'yellow',
  lineWidth: 8,
  strokeStyle: 'black',
  width: 80,
  height: 80,
  originPoint: { x: 50, y: 20 },
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
  width: 80,
  height: 80,
  originPoint: { x: 50, y: 150 },
  highlight: {
    strokeStyle: 'gray',
    fillStyle: 'red'
  },
  hoverSlot: {
    strokeStyle: 'red',
    fillStyle: 'red',
  }
})

const circle1 = new CircleShape({
  fillStyle: 'green',
  lineWidth: 8,
  strokeStyle: 'black',
  radius: 40,
  centerPoint: { x: 200, y: 60 },
  highlight: {
    strokeStyle: 'gray',
    fillStyle: 'green'
  }
})

draggableCanvas.registerElement(rect1)
draggableCanvas.registerElement(rect2)
draggableCanvas.registerElement(circle1)

draggableCanvas.mount()
// pickerCanvas.mount()
