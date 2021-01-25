/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontbackgroundcolor
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontBackgroundColorEditing from './fontbackgroundcolor/fontbackgroundcolorediting';
import FontBackgroundColorUI from './fontbackgroundcolor/fontbackgroundcolorui';

/**
 * The font background color plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads
 * the {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing} and
 * {@link module:font/fontbackgroundcolor/fontbackgroundcolorui~FontBackgroundColorUI} features in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontBackgroundColor extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontBackgroundColorEditing, FontBackgroundColorUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontBackgroundColor';
	}
}

/**
 * The configuration of the font background color feature.
 * It is introduced by the {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing} feature.
 *
 * Read more in {@link module:font/fontbackgroundcolor~FontBackgroundColorConfig}.
 *
 * @member {module:font/fontbackgroundcolor~FontBackgroundColorConfig} module:core/editor/editorconfig~EditorConfig#fontBackgroundColor
 */

/**
 * The configuration of the font background color feature.
 * This option is used by the {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 *				fontBackgroundColor: ... // Font background color feature configuration.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontbackgroundcolor~FontBackgroundColorConfig
 */

/**
 * Available font background colors defined as an array of strings or objects.
 *
 * The default value registers the following colors:
 *
 *		const fontBackgroundColorConfig = {
 *			colors: [
 *				{
 *					color: 'hsl(0, 0%, 0%)',
 *					label: 'Black'
 *				},
 *				{
 *					color: 'hsl(0, 0%, 30%)',
 *					label: 'Dim grey'
 *				},
 *				{
 *					color: 'hsl(0, 0%, 60%)',
 *					label: 'Grey'
 *				},
 *				{
 *					color: 'hsl(0, 0%, 90%)',
 *					label: 'Light grey'
 *				},
 *				{
 *					color: 'hsl(0, 0%, 100%)',
 *					label: 'White',
 *					hasBorder: true
 *				},
 *				{
 *					color: 'hsl(0, 75%, 60%)',
 *					label: 'Red'
 *				},
 *				{
 *					color: 'hsl(30, 75%, 60%)',
 *					label: 'Orange'
 *				},
 *				{
 *					color: 'hsl(60, 75%, 60%)',
 *					label: 'Yellow'
 *				},
 *				{
 *					color: 'hsl(90, 75%, 60%)',
 *					label: 'Light green'
 *				},
 *				{
 *					color: 'hsl(120, 75%, 60%)',
 *					label: 'Green'
 *				},
 *				{
 *					color: 'hsl(150, 75%, 60%)',
 *					label: 'Aquamarine'
 *				},
 *				{
 *					color: 'hsl(180, 75%, 60%)',
 *					label: 'Turquoise'
 *				},
 *				{
 *					color: 'hsl(210, 75%, 60%)',
 *					label: 'Light blue'
 *				},
 *				{
 *					color: 'hsl(240, 75%, 60%)',
 *					label: 'Blue'
 *				},
 *				{
 *					color: 'hsl(270, 75%, 60%)',
 *					label: 'Purple'
 *				}
 *			]
 *		};
 *
 * **Note**: The colors are displayed in the `'fontBackgroundColor'` dropdown.
 *
 * @member {Array.<String|Object>} module:font/fontbackgroundcolor~FontBackgroundColorConfig#colors
 */

/**
 * Represents the number of columns in the font background color dropdown.
 *
 * The default value is:
 *
 *		const fontBackgroundColorConfig = {
 *			columns: 5
 *		}
 *
 * @member {Number} module:font/fontbackgroundcolor~FontBackgroundColorConfig#columns
 */

/**
 * Determines the maximum number of available document colors.
 * Setting it to `0` will disable the document colors feature.
 *
 * By default it equals to the {@link module:font/fontbackgroundcolor~FontBackgroundColorConfig#columns} value.
 *
 * Examples:
 *
 * 	// 1) Neither document colors nor columns are defined in the configuration.
 * 	// Document colors will equal 5,
 * 	// because the value will be inherited from columns,
 * 	// which has a predefined value of 5.
 * 	const fontBackgroundColorConfig = {}
 *
 * 	// 2) Document colors will equal 8, because the value will be inherited from columns.
 * 	const fontBackgroundColorConfig = {
 * 		columns: 8
 * 	}
 *
 * 	// 3) Document colors will equal 24, because it has its own value defined.
 * 	const fontBackgroundColorConfig = {
 * 		columns: 8,
 * 		documentColors: 24
 * 	}
 *
 * 	// 4) The document colors feature will be disabled.
 * 	const fontBackgroundColorConfig = {
 * 		columns: 8,
 * 		documentColors: 0
 * 	}
 *
 * @member {Number} module:font/fontbackgroundcolor~FontBackgroundColorConfig#documentColors
 */
