/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/pictureediting
 */

import { Plugin } from 'ckeditor5/src/core';

import ImageEditing from './image/imageediting';
import ImageUtils from './imageutils';
import {
	sourcesAttributeConverter,
	viewPictureToModel
} from './image/converters';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInlineEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEditing, ImageUtils ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PictureEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._setupConversion();
		// this._setupImageUploadEditingIntegration();
	}

	/**
	 * Configures conversion pipelines to support upcasting and downcasting images using `<picture>` (and model `sources` attribute).
	 *
	 * @private
	 */
	_setupConversion() {
		const conversion = this.editor.conversion;
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );

		conversion.for( 'upcast' ).add( viewPictureToModel( imageUtils ) );
		conversion.for( 'downcast' ).add( sourcesAttributeConverter( imageUtils ) );
	}
}
