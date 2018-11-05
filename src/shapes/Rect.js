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
import Shape from "./Shape";
import { isInRectRange, isInTriRange } from "@utils/index";
export var RectBorderDirection;
(function (RectBorderDirection) {
    RectBorderDirection["TOP"] = "top";
    RectBorderDirection["RIGHT"] = "right";
    RectBorderDirection["BOTTOM"] = "bottom";
    RectBorderDirection["LEFT"] = "left";
})(RectBorderDirection || (RectBorderDirection = {}));
var RectShape = /** @class */ (function (_super) {
    __extends(RectShape, _super);
    function RectShape(options) {
        var _this = _super.call(this, options) || this;
        _this.width = options.width;
        _this.offsetWidth = _this.width + _this.lineWidth;
        _this.contentWidth = _this.width - _this.lineWidth;
        _this.height = options.height;
        _this.offsetHeight = _this.height + _this.lineWidth;
        _this.contentHeight = _this.height - _this.lineWidth;
        _this.startPoint = options.startPoint;
        return _this;
    }
    Object.defineProperty(RectShape.prototype, "centerPoint", {
        get: function () {
            return {
                x: this.startPoint.x + this.width / 2,
                y: this.startPoint.y + this.height / 2
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RectShape.prototype, "offsetStartPoint", {
        get: function () {
            return {
                x: this.startPoint.x - this.halfLineWidth,
                y: this.startPoint.y - this.halfLineWidth
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RectShape.prototype, "contentStartPoint", {
        get: function () {
            return {
                x: this.startPoint.x + this.halfLineWidth,
                y: this.startPoint.y + this.halfLineWidth
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RectShape.prototype, "topConnectionPoint", {
        get: function () {
            return { x: this.centerPoint.x, y: this.startPoint.y };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RectShape.prototype, "rightConnectionPoint", {
        get: function () {
            return { x: this.startPoint.x + this.width, y: this.centerPoint.y };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RectShape.prototype, "bottomConnectionPoint", {
        get: function () {
            return { x: this.centerPoint.x, y: this.startPoint.y + this.height };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RectShape.prototype, "leftConnectionPoint", {
        get: function () {
            return { x: this.startPoint.x, y: this.centerPoint.y };
        },
        enumerable: true,
        configurable: true
    });
    RectShape.prototype.draw = function (ctx) {
        this.drawRectPath(ctx);
        this.fillColor(ctx);
    };
    RectShape.prototype.move = function (mousePoint) {
        var _this = this;
        this.startPoint.x = mousePoint.x - this.offsetX;
        this.startPoint.y = mousePoint.y - this.offsetY;
        if (this.connections.size > 0) {
            this.connections.forEach(function (bd, l) {
                var options = {};
                if (l.head == _this)
                    options.startPoint = l.head.getConnectionPoint(bd);
                if (l.tail == _this)
                    options.endPoint = l.tail.getConnectionPoint(bd);
                l.update(options);
            });
        }
    };
    RectShape.prototype.setOffset = function (mousePoint) {
        this.offsetX = mousePoint.x - this.startPoint.x;
        this.offsetY = mousePoint.y - this.startPoint.y;
    };
    RectShape.prototype.isSelected = function (mousePoint) {
        return isInRectRange(mousePoint, this.offsetStartPoint, this.offsetWidth, this.offsetHeight);
    };
    RectShape.prototype.isSelectedContent = function (mousePoint) {
        return isInRectRange(mousePoint, this.contentStartPoint, this.contentWidth, this.contentHeight);
    };
    RectShape.prototype.isSelectedBorder = function (mousePoint) {
        return !this.isSelectedContent(mousePoint) && this.isSelected(mousePoint);
    };
    RectShape.prototype.getConnectionPoint = function (borderDirection) {
        switch (borderDirection) {
            case RectBorderDirection.TOP: return this.topConnectionPoint;
            case RectBorderDirection.RIGHT: return this.rightConnectionPoint;
            case RectBorderDirection.BOTTOM: return this.bottomConnectionPoint;
            case RectBorderDirection.LEFT: return this.leftConnectionPoint;
        }
    };
    RectShape.prototype.getSelectedBorder = function (mousePoint) {
        if (this.isSelectTopTri(mousePoint))
            return RectBorderDirection.TOP;
        if (this.isSelectRightTri(mousePoint))
            return RectBorderDirection.RIGHT;
        if (this.isSelectBottomTri(mousePoint))
            return RectBorderDirection.BOTTOM;
        if (this.isSelectLeftTri(mousePoint))
            return RectBorderDirection.LEFT;
    };
    RectShape.prototype.isSelectTopTri = function (mousePoint) {
        var width = this.offsetWidth / 2;
        var height = this.offsetHeight / 2;
        var mp = {
            x: mousePoint.x - this.offsetStartPoint.x,
            y: mousePoint.y - this.offsetStartPoint.y
        };
        return isInTriRange(mp, width, height);
    };
    RectShape.prototype.isSelectRightTri = function (mousePoint) {
        var width = this.offsetHeight / 2;
        var height = this.offsetWidth / 2;
        var mp = {
            x: mousePoint.y - this.offsetStartPoint.y,
            y: this.offsetWidth - (mousePoint.x - this.offsetStartPoint.x)
        };
        return isInTriRange(mp, width, height);
    };
    RectShape.prototype.isSelectBottomTri = function (mousePoint) {
        var width = this.offsetWidth / 2;
        var height = this.offsetHeight / 2;
        var mp = {
            x: mousePoint.x - this.offsetStartPoint.x,
            y: this.offsetHeight - (mousePoint.y - this.offsetStartPoint.y)
        };
        return isInTriRange(mp, width, height);
    };
    RectShape.prototype.isSelectLeftTri = function (mousePoint) {
        var width = this.offsetHeight / 2;
        var height = this.offsetWidth / 2;
        var mp = {
            x: this.offsetHeight - (mousePoint.y - this.offsetStartPoint.y),
            y: mousePoint.x - this.offsetStartPoint.x
        };
        return isInTriRange(mp, width, height);
    };
    RectShape.prototype.isSelectTopRect = function (mousePoint) {
        return isInRectRange(mousePoint, this.offsetStartPoint, this.offsetWidth, this.offsetHeight / 2);
    };
    RectShape.prototype.isSelectRightRect = function (mousePoint) {
        var startPoint = {
            x: this.offsetStartPoint.x + this.offsetWidth / 2,
            y: this.offsetStartPoint.y
        };
        return isInRectRange(mousePoint, startPoint, this.offsetWidth / 2, this.offsetHeight);
    };
    RectShape.prototype.isSelectBottomRect = function (mousePoint) {
        var startPoint = {
            x: this.offsetStartPoint.x,
            y: this.offsetStartPoint.y + this.offsetHeight / 2
        };
        return isInRectRange(mousePoint, startPoint, this.offsetWidth, this.offsetHeight / 2);
    };
    RectShape.prototype.isSelectLeftRect = function (mousePoint) {
        return isInRectRange(mousePoint, this.offsetStartPoint, this.offsetWidth / 2, this.offsetHeight);
    };
    RectShape.prototype.drawRectPath = function (ctx) {
        ctx.beginPath();
        ctx.rect(this.startPoint.x, this.startPoint.y, this.width, this.height);
    };
    return RectShape;
}(Shape));
export default RectShape;
