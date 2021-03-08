/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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
 * For a detailed overview, check the {@glink features/image#image-styles image styles} documentation.
 *
 * This is a "glue" plugin which loads the {@link module:image/imagestyle/imagestyleediting~ImageStyleEditing}
 * and {@link module:image/imagestyle/imagestyleui~ImageStyleUI} plugins.
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
 * A list of the image style arrangements.
 *
 * @member {Array.<module:image/imagestyle~ImageStyleArrangementDefinition>} module:image/imagestyle~ImageStyleConfig#arrangements
 */

/**
 * A list of the image style groups.
 *
 * @member {Array.<module:image/imagestyle~ImageStyleGroupDefinition>} module:image/imagestyle~ImageStyleConfig#groups
 */

/**
 * The {@link module:image/imagestyle `ImageStyle`} plugin requires a list of the image
 * {@link module:image/imagestyle~ImageStyleConfig#arrangements} and {@link module:image/imagestyle~ImageStyleConfig#groups}
 * to work properly. It provides the default configuration (listed below), which can be customized while creating the editor instance.
 *
 * The feature creates the {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand `imageStyle`}
 * command based on defined {@link module:image/imagestyle~ImageStyleConfig#arrangements}, so you can change the arrangement of a
 * selected image by executing the following command:
 *
 *		editor.execute( 'imageStyle' { value: 'alignLeft' } );
 *
 * The feature also creates buttons that execute the command with different values. Assuming that you use the
 * default image arrangements setting, you can {@link module:image/image~ImageConfig#toolbar configure the image toolbar}
 * (or any other toolbar) to contain these options:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					toolbar: [ 'imageStyle:alignLeft', 'imageStyle:alignRight' ]
 *				}
 *			} );
 *
 * The feature also creates drop-downs that contains a set of buttons defined in the
 * {@link module:image/imagestyle~ImageStyleGroupDefinition#items `items`} property.
 * The drop-downs can be added to a toolbar the same way as the buttons.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					toolbar: [ 'imageStyle:wrapText', 'imageStyle:breakText' ]
 *				}
 *			} );
 *
 * Each of the drop-downs added to the toolbar will be displayed as the split button. The arrangement applied on click will correspond to
 * the one specified in the {@link module:image/imagestyle~ImageStyleGroupDefinition#defaultItem `defaultItem`} property.
 *
 * Read more about styling images in the {@glink features/image#image-styles Image styles guide}.
 *
 * # **Default configuration**
 *
 * If the custom configuration is not provided, the default configuration will be used depending on the loaded
 * image editing plugins.
 *
 * * If both {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} and
 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugins are loaded
 * (which is usually the default editor configuration), the following arrangements and groups will be available for the toolbar
 * configuration:
 *
 *		const imageDefaultConfig = {
 *			styles: {
 *				arrangements: [
 *					'inline', 'alignLeft', 'alignRight',
 *					'alignCenter', 'alignBlockLeft', 'alignBlockRight'
 *				],
 *				groups: [ 'wrapText', 'breakText' ]
 *			}
 *		};
 *
 * * If only the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin is loaded,
 * the following arrangements and groups will be available for the toolbar configuration:
 *
 *		const imageDefaultConfig = {
 *			styles: {
 *				arrangements: [ 'full', 'side' ],
 *				groups: []
 *			}
 *		};
 *
 * * If only the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin is loaded,
 * the following arrangements and groups will available for the toolbar configuration:
 *
 *		const imageDefaultConfig = {
 *			styles: {
 *				arrangements: [ 'inline', 'alignLeft', 'alignRight' ],
 *				groups: []
 *			}
 *		};
 *
 * # **Custom configuration**
 *
 * The image styles configuration can be customized in several ways:
 *
 * * Any of the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangements} or
 * {@link module:image/imagestyle/utils~DEFAULT_GROUPS default groups} can be loaded by the reference to its name
 * as follows:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					styles: {
 *						arrangements: [ 'alignLeft', 'alignRight' ]
 *						groups: [ 'wrapText' ]
 *					}
 *				}
 *			} );
 *
 * **Note**: Custom arrangements will override the arrangements array only, the groups will stay as in the default configuration.
 * The same goes for applying the custom groups.
 *
 * **Note**: Every {@link module:image/imagestyle~ImageStyleGroupDefinition#items item} in the referenced groups
 * must be listed in the provided arrangements.
 *
 * * Each of the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangements} can be customized,
 * e.g. to change the `icon`, `title` or CSS `className` of the arrangement. The feature also provides several
 * {@link module:image/imagestyle/utils~DEFAULT_ICONS default icons} to choose from.
 *
 *		import customIcon from 'custom-icon.svg';
 *
 *		// ...
 *
 *		ClassicEditor.create( editorElement, { image:
 *			styles: {
 *				arrangements: {
 *					// This will only customize the icon of the "full" style.
 *					// Note: 'right' is one of default icons provided by the feature.
 *					{
 *						name: 'full',
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
 * * Each of the {@link module:image/imagestyle/utils~DEFAULT_GROUPS default groups} can be customized,
 * e.g. to change the `defaultItem`, `title` or the `items` list.
 *
 *		ClassicEditor.create( editorElement, { image:
 *			styles: {
 *				// The 'full' and 'side' arrangements are used in the 'breakText' group,
 *				// so they must be defined as the arrangements.
 *				arrangements: [ 'full', 'side' ],
 *				groups: {
 *					// This will only customize the default item.
 *					// Note: 'alignRight' is one of items defined in the default group.
 *					{
 *						name: 'wrapText',
 *						defaultItem: 'alignRight'
 *					},
 *
 *					// This will customize the title
 *					// and the items list of the default group.
 *					{
 *						name: 'breakText',
 *						title: 'My break text title',
 *						items: [ 'full', 'side' ]
 *					}
 *				}
 *			}
 *		} );
 *
 * * If none of the {@link module:image/imagestyle/utils~DEFAULT_GROUPS default groups} or
 * {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangements} works for the integration,
 * it is possible to define independent custom styles, too.
 *
 * See the documentation about the image
 *
 * * {@link module:image/imagestyle~ImageStyleArrangementDefinition arrangements} and
 * * {@link module:image/imagestyle~ImageStyleGroupDefinition groups}
 *
 * to define the custom image style configuration properly.
 *
 *		import redIcon from 'red-icon.svg';
 *		import blueIcon from 'blue-icon.svg';
 *
 *		// ...
 *
 *		ClassicEditor.create( editorElement, { image:
 *			styles: {
 *				// A list of completely custom arrangements.
 *				arrangements: [
 *					{
 *						name: 'regular',
 *						modelElements: [ 'image', 'imageInline' ],
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
 *						modelElements: [ 'image' ],
 *						title: 'Red image',
 *						icon: redIcon,
 *						className: 'image-red'
 *					}
 *				],
 *				// A list of completely custom groups.
 *				groups: [
 *					{
 *						name: 'Colorful',
 *						title: 'Colorful images',
 *						defaultItem: 'blue',
 *						items: [ 'blue', 'red' ]
 *					}
 *				]
 *			}
 *		} );
 *
 * @member {module:image/imagestyle~ImageStyleConfig} module:image/image~ImageConfig#styles
 */

/**
 * The image arrangement definition descriptor.
 *
 * This definition should be implemented in the `Image` plugin {@link module:image/image~ImageConfig#styles configuration} for:
 *
 * * customizing one of the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangements} by providing the proper name
 * of the default arrangement and the properties that should be overridden,
 * * or defining a completely custom arrangement by providing a custom name and implementing the following properties.
 *
 *		import fullSizeIcon from 'path/to/icon.svg';
 *
 *		const imageStyleArrangementDefinition = {
 *			name: 'fullSize',
 *			icon: fullSizeIcon,
 *			title: 'Full size image',
 *			className: 'image-full-size',
 *			modelElements: [ 'image', 'imageInline' ]
 *		}
 *
 * The arrangement will be registered as the button under the name `'imageStyle:{name}'` in the
 * {@link module:ui/componentfactory~ComponentFactory UI components factory} (this functionality is provided by the
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI} plugin).
 *
 * @property {String} name The unique name of the arrangement. It will be used to:
 *
 * * refer to one of the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangements} or define the custom arrangement,
 * * store the chosen arrangement in the model by setting the `imageStyle` attribute of the model image element,
 * * as a value of the {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute `imageStyle` command},
 * * when registering a button for the arrangement (`'imageStyle:{name}'`).
 *
 * @property {Boolean} [isDefault] When set, the arrangement will be used as the default one for the model elements
 * listed in the `modelElements` property. A default arrangement does not apply any CSS class to the view element.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangement} addressed in the name property.
 *
 * @property {String} icon One of the following to be used when creating the arrangement's button:
 *
 * * an SVG icon source (as an XML string),
 * * one of the keys in {@link module:image/imagestyle/utils~DEFAULT_ICONS} to use one of default icons provided by the plugin.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangement} addressed in the name property.
 *
 * @property {String} title The arrangement's title. Setting `title` to one of
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI#localizedDefaultStylesTitles}
 * will automatically translate it to the language of the editor.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangement} addressed in the name property.
 *
 * @property {String} [className] The CSS class used to represent the arrangement in the view.
 * It should be used only for the non-default arrangements.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangement} addressed in the name property.
 *
 * @property {Array.<String>} modelElements The list of the names of the model elements that are supported by the arrangement.
 * The possible values are:
 * * `[ 'image' ]` if the arrangement can be applied to the image type introduced by the
 * {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin,
 * * `[ 'imageInline' ]` if the arrangement can be applied to the image type introduced by the
 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin,
 * * `[ 'imageInline', 'image' ]` if the arrangement can be applied to both image types introduced by the plugins mentioned above.
 *
 * This property determines which model element names work with the arrangement. If the model element name of the currently selected
 * image is different, upon executing the
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute `imageStyle`} command the image type (model element name)
 * will automatically change.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangement} addressed in the name property.
 *
 * @typedef {Object} module:image/imagestyle~ImageStyleArrangementDefinition
 */

/**
 * The image group definition descriptor.
 *
 * This definition should be implemented in the `Image` plugin {@link module:image/image~ImageConfig#styles configuration} for:
 * * customizing one of the {@link module:image/imagestyle/utils~DEFAULT_GROUPS default groups} by providing the proper name
 * of the default group and the properties to be overridden,
 * * or defining a completely custom group by providing a custom name and implementing all of the following properties.
 *
 *		const imageStyleGroupDefinition = {
 *			name: 'wrapText',
 *			title: 'Wrap text',
 *			items: [ 'alignLeft', 'alignRight' ],
 *			defaultItem: 'alignLeft'
 *		}
 *
 * The group will be registered
 * as the {@link module:ui/dropdown/dropdownview~DropdownView dropdown}
 * with the {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView split button} under the name `'imageStyle:{name}'` in the
 * {@link module:ui/componentfactory~ComponentFactory UI components factory} (this functionality is provided by the
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI} plugin).
 *
 * @property {String} name The unique name of the group. It can refer to one of the
 * {@link module:image/imagestyle/utils~DEFAULT_GROUPS default groups} or be completely custom to define a new group.
 * It will be used for registering the drop-down  under the name `'imageStyle:{name}'`.
 *
 * @property {String} [title] The group's title. Setting `title` to one of
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI#localizedDefaultStylesTitles}
 * will automatically translate it to the language of the editor.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_GROUPS default group} addressed in the name property.
 *
 * @property {Array.<String>} [items] The list of the names of the buttons that will be placed in the dropdown toolbar.
 * Each of the buttons has to be defined
 * as the {@link module:image/imagestyle~ImageStyleArrangementDefinition image arrangement} to be registered in the
 * {@link module:ui/componentfactory~ComponentFactory UI components factory}.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_GROUPS default group} addressed in the name property.
 *
 * @property {String} [defaultItem] The name of one of the arrangements from the items list,
 * which will be used as a default button for the drop-down's split button.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:image/imagestyle/utils~DEFAULT_GROUPS default group} addressed in the name property.
 *
 * @typedef {Object} module:image/imagestyle~ImageStyleGroupDefinition
 */
