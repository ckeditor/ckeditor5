/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module autoformat/inlineautoformatengine
 */

import LiveRange from '@ckeditor/ckeditor5-engine/src/model/liverange';

/**
 * The inline autoformatting engine. It allows to format various inline patterns. For example,
 * it can be configured to make "foo" bold when typed `**foo**` (the `**` markers will be removed).
 *
 * The autoformatting operation is integrated with the undo manager,
 * so the autoformatting step can be undone if the user's intention was not to format the text.
 *
 * See the constructors documentation to learn how to create custom inline autoformatters. You can also use
 * the {@link module:autoformat/autoformat~Autoformat} feature which enables a set of default autoformatters
 * (lists, headings, bold and italic).
 */
export default class InlineAutoformatEngine {
	/**
	 * Enables autoformatting mechanism for a given {@link module:core/editor/editor~Editor}.
	 *
	 * It formats the matched text by applying the given model attribute or by running the provided formatting callback.
	 * On every change applied to the model the autoformatting engine checks the text on the left of the selection
	 * and executes the provided action if the text matches given criteria (regular expression or callback).
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {Function|RegExp} testRegexpOrCallback The regular expression or callback to execute on text.
	 * Provided regular expression *must* have three capture groups. The first and the third capture group
	 * should match opening and closing delimiters. The second capture group should match the text to format.
	 *
	 *		// Matches the `**bold text**` pattern.
	 *		// There are three capturing groups:
	 *		// - The first to match the starting `**` delimiter.
	 *		// - The second to match the text to format.
	 *		// - The third to match the ending `**` delimiter.
	 *		new InlineAutoformatEngine( editor, /(\*\*)([^\*]+?)(\*\*)$/g, 'bold' );
	 *
	 * When a function is provided instead of the regular expression, it will be executed with the text to match as a parameter.
	 * The function should return proper "ranges" to delete and format.
	 *
	 *		{
	 *			remove: [
	 *				[ 0, 1 ],	// Remove the first letter from the given text.
	 *				[ 5, 6 ]	// Remove the 6th letter from the given text.
	 *			],
	 *			format: [
	 *				[ 1, 5 ]	// Format all letters from 2nd to 5th.
	 *			]
	 *		}
	 *
	 * @param {Function|String} attributeOrCallback The name of attribute to apply on matching text or a callback for manual
	 * formatting.
	 *
	 *		// Use attribute name:
	 *		new InlineAutoformatEngine( editor, /(\*\*)([^\*]+?)(\*\*)$/g, 'bold' );
	 *
	 *		// Use formatting callback:
	 *		new InlineAutoformatEngine( editor, /(\*\*)([^\*]+?)(\*\*)$/g, ( batch, validRanges ) => {
	 *			for ( let range of validRanges ) {
	 *				batch.setAttribute( range, command, true );
	 *			}
	 *		} );
	 */
	constructor( editor, testRegexpOrCallback, attributeOrCallback ) {
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
		testCallback = testCallback || ( text => {
			let result;
			const remove = [];
			const format = [];

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
			for ( const range of validRanges ) {
				batch.setAttribute( range, command, true );
			}
		} );

		editor.document.on( 'change', ( evt, type, changes, batch ) => {
			if ( batch.type == 'transparent' ) {
				return;
			}

			if ( type !== 'insert' ) {
				return;
			}

			const selection = editor.document.selection;

			if ( !selection.isCollapsed || !selection.focus || !selection.focus.parent ) {
				return;
			}

			const block = selection.focus.parent;
			const text = getText( block ).slice( 0, selection.focus.offset );
			const ranges = testCallback( text );
			const rangesToFormat = [];

			// Apply format before deleting text.
			ranges.format.forEach( range => {
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
			ranges.remove.slice().reverse().forEach( range => {
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

			editor.document.enqueueChanges( () => {
				// Create new batch to separate typing batch from the Autoformat changes.
				const fixBatch = editor.document.batch();

				const validRanges = editor.document.schema.getValidRanges( rangesToFormat, command );

				// Apply format.
				formatCallback( fixBatch, validRanges );

				// Remove delimiters.
				for ( const range of rangesToRemove ) {
					fixBatch.remove( range );
				}
			} );
		} );
	}
}

// Returns whole text from parent element by adding all data from text nodes together.
//
// @private
// @param {module:engine/model/element~Element} element
// @returns {String}
function getText( element ) {
	return Array.from( element.getChildren() ).reduce( ( a, b ) => a + b.data, '' );
}
