/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-heading-rows-refresh-post-fixer
 */

/**
 * Injects a table post-fixer into the model which marks the table in the differ to have it re-rendered.
 *
 * Table heading rows are represented in the model by a `headingRows` attribute. However, in the view, it's represented as separate
 * sections of the table (`<thead>` or `<tbody>`) and changing `headingRows` attribute requires moving table rows between two sections.
 * This causes problems with structural changes in a table (like adding and removing rows) thus atomic converters cannot be used.
 *
 * When table `headingRows` attribute changes, the entire table is re-rendered.
 *
 * @param {module:engine/model/model~Model} model
 */
export default function injectTableHeadingRowsRefreshPostFixer( model ) {
	model.document.registerPostFixer( () => tableHeadingRowsRefreshPostFixer( model ) );
}

function tableHeadingRowsRefreshPostFixer( model ) {
	const differ = model.document.differ;

	// Stores tables to be refreshed so the table will be refreshed once for multiple changes.
	const tablesToRefresh = new Set();

	for ( const change of differ.getChanges() ) {
		if ( change.type === 'attribute' ) {
			const element = change.range.start.nodeAfter;

			if ( element && element.is( 'element', 'table' ) && change.attributeKey === 'headingRows' ) {
				tablesToRefresh.add( element );
			}
		} else {
			/* istanbul ignore else */
			if ( change.type === 'insert' || change.type === 'remove' ) {
				if ( change.name === 'tableRow' ) {
					const table = change.position.findAncestor( 'table' );
					const headingRows = table.getAttribute( 'headingRows' ) || 0;

					if ( change.position.offset < headingRows ) {
						tablesToRefresh.add( table );
					}
				} else if ( change.name === 'tableCell' ) {
					const table = change.position.findAncestor( 'table' );
					const headingColumns = table.getAttribute( 'headingColumns' ) || 0;

					if ( change.position.offset < headingColumns ) {
						tablesToRefresh.add( table );
					}
				}
			}
		}
	}

	if ( tablesToRefresh.size ) {
		// @if CK_DEBUG_TABLE // console.log( `Post-fixing table: refreshing heading rows (${ tablesToRefresh.size }).` );

		for ( const table of tablesToRefresh.values() ) {
			// Should be handled by a `triggerBy` configuration. See: https://github.com/ckeditor/ckeditor5/issues/8138.
			differ.refreshItem( table );
		}

		return true;
	}

	return false;
}
