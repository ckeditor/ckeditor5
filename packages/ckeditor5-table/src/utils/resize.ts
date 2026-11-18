/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/utils/resize
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import type { DowncastInsertEvent, EditingView, ModelElement, ViewElement } from '@ckeditor/ckeditor5-engine';
import { adoptGlobalStyleSheet, global, Rect, toUnit } from '@ckeditor/ckeditor5-utils';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * Determines how many digits after the decimal point are used to store the column widths and the row heights.
 *
 * @internal
 */
export const RESIZE_PRECISION = 2;

/**
 * The distance in pixels that the mouse has to move to start resizing a column or a row.
 *
 * @internal
 */
export const RESIZE_DISTANCE_THRESHOLD = 3;

/**
 * Rounds the provided value to a fixed-point number with defined number of digits after the decimal point.
 *
 * @internal
 * @param value A number to be rounded.
 * @returns The rounded number.
 */
export function toPrecision( value: number | string ): number {
	const multiplier = Math.pow( 10, RESIZE_PRECISION );
	const number = typeof value === 'number' ? value : parseFloat( value );

	return Math.round( number * multiplier ) / multiplier;
}

/**
 * Shows the resizing cursor everywhere while a column or a row is resized, also when the editor is in a shadow root.
 *
 * The class goes to the `<body>` and is styled by a rule adopted into the document, as a theme stylesheet loaded into
 * a shadow root cannot style the `<body>`. The cursor of the shadow host is inherited by the editor content inside.
 *
 * @internal
 * @param className The class that sets the cursor.
 * @param cursor The cursor to show.
 * @param isActive Whether the resizing is in progress.
 */
export function toggleResizingCursor( className: string, cursor: string, isActive: boolean ): void {
	if ( isActive ) {
		adoptGlobalStyleSheet( global.document, `.${ className },.${ className } *{cursor:${ cursor } !important}` );
	}

	global.document.body.classList.toggle( className, isActive );
}

/**
 * Toggles the class that hides the column or the row resizer handles (through CSS) on all editing roots.
 *
 * @internal
 * @param view The editing view.
 * @param className The class that hides the resizer handles.
 * @param isResizingAllowed Whether the resizing is allowed. The class is added when it is not.
 */
export function toggleResizingDisabledClass( view: EditingView, className: string, isResizingAllowed: boolean ): void {
	view.change( writer => {
		for ( const root of view.document.roots ) {
			if ( isResizingAllowed ) {
				writer.removeClass( className, root );
			} else {
				writer.addClass( className, root );
			}
		}
	} );
}

/**
 * Registers a listener ensuring that each table cell has a column or a row resizer handle.
 *
 * @internal
 * @param editor The editor instance.
 * @param className The class of the resizer handle element.
 */
export function registerResizerInserter( editor: Editor, className: string ): void {
	editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
		dispatcher.on<DowncastInsertEvent<ModelElement>>( 'insert:tableCell', ( evt, data, conversionApi ) => {
			const viewElement = conversionApi.mapper.toViewElement( data.item );
			const viewWriter = conversionApi.writer;

			viewWriter.insert(
				viewWriter.createPositionAt( viewElement!, 'end' ),
				viewWriter.createUIElement( 'div', { class: className } )
			);
		}, { priority: 'lowest' } );
	} );
}

/**
 * The side styles that stretch a resizer handle over the table: a column resizer along the table height,
 * a row resizer along the table width.
 */
const RESIZER_SIDES = {
	column: [ 'top', 'bottom' ],
	row: [ 'left', 'right' ]
} as const;

/**
 * Sets the side styles of a column or a row resizer handle, so it stretches over the whole height or width of the table.
 *
 * @internal
 * @param view The editing view.
 * @param viewResizer The resizer handle element.
 * @param type Whether it is a column or a row resizer.
 */
export function fitResizerToTable( view: EditingView, viewResizer: ViewElement, type: 'column' | 'row' ): void {
	const domConverter = view.domConverter;
	const [ startSide, endSide ] = RESIZER_SIDES[ type ];

	const domTable = domConverter.mapViewToDom( viewResizer.findAncestor( 'table' )! )!;
	const domCell = domConverter.mapViewToDom(
		viewResizer.findAncestor( item => [ 'td', 'th' ].includes( item.name ) )!
	)!;

	const rectTable = new Rect( domTable );
	const rectCell = new Rect( domCell );

	const startPosition = toPx( Number( ( rectTable[ startSide ] - rectCell[ startSide ] ).toFixed( 4 ) ) );
	const endPosition = toPx( Number( ( rectCell[ endSide ] - rectTable[ endSide ] ).toFixed( 4 ) ) );

	view.change( viewWriter => {
		viewWriter.setStyle( startSide, startPosition, viewResizer );
		viewWriter.setStyle( endSide, endPosition, viewResizer );
	} );
}

/**
 * Removes the side styles set by {@link ~fitResizerToTable `fitResizerToTable()`}.
 *
 * @internal
 * @param view The editing view.
 * @param viewResizer The resizer handle element.
 * @param type Whether it is a column or a row resizer.
 */
export function resetResizerStyles( view: EditingView, viewResizer: ViewElement, type: 'column' | 'row' ): void {
	const [ startSide, endSide ] = RESIZER_SIDES[ type ];

	view.change( viewWriter => {
		viewWriter.removeStyle( startSide, viewResizer );
		viewWriter.removeStyle( endSide, viewResizer );
	} );
}
