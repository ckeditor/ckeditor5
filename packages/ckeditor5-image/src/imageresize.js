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
import ImageResizeHandles from './imageresize/imageresizehandles';

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
		return [ ImageResizeEditing, ImageResizeHandles, ImageResizeUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageResize';
	}

	init() {
		const editor = this.editor;
		const shouldDisableImageResizeHandles = editor.config.get( 'image.disableResizeHandles' );

		if ( shouldDisableImageResizeHandles ) {
			editor.plugins.get( 'ImageResizeHandles' ).forceDisabled( 'ImageResize' );
		}
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
 * Each option should have its `name`, which is a component name definition that will be
 * used in the {@link module:image/imageresize/imageresizeui~ImageResizeUI} plugin.
 * Other properties like `label` and `value` define the following:
 * a text label for the option button and the value that will be applied to the image's width.
 *
 * The value property is combined with the `resizeUnit` (`%` by default), eg: `value: '50'` and `resizeUnit: '%'` is `50%`.
 *
 * **NOTE:** If you want to set an option that will reset image to its original size, you need to pass a `null` value
 * to one of the options. The `:original` token is not mandatory, you can call it anything you wish, but it must reflect
 * in the standalone buttons configuration for the image toolbar.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'imageResize:original',
 *						label: 'Original size',
 *						value: null
 *					},
 *					{
 *						name: 'imageResize:50',
 *						label: '50%',
 *						value: '50'
 *					},
 *					{
 *						name: 'imageResize:75',
 *						label: '75%',
 *						value: '75'
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
 *						label: 'Original size',
 *						value: null
 *					},
 *					{
 *						name: 'imageResize:50',
 *						label: '50%',
 *						value: '50'
 *					},
 *					{
 *						name: 'imageResize:75',
 *						label: '75%',
 *						value: '75'
 *					} ],
 *					toolbar: [ 'imageResize', ... ],
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * If you want to have separate buttons for each option, pass their names instead:
 *
 *			ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'imageResize:original',
 *						label: 'Original size',
 *						value: null
 *					},
 *					{
 *						name: 'imageResize:50',
 *						label: '50%',
 *						value: '50'
 *					},
 *					{
 *						name: 'imageResize:75',
 *						label: '75%',
 *						value: '75'
 *					} ],
 *					toolbar: [ 'imageResize:original', 'imageResize:50', 'imageResize:75', ... ],
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 *
 * @member {Array.<module:image/imageresize/imageresizeui~ImageResizeOption>} module:image/image~ImageConfig#resizeOptions
 */
