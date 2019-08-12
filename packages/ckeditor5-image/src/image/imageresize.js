/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageresize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResizer from '@ckeditor/ckeditor5-widget/src/widgetresizer';

/**
 *	Image resize plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetResizer ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageResize';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.editing.downcastDispatcher.on( 'insert:image', ( evt, data, conversionApi ) => {
			const widget = conversionApi.mapper.toViewElement( data.item );

			editor.plugins.get( 'WidgetResizer' ).apply( widget, conversionApi.writer, {
				getResizeHost( wrapper ) {
					return wrapper.querySelector( 'img' );
				},
				getAspectRatio( resizeHost ) {
					return resizeHost.naturalWidth / resizeHost.naturalHeight;
				},
				isCentered( context ) {
					const imageStyle = context._getModel( editor, context.widgetWrapperElement ).getAttribute( 'imageStyle' );

					return !imageStyle || imageStyle == 'full';
				}
			} );
		}, {
			priority: 'low'
		} );
	}
}
