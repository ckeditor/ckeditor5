/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute
} from '@ckeditor/ckeditor5-engine/src/conversion/definition-based-converters';

import FontFamilyCommand from './fontfamilycommand';
import { normalizeOptions } from './utils';

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

		// Define default configuration using font families shortcuts.
		editor.config.define( 'fontFamily', {
			options: [
				'default',
				'Arial, Helvetica, sans-serif',
				'Courier New, Courier, monospace',
				'Georgia, serif',
				'Lucida Sans Unicode, Lucida Grande, sans-serif',
				'Tahoma, Geneva, sans-serif',
				'Times New Roman, Times, serif',
				'Trebuchet MS, Helvetica, sans-serif',
				'Verdana, Geneva, sans-serif'
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow fontFamily attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'fontFamily' } );

		// Get configured font family options without "default" option.
		const options = normalizeOptions( editor.config.get( 'fontFamily.options' ) ).filter( item => item.model );

		// Define view to model conversion.
		for ( const option of options ) {
			viewToModelAttribute( 'fontFamily', option, [ data.viewToModel ] );
		}

		// Define model to view conversion.
		modelAttributeToViewAttributeElement( 'fontFamily', options, [ data.modelToView, editing.modelToView ] );

		editor.commands.add( 'fontFamily', new FontFamilyCommand( editor ) );
	}
}

/**
 * Font family option descriptor. Compatible with {@link module:engine/conversion/definition-based-converters~ConverterDefinition}.
 *
 * @typedef {Object} module:font/fontfamily/fontfamilyediting~FontFamilyOption
 *
 * @property {String} title The user-readable title of the option.
 * @property {String} model Attribute's unique value in the model.
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view View element configuration.
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} [acceptsAlso] An array with all matched elements that
 * view to model conversion should also accept.
 */

/**
 * The configuration of the font family feature.
 * Introduced by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
 *
 * Read more in {@link module:font/fontfamily/fontfamilyediting~FontFamilyConfig}.
 *
 * @member {module:font/fontfamily/fontfamilyediting~FontFamilyConfig} module:core/editor/editorconfig~EditorConfig#fontFamily
 */

/**
 * The configuration of the font family feature.
 * The option is used by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				fontFamily: ... // Font family feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontfamily/fontfamilyediting~FontFamilyConfig
 */

/**
 * Available font family options. Defined either as array of strings.
 *
 * The default value is
 *
 *		const fontFamilyConfig = {
 *			options: [
 *				'default',
 *				'Arial, Helvetica, sans-serif',
 *				'Courier New, Courier, monospace',
 *				'Georgia, serif',
 *				'Lucida Sans Unicode, Lucida Grande, sans-serif',
 *				'Tahoma, Geneva, sans-serif',
 *				'Times New Roman, Times, serif',
 *				'Trebuchet MS, Helvetica, sans-serif',
 *				'Verdana, Geneva, sans-serif'
 *			]
 *		};
 *
 * which configures 8 font family options. Each option consist one or more font-family names separated with coma. The first font name is
 * used as dropdown item description in UI. The family names that consist spaces should not have quotes (as opposed to CSS standard).
 * Appropriate quotes will be added in the view. For example, for the "Lucida Sans Unicode" the editor will render:
 *
 * 		<span style="font-family:'Lucida Sans Unicode', 'Lucida Grande', sans-serif">...</span>
 *
 * The "default" option is used to remove fontFamily from selection. In such case the text will
 * be represented in view using default content CSS font-family.

 * To use defined font families from {@link module:core/commandcollection~CommandCollection} use `fontFamily` command and pass desired
 * font family as a value.
 * For example, the below code will apply `fontFamily` attribute with `tiny` value to the current selection:
 *
 *		editor.execute( 'fontFamily', { value: 'tiny' } );
 *
 * Executing `fontFamily` command without value will remove `fontFamily` attribute from the current selection.
 *
 * @member {Array.<String|module:font/fontfamily/fontfamilyediting~FontFamilyOption>}
 *  module:font/fontfamily/fontfamilyediting~FontFamilyConfig#options
 */
