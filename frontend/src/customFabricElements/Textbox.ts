import * as fabric from "fabric";
import { ADDITIONAL_FABRIC_PROPS } from "../utils";
const TEXTBOX_PROPS = [
  ...ADDITIONAL_FABRIC_PROPS,
  "padding",
  "borderRadius",
] as const;

export class Textbox<
  Props extends fabric.TOptions<fabric.TextboxProps> = Partial<fabric.TextboxProps>,
  SProps extends fabric.SerializedTextboxProps = fabric.SerializedTextboxProps
> extends fabric.Textbox {
  static type = "Textbox";
  strokeWidth = 1;
  strokeColor = "#000";
  padding = 1;
  borderRadius = 1;

  constructor(text: string, options?: any) {
    console.log("text", text, " options = ", options);
    super(text, { ...fabric.Textbox.ownDefaults, ...options });
    if (options.padding) this.padding = options.padding;
    if (options.borderRadius) this.borderRadius = options.borderRadius;
  }

  /**
   * Returns object representation of an instance
   * @method toObject
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} object representation of an instance
   */
  // @ts-ignore
  toObject() {
    //@ts-ignore
    return super.toObject(TEXTBOX_PROPS);
  }

  _renderBackground(ctx: CanvasRenderingContext2D) {
    // Check if the background color is set
    if (!this.backgroundColor) {
      return;
    }

    // Get dimensions of the textbox
    const dim = this._getNonTransformedDimensions();

    // Save the current context state
    ctx.save();

    // Apply background color
    ctx.fillStyle = this.backgroundColor;

    // Create a rounded rectangle path
    const x = -dim.x / 2 - this.padding;
    const y = -dim.y / 2 - this.padding;
    const width = dim.x + this.padding * 2;
    const height = dim.y + this.padding * 2;
    const radius = 5; // Adjust this for border radius

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    // Fill the background
    ctx.fill();

    // Apply stroke (border) if defined
    if (this.strokeColor && this.strokeWidth) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth;
      ctx.stroke();
    }

    // Restore the context state to avoid affecting other objects
    ctx.restore();
  }
}

fabric.classRegistry.setClass(Textbox);
