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
 * Available image styles.
 *
 * The default value is:
 *
 *		const imageConfig = {
 *			styles: [ 'full', 'side' ]
 *		};
 *
 * which configures two default styles:
 *
 *  * the "full" style which does not apply any class, e.g. for images styled to span 100% width of the content,
 *  * the "side" style with the `.image-style-side` CSS class.
 *
 * See {@link module:image/imagestyle/utils~defaultStyles} to learn more about default
 * styles provided by the image feature.
 *
 * The {@link module:image/imagestyle/utils~defaultStyles default styles} can be customized,
 * e.g. to change the icon, title or CSS class of the style. The feature also provides several
 * {@link module:image/imagestyle/utils~defaultIcons default icons} to choose from.
 *
 *		import customIcon from 'custom-icon.svg';
 *
 *		// ...
 *
 *		const imageConfig = {
 *			styles: [
 *				// This will only customize the icon of the "full" style.
 *				// Note: 'right' is one of default icons provided by the feature.
 *				{ name: 'full', icon: 'right' },
 *
 *				// This will customize the icon, title and CSS class of the default "side" style.
 *				{ name: 'side', icon: customIcon, title: 'My side style', className: 'custom-side-image' }
 *			]
 *		};
 *
 * If none of the default styles is good enough, it is possible to define independent custom styles, too:
 *
 *		import { icons } from 'ckeditor5/src/core';
 *
 *		const fullSizeIcon = icons.objectCenter';
 *		const sideIcon = icons.objectRight';
 *
 *		// ...
 *
 *		const imageConfig = {
 *			styles: [
 *				// A completely custom full size style with no class, used as a default.
 *				{ name: 'fullSize', title: 'Full size', icon: fullSizeIcon, isDefault: true },
 *
 *				{ name: 'side', title: 'To the side', icon: sideIcon, className: 'side-image' }
 *			]
 *		};
 *
 * Note: Setting `title` to one of {@link module:image/imagestyle/imagestyleui~ImageStyleUI#localizedDefaultStylesTitles}
 * will automatically translate it to the language of the editor.
 *
 * Read more about styling images in the {@glink features/image#image-styles Image styles guide}.
 *
 * The feature creates commands based on defined styles, so you can change the style of a selected image by executing
 * the following command:
 *
 *		editor.execute( 'imageStyle' { value: 'side' } );
 *
 * The feature also creates buttons that execute the commands. So, assuming that you use the
 * default image styles setting, you can {@link module:image/image~ImageConfig#toolbar configure the image toolbar}
 * (or any other toolbar) to contain these options:
 *
 *		const imageConfig = {
 *			toolbar: [ 'imageStyle:full', 'imageStyle:side' ]
 *		};
 *
 * @member {Array.<module:image/imagestyle/imagestyleediting~ImageStyleFormat>} module:image/image~ImageConfig#styles
 */
