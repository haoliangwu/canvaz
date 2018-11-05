export var LineCapType;
(function (LineCapType) {
    LineCapType["BUTT"] = "butt";
    LineCapType["ROUND"] = "round";
    LineCapType["SQUARE"] = "square";
})(LineCapType || (LineCapType = {}));
var Line = /** @class */ (function () {
    function Line(options) {
        this.strokeStyle = options.strokeStyle || '';
        this.lineWidth = options.lineWidth || 6;
        this.lineCap = options.lineCap || LineCapType.ROUND;
    }
    Object.defineProperty(Line.prototype, "head", {
        get: function () {
            return this.startShape;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "tail", {
        get: function () {
            return this.endShape;
        },
        enumerable: true,
        configurable: true
    });
    Line.prototype.update = function (options) {
        this.strokeStyle = options.strokeStyle || this.strokeStyle;
        this.lineWidth = options.lineWidth || this.lineWidth;
        this.lineCap = options.lineCap || this.lineCap;
    };
    return Line;
}());
export default Line;
