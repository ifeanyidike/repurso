import * as fabric from 'fabric';
import { ADDITIONAL_FABRIC_PROPS } from '../utils';

const IMAGE_PROPS = [...ADDITIONAL_FABRIC_PROPS] as const;

// Extend fabric.Image to create a custom FabricImage
export class FabricImage<
    Props extends
      fabric.TOptions<fabric.ImageProps> = Partial<fabric.ImageProps>,
  >
  extends fabric.FabricImage
  implements fabric.ImageProps
{
  static type = 'FabricImage';

  constructor(element: HTMLImageElement | fabric.ImageSource, options?: Props) {
    //@ts-ignore
    super(element, options);
  }
  //@ts-ignore
  toObject() {
    //@ts-ignore
    return super.toObject(IMAGE_PROPS);
  }
}

fabric.classRegistry.setClass(FabricImage);
