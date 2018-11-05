var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Line from "./Line";
import { isInRectRange, calcDistanceBetweenPoints } from "@utils/index";
var StraightLine = /** @class */ (function (_super) {
    __extends(StraightLine, _super);
    function StraightLine(options) {
        var _this = _super.call(this, options) || this;
        _this.startPoint = options.startPoint;
        _this.endPoint = options.endPoint;
        _this.startShape = options.startShape;
        _this.endShape = options.endShape;
        return _this;
    }
    StraightLine.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        this.startPoint = options.startPoint || this.startPoint;
        this.endPoint = options.endPoint || this.endPoint;
        this.startShape = options.startShape || this.startShape;
        this.endShape = options.endShape || this.endShape;
    };
    StraightLine.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = this.lineCap;
        ctx.strokeStyle = this.strokeStyle;
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y);
        ctx.stroke();
    };
    StraightLine.prototype.stretch = function (mousePoint) {
        this.endPoint = mousePoint;
    };
    StraightLine.prototype.isSelected = function (mousePoint) {
        var halfWidth = this.lineWidth / 2;
        var startPoint = {
            x: this.startPoint.x - halfWidth,
            y: this.startPoint.y - halfWidth
        };
        var width = calcDistanceBetweenPoints(this.startPoint, this.endPoint);
        var height = this.lineWidth;
        return isInRectRange(mousePoint, startPoint, width, height);
    };
    return StraightLine;
}(Line));
export default StraightLine;
