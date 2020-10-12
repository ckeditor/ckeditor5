/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module markdown-gfm/html2markdown
 */

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// Override the original escape method by not escaping links.
const originalEscape = TurndownService.prototype.escape;

function escape( string ) {
	string = originalEscape( string );

	// Escape "<".
	string = string.replace( /</g, '\\<' );

	return string;
}

// eslint-disable-next-line max-len
const regex = /\b(?:https?:\/\/|www\.)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’])/g;

TurndownService.prototype.escape = function( string ) {
	// Urls should not be escaped. Our strategy is using a regex to find them and escape everything
	// which is out of the matches parts.

	let escaped = '';
	let lastLinkEnd = 0;

	for ( const match of string.matchAll( regex ) ) {
		const index = match.index;

		// Append the substring between the last match and the current one (if anything).
		if ( index > lastLinkEnd ) {
			escaped += escape( string.substring( lastLinkEnd, index ) );
		}

		const matchedURL = match[ 0 ];

		escaped += matchedURL;

		lastLinkEnd = index + matchedURL.length;
	}

	// Add text after the last link or at the string start if no matches.
	if ( lastLinkEnd < string.length ) {
		escaped += escape( string.substring( lastLinkEnd, string.length ) );
	}

	return escaped;
};

const turndownService = new TurndownService( {
	codeBlockStyle: 'fenced',
	hr: '---',
	headingStyle: 'atx'
} );

turndownService.use( [
	gfm,
	todoList
] );

/**
 * Parses HTML to a markdown.
 *
 * @param {String} html
 * @returns {String}
 */
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
