/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageResizeUI from './imageresize/imageresizeui';
import ImageResizeEditing from './imageresize/imageresizeediting';

import '../theme/imageresize.css';

/**
 * The image resize plugin.
 *
 * It adds a possibility to resize each image using handles.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageResizeEditing, ImageResizeUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageResize';
	}
}

/**
 * The available options are `'px'` or `'%'`.
 *
 * Determines the size unit applied to the resized image.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					resizeUnit: 'px'
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 *
 * This option is used by the {@link module:image/imageresize~ImageResize} feature.
 *
 * @default '%'
 * @member {String} module:image/image~ImageConfig#resizeUnit
 */

/**
 * The resize options.
 *
 * Each option should have its own `name`, which is a component name definition that will be
 * used in the {@link module:image/imageresize/imageresizeui~ImageResizeUI} plugin and `value` which will
 * be applied to the image's width during the {@link module:image/imageresize/imageresizecommand~ImageResizeCommand} execution.
 *
 * The value property is combined with the `resizeUnit` (`%` by default), eg: `value: '50'` and `resizeUnit: '%'` is `50%`.
 *
 * **NOTE:** There is additional mandatory property — `icon`, but it's necessary only for setting the standalone buttons configuration.
 *
 * **Reset size option:** If you want to set an option that will reset image to its original size, you need to pass a `null` value
 * to one of the options. The `:original` token is not mandatory, you can call it anything you wish, but it must reflect
 * in the standalone buttons configuration for the image toolbar.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'imageResize:original',
 *						value: null
 *						// you should add `icon` property if you're configuring the standalone buttons.
 *					},
 *					{
 *						name: 'imageResize:50',
 *						value: '50'
 *						// you should add `icon` property if you're configuring the standalone buttons.
 *					},
 *					{
 *						name: 'imageResize:75',
 *						value: '75'
 *						// you should add `icon` property if you're configuring the standalone buttons.
 *					} ]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * With resize options defined, you can decide whether you want to display them as a dropdown or as standalone buttons.
 * For the dropdown, you need to pass only the `imageResize` token to the `image.toolbar`.
 * The dropdown contains all defined options by default:
 *
 *			ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'imageResize:original',
 *						value: null
 *					},
 *					{
 *						name: 'imageResize:50',
 *						value: '50'
 *					},
 *					{
 *						name: 'imageResize:75',
 *						value: '75'
 *					} ],
 *					toolbar: [ 'imageResize', ... ],
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * If you want to have separate buttons for each option, pass their names to the `image.toolbar` instead. Please keep in
 * mind that this time **you should define additional `icon` property**:
 *
 *			ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'imageResize:original',
 *						value: null
 *						icon: 'original'
 *					},
 *					{
 *						name: 'imageResize:25',
 *						value: '25'
 *						icon: 'small'
 *					},
 *					{
 *						name: 'imageResize:50',
 *						value: '50'
 *						icon: 'medium'
 *					},
 *					{
 *						name: 'imageResize:75',
 *						value: '75'
 *						icon: 'large'
 *					} ],
 *					toolbar: [ 'imageResize:25', 'imageResize:50', 'imageResize:75', 'imageResize:original', ... ],
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * **User-defined labels**: You can also set your own labels for each option. To do that, please add `label` property like
 * in the example below. With the **dropdown**, the labels will be shown on the list of all options when you open the dropdown.
 * With the **standalone buttons**, the labels will be shown only in tooltips when you hover over the icons.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'imageResize:original',
 *						value: null,
 *						label: 'Original size'
 *					},
 *					{
 *						name: 'imageResize:50',
 *						value: '50',
 *						label: 'Medium size'
 *					},
 *					{
 *						name: 'imageResize:75',
 *						value: '75',
 *						label: 'Large size'
 *					} ]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 *
 * @member {Array.<module:image/imageresize/imageresizeui~ImageResizeOption>} module:image/image~ImageConfig#resizeOptions
 */
