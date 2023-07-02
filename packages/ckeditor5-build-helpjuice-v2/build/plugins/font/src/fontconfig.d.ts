/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/fontconfig
 */
import type { ColorOption, ColorPickerConfig } from 'ckeditor5/src/ui';
import type { MatcherPattern, ViewElementDefinition } from 'ckeditor5/src/engine';
/**
 * The configuration of the font color and font background color features.
 * This option is used by the {@link module:font/fontcolor/fontcolorediting~FontColorEditing} and
 * {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing} features.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 		fontColor: ... // Font color feature configuration.
 * 		fontBackgroundColor: ... // Font background color feature configuration.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface FontColorConfig {
    /**
     * Available font colors defined as an array of strings or objects.
     *
     * The default value registers the following colors:
     *
     * ```ts
     * const fontColorConfig = {
     * 	colors: [
     * 		{
     * 			color: 'hsl(0, 0%, 0%)',
     * 			label: 'Black'
     * 		},
     * 		{
     * 			color: 'hsl(0, 0%, 30%)',
     * 			label: 'Dim grey'
     * 		},
     * 		{
     * 			color: 'hsl(0, 0%, 60%)',
     * 			label: 'Grey'
     * 		},
     * 		{
     * 			color: 'hsl(0, 0%, 90%)',
     * 			label: 'Light grey'
     * 		},
     * 		{
     * 			color: 'hsl(0, 0%, 100%)',
     * 			label: 'White',
     * 			hasBorder: true
     * 		},
     * 		{
     * 			color: 'hsl(0, 75%, 60%)',
     * 			label: 'Red'
     * 		},
     * 		{
     * 			color: 'hsl(30, 75%, 60%)',
     * 			label: 'Orange'
     * 		},
     * 		{
     * 			color: 'hsl(60, 75%, 60%)',
     * 			label: 'Yellow'
     * 		},
     * 		{
     * 			color: 'hsl(90, 75%, 60%)',
     * 			label: 'Light green'
     * 		},
     * 		{
     * 			color: 'hsl(120, 75%, 60%)',
     * 			label: 'Green'
     * 		},
     * 		{
     * 			color: 'hsl(150, 75%, 60%)',
     * 			label: 'Aquamarine'
     * 		},
     * 		{
     * 			color: 'hsl(180, 75%, 60%)',
     * 			label: 'Turquoise'
     * 		},
     * 		{
     * 			color: 'hsl(210, 75%, 60%)',
     * 			label: 'Light blue'
     * 		},
     * 		{
     * 			color: 'hsl(240, 75%, 60%)',
     * 			label: 'Blue'
     * 		},
     * 		{
     * 			color: 'hsl(270, 75%, 60%)',
     * 			label: 'Purple'
     * 		}
     * 	]
     * };
     * ```
     *
     * **Note**: The colors are displayed in the `'fontColor'` dropdown.
     */
    colors?: Array<string | ColorOption>;
    /**
     * Determines the maximum number of available document colors.
     * Setting it to `0` will disable the document colors feature.
     *
     * By default it equals to the {@link module:font/fontconfig~FontColorConfig#columns} value.
     *
     * Examples:
     *
     * ```ts
     * // 1) Neither document colors nor columns are defined in the configuration.
     * // Document colors will equal 5,
     * // because the value will be inherited from columns,
     * // which has a predefined value of 5.
     * const fontColorConfig = {}
     *
     * // 2) Document colors will equal 8, because the value will be inherited from columns.
     * const fontColorConfig = {
     * 	columns: 8
     * }
     *
     * // 3) Document colors will equal 24, because it has its own value defined.
     * const fontColorConfig = {
     * 	columns: 8,
     * 	documentColors: 24
     * }
     *
     * // 4) The document colors feature will be disabled.
     * const fontColorConfig = {
     * 	columns: 8,
     * 	documentColors: 0
     * }
     * ```
     */
    documentColors?: number;
    /**
     * Represents the number of columns in the font color dropdown.
     *
     * The default value is:
     *
     * ```ts
     * const fontColorConfig = {
     * 	columns: 5
     * }
     * ```
     */
    columns?: number;
    /**
     * Configuration of the color picker feature.
     *
     * If set to `false` the picker will not appear.
     */
    colorPicker?: false | ColorPickerConfig;
}
/**
 * The configuration of the font family feature.
 * This option is used by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 		fontFamily: ... // Font family feature configuration.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface FontFamilyConfig {
    /**
     * Available font family options defined as an array of strings. The default value is:
     *
     * ```ts
     * const fontFamilyConfig = {
     * 	options: [
     * 		'default',
     * 		'Arial, Helvetica, sans-serif',
     * 		'Courier New, Courier, monospace',
     * 		'Georgia, serif',
     * 		'Lucida Sans Unicode, Lucida Grande, sans-serif',
     * 		'Tahoma, Geneva, sans-serif',
     * 		'Times New Roman, Times, serif',
     * 		'Trebuchet MS, Helvetica, sans-serif',
     * 		'Verdana, Geneva, sans-serif'
     * 	]
     * };
     * ```
     *
     * which configures 8 font family options. Each option consists of one or more comma–separated font family names. The first font name is
     * used as the dropdown item description in the UI.
     *
     * **Note:** The family names that consist of spaces should not have quotes (as opposed to the CSS standard). The necessary quotes
     * will be added automatically in the view. For example, the `"Lucida Sans Unicode"` will render as follows:
     *
     * ```html
     * <span style="font-family:'Lucida Sans Unicode', 'Lucida Grande', sans-serif">...</span>
     * ```
     *
     * The "default" option removes the `fontFamily` attribute from the selection. In such case, the text will
     * be rendered in the view using the default font family defined in the styles of the web page.
     *
     * Font family can be applied using the command API. To do that, use the `fontFamily` command and pass the desired family as a `value`.
     * For example, the following code will apply the `fontFamily` attribute with the `'Arial'` `value` to the current selection:
     *
     * ```ts
     * editor.execute( 'fontFamily', { value: 'Arial' } );
     * ```
     *
     * Executing the `'fontFamily'` command without any value will remove the `fontFamily` attribute from the current selection.
     */
    options?: Array<string | FontFamilyOption>;
    /**
     * By default the plugin removes any `font-family` value that does not match the plugin's configuration.
     * It means that if you paste content with font families that the editor does not understand, the `font-family` attribute
     * will be removed and the content will be displayed with the default font.
     *
     * You can preserve pasted font family values by switching the `supportAllValues` option to `true`:
     *
     * ```ts
     * const fontFamilyConfig = {
     * 	supportAllValues: true
     * };
     * ```
     *
     * With this configuration font families not specified in the editor configuration will not be removed when pasting the content.
     */
    supportAllValues?: boolean;
}
/**
 * The font family option descriptor.
 */
export interface FontFamilyOption {
    /**
     * The user-readable title of the option.
     */
    title: string;
    /**
     * The attribute's unique value in the model.
     */
    model?: string;
    /**
     * View element configuration.
     */
    view?: ViewElementDefinition;
    /**
     * An array with all matched elements that the view-to-model conversion should also accept.
     */
    upcastAlso?: Array<MatcherPattern>;
}
/**
 * The configuration of the font size feature.
 * This option is used by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 		fontSize: ... // Font size feature configuration.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface FontSizeConfig {
    /**
     * Available font size options. Expressed as predefined presets, numerical "pixel" values
     * or the {@link module:font/fontconfig~FontSizeOption}.
     *
     * The default value is:
     *
     * ```ts
     * const fontSizeConfig = {
     * 	options: [
     * 		'tiny',
     * 		'small',
     * 		'default',
     * 		'big',
     * 		'huge'
     * 	]
     * };
     * ```
     *
     * It defines 4 sizes: **tiny**, **small**, **big**, and **huge**. These values will be rendered as `<span>` elements in the view.
     * The **default** defines a text without the `fontSize` attribute.
     *
     * Each `<span>` has the the `class` attribute set to the corresponding size name. For instance, this is what the **small** size looks
     * like in the view:
     *
     * ```html
     * <span class="text-small">...</span>
     * ```
     *
     * As an alternative, the font size might be defined using numerical values (either as a `Number` or as a `String`):
     *
     * ```ts
     * const fontSizeConfig = {
     * 	options: [ 9, 10, 11, 12, 13, 14, 15 ]
     * };
     * ```
     *
     * Also, you can define a label in the dropdown for numerical values:
     *
     * ```ts
     * const fontSizeConfig = {
     * 	options: [
     * 		{
     * 			title: 'Small',
     * 			model: '8px'
     * 		},
     * 		'default',
     * 		{
     * 		 	title: 'Big',
     * 		 	model: '14px'
     * 		}
     * 	]
     * };
     * ```
     *
     * Font size can be applied using the command API. To do that, use the `'fontSize'` command and pass the desired font size as a `value`.
     * For example, the following code will apply the `fontSize` attribute with the **tiny** value to the current selection:
     *
     * ```ts
     * editor.execute( 'fontSize', { value: 'tiny' } );
     * ```
     *
     * Executing the `fontSize` command without value will remove the `fontSize` attribute from the current selection.
     */
    options?: Array<string | number | FontSizeOption>;
    /**
     * By default the plugin removes any `font-size` value that does not match the plugin's configuration.
     * It means that if you paste content with font sizes that the editor does not understand, the `font-size` attribute
     * will be removed and the content will be displayed with the default size.
     *
     * You can preserve pasted font size values by switching the `supportAllValues` option to `true`:
     *
     * ```ts
     * const fontSizeConfig = {
     * 	options: [ 9, 10, 11, 12, 'default', 14, 15 ],
     * 	supportAllValues: true
     * };
     * ```
     *
     * **Note:** This option can only be used with numerical values as font size options.
     *
     * With this configuration font sizes not specified in the editor configuration will not be removed when pasting the content.
     */
    supportAllValues?: boolean;
}
/**
 * The font size option descriptor.
 */
export interface FontSizeOption {
    /**
     * The user-readable title of the option.
     */
    title: string;
    /**
     * The attribute's unique value in the model.
     */
    model?: string;
    /**
     * View element configuration.
     */
    view?: ViewElementDefinition;
    /**
     * An array with all matched elements that the view-to-model conversion should also accept.
     */
    upcastAlso?: Array<MatcherPattern>;
}
