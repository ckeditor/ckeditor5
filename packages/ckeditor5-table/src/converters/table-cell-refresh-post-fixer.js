/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-cell-refresh-post-fixer
 */

/**
 * Injects a table cell post-fixer into the model which marks the table cell in the differ to have it re-rendered.
 *
 * Model `paragraph` inside a table cell can be rendered as `<span>` or `<p>`. It is rendered as `<span>` if this is the only block
 * element in that table cell and it does not have any attributes. It is rendered as `<p>` otherwise.
 *
 * When table cell content changes, for example a second `paragraph` element is added, we need to ensure that the first `paragraph` is
 * re-rendered so it changes from `<span>` to `<p>`. The easiest way to do it is to re-render the entire table cell.
 *
 * @param {module:engine/model/model~Model} model
 */
export default function injectTableCellRefreshPostFixer( model ) {
	model.document.registerPostFixer( () => tableCellRefreshPostFixer( model ) );
}

function tableCellRefreshPostFixer( model ) {
	const differ = model.document.differ;

	const changesForCells = new Map();
	const changes = [ ...differ.getChanges() ];

	// Updated refresh algorithm.
	// 1. Gather all changes inside table cell.
	changes.forEach( change => {
		const parent = change.type == 'attribute' ? change.range.start.parent : change.position.parent;

		if ( !parent.is( 'element', 'tableCell' ) ) {
			return;
		}

		if ( !changesForCells.has( parent ) ) {
			changesForCells.set( parent, [] );
		}

		changesForCells.get( parent ).push( change );
	} );

	// Stores cells to be refreshed, so the table cell will be refreshed once for multiple changes.
	const cellsToRefresh = new Set();

	// 2. For each table cell:
	for ( const [ tableCell, changes ] of changesForCells.entries() ) {
		// 2a. Count inserts/removes as diff and marks any attribute change.
		const { childDiff, attribute } = changes.reduce( ( summary, change ) => {
			if ( change.type === 'remove' ) {
				summary.childDiff--;
			}

			if ( change.type === 'insert' ) {
				summary.childDiff++;
			}

			if ( change.type === 'attribute' ) {
				summary.attribute = true;
			}

			return summary;
		}, { childDiff: 0, attribute: false } );

		// 2b. If we detect that number of children has changed...
		if ( childDiff !== 0 ) {
			const prevChildren = tableCell.childCount - childDiff;
			const currentChildren = tableCell.childCount;

			// Might need refresh if previous children was different from 1. Eg.: it was 2 before, now is 1.
			if ( currentChildren === 1 && prevChildren !== 1 ) {
				cellsToRefresh.add( tableCell );
			}

			// Might need refresh if previous children was 1. Eg.: it was 1 before, now is 5.
			if ( currentChildren !== 1 && prevChildren === 1 ) {
				cellsToRefresh.add( tableCell );
			}
		}

		// ... 2c or some attribute has changed.
		if ( attribute ) {
			cellsToRefresh.add( tableCell );
		}
	}

	// Having cells to refresh we need to
	if ( cellsToRefresh.size ) {
		// @if CK_DEBUG_TABLE // console.log( `Post-fixing table: Checking table cell to refresh (${ cellsToRefresh.size }).` );
		// @if CK_DEBUG_TABLE // let paragraphsRefreshed = 0;

		for ( const tableCell of cellsToRefresh.values() ) {
			for ( const paragraph of [ ...tableCell.getChildren() ].filter( child => child.is( 'element', 'paragraph' ) ) ) {
				// @if CK_DEBUG_TABLE // console.log( `Post-fixing table: refreshing paragraph in table cell (${++paragraphsRefreshed}).` );
				differ._pocRefreshItem( paragraph );
			}
		}

		return false; // TODO tmp
	}

	return false;
}
