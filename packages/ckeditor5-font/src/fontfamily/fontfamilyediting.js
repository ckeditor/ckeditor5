/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute
} from '@ckeditor/ckeditor5-engine/src/conversion/configurationdefinedconverters';

/**
 * The Font Family Editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontFamilyEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Define default configuration using named presets
		editor.config.define( 'fontFamily', {
			items: [
				'default',
				'Arial, Helvetica, sans-serif',
				'Courier New, Courier, monospace'
			]
		} );

		// Get configuration
		const data = editor.data;
		const editing = editor.editing;

		for ( const item of this.configuredItems ) {
			// Covert view to model.
			viewToModelAttribute( 'fontFamily', item, [ data.viewToModel ] );

			// Covert model to view.
			modelAttributeToViewAttributeElement( 'fontFamily', item, [ data.modelToView, editing.modelToView ] );

			// Add command.
		}
	}

	get configuredItems() {
		// Cache value
		if ( this._cachedItems ) {
			return this._cachedItems;
		}

		const items = [];
		const editor = this.editor;
		const config = editor.config;

		const configuredItems = config.get( 'fontFamily.items' );

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

		// Allow highlight attribute on all elements
		editor.model.schema.allow( { name: '$inline', attributes: 'fontFamily', inside: '$block' } );
		// Temporary workaround. See https://github.com/ckeditor/ckeditor5/issues/477.
		editor.model.schema.allow( { name: '$inline', attributes: 'fontFamily', inside: '$clipboardHolder' } );
	}
}

// Returns item definition from preset
function getItemDefinition( item ) {
	// Probably it is full item definition so return it
	if ( typeof item === 'object' ) {
		return item;
	}

	return generateFontPreset( item );
}

// Creates a predefined preset for pixel size.
function generateFontPreset( font ) {
	const fontNames = font.split( ',' );

	const cssFontNames = fontNames.join( fontNames );

	return {
		label: fontNames[ 0 ],
		model: fontNames[ 0 ],
		view: {
			name: 'span',
			styles: {
				'font-family': cssFontNames
			}
		}
	};
}

/**
 * Font family option descriptor.
 *
 * @typedef {Object} module:font/fontfamily/fontfamilyediting~FontFamilyOption
 *
 * @property {String} label TODO me
 * @property {String} model TODO me
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view View element configuration.
 */

/**
 * The configuration of the heading feature. Introduced by the {@link module:font/fontfamily/fontfamilyediting~FontSizeEditing} feature.
 *
 * Read more in {@link module:font/fontfamily/fontfamilyediting~FontFamilyConfig}.
 *
 * @member {module:font/fontfamily/fontfamilyediting~FontFamilyConfig} module:core/editor/editorconfig~EditorConfig#fontFamily
 */

/**
 * The configuration of the font family feature.
 * The option is used by the {@link module:font/fontfamily/fontfamilyediting~FontSizeEditing} feature.
 *
 *        ClassicEditor
 *            .create( {
 * 				fontFamily: ... // Font family feature config.
 *			} )
 *            .then( ... )
 *            .catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontfamily/fontfamilyediting~FontFamilyConfig
 */

/**
 * Available font family options. Defined either as array of strings.
 *
 * The default value is
 * TODO code
 * which configures
 *
 * @member {Array.<String|Number|module:font/fontfamily/fontfamilyediting~FontFamilyOption>}
 *  module:font/fontfamily/fontfamilyediting~FontFamilyConfig#items
 */
