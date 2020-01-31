/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/converters
 */

export function setupTableSelectionHighlighting( editor, tableSelection ) {
	const highlighted = new Set();
	editor.conversion.for( 'editingDowncast' ).add( dispatcher => dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
		const viewWriter = conversionApi.writer;
		const viewSelection = viewWriter.document.selection;

		if ( tableSelection._isSelecting ) {
			clearHighlightedTableCells( highlighted, editor.editing.view );

			for ( const tableCell of tableSelection.getSelectedTableCells() ) {
				const viewElement = conversionApi.mapper.toViewElement( tableCell );

				viewWriter.addClass( 'selected', viewElement );
				highlighted.add( viewElement );
			}

			const ranges = viewSelection.getRanges();
			const from = Array.from( ranges );

			viewWriter.setSelection( from, { fake: true, label: 'TABLE' } );
		} else {
			clearHighlightedTableCells( highlighted, editor.editing.view );
		}
	}, { priority: 'lowest' } ) );
}

function clearHighlightedTableCells( highlighted, view ) {
	const previous = [ ...highlighted.values() ];

	view.change( writer => {
		for ( const previouslyHighlighted of previous ) {
			writer.removeClass( 'selected', previouslyHighlighted );
		}
	} );
}
