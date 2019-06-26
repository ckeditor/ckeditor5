/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widget
 */

import WidgetResizeFeature from './widgetresizefeature';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The base class for widget features. This type provides a common API for reusable features of widgets.
 */
export default class WidgetResizer extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetResizer';
	}

	apply( widgetElement, writer ) {
		// @todo inline the logic
		const ret = new WidgetResizeFeature();

		ret.apply( widgetElement, writer );

		return ret;
	}
}
