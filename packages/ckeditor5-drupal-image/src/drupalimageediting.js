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
			.add( viewImageToModelImage( editor ) );
		conversion.for( 'downcast' )
			.add( modelEntityUuidToDataAttribute() )
			.add( modelEntityFileToDataAttribute() );
	}
}

function viewImageToModelImage( editor ) {
	return dispatcher => {
		dispatcher.on( 'element:img', converter, { priority: 'highest' } );
	};

	function converter( evt, data, conversionApi ) {
		const { viewItem } = data;
		const { writer, consumable, safeInsert, updateConversionResult, schema } = conversionApi;
		const attributesToConsume = [];

		let image;

		// Not only check if a given `img` view element has been consumed, but also verify it has `src` attribute present.
		if ( !consumable.test( viewItem, { name: true, attributes: 'src' } ) ) {
			return;
		}

		// Create image that's allowed in the given context.
		if ( schema.checkChild( data.modelCursor, 'imageInline' ) ) {
			image = writer.createElement( 'imageInline', { src: viewItem.getAttribute( 'src' ) } );
		} else {
			image = writer.createElement( 'imageBlock', { src: viewItem.getAttribute( 'src' ) } );
		}

		if ( editor.plugins.has( 'ImageStyleEditing' ) &&
			consumable.test( viewItem, { name: true, attributes: 'data-align' } )
		) {
			// https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagestyle_utils.html#constant-defaultStyles
			const dataToPresentationMapBlock = {
				left: 'alignBlockLeft',
				center: 'alignCenter',
				right: 'alignBlockRight'
			};
			const dataToPresentationMapInline = {
				left: 'alignLeft',
				right: 'alignRight'
			};

			const dataAlign = viewItem.getAttribute( 'data-align' );
			const alignment = image.is( 'element', 'imageBlock' ) ?
				dataToPresentationMapBlock[ dataAlign ] :
				dataToPresentationMapInline[ dataAlign ];

			writer.setAttribute( 'imageStyle', alignment, image );

			// Make sure the attribute can be consumed after successful `safeInsert` operation.
			attributesToConsume.push( 'data-align' );
		}

		// Check if the view element has still unconsumed `data-caption` attribute.
		// Also, we can add caption only to block image.
		if ( image.is( 'element', 'imageBlock' ) &&
			consumable.test( viewItem, { name: true, attributes: 'data-caption' } )
		) {
			// Create `caption` model element. Thanks to that element the rest of the `ckeditor5-plugin` converters can
			// recognize this image as a block image with a caption.
			const caption = writer.createElement( 'caption' );

			writer.insertText( viewItem.getAttribute( 'data-caption' ), caption );

			// Insert the caption element into image, as a last child.
			writer.append( caption, image );

			// Make sure the attribute can be consumed after successful `safeInsert` operation.
			attributesToConsume.push( 'data-caption' );
		}

		if ( consumable.test( viewItem, { name: true, attributes: 'data-entity-uuid' } ) ) {
			writer.setAttribute( 'dataEntityUuid', viewItem.getAttribute( 'data-entity-uuid' ), image );
			attributesToConsume.push( 'data-entity-uuid' );
		}

		if ( consumable.test( viewItem, { name: true, attributes: 'data-entity-file' } ) ) {
			writer.setAttribute( 'dataEntityFile', viewItem.getAttribute( 'data-entity-file' ), image );
			attributesToConsume.push( 'data-entity-file' );
		}

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

function modelEntityUuidToDataAttribute() {
	return dispatcher => {
		dispatcher.on( 'attribute:dataEntityUuid', converter );
	};

	function converter( evt, data, conversionApi ) {
		const { item } = data;
		const { consumable, writer } = conversionApi;

		if ( !consumable.consume( item, evt.name ) ) {
			return;
		}

		const viewElement = conversionApi.mapper.toViewElement( item );
		const imageInFigure = Array.from( viewElement.getChildren() ).find( child => child.name === 'img' );

		writer.setAttribute( 'data-entity-uuid', data.attributeNewValue, imageInFigure );
	}
}

function modelEntityFileToDataAttribute() {
	return dispatcher => {
		dispatcher.on( 'attribute:dataEntityFile', converter );
	};

	function converter( evt, data, conversionApi ) {
		const { item } = data;
		const { consumable, writer } = conversionApi;

		if ( !consumable.consume( item, evt.name ) ) {
			return;
		}

		const viewElement = conversionApi.mapper.toViewElement( item );
		const imageInFigure = Array.from( viewElement.getChildren() ).find( child => child.name === 'img' );

		writer.setAttribute( 'data-entity-file', data.attributeNewValue, imageInFigure );
	}
}
