/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// JSDoc validation fails without the following line for an unknown reason.
/** @module */

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// Overrides the escape() method, enlarging it.
{
	const originalEscape = TurndownService.prototype.escape;
	TurndownService.prototype.escape = function( string ) {
		// Urls should not be escaped. Our strategy is using a regex to find them and escape everything
		// which is out of the matches parts.

		// eslint-disable-next-line max-len
		const regex = /\b(?:https?:\/\/|www\.)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’])/g;

		let escaped = '';
		let lastIndex = 0;
		let m;
		do {
			m = regex.exec( string );

			// The substring should to to the matched index or, if nothing found, the end of the string.
			const index = m ? m.index : string.length;

			// Append the substring between the last match and the current one (if anything).
			if ( index > lastIndex ) {
				escaped += escape( string.substring( lastIndex, index ) );
			}

			// Append the match itself now, if anything.
			m && ( escaped += m[ 0 ] );

			lastIndex = regex.lastIndex;
		}
		while ( m );

		return escaped;

		function escape( string ) {
			string = originalEscape( string );

			// Escape "<".
			string = string.replace( /</g, '\\<' );

			return string;
		}
	};
}

const turndownService = new TurndownService( {
	codeBlockStyle: 'fenced',
	hr: '---',
	headingStyle: 'atx'
} );

turndownService.use( [
	gfm,
	todoList
] );

export default function html2markdown( html ) {
	return turndownService.turndown( html );
}

export { turndownService };

// This is a copy of the original taskListItems rule from turdown-plugin-gfm, with minor changes.
function todoList( turndownService ) {
	turndownService.addRule( 'taskListItems', {
		filter( node ) {
			return node.type === 'checkbox' &&
				// Changes here as CKEditor outputs a deeper structure.
				( node.parentNode.nodeName === 'LI' || node.parentNode.parentNode.nodeName === 'LI' );
		},
		replacement( content, node ) {
			return ( node.checked ? '[x]' : '[ ]' ) + ' ';
		}
	} );
}
