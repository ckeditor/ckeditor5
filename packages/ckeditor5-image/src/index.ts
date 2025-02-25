/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image
 */

export { default as AutoImage } from './autoimage.js';
export { default as Image } from './image.js';
export { default as ImageEditing } from './image/imageediting.js';
export { default as ImageCaptionUtils } from './imagecaption/imagecaptionutils.js';
export { default as ImageCaption } from './imagecaption.js';
export { default as ImageCaptionEditing } from './imagecaption/imagecaptionediting.js';
export { default as ImageInsert } from './imageinsert.js';
export { default as ImageInsertUI } from './imageinsert/imageinsertui.js';
export { default as ImageResize } from './imageresize.js';
export { default as ImageResizeButtons } from './imageresize/imageresizebuttons.js';
export { default as ImageResizeEditing } from './imageresize/imageresizeediting.js';
export { default as ImageResizeHandles } from './imageresize/imageresizehandles.js';
export { default as ImageCustomResizeUI } from './imageresize/imagecustomresizeui.js';
export { default as ImageSizeAttributes } from './imagesizeattributes.js';
export { default as ImageStyle } from './imagestyle.js';
export { default as ImageStyleEditing } from './imagestyle/imagestyleediting.js';
export { default as ImageStyleUI } from './imagestyle/imagestyleui.js';
export { default as ImageTextAlternative } from './imagetextalternative.js';
export { default as ImageTextAlternativeEditing } from './imagetextalternative/imagetextalternativeediting.js';
export { default as ImageTextAlternativeUI } from './imagetextalternative/imagetextalternativeui.js';
export { default as ImageToolbar } from './imagetoolbar.js';
export { default as ImageUpload } from './imageupload.js';
export { default as ImageUploadEditing, type ImageUploadCompleteEvent } from './imageupload/imageuploadediting.js';
export { default as ImageUploadProgress } from './imageupload/imageuploadprogress.js';
export { default as ImageUploadUI } from './imageupload/imageuploadui.js';
export { default as PictureEditing } from './pictureediting.js';
export { default as ImageBlock } from './imageblock.js';
export { default as ImageInline } from './imageinline.js';
export { default as ImageInsertViaUrl } from './imageinsertviaurl.js';
export { default as ImageUtils } from './imageutils.js';
export { default as ImageBlockEditing } from './image/imageblockediting.js';
export { default as ImageCaptionUI } from './imagecaption/imagecaptionui.js';

export { createImageTypeRegExp } from './imageupload/utils.js';

export type { ImageConfig } from './imageconfig.js';
export type { ImageLoadedEvent } from './image/imageloadobserver.js';
export type { default as ImageTypeCommand } from './image/imagetypecommand.js';
export type { default as InsertImageCommand } from './image/insertimagecommand.js';
export type { default as ReplaceImageSourceCommand } from './image/replaceimagesourcecommand.js';
export type { default as ToggleImageCaptionCommand } from './imagecaption/toggleimagecaptioncommand.js';
export type { default as ResizeImageCommand } from './imageresize/resizeimagecommand.js';
export type { default as ImageStyleCommand } from './imagestyle/imagestylecommand.js';
export type { default as ImageTextAlternativeCommand } from './imagetextalternative/imagetextalternativecommand.js';
export type { default as UploadImageCommand } from './imageupload/uploadimagecommand.js';

import './augmentation.js';
