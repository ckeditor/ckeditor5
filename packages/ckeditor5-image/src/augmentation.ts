/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	ImageConfig,

	AutoImage,
	Image,
	ImageBlock,
	ImageCaption,
	ImageInline,
	ImageInsert,
	ImageInsertViaUrl,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar,
	ImageUpload,
	ImageUtils,
	ImageBlockEditing,
	ImageEditing,
	ImageCaptionEditing,
	ImageCaptionUI,
	ImageCaptionUtils,
	ImageInsertUI,
	ImageResizeEditing,
	ImageStyleEditing,
	ImageStyleUI,
	ImageTextAlternativeEditing,
	ImageTextAlternativeUI,
	ImageUploadEditing,
	ImageUploadProgress,
	ImageUploadUI,

	ImageTypeCommand,
	InsertImageCommand,
	ReplaceImageSourceCommand,
	ToggleImageCaptionCommand,
	ResizeImageCommand,
	ImageStyleCommand,
	ImageTextAlternativeCommand,
	UploadImageCommand
} from '.';

declare module '@ckeditor/ckeditor5-core' {
  interface EditorConfig {

		/**
		 * The configuration of the image features. Used by the image features in the `@ckeditor/ckeditor5-image` package.
		 *
		 * Read more in {@link module:image/imageconfig~ImageConfig}.
		 */
		image?: ImageConfig;
	}

	interface PluginsMap {
		[ AutoImage.pluginName ]: AutoImage;
		[ Image.pluginName ]: Image;
		[ ImageBlock.pluginName ]: ImageBlock;
		[ ImageCaption.pluginName ]: ImageCaption;
		[ ImageInline.pluginName ]: ImageInline;
		[ ImageInsert.pluginName ]: ImageInsert;
		[ ImageInsertViaUrl.pluginName ]: ImageInsertViaUrl;
		[ ImageResize.pluginName ]: ImageResize;
		[ ImageStyle.pluginName ]: ImageStyle;
		[ ImageTextAlternative.pluginName ]: ImageTextAlternative;
		[ ImageToolbar.pluginName ]: ImageToolbar;
		[ ImageUpload.pluginName ]: ImageUpload;
		[ ImageUtils.pluginName ]: ImageUtils;
		[ ImageBlockEditing.pluginName ]: ImageBlockEditing;
		[ ImageEditing.pluginName ]: ImageEditing;
		[ ImageCaptionEditing.pluginName ]: ImageCaptionEditing;
		[ ImageCaptionUI.pluginName ]: ImageCaptionUI;
		[ ImageCaptionUtils.pluginName ]: ImageCaptionUtils;
		[ ImageInsertUI.pluginName ]: ImageInsertUI;
		[ ImageResizeEditing.pluginName ]: ImageResizeEditing;
		[ ImageStyleEditing.pluginName ]: ImageStyleEditing;
		[ ImageStyleUI.pluginName ]: ImageStyleUI;
		[ ImageTextAlternativeEditing.pluginName ]: ImageTextAlternativeEditing;
		[ ImageTextAlternativeUI.pluginName ]: ImageTextAlternativeUI;
		[ ImageUploadEditing.pluginName ]: ImageUploadEditing;
		[ ImageUploadProgress.pluginName ]: ImageUploadProgress;
		[ ImageUploadUI.pluginName ]: ImageUploadUI;
	}

  interface CommandsMap {
		imageTypeBlock: ImageTypeCommand;
		imageTypeInline: ImageTypeCommand;
		insertImage: InsertImageCommand;
		replaceImageSource: ReplaceImageSourceCommand;
		toggleImageCaption: ToggleImageCaptionCommand;
		resizeImage: ResizeImageCommand;
		imageStyle: ImageStyleCommand;
		imageTextAlternative: ImageTextAlternativeCommand;
		uploadImage: UploadImageCommand;
	}
}
