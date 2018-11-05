var Shape = /** @class */ (function () {
    function Shape(options) {
        this.offsetX = 0;
        this.offsetY = 0;
        this.connections = new Map();
        this.fillStyle = options.fillStyle || '';
        this.strokeStyle = options.strokeStyle || '';
        this.lineWidth = options.lineWidth || 2;
        this.halfLineWidth = this.lineWidth / 2;
    }
    Shape.prototype.fill = function (ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fill();
        return this;
    };
    Shape.prototype.stroke = function (ctx) {
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.strokeStyle;
        ctx.stroke();
        return this;
    };
    Shape.prototype.fillColor = function (ctx) {
        this.fill(ctx);
        this.stroke(ctx);
        return this;
    };
    Shape.prototype.registerConnection = function (line, borderDirection) {
        if (!this.connections.has(line)) {
            this.connections.set(line, borderDirection);
        }
        return this;
    };
    return Shape;
}());
export default Shape;
