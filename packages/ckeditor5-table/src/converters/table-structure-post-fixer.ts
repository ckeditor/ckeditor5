/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-structure-post-fixer
 */

import type { Editor } from 'ckeditor5/src/core.js';
import type {
	ModelElement,
	ModelWriter
} from 'ckeditor5/src/engine.js';

import { TableUtils } from '../tableutils.js';
import { updateNumericAttribute } from '../utils/common.js';

/**
 * Injects a table structure post-fixer into the model.
 *
 * It checks if the `headingRows` and `footerRows` attributes do not overlap.
 * If they overlap, the `footerRows` attribute is corrected.
 *
 * We prefer `headingRows` over `footerRows` because changing `headingRows` would require updating
 * the `tableCellType` attribute of the cells in the row, which is not required when changing `footerRows`.
 *
 * @param editor The editor instance.
 */
export function injectTableStructurePostFixer( editor: Editor ): void {
	const { model } = editor;
	const tableUtils = editor.plugins.get( TableUtils );

	model.document.registerPostFixer( writer => {
		let changed = false;

		const changes = model.document.differ.getChanges();
		const tables = new Set<ModelElement>();

		for ( const entry of changes ) {
			let table: ModelElement | null = null;

			if ( entry.type == 'attribute' && ( entry.attributeKey == 'headingRows' || entry.attributeKey == 'footerRows' ) ) {
				table = entry.range.start.nodeAfter as ModelElement;
			} else if ( entry.type == 'insert' && entry.name == 'tableRow' ) {
				table = entry.position.parent as ModelElement;
			} else if ( entry.type == 'remove' && entry.name == 'tableRow' ) {
				table = entry.position.parent as ModelElement;
			}

			if ( table && table.is( 'element', 'table' ) ) {
				tables.add( table );
			}
		}

		for ( const table of tables ) {
			if ( fixTableSections( tableUtils, writer, table ) ) {
				changed = true;
			}
		}

		return changed;
	} );
}

/**
 * Fixes table sections by ensuring that `headingRows` and `footerRows` do not overlap.
 */
function fixTableSections( tableUtils: TableUtils, writer: ModelWriter, table: ModelElement ): boolean {
	const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
	const footerRows = table.getAttribute( 'footerRows' ) as number || 0;
	const rows = tableUtils.getRows( table );

	// If heading rows and footer rows overlap, prefer heading rows. It's easier to change footer rows
	// because it doesn't require changing cell types.
	if ( ( headingRows + footerRows ) > rows ) {
		const value = Math.max( 0, rows - headingRows );

		updateNumericAttribute( 'footerRows', value, table, writer, 0 );

		return true;
	}

	return false;
}
