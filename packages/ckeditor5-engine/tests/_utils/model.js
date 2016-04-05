/**
 * @license Copyright (c) 2003-20'INSERT'6, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeWalker from '/ckeditor5/engine/treemodel/treewalker.js';
import Range from '/ckeditor5/engine/treemodel/range.js';
import Position from '/ckeditor5/engine/treemodel/position.js';

/**
 * Writes the contents of the document to an HTML-like string.
 *
 * @param {engine.treeModel.Document} document
 * @param {String} rootName
 * @param {Object} [options]
 * @param {Boolean} [options.selection] Whether to write the selection.
 */
export function getData( document, rootName, options ) {
	const walker = new TreeWalker( {
		boundaries: Range.createFromElement( document.getRoot( rootName ) )
	} );
	let ret = '';
	let lastPosition;
	const selection = document.selection;

	options = options || {};

	for ( let value of walker ) {
		if ( options.selection ) {
			ret += writeSelection( value.previousPosition, selection );
		}

		ret += writeItem( value, selection, options );

		lastPosition = value.nextPosition;
	}

	if ( options.selection ) {
		ret += writeSelection( lastPosition, selection );
	}

	return ret;
}

// -- Private stuff -----------------------------------------------------------

function writeItem( walkerValue, selection, options ) {
	const type = walkerValue.type;
	const item = walkerValue.item;

	if ( type == 'ELEMENT_START' ) {
		let attrs = writeAttributes( item.getAttributes() );

		if ( attrs ) {
			return `<${ item.name } ${ attrs }>`;
		}

		return `<${ item.name }>`;
	}

	if ( type == 'ELEMENT_END' ) {
		return `</${ item.name }>`;
	}

	return writeText( walkerValue, selection, options );
}

function writeText( walkerValue, selection, options ) {
	const item = walkerValue.item;
	const attrs = writeAttributes( item.getAttributes() );
	let text = Array.from( item.text );

	if ( options.selection ) {
		const startIndex = walkerValue.previousPosition.offset + 1;
		const endIndex = walkerValue.nextPosition.offset - 1;
		let index = startIndex;

		while ( index <= endIndex ) {
			// Add the selection marker without changing any indexes, so if second marker must be added
			// in the same loop it does not blow up.
			text[ index - startIndex ] +=
				writeSelection( Position.createFromParentAndOffset( item.commonParent, index ), selection );

			index++;
		}
	}

	text = text.join( '' );

	if ( attrs ) {
		return `<$text ${ attrs }>${ text }</$text>`;
	}

	return text;
}

function writeAttributes( attrs ) {
	attrs = Array.from( attrs );

	return attrs.map( attr => attr[ 0 ] + '=' + JSON.stringify( attr[ 1 ] ) ).sort().join( ' ' );
}

function writeSelection( currentPosition, selection ) {
	// TODO: This function obviously handles only the first range.
	const range = selection.getFirstRange();

	// Handle end of the selection.
	if ( !selection.isCollapsed && range.end.compareWith( currentPosition ) == 'SAME' ) {
		return '</selection>';
	}

	// Handle no match.
	if ( range.start.compareWith( currentPosition ) != 'SAME' ) {
		return '';
	}

	// Handle beginning of the selection.

	let ret = '<selection';
	const attrs = writeAttributes( selection.getAttributes() );

	// TODO: Once we'll support multiple ranges this will need to check which range it is.
	if ( selection.isBackward ) {
		ret += ' backward';
	}

	if ( attrs ) {
		ret += ' ' + attrs;
	}

	ret += ( selection.isCollapsed ? ' />' : '>' );

	return ret;
}
