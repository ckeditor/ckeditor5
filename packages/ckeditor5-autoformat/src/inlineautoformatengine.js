/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/liverange.js';
import getSchemaValidRanges from '../core/command/helpers/getschemavalidranges.js';

/**
 * A paragraph feature for editor.
 * Introduces `<paragraph>` element in the model which renders as `<p>` in the DOM and data.
 *
 * @memberOf paragraph
 * @extends ckeditor5.Feature
 */
export default class InlineAutoformatEngine {
	/**
	 * Assigns to `editor` to watch for pattern (either by executing that pattern or passing the text to `testCallbackOrPattern` callback).
	 * It formats found text by executing command `formatCallbackOrCommand` or by running `formatCallbackOrCommand` format callback.
	 *
	 * @param {core.editor.Editor} editor Editor instance.
	 * @param {Function|RegExp} testRegexpOrCallback RegExp to execute on text or test callback returning Object with offsets to
	 * remove and offsets to format.
	 *  * Format is applied before deletion,
	 *	* RegExp literal *must* have 3 capture groups.
	 *
	 * Example of object that should be returned from test callback.
	 *
	 *	{
	 *		remove: [
	 *			[ 0, 1 ],
	 *			[ 5, 6 ]
	 *		],
	 *		format: [
	 *			[ 1, 5 ]
	 *		],
	 *	}
	 *
	 * @param {Function|String} formatCallbackOrCommand Name of command to execute on matched text or format callback.
	 * Format callback gets following parameters:
	 *  1. {core.editor.Editor} Editor instance,
	 *  2. {engine.model.Range} Range of matched text to format,
	 *  3. {engine.model.Batch} Batch to group format operations.
	 */
	constructor( editor, testRegexpOrCallback, formatCallbackOrCommand ) {
		this.editor = editor;

		let pattern;
		let command;
		let testCallback;
		let formatCallback;

		if ( testRegexpOrCallback instanceof RegExp ) {
			pattern = testRegexpOrCallback;
		} else {
			testCallback = testRegexpOrCallback;
		}

		if ( typeof formatCallbackOrCommand == 'string' ) {
			command = formatCallbackOrCommand;
		} else {
			formatCallback = formatCallbackOrCommand;
		}

		// A test callback run on changed text.
		testCallback = testCallback || ( ( text ) => {
			let result;
			let remove = [];
			let format = [];

			while ( ( result = pattern.exec( text ) ) !== null ) {
				// There should be full match and 3 capture groups.
				if ( result && result.length < 4 ) {
					break;
				}

				console.log( result );
				const {
					index,
					'1': leftDel,
					'2': content,
					'3': rightDel
				} = result;

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

			if ( !selection.isCollapsed || !selection.focus || !selection.focus.textNode ) {
				return;
			}

			const textNode = selection.focus.textNode;
			const text = textNode.data.slice( 0, selection.focus.offset + 1 );
			const block = textNode.parent;

			const ranges = testCallback( text );
			const rangesToFormat = [];

			// Apply format before deleting text.
			ranges.format.forEach( ( range ) => {
				if ( range[ 0 ] === undefined || range[ 1 ] === undefined ) {
					return;
				}
				rangesToFormat.push( Range.createFromParentsAndOffsets(
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

				rangesToRemove.push( Range.createFromParentsAndOffsets(
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
