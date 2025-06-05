/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image
 */

export { AutoImage } from './autoimage.js';
export { Image } from './image.js';
export { ImageEditing } from './image/imageediting.js';
export { ImageCaptionUtils } from './imagecaption/imagecaptionutils.js';
export { ImageCaption } from './imagecaption.js';
export { ImageCaptionEditing } from './imagecaption/imagecaptionediting.js';
export { ImageInsert } from './imageinsert.js';
export { ImageInsertUI } from './imageinsert/imageinsertui.js';
export { ImageResize } from './imageresize.js';
export { ImageResizeButtons } from './imageresize/imageresizebuttons.js';
export { ImageResizeEditing } from './imageresize/imageresizeediting.js';
export { ImageResizeHandles } from './imageresize/imageresizehandles.js';
export { ImageCustomResizeUI } from './imageresize/imagecustomresizeui.js';
export { ImageSizeAttributes } from './imagesizeattributes.js';
export { ImageStyle } from './imagestyle.js';
export { ImageStyleEditing } from './imagestyle/imagestyleediting.js';
export { ImageStyleUI } from './imagestyle/imagestyleui.js';
export { ImageTextAlternative } from './imagetextalternative.js';
export { ImageTextAlternativeEditing } from './imagetextalternative/imagetextalternativeediting.js';
export { ImageTextAlternativeUI } from './imagetextalternative/imagetextalternativeui.js';
export { ImageToolbar } from './imagetoolbar.js';
export { ImageUpload } from './imageupload.js';
export { ImageUploadEditing, type ImageUploadCompleteEvent } from './imageupload/imageuploadediting.js';
export { ImageUploadProgress } from './imageupload/imageuploadprogress.js';
export { ImageUploadUI } from './imageupload/imageuploadui.js';
export { PictureEditing } from './pictureediting.js';
export { ImageBlock } from './imageblock.js';
export { ImageInline } from './imageinline.js';
export { ImageInsertViaUrl } from './imageinsertviaurl.js';
export { ImageUtils } from './imageutils.js';
export { ImageBlockEditing } from './image/imageblockediting.js';
export { ImageCaptionUI } from './imagecaption/imagecaptionui.js';

export { createImageTypeRegExp } from './imageupload/utils.js';

export type { ImageConfig } from './imageconfig.js';
export type { ImageLoadedEvent } from './image/imageloadobserver.js';
export type { ImageTypeCommand } from './image/imagetypecommand.js';
export type { InsertImageCommand } from './image/insertimagecommand.js';
export type { ReplaceImageSourceCommand } from './image/replaceimagesourcecommand.js';
export type { ToggleImageCaptionCommand } from './imagecaption/toggleimagecaptioncommand.js';
export type { ResizeImageCommand } from './imageresize/resizeimagecommand.js';
export type { ImageStyleCommand } from './imagestyle/imagestylecommand.js';
export type { ImageTextAlternativeCommand } from './imagetextalternative/imagetextalternativecommand.js';
export type { UploadImageCommand } from './imageupload/uploadimagecommand.js';

import './augmentation.js';
