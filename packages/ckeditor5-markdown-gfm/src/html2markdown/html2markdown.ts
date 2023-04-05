/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module markdown-gfm/html2markdown/html2markdown
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

// Importing types for this package is problematic, so it's omitted.
// @ts-ignore
import TurndownService from 'turndown';

// There no avaialble types for 'turndown-plugin-gfm' module and it's not worth to generate them on our own.
// @ts-ignore
import { gfm } from 'turndown-plugin-gfm';

// Override the original escape method by not escaping links.
const originalEscape = TurndownService.prototype.escape;

function escape( string: string ): string {
	string = originalEscape( string );

	// Escape "<".
	string = string.replace( /</g, '\\<' );

	return string;
}

TurndownService.prototype.escape = function( string: string ): string {
	// Urls should not be escaped. Our strategy is using a regex to find them and escape everything
	// which is out of the matches parts.

	let escaped = '';
	let lastLinkEnd = 0;

	for ( const match of matchAutolink( string ) ) {
		const index = match.index!;

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
 */
export default function html2markdown( html: string ): string {
	return turndownService.turndown( html );
}

export { turndownService };

// This is a copy of the original taskListItems rule from turdown-plugin-gfm, with minor changes.
function todoList( turndownService: TurndownService ): void {
	turndownService.addRule( 'taskListItems', {
		filter( node: any ) {
			return node.type === 'checkbox' &&
				// Changes here as CKEditor outputs a deeper structure.
				( node.parentNode.nodeName === 'LI' || node.parentNode.parentNode.nodeName === 'LI' );
		},
		replacement( content: any, node: any ) {
			return ( node.checked ? '[x]' : '[ ]' ) + ' ';
		}
	} );
}

// Autolink matcher.
const regex = new RegExp(
	// Prefix.
	/\b(?:(?:https?|ftp):\/\/|www\.)/.source +

	// Domain name.
	/(?![-_])(?:[-_a-z0-9\u00a1-\uffff]{1,63}\.)+(?:[a-z\u00a1-\uffff]{2,63})/.source +

	// The rest.
	/(?:[^\s<>]*)/.source,
	'gi'
);

/**
 * Trimming end of link.
 * https://github.github.com/gfm/#autolinks-extension-
 */
function* matchAutolink( string: string ) {
	for ( const match of string.matchAll( regex ) ) {
		const matched = match[ 0 ];
		const length = autolinkFindEnd( matched );

		yield Object.assign(
			[ matched.substring( 0, length ) ],
			{ index: match.index }
		);

		// We could adjust regex.lastIndex but it's not needed because what we skipped is for sure not a valid URL.
	}
}

/**
 * Returns the new length of the link (after it would trim trailing characters).
 */
function autolinkFindEnd( string: string ) {
	let length = string.length;

	while ( length > 0 ) {
		const char = string[ length - 1 ];

		if ( '?!.,:*_~\'"'.includes( char ) ) {
			length--;
		} else if ( char == ')' ) {
			let openBrackets = 0;

			for ( let i = 0; i < length; i++ ) {
				if ( string[ i ] == '(' ) {
					openBrackets++;
				} else if ( string[ i ] == ')' ) {
					openBrackets--;
				}
			}

			// If there is fewer opening brackets then closing ones we should remove a closing bracket.
			if ( openBrackets < 0 ) {
				length--;
			} else {
				break;
			}
		} else {
			break;
		}
	}

	return length;
}
