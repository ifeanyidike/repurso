import { FabricObject } from "fabric";
import gsap from "gsap";

class AnimationEffect {
  private tl: gsap.core.Timeline;
  private el: Element | FabricObject;

  constructor(timeline: gsap.core.Timeline, element: Element | FabricObject) {
    this.tl = timeline;
    this.el = element;
  }

  public none(duration: number) {
    this.tl.to(this.el, { duration });
  }
  public fadeIn(duration = 1, ease = "none") {
    this.tl.fromTo(this.el, { opacity: 0 }, { opacity: 1, duration, ease });
  }

  public fadeOut(duration = 1, ease = "none") {
    this.tl.to(this.el, { opacity: 0, duration, ease });
  }

  public fade(opacityFrom = 0, opacityTo = 1, duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { opacity: opacityFrom },
      { opacity: opacityTo, duration, ease }
    );
  }

  public slideX(xIn: number, xOut = 0, duration = 1, ease = "none") {
    // Slide left will have xIn as negative preferably -ElementWidth to begin from the leftmost part
    // To centralize, set xOut to 0 which is currently the default
    // Slide right will have xIn as postive preferrably ElementWidth to begin from the rightmost part
    this.tl.fromTo(
      this.el,
      { x: xIn },
      {
        x: xOut,
        duration,
        ease,
      }
    );
  }

  public slideY(yIn: number, yOut = 0, duration = 1, ease = "none") {
    // Slide Up will have yIn as negative preferably -ElementHeight to begin from the topmost part
    // To centralize, set yOut to 0 which is currently the default
    // Slide Down will have yIn as postive preferrably ElementHeight to begin from the bottommost part
    this.tl.fromTo(
      this.el,
      { y: yIn },
      {
        y: yOut,
        duration,
        ease,
      }
    );
  }

  public slide(
    xIn: number,
    yIn: number,
    xOut = 0,
    yOut = 0,
    duration = 1,
    ease = "none"
  ) {
    this.tl.fromTo(
      this.el,
      { y: yIn, x: xIn },
      {
        y: yOut,
        x: xOut,
        duration,
        ease,
      }
    );
  }

  public zoomTo(scale = 1.5, duration = 1, ease = "none") {
    // To zoom out set scale to value smaller to 1
    const center = (this.el as FabricObject)?.getCenterPoint();
    this.tl.to(this.el, {
      scale,
      duration,
      ease,
      onUpdate: () => {
        if (center) {
          (this.el as FabricObject).setPositionByOrigin(
            center,
            "center",
            "center"
          );
        }
      },
    });
  }

  public zoomFrom(scale = 1.5, duration = 1, ease = "none") {
    // This zooms from a zoom value default 1.5 to 1 (actual element scale)
    const center = (this.el as FabricObject).getCenterPoint();
    this.tl.from(this.el, {
      scale,
      duration,
      ease,
      onUpdate: () => {
        (this.el as FabricObject).setPositionByOrigin(
          center,
          "center",
          "center"
        );
      },
    });
  }

  public wipeX(
    xIn: number,
    xOut = 0,
    scaleXIn = 0,
    scaleXOut = 1,
    duration = 1,
    ease = "none"
  ) {
    //xIn should ideally be the element width for wipeLeft and -element width for wipeRight
    this.tl.fromTo(
      this.el,
      { x: xIn, scaleX: scaleXIn },
      {
        x: xOut,
        scaleX: scaleXOut,
        duration,
        ease,
      }
    );
  }

  public wipeY(
    yIn: number,
    yOut = 0,
    scaleYIn = 0,
    scaleYOut = 1,
    duration = 1,
    ease = "none"
  ) {
    //yIn should ideally be the element height for wipeUp and -element width for wipeDown
    this.tl.fromTo(
      this.el,
      { y: yIn, scaleY: scaleYIn },
      {
        y: yOut,
        scaleY: scaleYOut,
        duration,
        ease,
      }
    );
  }

  public radialWipe(duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { clipPath: "circle(0% at 50% 50%)" },
      {
        clipPath: "circle(100% at 50% 50%)",
        duration,
        ease,
      }
    );
  }

  public smoothX(duration = 1, xIn: number, xOut = 0, ease = "none") {
    this.tl.fromTo(
      this.el,
      { x: xIn },
      {
        x: xOut,
        duration,
        ease,
      }
    );
  }

  public smoothY(duration = 1, yIn: number, yOut = 0, ease = "none") {
    this.tl.fromTo(
      this.el,
      { y: yIn },
      {
        y: yOut,
        duration,
        ease,
      }
    );
  }

  // Rect Crop Open (Simulates opening the image from the middle)
  public rectCropOpen(duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { clipPath: "inset(50% 50%)" },
      { clipPath: "inset(0%)", duration, ease }
    );
  }

  // Rect Crop Close (Simulates closing the image to the center)
  public rectCropClose(duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { clipPath: "inset(0%)" },
      { clipPath: "inset(50% 50%)", duration, ease }
    );
  }

  // Squeeze Horizontal
  public squeezeX(duration = 1, ease = "none") {
    this.tl.fromTo(this.el, { scaleX: 0 }, { scaleX: 1, duration, ease });
  }

  // Squeeze Vertical
  public squeezeY(duration = 1, ease = "none") {
    this.tl.fromTo(this.el, { scaleY: 0 }, { scaleY: 1, duration, ease });
  }

  // Reveal Left
  public revealLeft(duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { clipPath: "inset(0% 100% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration, ease }
    );
  }

  // Cover Left
  public coverLeft(duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { clipPath: "inset(0% 0% 0% 0%)" },
      { clipPath: "inset(0% 100% 0% 0%)", duration, ease }
    );
  }

  // Diagonal Top Left to Bottom Right
  public diagonal(
    translateXIn: number,
    translateYIn: number,
    translateXOut = 0,
    translateYOut = 0,
    duration = 1,
    ease = "none"
  ) {
    // for diagonal TLBR set translateXIn to -element width and translateYIn to -element height, translateXOut and translateYOut can be zero to centralize
    // for diagonal BLTR set translateXIn to -element width and translateYIn to element height, translateXOut and translateYOut can be zero to central
    this.tl.fromTo(
      this.el,
      { translateX: translateXIn, translateY: translateYIn },
      { translateX: translateXOut, translateY: translateYOut, duration, ease }
    );
  }

  // Dissolve (Fade Out & Pixelize)
  public dissolve(duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { opacity: 1, filter: "blur(0px)" },
      { opacity: 0, filter: "blur(10px)", duration, ease }
    );
  }

  // Horizontal Slice
  public horizontalSlice(duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
      { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", duration, ease }
    );
  }

  // Vertical Slice
  public verticalSlice(duration = 1, ease = "none") {
    this.tl.fromTo(
      this.el,
      { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
      { clipPath: "polygon(0 0, 0 0, 100% 0, 100% 0)", duration, ease }
    );
  }

  // Smooth Translate Left
  public smoothTranslateX(
    translateXIn: number,
    translateXOut = 0,
    duration = 1.5,
    ease = "none"
  ) {
    // for left set translateX to negative element width and for right set translateX to positive element width
    this.tl.fromTo(
      this.el,
      { translateX: translateXIn },
      { translateX: translateXOut, duration, ease }
    );
  }

  public smoothTranslateY(
    translateYIn: number,
    translateYOut = 0,
    duration = 1.5,
    ease = "none"
  ) {
    // For up set translateYIn to negative element width and for down set it to positive
    this.tl.fromTo(
      this.el,
      { translateX: translateYIn },
      { translateX: translateYOut, duration, ease }
    );
  }

  // Fade to Black
  public fadeColor(duration = 1, color = "#000", ease = "none") {
    // for fade white set color to #FFF
    this.tl.fromTo(
      this.el,
      { backgroundColor: color, opacity: 1 },
      { opacity: 0, duration, ease }
    );
  }

  // Other methods can follow a similar pattern.
}

export default AnimationEffect;
