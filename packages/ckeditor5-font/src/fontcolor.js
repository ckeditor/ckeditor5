/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontColorEditing from './fontcolor/fontcolorediting';
import FontColorUI from './fontcolor/fontcolorui';

/**
 * The font color plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontcolor/fontcolorediting~FontColorEditing} and
 * {@link module:font/fontcolor/fontcolorui~FontColorUI} features in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontColor extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontColorEditing, FontColorUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontColor';
	}
}

/**
 * The configuration of the font color feature.
 * It is introduced by the {@link module:font/fontcolor/fontcolorediting~FontColorEditing} feature.
 *
 * Read more in {@link module:font/fontcolor~FontColorConfig}.
 *
 * @member {module:font/fontcolor~FontColorConfig} module:core/editor/editorconfig~EditorConfig#fontColor
 */

/**
 * The configuration of the font color feature.
 * This option is used by the {@link module:font/fontcolor/fontcolorediting~FontColorEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 *				fontColor: ... // Font color feature configuration.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontcolor~FontColorConfig
 */

/**
 * Available font colors defined as an array of strings or objects.
 *
 * The default value registers the following colors:
 *
 *		const fontColorConfig = {
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
 * *Note*: The colors are displayed in the `'fontColor'` dropdown.
 *
 * @member {Array.<String|Object>} module:font/fontcolor~FontColorConfig#colors
 */

/**
 * Represents the number of columns in the dropdown. The default value is:
 *
 *		const fontColorConfig = {
 *			columns: 5
 *		}
 *
 * @member {Number} module:font/fontcolor~FontColorConfig#columns
 */
