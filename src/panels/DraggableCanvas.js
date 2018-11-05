import Shape from "@shapes/Shape";
import Line from "@lines/Line";
import StraightLine from "@lines/StraightLine";
import { arrayRemove, isSameReference } from "@utils/index";
var DraggableCanvas = /** @class */ (function () {
    function DraggableCanvas(canvas, options) {
        this.startPoint = { x: 0, y: 0 };
        this.width = 0;
        this.height = 0;
        this.shapes = [];
        this.lines = [];
        this.mousePoint = { x: 0, y: 0 };
        this.ctx = canvas.getContext('2d');
        this.init(canvas);
        this.width = canvas.width;
        this.height = canvas.height;
        if (options) { }
    }
    Object.defineProperty(DraggableCanvas.prototype, "relativeMousePoint", {
        get: function () {
            return {
                x: this.mousePoint.x - this.startPoint.x,
                y: this.mousePoint.y - this.startPoint.y
            };
        },
        set: function (val) {
            this.mousePoint = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DraggableCanvas.prototype, "context", {
        get: function () {
            return this.ctx;
        },
        enumerable: true,
        configurable: true
    });
    DraggableCanvas.prototype.register = function (shape) {
        if (shape instanceof Shape) {
            this.shapes.push(shape);
        }
        if (shape instanceof Line) {
            this.lines.push(shape);
        }
    };
    DraggableCanvas.prototype.unregister = function (shape) {
        if (shape instanceof Shape) {
            arrayRemove(this.shapes, shape);
        }
        if (shape instanceof Line) {
            arrayRemove(this.lines, shape);
        }
    };
    DraggableCanvas.prototype.draw = function () {
        var _this = this;
        this.clear();
        this.shapes.forEach(function (shape) {
            _this.ctx.save();
            shape.draw(_this.ctx);
            _this.ctx.restore();
        });
        this.lines.forEach(function (line) {
            _this.ctx.save();
            line.draw(_this.ctx);
            _this.ctx.restore();
        });
    };
    DraggableCanvas.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    };
    DraggableCanvas.prototype.selectShape = function (relativePoint) {
        for (var i = this.shapes.length - 1; i >= 0; i--) {
            var shape = this.shapes[i];
            if (shape.isSelected(relativePoint))
                return shape;
            else
                continue;
        }
    };
    DraggableCanvas.prototype.startConnect = function (mousePoint) {
        this.relativeMousePoint = mousePoint;
        var shape = this.selectShape(this.relativeMousePoint);
        if (shape && shape.isSelectedBorder(this.relativeMousePoint)) {
            this.connectionStartShape = shape;
            var borderDirection = shape.getSelectedBorder(this.relativeMousePoint);
            if (!borderDirection)
                return false;
            var connectionStartPoint = shape.getConnectionPoint(borderDirection);
            if (!connectionStartPoint)
                return false;
            this.connection = new StraightLine({
                startPoint: connectionStartPoint,
                endPoint: connectionStartPoint,
                startShape: shape
            });
            shape.registerConnection(this.connection, borderDirection);
            this.lines.push(this.connection);
            return true;
        }
        return false;
    };
    DraggableCanvas.prototype.connect = function (mousePoint) {
        if (this.connection) {
            this.relativeMousePoint = mousePoint;
            this.connection.stretch(this.relativeMousePoint);
            this.draw();
        }
    };
    DraggableCanvas.prototype.endConnect = function (mousePoint) {
        this.relativeMousePoint = mousePoint;
        var shape = this.selectShape(this.relativeMousePoint);
        // 当前鼠标指向某个图形
        // 且悬浮于图形的 border 上
        // 且连线的终点图形不为始点图形
        if (shape && shape.isSelectedBorder(this.relativeMousePoint) && !isSameReference(this.connectionStartShape, shape)) {
            var borderDirection = shape.getSelectedBorder(this.relativeMousePoint);
            if (this.connection && borderDirection) {
                var connectionEndPoint = shape.getConnectionPoint(borderDirection);
                if (connectionEndPoint) {
                    this.connection.update({
                        endPoint: connectionEndPoint,
                        endShape: shape
                    });
                    shape.registerConnection(this.connection, borderDirection);
                    this.draw();
                }
            }
        }
        else {
            // todo revert current connection line
            this.removeConnection(this.connection);
        }
        this.connection = undefined;
        this.connectionStartShape = undefined;
    };
    DraggableCanvas.prototype.startDrag = function (mousePoint) {
        this.relativeMousePoint = mousePoint;
        var shape = this.selectShape(this.relativeMousePoint);
        if (shape && shape.isSelectedContent(mousePoint)) {
            this.dragStartPoint = { x: this.relativeMousePoint.x, y: this.relativeMousePoint.y };
            this.dragShape = shape;
            shape.setOffset(this.relativeMousePoint);
            return true;
        }
        return false;
    };
    DraggableCanvas.prototype.drag = function (mousePoint) {
        if (this.dragShape) {
            this.relativeMousePoint = mousePoint;
            this.dragShape.move(this.relativeMousePoint);
            this.draw();
        }
    };
    DraggableCanvas.prototype.endDrag = function (mousePoint) {
        this.dragStartPoint = undefined;
        this.dragShape = undefined;
    };
    DraggableCanvas.prototype.removeConnection = function (line) {
        if (!line)
            return;
        this.removeElement(this.lines, line);
    };
    DraggableCanvas.prototype.removeShape = function (shape) {
        if (!shape)
            return;
        this.removeElement(this.shapes, shape);
    };
    DraggableCanvas.prototype.init = function (canvas) {
        var _a = canvas.getBoundingClientRect(), top = _a.top, left = _a.left;
        this.startPoint = {
            x: left + window.pageXOffset,
            y: top + window.pageYOffset,
        };
    };
    DraggableCanvas.prototype.removeElement = function (arr, item) {
        var idx = arr.indexOf(item);
        if (idx > -1) {
            arr.splice(idx, 1);
        }
        this.draw();
    };
    return DraggableCanvas;
}());
export default DraggableCanvas;
