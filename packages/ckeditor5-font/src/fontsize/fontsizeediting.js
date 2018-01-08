/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsize/fontsizeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute
} from '@ckeditor/ckeditor5-engine/src/conversion/definition-based-converters';

import FontSizeCommand from './fontsizecommand';

/**
 * The Font Size Editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontSizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Define default configuration using named presets
		editor.config.define( 'fontSize', {
			items: [
				'tiny',
				'small',
				'normal',
				'big',
				'huge'
			]
		} );

		// Get configuration
		const data = editor.data;
		const editing = editor.editing;

		// Define view to model conversion.
		const items = this.configuredItems.filter( item => item.model );

		for ( const item of items ) {
			// Covert view to model.
			viewToModelAttribute( 'fontSize', item, [ data.viewToModel ] );
		}

		// Define model to view conversion.
		modelAttributeToViewAttributeElement( 'fontSize', items, [ data.modelToView, editing.modelToView ] );

		// Add FontSize command.
		editor.commands.add( 'fontSize', new FontSizeCommand( editor ) );
	}

	get configuredItems() {
		// Cache value
		if ( this._cachedItems ) {
			return this._cachedItems;
		}

		const items = [];
		const editor = this.editor;
		const config = editor.config;

		const configuredItems = config.get( 'fontSize.items' );

		for ( const item of configuredItems ) {
			const itemDefinition = getItemDefinition( item );

			if ( itemDefinition ) {
				items.push( itemDefinition );
			}
		}

		return ( this._cachedItems = items );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow fontSize attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'fontSize' } );
	}
}

const namedPresets = {
	tiny: {
		title: 'Tiny',
		model: 'text-tiny',
		view: {
			name: 'span',
			class: 'text-tiny'
		}
	},
	small: {
		title: 'Small',
		model: 'text-small',
		view: {
			name: 'span',
			class: 'text-small'
		}
	},
	big: {
		title: 'Big',
		model: 'text-big',
		view: {
			name: 'span',
			class: 'text-big'
		}
	},
	huge: {
		title: 'Huge',
		model: 'text-huge',
		view: {
			name: 'span',
			class: 'text-huge'
		}
	}
};

// Returns item definition from preset
function getItemDefinition( item ) {
	// Named preset exist so return it
	if ( namedPresets[ item ] ) {
		return namedPresets[ item ];
	}

	// Probably it is full item definition so return it
	if ( typeof item === 'object' ) {
		return item;
	}

	if ( item === 'normal' ) {
		return {
			model: undefined,
			title: 'Normal'
		};
	}

	// At this stage we probably have numerical value to generate a preset so parse it's value.
	const sizePreset = parseInt( item ); // TODO: Should we parse floats? 🤔

	// Discard any faulty values.
	if ( isNaN( sizePreset ) ) {
		return;
	}

	return generatePixelPreset( sizePreset );
}

// Creates a predefined preset for pixel size.
function generatePixelPreset( size ) {
	const sizeName = String( size );

	return {
		title: sizeName,
		model: sizeName,
		view: {
			name: 'span',
			style: {
				'font-size': `${ size }px`
			}
		}
	};
}

/**
 * Font size option descriptor.
 *
 * @typedef {Object} module:font/fontsize/fontsizeediting~FontSizeOption
 *
 * @property {String} title TODO me
 * @property {String} model TODO me
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view View element configuration.
 */

/**
 * The configuration of the heading feature. Introduced by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
 *
 * Read more in {@link module:font/fontsize/fontsizeediting~FontSizeConfig}.
 *
 * @member {module:font/fontsize/fontsizeediting~FontSizeConfig} module:core/editor/editorconfig~EditorConfig#fontSize
 */

/**
 * The configuration of the font size feature.
 * The option is used by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
 *
 *        ClassicEditor
 *            .create( {
 * 				fontSize: ... // Font size feature config.
 *			} )
 *            .then( ... )
 *            .catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontsize/fontsizeediting~FontSizeConfig
 */

/**
 * Available font size options. Defined either as array of strings.
 *
 * The default value is
 * TODO code
 * which configures
 *
 * @member {Array.<String|Number|module:font/fontsize/fontsizeediting~FontSizeOption>}
 *  module:font/fontsize/fontsizeediting~FontSizeConfig#items
 */
