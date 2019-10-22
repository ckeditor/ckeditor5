/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablestyle
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TableStyleUI from './tablestyleui';
import TableProperties from './tableproperites';
import TableCellProperties from './tablecellproperites';
import TableColumnRowProperties from './tablecolumnrowproperites';

/**
 * The table style feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableProperties, TableCellProperties, TableColumnRowProperties, TableStyleUI ];
	}
}
