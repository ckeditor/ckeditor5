/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
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
 */
export default class ImageStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ImageStyleEditing, ImageStyleUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageStyle' {
		return 'ImageStyle';
	}
}

/**
 * The configuration for the {@link module:image/imagestyle~ImageStyle} plugin that should be provided
 * while creating the editor instance.
 *
 * A detailed information about the default configuration and customization can be found in
 * {@link module:image/image~ImageConfig#styles `ImageConfig#styles`}.
 */
export interface ImageStyleConfig {

	/**
	 * A list of the image style options.
	 */
	options: Array<ImageStyleOptionDefinition>;
}

/**
 * The image styling option definition descriptor.
 *
 * This definition should be implemented in the `Image` plugin {@link module:image/image~ImageConfig#styles configuration} for:
 *
 * * customizing one of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} by providing the proper name
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
	 * @property name The unique name of the styling option. It will be used to:
	 *
	 * * refer to one of the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} or define the custom style,
	 * * store the chosen style in the model by setting the `imageStyle` attribute of the model image element,
	 * * as a value of the {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute `imageStyle` command},
	 * * when registering a button for the style in the following manner: (`'imageStyle:{name}'`).
	 */
	name: string;

	/**
	 * @property isDefault When set, the style will be used as the default one for the model elements
	 * listed in the `modelElements` property. A default style does not apply any CSS class to the view element.
	 *
	 * If this property is not defined, its value is inherited
	 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	isDefault?: boolean;

	/**
	 * @property icon One of the following to be used when creating the styles's button:
	 *
	 * * an SVG icon source (as an XML string),
	 * * one of the keys in {@link module:image/imagestyle/utils~DEFAULT_ICONS} to use one of default icons provided by the plugin.
	 *
	 * If this property is not defined, its value is inherited
	 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	icon: string;

	/**
	 * @property title The styles's title. Setting `title` to one of
	 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI#localizedDefaultStylesTitles}
	 * will automatically translate it to the language of the editor.
	 *
	 * If this property is not defined, its value is inherited
	 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	title: string;

	/**
	 * @property className The CSS class used to represent the style in the view.
	 * It should be used only for the non-default styles.
	 *
	 * If this property is not defined, its value is inherited
	 * from the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
	 */
	className?: string;

	/**
	 * @property modelElements The list of the names of the model elements that are supported by the style.
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
	 */
	modelElements: Array<string>;
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ImageStyle.pluginName ]: ImageStyle;
	}
}
