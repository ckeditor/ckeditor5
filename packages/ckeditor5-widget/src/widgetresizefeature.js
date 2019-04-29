/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widget
 */

import WidgetFeature from './widgetfeature';

export const WIDGET_RESIZE_ATTRIBUTE_NAME = 'resizer';

/**
 * The base class for widget features. This type provides a common API for reusable features of widgets.
 */
export default class WidgetResizeFeature extends WidgetFeature {
	apply( widget, writer ) {
		super.apply( widget, writer );

		// writer.setCustomProperty( WIDGET_RESIZE_ATTRIBUTE_NAME, true, widget );
		writer.setAttribute( WIDGET_RESIZE_ATTRIBUTE_NAME, true, widget );

		// widget.setAttribute( WIDGET_RESIZE_ATTRIBUTE_NAME );
		// aaa
	}
}
