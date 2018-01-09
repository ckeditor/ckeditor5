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
 * Font family option. Compatible with {@link module:engine/conversion/definition-based-converters~ConverterDefinition}.
 *
 * @typedef {Object} module:font/fontfamily/fontfamilyediting~FontFamilyOption
 *
 * @property {String} model The `fontFamily` attribute value in the model.
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view The view representation for that option.
 * @property {String} title The user-readable title of the option.
 * @property {String} [uiStyle] The style which will be added to the dropdown item representing this option.
 * Defaults to `view.style[ 'font-family' ]`.
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} acceptAlso An array with all matched elements that
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
 * which configures 8 font family options and a default option that will remove font family to text default setting (defaulting to content
 * CSS styles).
 *
 * TODO: what 'default' does.
 * TODO: how those string are translated to configuration
 *
 * @member {Array.<String|module:font/fontfamily/fontfamilyediting~FontFamilyOption>}
 *  module:font/fontfamily/fontfamilyediting~FontFamilyConfig#options
 */
