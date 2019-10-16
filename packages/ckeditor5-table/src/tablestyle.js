/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablestyle
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TableStyleEditing from './tablestyleediting';
import TableStyleUI from './tablestyleui';

/**
 * The table style feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static requires() {
		return [ TableStyleEditing, TableStyleUI ];
	}
}
