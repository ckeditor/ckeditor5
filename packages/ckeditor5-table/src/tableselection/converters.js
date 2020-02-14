/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/converters
 */

/**
 * Adds a visual highlight style to a selected table cells.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {module:table/tableselection~TableSelection} tableSelection
 */
export function setupTableSelectionHighlighting( editor, tableSelection ) {
	const highlighted = new Set();

	editor.conversion.for( 'editingDowncast' ).add( dispatcher => dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
		const view = editor.editing.view;
		const viewWriter = conversionApi.writer;
		const viewSelection = viewWriter.document.selection;

		if ( tableSelection.hasMultiCellSelection ) {
			clearHighlightedTableCells( highlighted, view );

			for ( const tableCell of tableSelection.getSelectedTableCells() ) {
				const viewElement = conversionApi.mapper.toViewElement( tableCell );

				viewWriter.addClass( 'selected', viewElement );
				highlighted.add( viewElement );
			}

			viewWriter.setSelection( viewSelection.getRanges(), { fake: true, label: 'TABLE' } );
		} else {
			clearHighlightedTableCells( highlighted, view );
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
