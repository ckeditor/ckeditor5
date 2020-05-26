/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// Overrides the escape() method, enlarging it.
{
	const originalEscape = TurndownService.prototype.escape;
	TurndownService.prototype.escape = function( string ) {
		string = originalEscape( string );

		// Escape "<".
		string = string.replace( /</g, '\\<' );

		return string;
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
