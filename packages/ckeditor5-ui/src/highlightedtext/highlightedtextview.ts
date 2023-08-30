/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
*/

import View from '../view';
import { escape } from 'lodash-es';

import '../../theme/components/highlightedtext/highlightedtext.css';

/**
 * TODO
 */
export default class HighlightedTextView extends View {
	/**
	 * TODO
	 */
	private _text: string;

	/**
	 * TODO
	 *
	 * @param text
	 */
	constructor( text: string ) {
		super();

		this._text = text;

		this.setTemplate( {
			tag: 'span',
			attributes: {
				class: [ 'ck', 'ck-highlighted-text' ]
			},
			children: [
				text
			]
		} );
	}

	/**
	 * TODO
	 *
	 * @param regExp
	 */
	public highlightText( regExp: RegExp | null ): void {
		this.element!.innerHTML = markText( this._text, regExp );
	}
}

// Replaces RegExp occurrences with <mark> tags in a text.
//
// @param text A text to get marked.
// @param [regExp] An optional RegExp. If not passed, this is a pass-through function.
// @returns A text with RegExp occurrences marked by <mark>.
function markText( text: string, regExp: RegExp | null ) {
	if ( !regExp ) {
		return escape( text );
	}

	const textParts: Array<{ text: string; isMatch: boolean }> = [];
	let lastMatchEnd = 0;
	let matchInfo;

	// Iterate over all matches and create an array of text parts. The idea is to mark which parts are query matches
	// so that later on they can be highlighted.
	while ( ( matchInfo = regExp.exec( text ) ) !== null ) {
		const curMatchStart = matchInfo.index;
		// Detect if there was something between last match and this one.
		if ( curMatchStart !== lastMatchEnd ) {
			textParts.push( {
				text: text.substring( lastMatchEnd, curMatchStart ),
				isMatch: false
			} );
		}

		textParts.push( {
			text: matchInfo[ 0 ],
			isMatch: true
		} );

		lastMatchEnd = regExp.lastIndex;
	}

	// Your match might not be the last part of a string. Be sure to add any plain text following the last match.
	if ( lastMatchEnd !== text.length ) {
		textParts.push( {
			text: text.substring( lastMatchEnd ),
			isMatch: false
		} );
	}

	const outputHtml = textParts
		// The entire text should be escaped.
		.map( part => {
			part.text = escape( part.text );
			return part;
		} )
		// Only matched text should be wrapped with HTML mark element.
		.map( part => part.isMatch ? `<mark>${ part.text }</mark>` : part.text )
		.join( '' );

	return outputHtml;
}
