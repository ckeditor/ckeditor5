/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestyleengine
 */

import Plugin from '../../core/plugin.js';
import ImageStyleCommand from './imagestylecommand.js';
import ImageEngine from '../imageengine.js';
import ModelElement from '../../engine/model/element.js';

export default class ImageStyleEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine ];
	}

	init() {
		const editor = this.editor;
		const doc = editor.document;
		const schema = doc.schema;
		const data = editor.data;
		const editing = editor.editing;

		// Define default configuration.
		editor.config.define( 'image.styles', {
			options: {
				// This option is equal to situation when no style is applied at all.
				imageStyleFull: { title: 'Full size image', image: 'bold', value: null },

				// This represents side image.
				imageStyleSide: { title: 'Side image', image: 'italic', value: 'side', className: 'image-style-side' }
			}
		} );

		// Get configuration.
		const styles = editor.config.get( 'image.styles.options' );

		// Allow style attribute in image.
		schema.allow( { name: 'image', attributes: 'style' } );

		// Converters for models element style attribute.
		editing.modelToView.on( 'addAttribute:style', addStyle( styles ) );
		editing.modelToView.on( 'changeAttribute:style', changeStyle( styles ) );
		editing.modelToView.on( 'removeAttribute:style', removeStyle( styles ) );

		for ( let key in styles ) {
			const style = styles[ key ];

			// Converter for figure element from view to model.
			// Create converter only for non-null values.
			if ( style.value !== null ) {
				data.viewToModel.on( 'element:figure', viewToModelImageStyle( style ), { priority: 'low' } );
			}
		}

		// Register image style command.
		editor.commands.set( 'imagestyle', new ImageStyleCommand( editor ) );
	}
}

function addStyle( styles ) {
	return ( event, data, consumable, conversionApi ) => {
		// Check if we can consume, and we are adding in image.
		if ( !consumable.consume( data.item, 'addAttribute:style' ) || !isImage( data.item ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByValue( data.attributeNewValue, styles );

		// Check if new style is allowed in configuration.
		if ( !newStyle ) {
			return;
		}

		conversionApi.mapper.toViewElement( data.item ).addClass( newStyle.className );
	};
}

function changeStyle( styles ) {
	return ( event, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, 'changeAttribute:style' ) || !isImage( data.item ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByValue( data.attributeNewValue, styles );

		// Check if new style is allowed in configuration.
		if ( !newStyle ) {
			return;
		}

		const viewElement = conversionApi.mapper.toViewElement( data.item );
		viewElement.removeClass( data.attributeOldValue );
		viewElement.addClass( newStyle.className );
	};
}

function removeStyle( styles ) {
	return ( event, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, 'removeAttribute:style' ) || !isImage( data.item ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByValue( data.attributeNewValue, styles );

		// Check if new style is allowed in configuration.
		if ( !newStyle ) {
			return;
		}

		conversionApi.mapper.toViewElement( data.item ).viewElement.removeClass( data.attributeOldValue );
	};
}

function viewToModelImageStyle( style ) {
	return ( evt, data, consumable, conversionApi ) => {
		const viewFigureElement = data.input;
		const modelImageElement = data.output;

		// *** Step 1: Validate conversion.
		// Check if view element has proper class to consume.
		if ( !consumable.test( viewFigureElement, { class: style.className } ) ) {
			return;
		}

		// Check if figure is converted to image.
		if ( !isImage( modelImageElement ) ) {
			return;
		}

		// Check if image element can be placed in current context wit additional attribute.
		const attributes = [ ...modelImageElement.getAttributeKeys(), 'style' ];

		if ( !conversionApi.schema.check( { name: 'image', inside: data.context, attributes } ) ) {
			return;
		}

		// *** Step2: Convert to model.
		consumable.consume( viewFigureElement, { class: style.className } );
		modelImageElement.setAttribute( 'style', style.value );
	};
}

function isImage( modelElement ) {
	return modelElement instanceof ModelElement && modelElement.name == 'image';
}

function getStyleByValue( value, styles ) {
	for ( let key in styles ) {
		const style = styles[ key ];

		if ( style.value == value ) {
			return style;
		}
	}
}
