import * as fabric from 'fabric';
import { ADDITIONAL_FABRIC_PROPS } from '../utils';

type LoadOptions = { crossOrigin?: fabric.TCrossOrigin; signal?: AbortSignal };
const VIDEO_PROPS = [...ADDITIONAL_FABRIC_PROPS] as const;

// Extend fabric.Image to create a custom FabricImage
export class FabricVideo<
  Props extends
  fabric.TOptions<fabric.ImageProps> = Partial<fabric.ImageProps>,
  SProps extends fabric.SerializedImageProps = fabric.SerializedImageProps,
>
  extends fabric.FabricImage
  implements fabric.ImageProps {
  static type = 'FabricVideo';
  constructor(
    element: HTMLImageElement | HTMLVideoElement | fabric.ImageSource,
    options?: Props
  ) {
    super(element, options);
  }

  // Custom method to set the source of the image
  setSrc(src: string, { crossOrigin, signal }: LoadOptions = {}) {
    return loadImage(src, { crossOrigin, signal }).then(img => {
      if (crossOrigin !== undefined) {
        this.set({ crossOrigin });
      }
      this.setElement(img);
    });
  }

  // Other custom methods like fromURL, fromObject, etc.
  static fromURL(
    url: string,
    options: LoadOptions = {},
    imageOptions?: fabric.TOptions<fabric.ImageProps>
  ) {
    return loadImage(url, options).then(
      img => new fabric.FabricImage(img, imageOptions)
    );
  }

  //@ts-ignore
  toObject(): Pick<T, K> & SProps {
    //@ts-ignore
    return super.toObject(VIDEO_PROPS);
  }

  fromObject<T extends fabric.TOptions<fabric.SerializedImageProps>>(
    { filters: f, resizeFilter: rf, src, crossOrigin, type, ...object }: T,
    options?: { signal: AbortSignal }
  ) {
    return Promise.all([
      loadImage(src!, { ...options, crossOrigin }),
      f && fabric.util.enlivenObjects<any>(f, options),
      // TODO: redundant - handled by enlivenObjectEnlivables
      rf && fabric.util.enlivenObjects<any>([rf], options),
      fabric.util.enlivenObjectEnlivables(object, options),
      //@ts-ignore
    ]).then(([el, filters = [], [resizeFilter] = [], hydratedProps = {}]) => {
      return new fabric.FabricImage(el, {
        ...object,
        // TODO: this creates a difference between image creation and restoring from JSON
        src,
        filters,
        resizeFilter,
        ...hydratedProps,
      });
    });
  }

  getOriginalSize(): { width: any; height: any } {
    {
      const element = this.getElement() as any;
      if (!element) {
        return {
          width: 0,
          height: 0,
        };
      }
      return {
        width: element.naturalWidth || element.videoWidth || element.width,
        height: element.naturalHeight || element.videoHeight || element.height,
      };
    }
  }

  _renderFill(ctx: CanvasRenderingContext2D) {
    const elementToDraw = this._element;
    if (!elementToDraw) {
      return;
    }
    const scaleX = this['_filterScalingX'],
      scaleY = this['_filterScalingY'],
      w = this.width,
      h = this.height,
      // crop values cannot be lesser than 0.
      cropX = Math.max(this.cropX, 0),
      cropY = Math.max(this.cropY, 0),
      elWidth =
        (elementToDraw as HTMLImageElement).naturalWidth ||
        (elementToDraw as HTMLVideoElement).videoWidth ||
        elementToDraw.width,
      elHeight =
        (elementToDraw as HTMLImageElement).naturalHeight ||
        (elementToDraw as HTMLVideoElement).videoWidth ||
        elementToDraw.height,
      sX = cropX * scaleX,
      sY = cropY * scaleY,
      // the width height cannot exceed element width/height, starting from the crop offset.
      sW = Math.min(w * scaleX, elWidth - sX),
      sH = Math.min(h * scaleY, elHeight - sY),
      x = -w / 2,
      y = -h / 2,
      maxDestW = Math.min(w, elWidth / scaleX - cropX),
      maxDestH = Math.min(h, elHeight / scaleY - cropY);
    // if ("play" in elementToDraw) (elementToDraw as HTMLVideoElement).play();
    elementToDraw &&
      ctx.drawImage(elementToDraw, sX, sY, sW, sH, x, y, maxDestW, maxDestH);
  }
}

function loadImage(
  url: string,
  { signal, crossOrigin = null }: fabric.util.LoadImageOptions = {}
): Promise<HTMLImageElement | HTMLVideoElement> {
  return new Promise(function (resolve, reject) {
    if (signal && signal.aborted) {
      return reject(new Error('loadImage aborted'));
    }

    // Check if the source is a video or image
    const isMp4 =
      url.endsWith('.mp4') || url.startsWith('data:video/mp4;base64,');
    const element = document.createElement(isMp4 ? 'video' : 'img') as
      | HTMLVideoElement
      | HTMLImageElement;

    let abort: EventListenerOrEventListenerObject;
    if (signal) {
      abort = function (err: Event) {
        element.src = '';
        reject(err);
      };
      signal.addEventListener('abort', abort, { once: true });
    }

    const done = function () {
      element.onload = element.onerror = element.onloadeddata = null;
      abort && signal?.removeEventListener('abort', abort);
      resolve(element);
    };

    if (!url) {
      done();
      return;
    }

    element.onerror = function () {
      abort && signal?.removeEventListener('abort', abort);
      reject(new Error(`Error loading ${element.src}`));
    };

    // Handle video element separately
    if (isMp4) {
      const videoElement = element as HTMLVideoElement;
      videoElement.muted = true; // Mute video if required
      videoElement.onloadeddata = () => {
        resolve(videoElement); // Resolve the video element when it's ready
      };
      videoElement.src = url;
    } else {
      // For images
      element.onload = done; // For image load
      if (crossOrigin) {
        element.crossOrigin = crossOrigin;
      }
      element.src = url;
    }
  });
}

fabric.classRegistry.setClass(FabricVideo);
