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
export default class PictureEditing extends Plugin {
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
	afterInit() {
		const editor = this.editor;

		if ( editor.plugins.has( 'ImageBlockEditing' ) ) {
			editor.model.schema.extend( 'imageBlock', {
				allowAttributes: [ 'sources' ]
			} );
		}

		if ( editor.plugins.has( 'ImageInlineEditing' ) ) {
			editor.model.schema.extend( 'imageInline', {
				allowAttributes: [ 'sources' ]
			} );
		}

		this._setupConversion();
		this._setupImageUploadEditingIntegration();
	}

	/**
	 * Configures conversion pipelines to support upcasting and downcasting images using the `<picture>` view element
	 * and the model `sources` attribute.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const conversion = editor.conversion;
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		conversion.for( 'upcast' ).add( viewPictureToModel( imageUtils ) );
		conversion.for( 'downcast' ).add( sourcesAttributeConverter( imageUtils ) );
	}

	/**
	 * Makes it possible for uploaded images to get the `sources` model attribute and the `<picture>...</picture>`
	 * view structure out-of-the-box if relevant data is provided along the
	 * {@link module:image/imageupload/imageuploadediting~ImageUploadEditing#event:uploadComplete} event.
	 *
	 * @private
	 */
	_setupImageUploadEditingIntegration() {
		const editor = this.editor;

		if ( !editor.plugins.has( 'ImageUploadEditing' ) ) {
			return;
		}

		this.listenTo( editor.plugins.get( 'ImageUploadEditing' ), 'uploadComplete', ( evt, { imageElement, data } ) => {
			const sources = data.sources;

			if ( !sources ) {
				return;
			}

			editor.model.change( writer => {
				writer.setAttributes( {
					src: data.default,
					sources
				}, imageElement );
			} );
		} );
	}
}
