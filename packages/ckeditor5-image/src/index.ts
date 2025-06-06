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
export { ImageTypeCommand } from './image/imagetypecommand.js';
export { InsertImageCommand } from './image/insertimagecommand.js';
export { ReplaceImageSourceCommand } from './image/replaceimagesourcecommand.js';
export { ToggleImageCaptionCommand } from './imagecaption/toggleimagecaptioncommand.js';
export { ResizeImageCommand } from './imageresize/resizeimagecommand.js';
export { ImageStyleCommand } from './imagestyle/imagestylecommand.js';
export { ImageTextAlternativeCommand } from './imagetextalternative/imagetextalternativecommand.js';
export { UploadImageCommand } from './imageupload/uploadimagecommand.js';

export {
	upcastImageFigure as _upcastImageFigure,
	upcastPicture as _upcastImagePicture,
	downcastSrcsetAttribute as _downcastImageSrcsetAttribute,
	downcastSourcesAttribute as _downcastImageSourcesAttribute,
	downcastImageAttribute as _downcastImageAttribute
} from './image/converters.js';

export {
	repositionContextualBalloon as _repositionImageContextualBalloon,
	getBalloonPositionData as _getImageBalloonPositionData
} from './image/ui/utils.js';

export {
	createInlineImageViewElement as _createInlineImageViewElement,
	createBlockImageViewElement as _createBlockImageViewElement,
	getImgViewElementMatcher as _getImageViewElementMatcher,
	determineImageTypeForInsertionAtSelection as _determineImageTypeForInsertionAtSelection,
	getSizeValueIfInPx as _getImageSizeValueIfInPx,
	widthAndHeightStylesAreBothSet as _checkIfImageWidthAndHeightStylesAreBothSet
} from './image/utils.js';

export { ImageInsertFormView as _ImageInsertFormView } from './imageinsert/ui/imageinsertformview.js';
export { ImageInsertUrlView as _ImageInsertUrlView } from './imageinsert/ui/imageinserturlview.js';

export { ImageCustomResizeFormView as _ImageCustomResizeFormView } from './imageresize/ui/imagecustomresizeformview.js';
export type {
	ImageCustomResizeFormValidatorCallback as _ImageCustomResizeFormValidatorCallback
} from './imageresize/ui/imagecustomresizeformview.js';

export type { PossibleResizeImageRange as _PossibleResizeImageRange } from './imageresize/utils/getselectedimagepossibleresizerange.js';
export { getSelectedImageEditorNodes as _getSelectedImageEditorNodes } from './imageresize/utils/getselectedimageeditornodes.js';
export {
	getSelectedImagePossibleResizeRange as _getSelectedImagePossibleResizeRange
} from './imageresize/utils/getselectedimagepossibleresizerange.js';

export { getSelectedImageWidthInUnits as _getSelectedImageWidthInUnits } from './imageresize/utils/getselectedimagewidthinunits.js';

export {
	tryParseDimensionWithUnit as _tryParseImageDimensionWithUnit,
	tryCastDimensionsToUnit as _tryCastImageDimensionsToUnit
} from './imageresize/utils/tryparsedimensionwithunit.js';
export type { DimensionWithUnit as _ImageDimensionWithUnit } from './imageresize/utils/tryparsedimensionwithunit.js';

export {
	modelToViewStyleAttribute as _modelToViewImageStyleAttribute,
	viewToModelStyleAttribute as _viewToModelImageStyleAttribute
} from './imagestyle/converters.js';

export {
	utils as _ImageStyleUtils,
	DEFAULT_OPTIONS as _IMAGE_DEFAULT_OPTIONS,
	DEFAULT_ICONS as _IMAGE_DEFAULT_ICONS,
	DEFAULT_DROPDOWN_DEFINITIONS as _IMAGE_DEFAULT_DROPDOWN_DEFINITIONS
} from './imagestyle/utils.js';

export { TextAlternativeFormView as _ImageTextAlternativeFormView } from './imagetextalternative/ui/textalternativeformview.js';
export type {
	TextAlternativeFormViewSubmitEvent as _ImageTextAlternativeFormViewSubmitEvent,
	TextAlternativeFormViewCancelEvent as _ImageTextAlternativeFormViewCancelEvent
} from './imagetextalternative/ui/textalternativeformview.js';

export {
	fetchLocalImage as _fetchLocalImage,
	isLocalImage as _isLocalImage
} from './imageupload/utils.js';

import './augmentation.js';
