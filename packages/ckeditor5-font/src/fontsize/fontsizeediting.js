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
import { normalizeOptions } from './utils';

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
			options: [
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
		const options = normalizeOptions( this.editor.config.get( 'fontSize.options' ) ).filter( item => item.model );

		for ( const option of options ) {
			// Covert view to model.
			viewToModelAttribute( 'fontSize', option, [ data.viewToModel ] );
		}

		// Define model to view conversion.
		modelAttributeToViewAttributeElement( 'fontSize', options, [ data.modelToView, editing.modelToView ] );

		// Add FontSize command.
		editor.commands.add( 'fontSize', new FontSizeCommand( editor ) );
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
 *  module:font/fontsize/fontsizeediting~FontSizeConfig#options
 */
