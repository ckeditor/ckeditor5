/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LiveRange from '../engine/model/liverange.js';
import getSchemaValidRanges from '../core/command/helpers/getschemavalidranges.js';

/**
 * The inline autoformatting engine. Allows to format various inline patterns. For example,
 * it can be configured to make "foo" bold when typed `**foo**` (the `**` markers will be removed).
 *
 * The autoformatting operation is integrated with the undo manager,
 * so the autoformatting step can be undone, if the user's intention wasn't to format the text.
 *
 * See the constructors documentation to learn how to create custom inline autoformatters. You can also use
 * the {@link autoformat.Autoformat} feature which enables a set of default autoformatters (lists, headings, bold and italic).
 *
 * @memberOf autoformat
 */
export default class InlineAutoformatEngine {
	/**
	 * Enables autoformatting mechanism on a given {@link core.editor.Editor}.
	 *
	 * It formats the matched text by applying given model attribute or by running the provided formatting callback.
	 * Each time data model changes text from given node (from the beginning of the current node to the collapsed
	 * selection location) will be tested.
	 *
	 * @param {core.editor.Editor} editor Editor instance.
	 * @param {Function|RegExp} testRegexpOrCallback RegExp or callback to execute on text.
	 * Provided RegExp *must* have three capture groups. First and third capture groups
	 * should match opening/closing delimiters. Second capture group should match text to format.
	 *
	 *		// Matches `**bold text**` pattern.
	 *		// There are three capturing groups:
	 *		// - first to match starting `**` delimiter,
	 *		// - second to match text to format,
	 *		// - third to match ending `**` delimiter.
	 *		new InlineAutoformatEngine( this.editor, /(\*\*)([^\*]+?)(\*\*)$/g, 'bold' );
	 *
	 * When function is provided instead of RegExp, it will be executed with text to match as a parameter. Function
	 * should return proper "ranges" to delete and format.
	 *
	 *		{
	 *			remove: [
	 *				[ 0, 1 ],	// Remove first letter from the given text.
	 *				[ 5, 6 ]	// Remove 6th letter from the given text.
	 *			],
	 *			format: [
	 *				[ 1, 5 ]	// Format all letters from 2nd to 5th.
	 *			]
	 *		}
	 *
	 * @param {Function|String} attributeOrCallback Name of attribute to apply on matching text or callback for manual
	 * formatting.
	 *
	 *		// Use attribute name:
	 *		new InlineAutoformatEngine( this.editor, /(\*\*)([^\*]+?)(\*\*)$/g, 'bold' );
	 *
	 *		// Use formatting callback:
	 *		new InlineAutoformatEngine( this.editor, /(\*\*)([^\*]+?)(\*\*)$/g, ( batch, validRanges ) => {
	 *			for ( let range of validRanges ) {
	 *				batch.setAttribute( range, command, true );
	 *			}
	 *		} );
	 */
	constructor( editor, testRegexpOrCallback, attributeOrCallback ) {
		this.editor = editor;

		let regExp;
		let command;
		let testCallback;
		let formatCallback;

		if ( testRegexpOrCallback instanceof RegExp ) {
			regExp = testRegexpOrCallback;
		} else {
			testCallback = testRegexpOrCallback;
		}

		if ( typeof attributeOrCallback == 'string' ) {
			command = attributeOrCallback;
		} else {
			formatCallback = attributeOrCallback;
		}

		// A test callback run on changed text.
		testCallback = testCallback || ( ( text ) => {
			let result;
			let remove = [];
			let format = [];

			while ( ( result = regExp.exec( text ) ) !== null ) {
				// There should be full match and 3 capture groups.
				if ( result && result.length < 4 ) {
					break;
				}

				let {
					index,
					'1': leftDel,
					'2': content,
					'3': rightDel
				} = result;

				// Real matched string - there might be some non-capturing groups so we need to recalculate starting index.
				const found = leftDel + content + rightDel;
				index += result[ 0 ].length - found.length;

				// Start and End offsets of delimiters to remove.
				const delStart = [
					index,
					index + leftDel.length
				];
				const delEnd = [
					index + leftDel.length + content.length,
					index + leftDel.length + content.length + rightDel.length
				];

				remove.push( delStart );
				remove.push( delEnd );

				format.push( [ index + leftDel.length, index + leftDel.length + content.length ] );
			}

			return {
				remove,
				format
			};
		} );

		// A format callback run on matched text.
		formatCallback = formatCallback || ( ( batch, validRanges ) => {
			for ( let range of validRanges ) {
				batch.setAttribute( range, command, true );
			}
		} );

		editor.document.on( 'change', ( evt, type ) => {
			if ( type !== 'insert' ) {
				return;
			}

			const selection = this.editor.document.selection;

			if ( !selection.isCollapsed || !selection.focus || !selection.focus.parent ) {
				return;
			}

			const block = selection.focus.parent;
			const text = getText( block ).slice( 0, selection.focus.offset + 1 );
			const ranges = testCallback( text );
			const rangesToFormat = [];

			// Apply format before deleting text.
			ranges.format.forEach( ( range ) => {
				if ( range[ 0 ] === undefined || range[ 1 ] === undefined ) {
					return;
				}

				rangesToFormat.push( LiveRange.createFromParentsAndOffsets(
					block, range[ 0 ],
					block, range[ 1 ]
				) );
			} );

			const rangesToRemove = [];

			// Reverse order to not mix the offsets while removing.
			ranges.remove.slice().reverse().forEach( ( range ) => {
				if ( range[ 0 ] === undefined || range[ 1 ] === undefined ) {
					return;
				}

				rangesToRemove.push( LiveRange.createFromParentsAndOffsets(
					block, range[ 0 ],
					block, range[ 1 ]
				) );
			} );

			if ( !( rangesToFormat.length && rangesToRemove.length ) ) {
				return;
			}

			const batch = editor.document.batch();

			editor.document.enqueueChanges( () => {
				const validRanges = getSchemaValidRanges( command, rangesToFormat, editor.document.schema );

				// Apply format.
				formatCallback( batch, validRanges );

				// Remove delimiters.
				for ( let range of rangesToRemove ) {
					batch.remove( range );
				}
			} );
		} );
	}
}

// Returns whole text from parent element by adding all data from text nodes together.
//
// @private
// @param {engine.model.Element} element
// @returns {String}
function getText( element ) {
	return Array.from( element.getChildren() ).reduce( ( a, b ) => a + b.data, '' );
}
