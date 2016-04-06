/**
 * @license Copyright (c) 2003-20'INSERT'6, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeWalker from '/ckeditor5/engine/treemodel/treewalker.js';
import Range from '/ckeditor5/engine/treemodel/range.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import Text from '/ckeditor5/engine/treemodel/text.js';
import Element from '/ckeditor5/engine/treemodel/element.js';

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

export function setData( document, rootName, data ) {
	let appendTo = document.getRoot( rootName );
	const path = [];

	for ( let token of tokenize( data ) ) {
		if ( token.type == 'text' ) {
			appendTo.appendChildren( new Text( token.text, token.attributes ) );
		} else if ( token.type == 'openingTag' ) {
			let el = new Element( token.name, token.attributes );
			appendTo.appendChildren( el );

			appendTo = el;
			path.push( token.name );
		} else {
			if ( path.pop() != token.name ) {
				throw new Error( 'Parse error - unexpected closing tag.' );
			}

			appendTo = appendTo.parent;
		}
	}

	if ( path.length ) {
		throw new Error( 'Parse error - missing closing tags: ' + path.join( ', ' ) + '.' );
	}
}

// -- getData helpers ---------------------------------------------------------

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

// -- setData helpers ---------------------------------------------------------

const patterns = {
	textTag: /^<\$text ([^>]+)>([\s\S]+?)<\/\$text>/,
	tag: /^<([^>]+)>/,
	text: /^[^<]+/
};
const handlers = {
	textTag( match ) {
		return {
			type: 'text',
			attributes: parseAttributes( match[ 1 ] ),
			text: match[ 2 ]
		};
	},

	tag( match ) {
		const tagContents = match[ 1 ].split( /\s+/ );
		const tagName = tagContents.shift();
		const attrs = tagContents.join( ' ' );

		if ( tagName[ 0 ] == '/' ) {
			return {
				type: 'closingTag',
				name: tagName.slice( 1 )
			};
		}

		return {
			type: 'openingTag',
			name: tagName,
			attributes: parseAttributes( attrs )
		};
	},

	text( match ) {
		return {
			type: 'text',
			text: match[ 0 ]
		};
	}
};

function *tokenize( data ) {
	while ( data ) {
		const consumed = consumeNextToken( data );

		data = consumed.data;
		yield consumed.token;
	}
}

function consumeNextToken( data ) {
	let match;

	for ( let patternName in patterns ) {
		match = data.match( patterns[ patternName ] );

		if ( match ) {
			data = data.slice( match[ 0 ].length );

			return {
				token: handlers[ patternName ]( match ),
				data
			};
		}
	}

	throw new Error( 'Parse error - unpexpected token: ' + data + '.' );
}

function parseAttributes( attrsString  ) {
	if ( !attrsString  ) {
		return {};
	}

	const pattern = /(\w+)=("[^"]+"|[^\s]+)\s*/;
	const attrs = {};

	while ( attrsString ) {
		let match = attrsString.match( pattern );

		if ( !match ) {
			throw new Error( 'Parse error - unexpected token: ' + attrsString + '.' );
		}

		attrs[ match[ 1 ] ] = JSON.parse( match[ 2 ] );
		attrsString = attrsString.slice( match[ 0 ].length );
	}

	return attrs;
}
