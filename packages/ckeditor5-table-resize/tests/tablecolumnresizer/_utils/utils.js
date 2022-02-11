/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, MouseEvent */

import { global } from 'ckeditor5/src/utils';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { Point } from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';

export const tableColumnResizeMouseSimulator = {
	down( view, domTarget ) {
		const preventDefault = sinon.spy();
		const domEventDataMock = new DomEventData( view, {
			target: domTarget,
			preventDefault,
			clientX: getColumnResizerRect( domTarget ).x
		} );

		view.document.fire( 'mousedown', domEventDataMock );
	},

	move( domTarget, vector ) {
		const event = new MouseEvent( 'mousemove', {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: getColumnResizerRect( domTarget ).moveBy( vector.x, vector.y ).x
		} );

		domTarget.dispatchEvent( event );
	},

	up( domTarget ) {
		const event = new MouseEvent( 'mouseup', {
			view: window,
			bubbles: true,
			cancelable: true
		} );

		domTarget.dispatchEvent( event );
	},

	resize( view, columnIndex, vector, rowIndex ) {
		const domResizer = getDomResizer( view, columnIndex, rowIndex );

		this.down( view, domResizer );
		this.move( domResizer, vector );
		this.up( domResizer );
	}
};

const getWidth = domElement => parseFloat( global.window.getComputedStyle( domElement ).width );

export const getDomTable = view => view.domConverter.mapViewToDom( view.document.getRoot().getChild( 0 ) );

export function getDomTableRects( view ) {
	return getDomTable( view ).getClientRects()[ 0 ];
}

export function getDomTableCellRects( view, columnIndex ) {
	return Array.from( getDomTable( view ).querySelectorAll( 'td' ) )[ columnIndex ].getClientRects()[ 0 ];
}

export function getColumnWidth( view, columnIndex ) {
	const domTable = getDomTable( view );

	return getWidth( Array.from( domTable.querySelectorAll( 'col' ) )[ columnIndex ] );
}

export function getViewColumnWidthsPx( view ) {
	const domTable = getDomTable( view );
	const widths = [];

	Array.from( domTable.querySelectorAll( 'col' ) ).forEach( col => {
		widths.push( getWidth( col ) );
	} );
	return widths;
}

export function getModelColumnWidthsPc( model ) {
	return model.document.getRoot().getChild( 0 ).getAttribute( 'columnWidths' ).replaceAll( '%', '' ).split( ',' );
}

export function getViewColumnWidthsPc( view ) {
	const viewColWidths = [];

	for ( const item of view.createRangeIn( view.document.getRoot() ) ) {
		if ( item.item.is( 'element', 'col' ) ) {
			viewColWidths.push( item.item.getStyle( 'width' ).replaceAll( '%', '' ) );
		}
	}

	return viewColWidths;
}

export function getDomResizer( view, columnIndex, rowIndex ) {
	const domTable = getDomTable( view );
	const rows = Array.from( domTable.querySelectorAll( 'tr' ) );
	const row = rows[ rowIndex ? rowIndex : 0 ];
	const domResizer = Array.from( row.querySelectorAll( '.table-column-resizer' ) )[ columnIndex ];

	return domResizer;
}

export function getColumnResizerRect( resizerElement ) {
	const cellRect = new Rect( resizerElement.parentElement );
	const resizerPosition = new Point( cellRect.right, cellRect.top + cellRect.height / 2 );

	return resizerPosition;
}
