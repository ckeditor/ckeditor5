/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BlockAutoformatEngine from './blockautoformatengine.js';
import InlineAutoformatEngine from './inlineautoformatengine.js';
import Feature from '../core/feature.js';
import HeadingEngine from '../heading/headingengine.js';
import ListEngine from '../list/listengine.js';
import BoldEngine from '../basic-styles/boldengine.js';
import ItalicEngine from '../basic-styles/italicengine.js';

/**
 * Includes set of predefined Autoformatting actions:
 * * Bulleted list,
 * * Numbered list,
 * * Headings.
 *
 * @memberOf autoformat
 * @extends core.Feature
 */
export default class Autoformat extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HeadingEngine, ListEngine, BoldEngine, ItalicEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._addListAutoformats();
		this._addHeadingAutoformats();
		this._addInlineAutoformats();
	}

	/**
	 * Adds autoformats related to ListEngine commands.
	 *
	 * When typed:
	 *
	 * 	`* ` or `- `
	 *		Paragraph will be changed to a bulleted list.
	 *
	 * 	`1. ` or `1) `
	 *		Paragraph will be changed to a numbered list (1 can be any digit or list of digits).
	 *
	 * @private
	 */
	_addListAutoformats() {
		new BlockAutoformatEngine( this.editor, /^[\*\-]\s$/, 'bulletedList' );
		new BlockAutoformatEngine( this.editor, /^\d+[\.|)]?\s$/, 'numberedList' );
	}

	/**
	 * Adds autoformats related to HeadingEngine commands.
	 *
	 * When typed:
	 *
	 * 	`#` or `##` or `###`
	 *		Paragraph will be changed to a corresponding heading level.
	 *
	 * @private
	 */
	_addHeadingAutoformats() {
		new BlockAutoformatEngine( this.editor, /^(#{1,3})\s$/, ( context ) => {
			const { batch, match } = context;
			const headingLevel = match[ 1 ].length;

			this.editor.execute( 'heading', {
				batch,
				formatId: `heading${ headingLevel }`
			} );
		} );
	}

	/**
	 * Adds inline autoformatting capabilities to the editor.
	 *
	 * When typed:
	 *
	 *	`**foobar**`
	 *		The `**` characters are removed, and `foobar` is set to bold.
	 *	`*foobar*`
	 *		The `*` characters are removed, and `foobar` is set to italic.
	 *
	 * @private
	 */
	_addInlineAutoformats() {
		// Bold text between `**`, e.g. `**text to bold**`.
		new InlineAutoformatEngine( this.editor, /(\*\*)(.+?)(\*\*)/g, 'bold' );

		// Italicize text between `*`, e.g. `*text to italicize*`.
		// Slightly more complicated because if the clashing with the Bold autoformat.
		// Won't work for text shorter than 3 characters.
		new InlineAutoformatEngine(
			this.editor,
			( text ) => {
				// For a text: 'Brown *fox* jumps over the lazy dog' the expression below will return following values:
				//
				// 	[0]: ' *fox* ',
				// 	[1]: ' ',
				// 	[2]: '*fox*',
				// 	[index]: 5
				//
				// Value at index 1 is a "prefix". It can be empty, if the matched word is at the
				// beginning of the line. Length of the prefix is used to calculate `start` index.
				const pattern = /([^\*]|^)(\*[^\*].+?[^\*]\*)(?:[^\*]|$)/g;

				let result;
				let remove = [];
				let format = [];

				while ( ( result = pattern.exec( text ) ) !== null ) {
					// Add "prefix" match length.
					const start = result.index + result[ 1 ].length;
					const fullMatchLen = result[ 2 ].length;
					const delimiterLen = 1; // Length of '*'.

					const delStart = [
						start,
						start + delimiterLen
					];
					const delEnd = [
						start + fullMatchLen - delimiterLen,
						start + fullMatchLen
					];

					remove.push( delStart );
					remove.push( delEnd );

					// Calculation of offsets after deletion is not needed.
					format.push( [ start + delimiterLen, start + fullMatchLen - delimiterLen ] );
				}

				return {
					remove,
					format
				};
			},
			( editor, range, batch ) => {
				this.editor.execute( 'italic', { batch, forceValue: true } );
			}
		);
	}
}
