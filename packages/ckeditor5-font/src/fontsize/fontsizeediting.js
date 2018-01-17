/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
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

		// Define default configuration using named presets.
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
 * Font size option descriptor. Compatible with {@link module:engine/conversion/definition-based-converters~ConverterDefinition}.
 *
 * @typedef {Object} module:font/fontsize/fontsizeediting~FontSizeOption
 *
 * @property {String} title The user-readable title of the option.
 * @property {String} model Attribute's unique value in the model.
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view View element configuration.
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} [acceptsAlso] An array with all matched elements that
 * view to model conversion should also accept.
 */

/**
 * The configuration of the font size feature.
 * Introduced by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
 *
 * Read more in {@link module:font/fontsize/fontsizeediting~FontSizeConfig}.
 *
 * @member {module:font/fontsize/fontsizeediting~FontSizeConfig} module:core/editor/editorconfig~EditorConfig#fontSize
 */

/**
 * The configuration of the font size feature.
 * The option is used by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
 *
 * 		ClassicEditor
 * 			.create( {
 * 				fontSize: ... // Font size feature config.
 *			} )
 * 			.then( ... )
 * 			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontsize/fontsizeediting~FontSizeConfig
 */

/**
 * Available font size options. Defined either using predefined presets, numeric pixel values
 * or {@link module:font/fontsize/fontsizeediting~FontSizeOption}.
 *
 * The default value is:
 *
 *		const fontSizeConfig = {
 *			options: [
 *				'tiny',
 * 				'small',
 * 				'normal',
 * 				'big',
 * 				'huge'
 *			]
 *		};
 *
 * It defines 4 sizes: "tiny", "small", "big" and "huge". Those values will be rendered as `span` elements in view. The "normal" defines
 * text without a `fontSize` attribute set.
 *
 * Each rendered span in the view will have class attribute set corresponding to size name.
 * For instance for "small" size the view will render:
 *
 * 		<span class="text-small">...</span>
 *
 * As an alternative the font size might be defined using numeric values (either as Number or as String):
 *
 * 		const fontSizeConfig = {
 * 			options: [ 9, 10, 11, 12, 13, 14, 15 ]
 * 		};
 *
 * To use defined font sizes from {@link module:core/commandcollection~CommandCollection} use `fontSize` command and pass desired
 * font size as a value.
 * For example, the below code will apply `fontSize` attribute with `tiny` value to the current selection:
 *
 *		editor.execute( 'fontSize', { value: 'tiny' } );
 *
 * Executing `fontSize` command without value will remove `fontSize` attribute from the current selection.
 *
 * @member {Array.<String|Number|module:font/fontsize/fontsizeediting~FontSizeOption>}
 *  module:font/fontsize/fontsizeediting~FontSizeConfig#options
 */
