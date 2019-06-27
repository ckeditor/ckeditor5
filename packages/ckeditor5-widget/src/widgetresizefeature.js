/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widget
 */

import WidgetFeature from './widgetfeature';
import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import dragHandlerIcon from '../theme/icons/drag-handler.svg';

/**
 * The base class for widget features. This type provides a common API for reusable features of widgets.
 */
export default class WidgetResizeFeature extends WidgetFeature {
	apply( widgetElement, writer ) {
		super.apply( widgetElement, writer );

		const selectionHandler = writer.createUIElement( 'div', {
			class: 'ck ck-widget__resizer-wrapper'
		}, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

			const shadowElement = domDocument.createElement( 'div' );
			shadowElement.setAttribute( 'class', 'ck ck-widget__resizer-shadow' );
			domElement.appendChild( shadowElement );

			for ( const currentPosition of resizerPositions ) {
				// Use the IconView from the UI library.
				const icon = new IconView();
				icon.set( 'content', dragHandlerIcon );
				icon.extendTemplate( {
					attributes: {
						'class': `ck-widget__resizer ck-widget__resizer-${ currentPosition }`
					}
				} );

				// Make sure icon#element is rendered before passing to appendChild().
				icon.render();

				domElement.appendChild( icon.element );
			}

			return domElement;
		} );

		// Append resizer wrapper to the widget's wrapper.
		writer.insert( writer.createPositionAt( widgetElement, widgetElement.childCount ), selectionHandler );
		writer.addClass( [ 'ck-widget_with-resizer' ], widgetElement );
	}
}
