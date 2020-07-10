/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
		if ( change.type != 'attribute' ) {
			continue;
		}

		const element = change.range.start.nodeAfter;

		if ( element && element.is( 'table' ) && change.attributeKey == 'headingRows' ) {
			tablesToRefresh.add( element );
		}
	}

	if ( tablesToRefresh.size ) {
		// @if CK_DEBUG_TABLE // console.log( `Post-fixing table: refreshing heading rows (${ tablesToRefresh.size }).` );

		for ( const table of tablesToRefresh.values() ) {
			differ.refreshItem( table );
		}

		return true;
	}

	return false;
}
