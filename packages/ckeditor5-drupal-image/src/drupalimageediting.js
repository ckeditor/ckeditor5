/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module drupal-image/drupalimage
 */

import { Plugin } from 'ckeditor5/src/core';

export default class DrupalImageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DrupalImageEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const conversion = editor.conversion;

		// Conversion.
		conversion.for( 'upcast' )
			.add( viewImageToImageBlock( editor ) );
	}
}

function viewImageToImageBlock( editor ) {
	return dispatcher => {
		dispatcher.on( 'element:img', converter, { priority: 'highest' } );
	};

	function converter( evt, data, conversionApi ) {
		const { viewItem } = data;
		const { writer, consumable, safeInsert, updateConversionResult } = conversionApi;
		const attributesToConsume = [];

		// Not only check if a given `img` view element has been consumed, but also verify it has `src` attribute present.
		if ( !consumable.test( viewItem, { name: true, attributes: 'src' } ) ) {
			return;
		}

		// Place the `src` attribute in a new `imageBlock` model element.
		const image = writer.createElement( 'imageBlock', { src: viewItem.getAttribute( 'src' ) } );

		// Check if the view element has still unconsumed `data-caption` attribute.
		if ( consumable.test( viewItem, { name: true, attributes: 'data-caption' } ) ) {
			// Create `caption` model element. Thanks to that element the rest of the `ckeditor5-plugin` converters can
			// recognize this image as a block image with a caption.
			const caption = writer.createElement( 'caption' );

			writer.insertText( viewItem.getAttribute( 'data-caption' ), caption );

			// Insert the caption element into image, as a last child.
			writer.append( caption, image );

			// Make sure the attribute can be consumed after successful `safeInsert` operation.
			attributesToConsume.push( 'data-caption' );
		}

		if ( editor.plugins.has( 'ImageStyleEditing' ) &&
			consumable.test( viewItem, { name: true, attributes: 'data-align' } )
		) {
			// The integrator needs to adjust styles for the alignment to match their system.
			// Depending on the needs you can either pick the right style from the default config:
			// https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagestyle_utils.html#constant-defaultStyles
			// or specify your own.
			const dataToPresentationMap = {
				left: 'alignBlockLeft',
				center: 'alignBlockCenter', // it's more like 'full'
				right: 'alignBlockRight'
			};

			// todo: check in schema the context of the image - it can be either inline or block.

			const dataAlign = viewItem.getAttribute( 'data-align' );

			writer.setAttribute( 'imageStyle', dataToPresentationMap[ dataAlign ], image );

			// Make sure the attribute can be consumed after successful `safeInsert` operation.
			attributesToConsume.push( 'data-align' );
		}

		// todo: upcast `uuid` and `entity-file`

		// Try to place the image in the allowed position.
		if ( !safeInsert( image, data.modelCursor ) ) {
			return;
		}

		// Mark given element as consumed. Now other converters will not process it anymore.
		consumable.consume( viewItem, { name: true, attributes: attributesToConsume } );

		// Make sure `modelRange` and `modelCursor` is up to date after inserting new nodes into the model.
		updateConversionResult( image, data );
	}
}
