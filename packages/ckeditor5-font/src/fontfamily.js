/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontfamily
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontFamilyEditing from './fontfamily/fontfamilyediting';
import FontFamilyUI from './fontfamily/fontfamilyui';

/**
 * The font family plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentatiom
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} and
 * {@link module:font/fontfamily/fontfamilyui~FontFamilyUI} features in the editor.
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
 * The font family option descriptor.
 *
 * @typedef {Object} module:font/fontfamily~FontFamilyOption
 *
 * @property {String} title The user-readable title of the option.
 * @property {String} model The attribute's unique value in the model.
 * @property {module:engine/view/elementdefinition~ElementDefinition} view View element configuration.
 * @property {Array.<module:engine/view/elementdefinition~ElementDefinition>} [upcastAlso] An array with all matched elements that
 * the view-to-model conversion should also accept.
 */

/**
 * The configuration of the font family feature.
 * It is introduced by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
 *
 * Read more in {@link module:font/fontfamily~FontFamilyConfig}.
 *
 * @member {module:font/fontfamily~FontFamilyConfig} module:core/editor/editorconfig~EditorConfig#fontFamily
 */

/**
 * The configuration of the font family feature.
 * This option is used by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				fontFamily: ... // Font family feature configuration.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontfamily~FontFamilyConfig
 */

/**
 * Available font family options defined as an array of strings. The default value is:
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
 * which configures 8 font family options. Each option consists of one or more comma–separated font family names. The first font name is
 * used as the dropdown item description in the UI.
 *
 * **Note:** The family names that consist of spaces should not have quotes (as opposed to the CSS standard). The necessary quotes
 * will be added automatically in the view. For example, the `"Lucida Sans Unicode"` will render as follows:
 *
 * 		<span style="font-family:'Lucida Sans Unicode', 'Lucida Grande', sans-serif">...</span>
 *
 * The "default" option removes the `fontFamily` attribute from the selection. In such case, the text will
 * be rendered in the view using the default font family defined in the styles of the web page.
 *
 * Font family can be applied using the command API. To do that, use the `fontFamily` command and pass the desired family as a `value`.
 * For example, the following code will apply the `fontFamily` attribute with the `'Arial'` `value` to the current selection:
 *
 *		editor.execute( 'fontFamily', { value: 'Arial' } );
 *
 * Executing the `'fontFamily'` command without any value will remove the `fontFamily` attribute from the current selection.
 *
 * @member {Array.<String|module:font/fontfamily~FontFamilyOption>} module:font/fontfamily~FontFamilyConfig#options
 */

/**
 * By default the plugin removes any `font-family` value that does not match to the plugin's configuration. It means if you paste a content
 * with font families that the editor does not understand, the font-family attribute will be removed and the content will be displayed
 * with the font.
 *
 * You can preserve pasted font family values by switching the option:
 *
 *		const fontSizeConfig = {
 *			disableValueMatching: true
 *		};
 *
 * Now, the font families, not specified in the editor's configuration, won't be removed when pasting the content.
 *
 * @member {Boolean} module:font/fontfamily~FontFamilyConfig#disableValueMatching
 */
