/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageconfig
 */

/**
 * The configuration of the image features. Used by the image features in the `@ckeditor/ckeditor5-image` package.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 			image: ... // Image feature options.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface ImageConfig {

	/**
	 * The image insert configuration.
	 */
	insert?: ImageInsertConfig;

	/**
	 * The image resize options.
	 *
	 * Each option should have at least these two properties:
	 *
	 * * name: The name of the UI component registered in the global
	 * {@link module:ui/editorui/editorui~EditorUI#componentFactory component factory} of the editor,
	 * representing the button a user can click to change the size of an image,
	 * * value: An actual image width applied when a user clicks the mentioned button
	 * ({@link module:image/imageresize/resizeimagecommand~ResizeImageCommand} gets executed).
	 * The value property is combined with the
	 * {@link module:image/imageconfig~ImageConfig#resizeUnit `config.image.resizeUnit`} (`%` by default).
	 * For instance: `value: '50'` and `resizeUnit: '%'` will render as `'50%'` in the UI.
	 *
	 * **Resetting the image size**
	 *
	 * If you want to set an option that will reset image to its original size, you need to pass a `null` value
	 * to one of the options. The `:original` token is not mandatory, you can call it anything you wish, but it must reflect
	 * in the standalone buttons configuration for the image toolbar.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		image: {
	 * 			resizeUnit: "%",
	 * 			resizeOptions: [ {
	 * 				name: 'resizeImage:original',
	 * 				value: null
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:50',
	 * 				value: '50'
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:75',
	 * 				value: '75'
	 * 			} ]
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * **Resizing images using a dropdown**
	 *
	 * With resize options defined, you can decide whether you want to display them as a dropdown or as standalone buttons.
	 * For the dropdown, you need to pass only the `resizeImage` token to the
	 {@link module:image/imageconfig~ImageConfig#toolbar `config.image.toolbar`}. The dropdown contains all defined options by default:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		image: {
	 * 			resizeUnit: "%",
	 * 			resizeOptions: [ {
	 * 				name: 'resizeImage:original',
	 * 				value: null
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:50',
	 * 				value: '50'
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:75',
	 * 				value: '75'
	 * 			} ],
	 * 			toolbar: [ 'resizeImage', ... ],
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * **Resizing images using individual buttons**
	 *
	 * If you want to have separate buttons for {@link module:image/imageconfig~ImageResizeOption each option},
	 * pass their names to the {@link module:image/imageconfig~ImageConfig#toolbar `config.image.toolbar`} instead. Please keep in mind
	 * that this time **you must define the additional
	 * {@link module:image/imageconfig~ImageResizeOption `icon` property}**:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		image: {
	 * 			resizeUnit: "%",
	 * 			resizeOptions: [ {
	 * 				name: 'resizeImage:original',
	 * 				value: null,
	 * 				icon: 'original'
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:25',
	 * 				value: '25',
	 * 				icon: 'small'
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:50',
	 * 				value: '50',
	 * 				icon: 'medium'
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:75',
	 * 				value: '75',
	 * 				icon: 'large'
	 * 			} ],
	 * 			toolbar: [ 'resizeImage:25', 'resizeImage:50', 'resizeImage:75', 'resizeImage:original', ... ],
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * **Customizing resize button labels**
	 *
	 * You can set your own label for each resize button. To do that, add the `label` property like in the example below.
	 *
	 * * When using the **dropdown**, the labels are displayed on the list of all options when you open the dropdown.
	 * * When using **standalone buttons**, the labels will are displayed as tooltips when a user hovers over the button.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		image: {
	 * 			resizeUnit: "%",
	 * 			resizeOptions: [ {
	 * 				name: 'resizeImage:original',
	 * 				value: null,
	 * 				label: 'Original size'
	 * 				// Note: add the "icon" property if you're configuring a standalone button.
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:50',
	 * 				value: '50',
	 * 				label: 'Medium size'
	 * 				// Note: add the "icon" property if you're configuring a standalone button.
	 * 			},
	 * 			{
	 * 				name: 'resizeImage:75',
	 * 				value: '75',
	 * 				label: 'Large size'
	 * 				// Note: add the "icon" property if you're configuring a standalone button.
	 * 			} ]
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * **Default value**
	 *
	 * The following configuration is used by default:
	 *
	 * ```ts
	 * resizeOptions = [
	 * 	{
	 * 		name: 'resizeImage:original',
	 * 		value: null,
	 * 		icon: 'original'
	 * 	},
	 * 	{
	 * 		name: 'resizeImage:25',
	 * 		value: '25',
	 * 		icon: 'small'
	 * 	},
	 * 	{
	 * 		name: 'resizeImage:50',
	 * 		value: '50',
	 * 		icon: 'medium'
	 * 	},
	 * 	{
	 * 		name: 'resizeImage:75',
	 * 		value: '75',
	 * 		icon: 'large'
	 * 	}
	 * ];
	 * ```
	 */
	resizeOptions?: Array<ImageResizeOption>;

	/**
	 * The available options are `'px'` or `'%'`.
	 *
	 * Determines the size unit applied to the resized image.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		image: {
	 * 			resizeUnit: 'px'
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * This option is used by the {@link module:image/imageresize~ImageResize} feature.
	 *
	 * @default '%'
	 */
	resizeUnit?: 'px' | '%';

	/**
	 * The {@link module:image/imagestyle `ImageStyle`} plugin requires a list of the
	 * {@link module:image/imageconfig~ImageStyleConfig#options image style options} to work properly.
	 * The default configuration is provided (listed below) and can be customized while creating the editor instance.
	 *
	 * # **Command**
	 *
	 * The {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand `imageStyleCommand`}
	 * is configured based on the defined options,
	 * so you can change the style of the selected image by executing the following command:
	 *
	 * ```ts
	 * editor.execute( 'imageStyle' { value: 'alignLeft' } );
	 * ```
	 *
	 * # **Buttons**
	 *
	 * All of the image style options provided in the configuration are registered
	 * in the {@link module:ui/componentfactory~ComponentFactory UI components factory} with the "imageStyle:" prefixes and can be used
	 * in the {@link module:image/imageconfig~ImageConfig#toolbar image toolbar configuration}. The buttons available by default depending
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
	 * ```ts
	 * const imageDefaultConfig = {
	 * 	styles: {
	 * 		options: [
	 * 			'inline', 'alignLeft', 'alignRight',
	 * 			'alignCenter', 'alignBlockLeft', 'alignBlockRight',
	 * 			'block', 'side'
	 * 		]
	 * 	}
	 * };
	 * ```
	 *
	 * * If only the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin is loaded,
	 * the following buttons (options) and groups will be available for the toolbar configuration.
	 * These options will be registered as the buttons with the "imageStyle:" prefixes.
	 *
	 * ```ts
	 * const imageDefaultConfig = {
	 * 	styles: {
	 * 		options: [ 'block', 'side' ]
	 * 	}
	 * };
	 * ```
	 *
	 * * If only the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin is loaded,
	 * the following buttons (options) and groups will available for the toolbar configuration.
	 * These options will be registered as the buttons with the "imageStyle:" prefixes.
	 *
	 * ```ts
	 * const imageDefaultConfig = {
	 * 	styles: {
	 * 		options: [ 'inline', 'alignLeft', 'alignRight' ]
	 * 	}
	 * };
	 * ```
	 *
	 * Read more about the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options}.
	 *
	 * # **Custom configuration**
	 *
	 * The image styles configuration can be customized in several ways:
	 *
	 * * Any of the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options}
	 * can be loaded by the reference to its name as follows:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		image: {
	 * 			styles: {
	 * 				options: [ 'alignLeft', 'alignRight' ]
	 * 			}
	 * 		}
	 * 	} );
	 * ```
	 *
	 * * Each of the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default image style options} can be customized,
	 * e.g. to change the `icon`, `title` or CSS `className` of the style. The feature also provides several
	 * {@link module:image/imagestyle/utils#DEFAULT_ICONS default icons} to choose from.
	 *
	 * ```ts
	 * import customIcon from 'custom-icon.svg';
	 *
	 * // ...
	 *
	 * ClassicEditor.create( editorElement, { image:
	 * 	styles: {
	 * 		options: {
	 * 			// This will only customize the icon of the "block" style.
	 * 			// Note: 'right' is one of default icons provided by the feature.
	 * 			{
	 * 				name: 'block',
	 * 				icon: 'right'
	 * 			},
	 *
	 * 			// This will customize the icon, title and CSS class of the default "side" style.
	 * 			{
	 * 				name: 'side',
	 * 				icon: customIcon,
	 * 				title: 'My side style',
	 * 				className: 'custom-side-image'
	 * 			}
	 * 		}
	 * 	}
	 * } );
	 * ```
	 *
	 * * If none of the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default image style options}
	 * works for the integration, it is possible to define independent custom styles, too.
	 *
	 * See the documentation about the image style {@link module:image/imageconfig~ImageStyleOptionDefinition options}
	 * to define the custom image style configuration properly.
	 *
	 * ```ts
	 * import redIcon from 'red-icon.svg';
	 * import blueIcon from 'blue-icon.svg';
	 *
	 * // ...
	 *
	 * ClassicEditor.create( editorElement, { image:
	 * 	styles: {
	 * 		// A list of completely custom styling options.
	 * 		options: [
	 * 			{
	 * 				name: 'regular',
	 * 				modelElements: [ 'imageBlock', 'imageInline' ],
	 * 				title: 'Regular image',
	 * 				icon: 'full',
	 * 				isDefault: true
	 * 			}, {
	 * 				name: 'blue',
	 * 				modelElements: [ 'imageInline' ],
	 * 				title: 'Blue image',
	 * 				icon: blueIcon,
	 * 				className: 'image-blue'
	 * 			}, {
	 * 				name: 'red',
	 * 				modelElements: [ 'imageBlock' ],
	 * 				title: 'Red image',
	 * 				icon: redIcon,
	 * 				className: 'image-red'
	 * 			}
	 * 		]
	 * 	}
	 * } );
	 * ```
	 */
	styles?: ImageStyleConfig;

	/**
	 * Items to be placed in the image toolbar.
	 * This option is used by the {@link module:image/imagetoolbar~ImageToolbar} feature.
	 *
	 * Assuming that you use the following features:
	 *
	 * * {@link module:image/imagestyle~ImageStyle} (with a default configuration),
	 * * {@link module:image/imagetextalternative~ImageTextAlternative},
	 * * {@link module:image/imagecaption~ImageCaption},
	 *
	 * the following toolbar items will be available in {@link module:ui/componentfactory~ComponentFactory}:
	 * * `'imageTextAlternative'`,
	 * * `'toggleImageCaption'`,
	 * * {@link module:image/imageconfig~ImageConfig#styles buttons provided by the `ImageStyle` plugin},
	 * * {@link module:image/imagestyle/utils#DEFAULT_DROPDOWN_DEFINITIONS drop-downs provided by the `ImageStyle` plugin},
	 *
	 * so you can configure the toolbar like this:
	 *
	 * ```ts
	 * const imageConfig = {
	 * 	toolbar: [
	 * 		'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|',
	 * 		'toggleImageCaption', 'imageTextAlternative'
	 * 	]
	 * };
	 * ```
	 *
	 * Besides that, the `ImageStyle` plugin allows to define a
	 * {@link module:image/imageconfig~ImageStyleDropdownDefinition custom drop-down} while configuring the toolbar.
	 *
	 * The same items can also be used in the {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
	 *
	 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
	 */
	toolbar?: Array<string | ImageStyleDropdownDefinition>;

	/**
	 * The image upload configuration.
	 */
	upload?: ImageUploadConfig;
}

/**
 * The configuration of the image insert dropdown panel view. Used by the image insert feature in the `@ckeditor/ckeditor5-image` package.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 			image: {
 * 				insert: {
 * 				... // settings for "insertImage" view goes here
 * 				}
 * 			}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface ImageInsertConfig {

	/**
	 * The image insert panel view configuration contains a list of {@link module:image/imageinsert~ImageInsert} integrations.
	 *
	 * The option accepts string tokens.
	 * * for predefined integrations, we have 3 special strings: `upload`, `url`, and `assetManager`.
	 * * for custom integrations, each string should be a name of the integration registered by the
	 * {@link module:image/imageinsert/imageinsertui~ImageInsertUI#registerIntegration `ImageInsertUI#registerIntegration()`}.
	 *
	 * ```ts
	 * // Add `upload`, `assetManager` and `url` integrations.
	 * const imageInsertConfig = {
	 * 	insert: {
	 * 		integrations: [
	 * 			'upload',
	 * 			'assetManager',
	 * 			'url'
	 * 		]
	 * 	}
	 * };
	 * ```
	 *
	 * @default [ 'upload', 'assetManager', 'url' ]
	 */
	integrations?: Array<string>;

	/**
	 * This option allows to override the image type used by the {@link module:image/image/insertimagecommand~InsertImageCommand}
	 * when the user inserts new images into the editor content. By default, all images inserted into the editor will be block
	 * if {@link module:image/imageblock~ImageBlock} is loaded. To let the editor decide the image type, choose `'auto'`.
	 *
	 * Available options are:
	 *
	 * * `'block'` – all images inserted into the editor will be block (requires the {@link module:image/imageblock~ImageBlock} plugin),
	 * * `'inline'` – all images inserted into the editor will be inline (requires the {@link module:image/imageinline~ImageInline} plugin),
	 * * `'auto'` – the editor will choose the optimal image type based on the context of the insertion and availability of plugins.
	 *
	 * @default 'block'
	 */
	type?: 'inline' | 'block' | 'auto';
}

/**
 * The image resize option used in the {@link module:image/imageconfig~ImageConfig#resizeOptions image resize configuration}.
 */
export interface ImageResizeOption {

	/**
	 * The name of the UI component that changes the image size.
	 * * If you configure the feature using individual resize buttons, you can refer to this name in the
	 * {@link module:image/imageconfig~ImageConfig#toolbar image toolbar configuration}.
	 * * If you configure the feature using the resize dropdown, this name will be used for a list item in the dropdown.
	 */
	name: string;

	/**
	 *
	 * The value of the resize option without the unit
	 * ({@link module:image/imageconfig~ImageConfig#resizeUnit configured separately}). `null` resets an image to its original size.
	 */
	value: string | null;

	/**
	 * An icon used by an individual resize button (see the `name` property to learn more).
	 * Available icons are: `'small'`, `'medium'`, `'large'`, `'original'`.
	 */
	icon?: string;

	/**
	 * An option label displayed in the dropdown or, if the feature is configured using
	 * individual buttons, a {@link module:ui/button/buttonview~ButtonView#tooltip} and an ARIA attribute of a button.
	 * If not specified, the label is generated automatically based on the `value` option and the
	 * {@link module:image/imageconfig~ImageConfig#resizeUnit `config.image.resizeUnit`}.
	 */
	label?: string;
}

/**
 * # **The image style custom drop-down definition descriptor**
 *
 * This definition can be implemented in the {@link module:image/imageconfig~ImageConfig#toolbar image toolbar configuration}
 * to define a completely custom drop-down in the image toolbar.
 *
 * ```ts
 * ClassicEditor.create( editorElement, {
 * 	image: { toolbar: [
 * 			// One of the predefined drop-downs
 * 			'imageStyle:wrapText',
 * 		// Custom drop-down
 * 		{
 * 			name: 'imageStyle:customDropdown',
 * 			title: Custom drop-down title,
 * 			items: [ 'imageStyle:alignLeft', 'imageStyle:alignRight' ],
 * 			defaultItem: 'imageStyle:alignLeft'
 * 		}
 * 	] }
 * } );
 * ```
 *
 * **Note:** At the moment it is possible to populate the custom drop-down with only the buttons registered by the `ImageStyle` plugin.
 *
 * The defined drop-down will be registered
 * as the {@link module:ui/dropdown/dropdownview~DropdownView}
 * with the {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} under the provided name in the
 * {@link module:ui/componentfactory~ComponentFactory}
 */
export interface ImageStyleDropdownDefinition {

	/**
	 * The unique name of the drop-down. It is recommended to precede it with the "imageStyle:" prefix
	 * to avoid collision with the components' names registered by other plugins.
	 */
	name: string;

	/**
	 * The drop-down's title. It will be used as the split button label along with the title of the default item
	 * in the following manner: "Custom drop-down title: Default item title".
	 *
	 * Setting `title` to one of
	 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI#localizedDefaultStylesTitles}
	 * will automatically translate it to the language of the editor.
	 */
	title?: string;

	/**
	 * The list of the names of the buttons that will be placed in the drop-down's toolbar.
	 * Each of the buttons has to be one of the {@link module:image/imageconfig~ImageConfig#styles default image style buttons}
	 * or to be defined as the {@link module:image/imageconfig~ImageStyleOptionDefinition image styling option}.
	 */
	items: Array<string>;

	/**
	 * defaultItem The name of one of the buttons from the items list,
	 * which will be used as a default button for the drop-down's split button.
	 */
	defaultItem: string;
}

/**
 * The configuration for the {@link module:image/imagestyle~ImageStyle} plugin that should be provided
 * while creating the editor instance.
 *
 * A detailed information about the default configuration and customization can be found in
 * {@link module:image/imageconfig~ImageConfig#styles `ImageConfig#styles`}.
 */
export interface ImageStyleConfig {

	/**
	 * A list of the image style options.
	 */
	options?: Array<string | ImageStyleOptionDefinition>;
}

/**
 * The image styling option definition descriptor.
 *
 * This definition should be implemented in the `Image` plugin {@link module:image/imageconfig~ImageConfig#styles configuration} for:
 *
 * * customizing one of the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options} by providing the proper name
 * of the default style and the properties that should be overridden,
 * * or defining a completely custom styling option by providing a custom name and implementing the following properties.
 *
 * ```ts
 * import fullSizeIcon from 'path/to/icon.svg';
 *
 * const imageStyleOptionDefinition = {
 * 	name: 'fullSize',
 * 	icon: fullSizeIcon,
 * 	title: 'Full size image',
 * 	className: 'image-full-size',
 * 	modelElements: [ 'imageBlock', 'imageInline' ]
 * }
 * ```
 *
 * The styling option will be registered as the button under the name `'imageStyle:{name}'` in the
 * {@link module:ui/componentfactory~ComponentFactory UI components factory} (this functionality is provided by the
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI} plugin).
 */
export interface ImageStyleOptionDefinition {

	/**
	 * The unique name of the styling option. It will be used to:
	 *
	 * * refer to one of the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options} or define the custom style,
	 * * store the chosen style in the model by setting the `imageStyle` attribute of the model image element,
	 * * as a value of the {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute `imageStyle` command},
	 * * when registering a button for the style in the following manner: (`'imageStyle:{name}'`).
	 */
	name: string;

	/**
	 * When set, the style will be used as the default one for the model elements
	 * listed in the `modelElements` property. A default style does not apply any CSS class to the view element.
	 *
	 * If this property is not defined, its value is inherited
	 * from the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	isDefault?: boolean;

	/**
	 * One of the following to be used when creating the styles's button:
	 *
	 * * an SVG icon source (as an XML string),
	 * * one of the keys in {@link module:image/imagestyle/utils#DEFAULT_ICONS} to use one of default icons provided by the plugin.
	 *
	 * If this property is not defined, its value is inherited
	 * from the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	icon: string;

	/**
	 * The styles's title. Setting `title` to one of
	 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI#localizedDefaultStylesTitles}
	 * will automatically translate it to the language of the editor.
	 *
	 * If this property is not defined, its value is inherited
	 * from the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	title: string;

	/**
	 * The CSS class used to represent the style in the view.
	 * It should be used only for the non-default styles.
	 *
	 * If this property is not defined, its value is inherited
	 * from the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	className?: string;

	/**
	 * The list of the names of the model elements that are supported by the style.
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
	 * from the {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	modelElements: Array<string>;
}

/**
 * The configuration of the image upload feature. Used by the image upload feature in the `@ckeditor/ckeditor5-image` package.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		image: {
 * 			upload:  ... // Image upload feature options.
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface ImageUploadConfig {

	/**
	 * The list of accepted image types.
	 *
	 * The accepted types of images can be customized to allow only certain types of images:
	 *
	 * ```ts
	 * // Allow only JPEG and PNG images:
	 * const imageUploadConfig = {
	 * 	types: [ 'png', 'jpeg' ]
	 * };
	 * ```
	 *
	 * The type string should match [one of the sub-types](https://www.iana.org/assignments/media-types/media-types.xhtml#image)
	 * of the image MIME type. For example, for the `image/jpeg` MIME type, add `'jpeg'` to your image upload configuration.
	 *
	 * **Note:** This setting only restricts some image types to be selected and uploaded through the CKEditor UI and commands. Image type
	 * recognition and filtering should also be implemented on the server which accepts image uploads.
	 *
	 * @default [ 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff' ]
	 */
	types: Array<string>;
}
