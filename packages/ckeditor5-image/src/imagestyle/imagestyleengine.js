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
import { addStyle, changeStyle, removeStyle, viewToModelImageStyle } from './converters.js';

/**
 * The image style engine plugin. Sets default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 *
 * @extends {module:core/plugin~Plugin}
 */
export default class ImageStyleEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.document;
		const schema = doc.schema;
		const data = editor.data;
		const editing = editor.editing;

		// Define default configuration.
		editor.config.define( 'image.styles', {
			// This option is equal to situation when no style is applied at all.
			imageStyleFull: { title: 'Full size image', icon: 'object-center', value: null },

			// This represents side image.
			imageStyleSide: { title: 'Side image', icon: 'object-right', value: 'side', className: 'image-style-side' }
		} );

		// Get configuration.
		const styles = editor.config.get( 'image.styles' );

		// Allow imageStyle attribute in image.
		// We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
		schema.allow( { name: 'image', attributes: 'imageStyle', inside: '$root' } );

		// Converters for models element imageStyle attribute.
		editing.modelToView.on( 'addAttribute:imageStyle', addStyle( styles ) );
		data.modelToView.on( 'addAttribute:imageStyle', addStyle( styles ) );
		editing.modelToView.on( 'changeAttribute:imageStyle', changeStyle( styles ) );
		data.modelToView.on( 'changeAttribute:imageStyle', changeStyle( styles ) );
		editing.modelToView.on( 'removeAttribute:imageStyle', removeStyle( styles ) );
		data.modelToView.on( 'removeAttribute:imageStyle', removeStyle( styles ) );

		for ( let key in styles ) {
			const style = styles[ key ];

			// Converter for figure element from view to model.
			// Create converter only for non-null values.
			if ( style.value !== null ) {
				data.viewToModel.on( 'element:figure', viewToModelImageStyle( style ), { priority: 'low' } );
			}
		}

		// Register image style command.
		editor.commands.set( 'imagestyle', new ImageStyleCommand( editor, styles ) );
	}
}

/**
 * Image style format descriptor.
 *
 * @typedef {Object} module:image/imagestyle/imagestyleengine~ImageStyleFormat
 * @property {String} value Value used to store this style in model.
 * When value is `null` style will be used as default one. Default style does not apply any CSS class to the view element.
 * @property {String} icon Icon name to use when creating style's toolbar button.
 * @property {String} title Style's title.
 * @property {String} className CSS class used to represent style in view.
 */
