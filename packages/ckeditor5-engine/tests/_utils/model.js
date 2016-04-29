/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeWalker from '/ckeditor5/engine/treemodel/treewalker.js';
import Range from '/ckeditor5/engine/treemodel/range.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import Text from '/ckeditor5/engine/treemodel/text.js';
import RootElement from '/ckeditor5/engine/treemodel/rootelement.js';
import Element from '/ckeditor5/engine/treemodel/element.js';
import DocumentFragment from '/ckeditor5/engine/treemodel/documentfragment.js';
import Selection from '/ckeditor5/engine/treemodel/selection.js';

export function stringify( root, selectionOrPositionOrRange ) {
	let selection;
	let document;

	if ( root instanceof RootElement ) {
		document = root.document;
	} else if ( root instanceof Element || root instanceof Text ) {
		// If root is Element or Text - wrap it with DocumentFragment.
		root = new DocumentFragment( root );
	}

	const walker = new TreeWalker( {
		boundaries: Range.createFromElement( root )
	} );

	if ( selectionOrPositionOrRange instanceof Selection ) {
		selection = selectionOrPositionOrRange;
	} else if ( selectionOrPositionOrRange instanceof Range ) {
		selection = new Selection( document || new Document() );
		selection.addRange( selectionOrPositionOrRange );
	} else if ( selectionOrPositionOrRange instanceof Position ) {
		selection = new Selection( document || new Document() );
		selection.addRange( new Range( selectionOrPositionOrRange, selectionOrPositionOrRange ) );
	}

	let ret = '';
	let lastPosition = Position.createFromParentAndOffset( root, 0 );
	const withSelection = !!selection;

	for ( let value of walker ) {
		if ( withSelection ) {
			ret += writeSelection( value.previousPosition, selection );
		}

		ret += writeItem( value, selection, { selection: withSelection } );

		lastPosition = value.nextPosition;
	}

	if ( withSelection ) {
		ret += writeSelection( lastPosition, selection );
	}

	return ret;
}

/**
 * Writes the contents of the document to an HTML-like string.
 *
 * @param {engine.treeModel.Document} document
 * @param {String} rootName
 * @param {Object} [options]
 * @param {Boolean} [options.selection] Whether to write the selection.
 * @returns {String} The stringified data.
 */
export function getData( document, rootName, options ) {
	options = options || {};
	const root = document.getRoot( rootName );

	if ( options.selection ) {
		return stringify( root, document.selection );
	} else {
		return stringify( root );
	}
}

/**
 * Sets the contents of the model and the selection in it.
 *
 * @param {engine.treeModel.Document} document
 * @param {String} rootName
 * @param {String} data
 */
export function setData( document, rootName, data ) {
	let appendTo = document.getRoot( rootName );
	const path = [];
	let selectionStart, selectionEnd, selectionAttributes, textAttributes;

	const handlers = {
		text( token ) {
			appendTo.appendChildren( new Text( token.text, textAttributes ) );
		},

		textStart( token ) {
			textAttributes = token.attributes;
			path.push( '$text' );
		},

		textEnd() {
			if ( path.pop() != '$text' ) {
				throw new Error( 'Parse error - unexpected closing tag.' );
			}

			textAttributes = null;
		},

		openingTag( token ) {
			let el = new Element( token.name, token.attributes );
			appendTo.appendChildren( el );

			appendTo = el;

			path.push( token.name );
		},

		closingTag( token ) {
			if ( path.pop() != token.name ) {
				throw new Error( 'Parse error - unexpected closing tag.' );
			}

			appendTo = appendTo.parent;
		},

		collapsedSelection( token ) {
			document.selection.collapse( appendTo, 'END' );
			document.selection.setAttributesTo( token.attributes );
		},

		selectionStart( token ) {
			selectionStart = Position.createFromParentAndOffset( appendTo, appendTo.getChildCount() );
			selectionAttributes = token.attributes;
		},

		selectionEnd() {
			if ( !selectionStart ) {
				throw new Error( 'Parse error - missing selection start' );
			}

			selectionEnd = Position.createFromParentAndOffset( appendTo, appendTo.getChildCount() );

			document.selection.setRanges(
				[ new Range( selectionStart, selectionEnd ) ],
				selectionAttributes.backward
			);

			delete selectionAttributes.backward;

			document.selection.setAttributesTo( selectionAttributes );
		}
	};

	for ( let token of tokenize( data ) ) {
		handlers[ token.type ]( token );
	}

	if ( path.length ) {
		throw new Error( 'Parse error - missing closing tags: ' + path.join( ', ' ) + '.' );
	}

	if ( selectionStart && !selectionEnd ) {
		throw new Error( 'Parse error - missing selection end.' );
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
	selection: /^<(\/?selection)( [^>]*)?>/,
	tag: /^<([^>]+)>/,
	text: /^[^<]+/
};

const handlers = {
	selection( match ) {
		const tagName = match[ 1 ];
		const tagExtension = match[ 2 ] || '';

		if ( tagName[ 0 ] == '/' ) {
			return {
				type: 'selectionEnd'
			};
		}

		if ( tagExtension.endsWith( ' /' ) ) {
			return {
				type: 'collapsedSelection',
				attributes: parseAttributes( tagExtension.slice( 1, -2 ) )
			};
		}

		return {
			type: 'selectionStart',
			attributes: parseAttributes( tagExtension.slice( 1 ) )
		};
	},

	tag( match ) {
		const tagContents = match[ 1 ].split( /\s+/ );
		const tagName = tagContents.shift();
		const attrs = tagContents.join( ' ' );

		if ( tagName == '/$text' ) {
			return {
				type: 'textEnd'
			};
		}

		if ( tagName == '$text' ) {
			return {
				type: 'textStart',
				attributes: parseAttributes( attrs )
			};
		}

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

function parseAttributes( attrsString ) {
	attrsString = attrsString.trim();

	if ( !attrsString  ) {
		return {};
	}

	const pattern = /(?:backward|(\w+)=("[^"]+"|[^\s]+))\s*/;
	const attrs = {};

	while ( attrsString ) {
		let match = attrsString.match( pattern );

		if ( !match ) {
			throw new Error( 'Parse error - unexpected token: ' + attrsString + '.' );
		}

		if ( match[ 0 ].trim() == 'backward' ) {
			attrs.backward = true;
		} else {
			attrs[ match[ 1 ] ] = JSON.parse( match[ 2 ] );
		}

		attrsString = attrsString.slice( match[ 0 ].length );
	}

	return attrs;
}
