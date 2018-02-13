/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontFamilyEditing from './fontfamily/fontfamilyediting';
import FontFamilyUI from './fontfamily/fontfamilyui';

/**
 * The Font family plugin.
 *
 * It requires {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} and
 * {@link module:font/fontfamily/fontfamilyui~FontFamilyUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontFamily extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontFamilyEditing, FontFamilyUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontFamily';
	}
}

/**
 * Font family option descriptor. Compatible with {@link module:engine/conversion/definition-based-converters~ConverterDefinition}.
 *
 * @typedef {Object} module:font/fontfamily~FontFamilyOption
 *
 * @property {String} title The user-readable title of the option.
 * @property {String} model Attribute's unique value in the model.
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view View element configuration.
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} [upcastAlso] An array with all matched elements that
 * view to model conversion should also accept.
 */

/**
 * The configuration of the font family feature.
 * Introduced by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
 *
 * Read more in {@link module:font/fontfamily~FontFamilyConfig}.
 *
 * @member {module:font/fontfamily~FontFamilyConfig} module:core/editor/editorconfig~EditorConfig#fontFamily
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
 * @interface module:font/fontfamily~FontFamilyConfig
 */

/**
 * Available font family options defined as an array of strings.
 *
 * The default value is:
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
 * which configures 8 font family options. Each option consist one or more comma–separated font-family names. The first font name is
 * used as a dropdown item description in the UI. The family names that consist of spaces should not have quotes
 * (as opposed to the CSS standard).
 *
 * The necessary quotes will be added automatically in the view. For example, for the "Lucida Sans Unicode" the editor will render:
 *
 * 		<span style="font-family:'Lucida Sans Unicode', 'Lucida Grande', sans-serif">...</span>
 *
 * The "default" option can be used to remove the `font–family` from selection. In such case the text will
 * be represented in view using default `font-family` defined in the styles of the web page.
 *
 * The `fontFamily` command is also available in the {@link module:core/commandcollection~CommandCollection}.
 * For example, the following code will apply the `fontFamily` attribute with the `tiny` value to the current selection:
 *
 *		editor.execute( 'fontFamily', { value: 'tiny' } );
 *
 * Executing `fontFamily` command without any value will remove `fontFamily` attribute from the current selection.
 *
 * @member {Array.<String|module:font/fontfamily~FontFamilyOption>} module:font/fontfamily~FontFamilyConfig#options
 */
