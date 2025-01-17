/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/table
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Widget } from 'ckeditor5/src/widget.js';

import TableEditing from './tableediting.js';
import TableUI from './tableui.js';
import TableSelection from './tableselection.js';
import TableClipboard from './tableclipboard.js';
import TableKeyboard from './tablekeyboard.js';
import TableMouse from './tablemouse.js';

import '../theme/table.css';

/**
 * The table plugin.
 *
 * For a detailed overview, check the {@glink features/tables/tables Table feature documentation}.
 *
 * This is a "glue" plugin that loads the following table features:
 *
 * * {@link module:table/tableediting~TableEditing editing feature},
 * * {@link module:table/tableselection~TableSelection selection feature},
 * * {@link module:table/tablekeyboard~TableKeyboard keyboard navigation feature},
 * * {@link module:table/tablemouse~TableMouse mouse selection feature},
 * * {@link module:table/tableclipboard~TableClipboard clipboard feature},
 * * {@link module:table/tableui~TableUI UI feature}.
 */
export default class Table extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableEditing, TableUI, TableSelection, TableMouse, TableKeyboard, TableClipboard, Widget ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Table' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
