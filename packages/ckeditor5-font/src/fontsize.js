/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontSizeEditing from './fontsize/fontsizeediting';
import FontSizeUI from './fontsize/fontsizeui';

/**
 * The Font size plugin.
 *
 * It requires {@link module:font/fontsize/fontsizeediting~FontSizeEditing} and
 * {@link module:font/fontsize/fontsizeui~FontSizeUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontSize extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontSizeEditing, FontSizeUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontSize';
	}
}

/**
 * Font size option descriptor. Compatible with {@link module:engine/conversion/definition-based-converters~ConverterDefinition}.
 *
 * @typedef {Object} module:font/fontsize~FontSizeOption
 *
 * @property {String} title The user-readable title of the option.
 * @property {String} model Attribute's unique value in the model.
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view View element configuration.
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} [upcastAlso] An array with all matched elements that
 * view to model conversion should also accept.
 */

/**
 * The configuration of the font size feature.
 * Introduced by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
 *
 * Read more in {@link module:font/fontsize~FontSizeConfig}.
 *
 * @member {module:font/fontsize~FontSizeConfig} module:core/editor/editorconfig~EditorConfig#fontSize
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
 * @interface module:font/fontsize~FontSizeConfig
 */

/**
 * Available font size options. Defined either using predefined presets, numeric pixel values
 * or {@link module:font/fontsize~FontSizeOption}.
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
 * @member {Array.<String|Number|module:font/fontsize~FontSizeOption>} module:font/fontsize~FontSizeConfig#options
 */
