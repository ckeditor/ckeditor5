/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/highlightedtext/highlightedtextview
 */

import View from '../view.js';
import { escape } from 'es-toolkit/compat';

import '../../theme/components/highlightedtext/highlightedtext.css';

/**
 * A class representing a view that displays a text which subset can be highlighted using the
 * {@link #highlightText} method.
 */
export default class HighlightedTextView extends View {
	/**
	 * The text that can be highlighted using the {@link #highlightText} method.
	 *
	 * **Note:** When this property changes, the previous highlighting is removed.
	 *
	 * @observable
	 */
	declare public text: string | undefined;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		this.set( 'text', undefined );

		this.setTemplate( {
			tag: 'span',
			attributes: {
				class: [ 'ck', 'ck-highlighted-text' ]
			}
		} );

		this.on( 'render', () => {
			// Classic setTemplate binding for #text will not work because highlightText() replaces the
			// pre-rendered DOM text node new a new one (and <mark> elements).
			this.on( 'change:text', () => {
				this._updateInnerHTML( this.text );
			} );

			this._updateInnerHTML( this.text );
		} );
	}

	/**
	 * Highlights view's {@link #text} according to the specified `RegExp`. If the passed RegExp is `null`, the
	 * highlighting is removed
	 *
	 * @param regExp
	 */
	public highlightText( regExp: RegExp | null ): void {
		this._updateInnerHTML( markText( this.text || '', regExp ) );
	}

	/**
	 * Updates element's `innerHTML` with the passed content.
	 */
	private _updateInnerHTML( newInnerHTML: string | undefined ) {
		this.element!.innerHTML = newInnerHTML || '';
	}
}

/**
 * Replaces `regExp` occurrences with `<mark>` tags in a text.
 *
 * @param text A text to get marked.
 * @param regExp An optional `RegExp`. If not passed, this is a pass-through function.
 * @returns A text with `RegExp` occurrences marked by `<mark>`.
 */
function markText( text: string, regExp?: RegExp | null ) {
	if ( !regExp ) {
		return escape( text );
	}

	const textParts: Array<{ text: string; isMatch: boolean }> = [];
	let lastMatchEnd = 0;
	let matchInfo = regExp.exec( text );

	// Iterate over all matches and create an array of text parts. The idea is to mark which parts are query matches
	// so that later on they can be highlighted.
	while ( matchInfo !== null ) {
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
		matchInfo = regExp.exec( text );
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
