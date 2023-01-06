/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import ImageBlock from './imageblock';
import ImageInline from './imageinline';

import '../theme/image.css';
import type { ImageInsertConfig } from './imageinsert';
import type { ImageStyleConfig } from './imagestyle';
import type { ImageUploadConfig } from './imageupload';
import type { ImageStyleDropdownDefinition } from './imagestyle/imagestyleui';
import type { ImageResizeOption } from './imageresize/imageresizebuttons';

/**
 * The image plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-overview image feature} documentation.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/imageblock~ImageBlock},
 * * {@link module:image/imageinline~ImageInline},
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 */
export default class Image extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ImageBlock, ImageInline ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Image' {
		return 'Image';
	}
}

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
 *
 * @interface ImageConfig
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
	 * {@link module:core/editor/editorui~EditorUI#componentFactory component factory} of the editor,
	 * representing the button a user can click to change the size of an image,
	 * * value: An actual image width applied when a user clicks the mentioned button
	 * ({@link module:image/imageresize/resizeimagecommand~ResizeImageCommand} gets executed).
	 * The value property is combined with the {@link module:image/image~ImageConfig#resizeUnit `config.image.resizeUnit`} (`%` by default).
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
	 {@link module:image/image~ImageConfig#toolbar `config.image.toolbar`}. The dropdown contains all defined options by default:
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
	 * If you want to have separate buttons for {@link module:image/imageresize/imageresizebuttons~ImageResizeOption each option},
	 * pass their names to the {@link module:image/image~ImageConfig#toolbar `config.image.toolbar`} instead. Please keep in mind
	 * that this time **you must define the additional
	 * {@link module:image/imageresize/imageresizebuttons~ImageResizeOption `icon` property}**:
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
	resizeUnit?: string;

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
	 * ```ts
	 * editor.execute( 'imageStyle' { value: 'alignLeft' } );
	 * ```
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
	 * Read more about the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options}.
	 *
	 * # **Custom configuration**
	 *
	 * The image styles configuration can be customized in several ways:
	 *
	 * * Any of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options}
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
	 * * Each of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default image style options} can be customized,
	 * e.g. to change the `icon`, `title` or CSS `className` of the style. The feature also provides several
	 * {@link module:image/imagestyle/utils~DEFAULT_ICONS default icons} to choose from.
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
	 * * If none of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default image style options}
	 * works for the integration, it is possible to define independent custom styles, too.
	 *
	 * See the documentation about the image style {@link module:image/imagestyle~ImageStyleOptionDefinition options}
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
	 * * {@link module:image/image~ImageConfig#styles buttons provided by the `ImageStyle` plugin},
	 * * {@link module:image/imagestyle/utils~DEFAULT_DROPDOWN_DEFINITIONS drop-downs provided by the `ImageStyle` plugin},
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
	 * {@link module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition custom drop-down} while configuring the toolbar.
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

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Image.pluginName ]: Image;
	}

	interface EditorConfig {

		/**
		 * The configuration of the image features. Used by the image features in the `@ckeditor/ckeditor5-image` package.
		 *
		 * Read more in {@link module:image/image~ImageConfig}.
		 */
		image?: ImageConfig;
	}

}

