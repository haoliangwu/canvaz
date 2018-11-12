import StraightLine, { LineOptions } from "@lines/StraightLine";
import { LineBaseOptions } from "@lines/Line";

export interface ConnectionLineOptions extends LineOptions {
  startPoint: ConnectionPoint;
  endPoint: ConnectionPoint;
}

export default class StraightConnectionLine extends StraightLine {
  startPoint: ConnectionPoint;
  endPoint: ConnectionPoint;
  
  constructor(options: ConnectionLineOptions) {
    super(options)

    this.startPoint = options.startPoint
    this.endPoint = options.endPoint
  }
}