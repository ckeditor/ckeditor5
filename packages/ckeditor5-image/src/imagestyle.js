/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageStyleEditing from './imagestyle/imagestyleediting';
import ImageStyleUI from './imagestyle/imagestyleui';

/**
 * The image style plugin.
 *
 * For a detailed overview of the image styles feature, check the {@glink features/images/images-styles documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:image/imagestyle/imagestyleediting~ImageStyleEditing},
 * * {@link module:image/imagestyle/imagestyleui~ImageStyleUI}
 *
 * It provides a default configuration, which can be extended or overwritten.
 * Read more about the {@link module:image/image~ImageConfig#styles image styles configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageStyleEditing, ImageStyleUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageStyle';
	}
}

/**
 * The configuration for the {@link module:image/imagestyle~ImageStyle} plugin that should be provided
 * while creating the editor instance.
 *
 * A detailed information about the default configuration and customization can be found in
 * {@link module:image/image~ImageConfig#styles `ImageConfig#styles`}.
 *
 * @interface ImageStyleConfig
 */

/**
 * A list of the image style options.
 *
 * @member {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} module:image/imagestyle~ImageStyleConfig#options
 */

/**
 * The {@link module:image/imagestyle `ImageStyle`} plugin requires a list of the
 * {@link module:image/imagestyle~ImageStyleConfig#options image style options} to work properly.
 * The default configuration is provided (listed below) and can be customized while creating the editor instance.
 *
 * # **Command**
 *
 * The {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand `imageStyleCommand`}
 * is configured based on the defined options,
 * so you can change the style of the selected image by executing the following command:
 *
 *		editor.execute( 'imageStyle' { value: 'alignLeft' } );
 *
 * # **Buttons**
 *
 * All of the image style options provided in the configuration are registered
 * in the {@link module:ui/componentfactory~ComponentFactory UI components factory} with the "imageStyle:" prefixes and can be used
 * in the {@link module:image/image~ImageConfig#toolbar image toolbar configuration}. The buttons available by default depending
 * on the loaded plugins are listed in the next section.
 *
 * Read more about styling images in the {@glink features/images/images-styles Image styles guide}.
 *
 * # **Default options and buttons**
 *
 * If the custom configuration is not provided, the default configuration will be used depending on the loaded
 * image editing plugins.
 *
 * * If both {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} and
 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugins are loaded
 * (which is usually the default editor configuration), the following options will be available for the toolbar
 * configuration. These options will be registered as the buttons with the "imageStyle:" prefixes.
 *
 *		const imageDefaultConfig = {
 *			styles: {
 *				options: [
 *					'inline', 'alignLeft', 'alignRight',
 *					'alignCenter', 'alignBlockLeft', 'alignBlockRight',
 *					'block', 'side'
 *				]
 *			}
 *		};
 *
 * * If only the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin is loaded,
 * the following buttons (options) and groups will be available for the toolbar configuration.
 * These options will be registered as the buttons with the "imageStyle:" prefixes.
 *
 *		const imageDefaultConfig = {
 *			styles: {
 *				options: [ 'block', 'side' ]
 *			}
 *		};
 *
 * * If only the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin is loaded,
 * the following buttons (options) and groups will available for the toolbar configuration.
 * These options will be registered as the buttons with the "imageStyle:" prefixes.
 *
 *		const imageDefaultConfig = {
 *			styles: {
 *				options: [ 'inline', 'alignLeft', 'alignRight' ]
 *			}
 *		};
 *
 * Read more about the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options}.
 *
 * # **Custom configuration**
 *
 * The image styles configuration can be customized in several ways:
 *
 * * Any of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options}
 * can be loaded by the reference to its name as follows:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					styles: {
 *						options: [ 'alignLeft', 'alignRight' ]
 *					}
 *				}
 *			} );
 *
 * * Each of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default image style options} can be customized,
 * e.g. to change the `icon`, `title` or CSS `className` of the style. The feature also provides several
 * {@link module:image/imagestyle/utils~DEFAULT_ICONS default icons} to choose from.
 *
 *		import customIcon from 'custom-icon.svg';
 *
 *		// ...
 *
 *		ClassicEditor.create( editorElement, { image:
 *			styles: {
 *				options: {
 *					// This will only customize the icon of the "block" style.
 *					// Note: 'right' is one of default icons provided by the feature.
 *					{
 *						name: 'block',
 *						icon: 'right'
 *					},
 *
 *					// This will customize the icon, title and CSS class of the default "side" style.
 *					{
 *						name: 'side',
 *						icon: customIcon,
 *						title: 'My side style',
 *						className: 'custom-side-image'
 *					}
 *				}
 *			}
 *		} );
 *
 * * If none of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default image style options}
 * works for the integration, it is possible to define independent custom styles, too.
 *
 * See the documentation about the image style {@link module:image/imagestyle~ImageStyleOptionDefinition options}
 * to define the custom image style configuration properly.
 *
 *		import redIcon from 'red-icon.svg';
 *		import blueIcon from 'blue-icon.svg';
 *
 *		// ...
 *
 *		ClassicEditor.create( editorElement, { image:
 *			styles: {
 *				// A list of completely custom styling options.
 *				options: [
 *					{
 *						name: 'regular',
 *						modelElements: [ 'imageBlock', 'imageInline' ],
 *						title: 'Regular image',
 *						icon: 'full',
 *						isDefault: true
 *					}, {
 *						name: 'blue',
 *						modelElements: [ 'imageInline' ],
 *						title: 'Blue image',
 *						icon: blueIcon,
 *						className: 'image-blue'
 *					}, {
 *						name: 'red',
 *						modelElements: [ 'imageBlock' ],
 *						title: 'Red image',
 *						icon: redIcon,
 *						className: 'image-red'
 *					}
 *				]
 *			}
 *		} );
 *
 * @member {module:image/imagestyle~ImageStyleConfig} module:image/image~ImageConfig#styles
 */

/**
 * The image styling option definition descriptor.
 *
 * This definition should be implemented in the `Image` plugin {@link module:image/image~ImageConfig#styles configuration} for:
 *
 * * customizing one of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} by providing the proper name
 * of the default style and the properties that should be overridden,
 * * or defining a completely custom styling option by providing a custom name and implementing the following properties.
 *
 *		import fullSizeIcon from 'path/to/icon.svg';
 *
 *		const imageStyleOptionDefinition = {
 *			name: 'fullSize',
 *			icon: fullSizeIcon,
 *			title: 'Full size image',
 *			className: 'image-full-size',
 *			modelElements: [ 'imageBlock', 'imageInline' ]
 *		}
 *
 * The styling option will be registered as the button under the name `'imageStyle:{name}'` in the
 * {@link module:ui/componentfactory~ComponentFactory UI components factory} (this functionality is provided by the
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI} plugin).
 *
 * @property {String} name The unique name of the styling option. It will be used to:
 *
 * * refer to one of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} or define the custom style,
 * * store the chosen style in the model by setting the `imageStyle` attribute of the model image element,
 * * as a value of the {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute `imageStyle` command},
 * * when registering a button for the style in the following manner: (`'imageStyle:{name}'`).
 *
 * @property {Boolean} [isDefault] When set, the style will be used as the default one for the model elements
 * listed in the `modelElements` property. A default style does not apply any CSS class to the view element.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @property {String} icon One of the following to be used when creating the styles's button:
 *
 * * an SVG icon source (as an XML string),
 * * one of the keys in {@link module:image/imagestyle/utils~DEFAULT_ICONS} to use one of default icons provided by the plugin.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @property {String} title The styles's title. Setting `title` to one of
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI#localizedDefaultStylesTitles}
 * will automatically translate it to the language of the editor.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @property {String} [className] The CSS class used to represent the style in the view.
 * It should be used only for the non-default styles.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @property {Array.<String>} modelElements The list of the names of the model elements that are supported by the style.
 * The possible values are:
 * * `[ 'imageBlock' ]` if the style can be applied to the image type introduced by the
 * {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin,
 * * `[ 'imageInline' ]` if the style can be applied to the image type introduced by the
 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin,
 * * `[ 'imageInline', 'imageBlock' ]` if the style can be applied to both image types introduced by the plugins mentioned above.
 *
 * This property determines which model element names work with the style. If the model element name of the currently selected
 * image is different, upon executing the
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute `imageStyle`} command the image type (model element name)
 * will automatically change.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @typedef {Object} module:image/imagestyle~ImageStyleOptionDefinition
 */
