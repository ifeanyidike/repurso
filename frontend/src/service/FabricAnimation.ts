import { FabricObject } from "fabric";

type AnimationState = {
  isPaused: boolean;
  isRunning: boolean;
  hasStarted: boolean;
  isFinished: boolean;
  time: number;
  animationType: "enter" | "element" | "exit";
};
type Direction =
  | "left"
  | "right"
  | "up"
  | "down"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
class FabricAnimation {
  /**
   * General-purpose animation method with pause, resume, and cancel controls
   * @param fabricObject The Fabric.js object to animate
   * @param properties An object containing the properties to animate (e.g. scaleX, scaleY, left, top, opacity, fill)
   * @param duration Duration of the animation
   * @param onChange Optional callback for onChange event during the animation
   */
  public animate(
    fabricObject: FabricObject,
    properties: Record<string, any>, // Allows any combination of properties (e.g., scaleX, scaleY, fill, etc.)
    duration: number = 1000,
    type: "enter" | "element" | "exit" = "enter",
    effectProps: Record<string, any> = {},
    onChange?: () => void
  ) {
    let isPaused = false; // Flag to indicate if the animation is paused
    let animationRunning = true; // Flag to indicate if animation should run
    let hasAnimationStarted = false; // To track if the animation has started
    let animationFinished = false; // Flag to indicate if the animation
    console.log("effect props", effectProps);

    // Helper function to start or resume the animation
    const center = fabricObject.getCenterPoint();
    const startAnimation = () => {
      hasAnimationStarted = true; // Mark that animation started
      fabricObject.animate(properties, {
        duration: duration,
        ...effectProps,
        onStart: () => {
          console.log("started,");
        },
        onChange: () => {
          // Call the custom onChange function if provided
          if ("scaleX" in properties || "scaleY" in properties) {
            const { top, left, right, bottom } = properties;
            if (!top && !left && !right && !bottom) {
              fabricObject.setPositionByOrigin(center, "center", "center");
            }
          }
          if (onChange) onChange();
          // Ensure canvas re-renders
        },
        onComplete: () => {
          // Animation complete
          console.log("Animation complete");
          animationRunning = false;
          hasAnimationStarted = false;
          animationFinished = true; // Stop the animation after
        },
        abort: () => {
          return !animationRunning;
        }, // Use abort to stop the animation if paused or canceled
      });
    };

    // Start the animation
    startAnimation();

    return {
      pause: () => {
        console.log("on pause");
        if (hasAnimationStarted && animationRunning && !isPaused) {
          isPaused = true;
          animationRunning = false; // Pause the animation
          console.log("Animation paused");
        }
      },
      resume: () => {
        console.log("on resume");
        if (hasAnimationStarted && isPaused) {
          isPaused = false;
          animationRunning = true; // Resume the animation
          console.log("Animation resumed");
          startAnimation(); // Restart the animation with remaining time
        }
      },
      cancel: () => {
        console.log("on cancel");
        if (hasAnimationStarted) {
          animationRunning = false; // Stop the animation
          console.log("Animation canceled");
        }
      },
      reset: () => {
        if (animationFinished) {
          console.log("animation reset");
          animationFinished = false;
          isPaused = true;
          hasAnimationStarted = true;
          //startAnimation(); // Restart the animation from the beginning
          //isPaused = false;
          //animationRunning = true;
        }
      },
      isPaused: () => isPaused,
      isRunning: () => animationRunning,
      hasStarted: () => hasAnimationStarted,
      isFinished: () => animationFinished,
      getTime: () => performance.now(),
      getType: () => type,
    };
  }

  public fade(
    fabricObject: FabricObject,
    targetOpacity = 0,
    duration = 1000,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    return this.animate(
      fabricObject,
      {
        opacity: targetOpacity,
      },
      duration,
      type,
      {
        startValue: 1 - targetOpacity,
        endValue: targetOpacity,
      }
    );
  }

  public fadeAndMove(
    fabricObject: FabricObject,
    targetOpacity = 0,
    xMove = 0,
    yMove = 0,
    duration = 1000,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    return this.animate(
      fabricObject,
      {
        opacity: targetOpacity,
        left: fabricObject.left + xMove,
        top: fabricObject.top + yMove,
      },
      duration,
      type
    );
  }

  public rotate(
    fabricObject: FabricObject,
    angle = 90,
    duration = 1000,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    return this.animate(
      fabricObject,
      {
        angle,
      },
      duration,
      type
    );
  }

  public rotateAndScale(
    fabricObject: FabricObject,
    angle = 90,
    scaleFactor = 1.5,
    duration = 1000,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    return this.animate(
      fabricObject,
      {
        angle,
        scaleX: fabricObject.scaleX * scaleFactor,
        scaleY: fabricObject.scaleY * scaleFactor,
      },
      duration,
      type
    );
  }

  public changeColorAndFade(
    fabricObject: FabricObject,
    color = "#000000",
    targetOpacity = 0,
    duration = 1000,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    return this.animate(
      fabricObject,
      {
        fill: color,
        opacity: targetOpacity,
      },
      duration,
      type
    );
  }

  // Helper methods to easily call common animations

  public zoomAndChangeColor(
    fabricObject: FabricObject,
    duration = 1000,
    factor = 1.5,
    color = "#000000",
    type: "enter" | "element" | "exit" = "enter"
  ) {
    return this.animate(
      fabricObject,
      {
        scaleX: fabricObject.scaleX * factor,
        scaleY: fabricObject.scaleY * factor,
        fill: color,
      },
      duration,
      type
    );
  }

  private _panProperties(fabricObject: FabricObject, direction: Direction) {
    const properties: Partial<{ top: number; left: number }> = {};

    switch (direction) {
      case "left":
        properties.left = fabricObject.left - fabricObject.width;
        break;
      case "right":
        properties.left = fabricObject.left + fabricObject.width;
        break;
      case "up":
        properties.top = fabricObject.top - fabricObject.height;
        break;
      case "down":
        properties.top = fabricObject.top + fabricObject.height;
        break;
      case "top-left":
        properties.top = fabricObject.top - fabricObject.height;
        properties.left = fabricObject.left - fabricObject.width;
        break;
      case "top-right":
        properties.top = fabricObject.top - fabricObject.height;
        properties.left = fabricObject.left + fabricObject.width;
        break;
      case "bottom-left":
        properties.top = fabricObject.top + fabricObject.height;
        properties.left = fabricObject.left - fabricObject.width;
        break;
      case "bottom-right":
        properties.top = fabricObject.top + fabricObject.height;
        properties.left = fabricObject.left + fabricObject.width;
        break;
    }
    return properties;
  }

  public pan(
    fabricObject: FabricObject,
    direction: Direction,
    duration = 1000,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    const properties = this._panProperties(fabricObject, direction);
    return this.animate(fabricObject, properties, duration, type);
  }

  public panAndZoom(
    fabricObject: FabricObject,
    direction: Direction,
    duration = 1000,
    factor = 1.5,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    const properties = this._panProperties(fabricObject, direction);
    console.log("properties", properties, factor);
    return this.animate(
      fabricObject,
      {
        ...properties,
        scaleX: fabricObject.scaleX * factor,
        scaleY: fabricObject.scaleY * factor,
      },
      duration,
      type
    );
  }

  public zoom(
    fabricObject: FabricObject,
    factor = 1.5,
    duration = 1000,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    return this.animate(
      fabricObject,
      {
        scaleX: fabricObject.scaleX * factor,
        scaleY: fabricObject.scaleY * factor,
      },
      duration,
      type
    );
  }

  public run(
    object: FabricObject,
    props: {
      scaleFactor?: number;
      fadeTo?: number;
      x?: number;
      y?: number;
      angle?: number;
    },
    duration = 1000,
    type: "enter" | "element" | "exit" = "enter"
  ) {
    return {
      panUp: () => this.pan(object, "up", duration, type),
      panDown: () => this.pan(object, "down", duration, type),
      panLeft: () => this.pan(object, "left", duration, type),
      panRight: () => this.pan(object, "right", duration, type),
      panBottomLeft: () => this.pan(object, "bottom-left", duration, type),
      panBottomRight: () => this.pan(object, "bottom-right", duration, type),
      panTopLeft: () => this.pan(object, "top-left", duration, type),
      panTopRight: () => this.pan(object, "top-right", duration, type),

      panUpWithZoom: () =>
        this.panAndZoom(object, "up", duration, props.scaleFactor, type),
      panDownWithZoom: () =>
        this.panAndZoom(object, "down", duration, props.scaleFactor, type),
      panLeftWithZoom: () =>
        this.panAndZoom(object, "left", duration, props.scaleFactor, type),
      panRightWithZoom: () =>
        this.panAndZoom(object, "right", duration, props.scaleFactor, type),
      panBottomLeftWithZoom: () =>
        this.panAndZoom(
          object,
          "bottom-left",
          duration,
          props.scaleFactor,
          type
        ),
      panBottomRightWithZoom: () =>
        this.panAndZoom(
          object,
          "bottom-right",
          duration,
          props.scaleFactor,
          type
        ),
      panTopLeftWithZoom: () =>
        this.panAndZoom(object, "top-left", duration, props.scaleFactor, type),
      panTopRightWithZoom: () =>
        this.panAndZoom(object, "top-right", duration, props.scaleFactor, type),

      fadeIn: () => this.fade(object, 1, duration, type),
      fadeOut: () => this.fade(object, 0, duration, type),
      fadeTo: () => this.fade(object, props.fadeTo, duration, type),

      fadeInAndMove: () =>
        this.fadeAndMove(object, 1, props.x, props.y, duration, type),
      fadeOutAndMove: () =>
        this.fadeAndMove(object, 0, props.x, props.y, duration, type),
      fadeToAndMove: () =>
        this.fadeAndMove(
          object,
          props.fadeTo,
          props.x,
          props.y,
          duration,
          type
        ),

      zoomIn: () => this.zoom(object, props.scaleFactor, duration, type),
      zoomOut: () => this.zoom(object, props.scaleFactor, duration, type),

      rotate: () => this.rotate(object, props.angle, duration, type),
      rotateAndScale: () =>
        this.rotateAndScale(
          object,
          props.angle,
          props.scaleFactor,
          duration,
          type
        ),

      // fadeIn: () => effect.fadeIn(duration),
      // fadeOut: () => effect.fadeOut(duration),
      // fade: () => effect.fade(0, 1, duration),
      // slideX: () => effect.slideX(-el.clientWidth, 0, duration),
      // slideLeftIn: () => effect.slideX(-el.clientWidth, 0, duration),
      // slideLeftOut: () => effect.slideX(0, el.clientWidth + 200, duration),
      // slideRightIn: () => effect.slideX(el.clientWidth, 0, duration),
      // slideRightOut: () => effect.slideX(0, -el.clientWidth, duration),

      // slideY: () => effect.slideY(-el.clientHeight, 0, duration),
      // slideUpIn: () => effect.slideY(-el.clientHeight, 0, duration),
      // slideUpOut: () => effect.slideY(0, el.clientHeight, duration),
      // slideDownIn: () => effect.slideY(el.clientHeight, 0, duration),
      // slideDownOut: () => effect.slideY(0, -el.clientHeight, duration),
      // slide: () =>
      //   effect.slide(-el.clientWidth, -el.clientHeight, 0, 0, duration),

      // zoomIn: () => effect.zoomTo(1.5, duration),
      // zoomOut: () => effect.zoomTo(0.5, duration),
      // zoomTo: () => effect.zoomTo(1.5, duration),
      // zoomFrom: () => effect.zoomFrom(1.5, duration),

      // wipeX: () => effect.wipeX(-el.clientWidth, 0, 0, 1, duration),
      // wipeLeft: () => effect.wipeX(-el.clientWidth, 0, 0, 1, duration),
      // wipeRight: () => effect.wipeX(el.clientWidth, 0, 0, 1, duration),

      // wipeY: () => effect.wipeY(-el.clientHeight, 0, 0, 1, duration),
      // wipeUp: () => effect.wipeY(-el.clientHeight, 0, 0, 1, duration),
      // wipeDown: () => effect.wipeY(el.clientHeight, 0, 0, 1, duration),
      // radialWipe: () => effect.radialWipe(duration),

      // fadeBlack: () => effect.fadeColor(duration),
      // fadeWhite: () => effect.fadeColor(duration, '#fff'),

      // smoothUpIn: () => effect.smoothY(duration, -el.clientHeight, 0),
      // smoothUpOut: () => effect.smoothY(duration, 0, el.clientHeight),
      // smoothDownIn: () => effect.smoothY(duration, el.clientHeight, 0),
      // smoothDownOut: () => effect.smoothY(duration, 0, -el.clientHeight),

      // smoothLeftIn: () => effect.smoothX(duration, -el.clientWidth, 0),
      // smoothLeftOut: () => effect.smoothX(duration, 0, el.clientWidth + 200),
      // smoothRightIn: () => effect.smoothX(duration, el.clientWidth, 0),
      // smoothRightOut: () => effect.smoothX(duration, 0, -el.clientWidth),

      // smoothTranslateUpIn: () =>
      //   effect.smoothTranslateY(-el.clientHeight, 0, duration),
      // smoothTranslateUpOut: () =>
      //   effect.smoothTranslateY(0, el.clientHeight, duration),
      // smoothTranslateDownIn: () =>
      //   effect.smoothTranslateY(el.clientHeight, 0, duration),
      // smoothTranslateDownOut: () =>
      //   effect.smoothTranslateY(0, -el.clientHeight, duration),

      // smoothTranslateLeftIn: () =>
      //   effect.smoothTranslateX(-el.clientWidth, 0, duration),
      // smoothTranslateLeftOut: () =>
      //   effect.smoothTranslateX(0, el.clientWidth + 200, duration),
      // smoothTranslateRightIn: () =>
      //   effect.smoothTranslateX(el.clientWidth, 0, duration),
      // smoothTranslateRightOut: () =>
      //   effect.smoothTranslateX(0, -el.clientWidth, duration),

      // dissolve: () => effect.dissolve(duration),
      // verticalSlice: () => effect.verticalSlice(duration),
      // horizontalSlice: () => effect.horizontalSlice(duration),
      // diagonalTLBRIn: () =>
      //   effect.diagonal(-el.clientWidth, -el.clientHeight, 0, 0, duration),
      // diagonalBLTRIn: () =>
      //   effect.diagonal(-el.clientWidth, el.clientHeight, 0, 0, duration),
      // diagonalTLBROut: () =>
      //   effect.diagonal(0, 0, el.clientWidth, el.clientHeight, duration),
      // diagonalBLTROut: () =>
      //   effect.diagonal(0, 0, el.clientWidth, -el.clientHeight, duration),
      // rectCropOpen: () => effect.rectCropOpen(duration),
      // rectCropClose: () => effect.rectCropClose(duration),

      // none: () => effect.none(duration),
    };
  }
}

export default new FabricAnimation();
