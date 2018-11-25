import BaseCanvas from "@panels/BaseCanvas";

export interface BasePluginOptions {

}

export default abstract class BasePlugin {
  abstract id: string | symbol

  options: BasePluginOptions = {}
  panel?: BaseCanvas

  constructor(options: BasePluginOptions = {}) {
    this.options = options
  }

  mount(panel: BaseCanvas) {
    this.panel = panel
  }

  unmount(panel: BaseCanvas) {
    this.panel = undefined
  }
}