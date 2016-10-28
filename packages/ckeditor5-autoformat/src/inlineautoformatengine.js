/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/range.js';
import TreeWalker from '../engine/model/treewalker.js';

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
	 * @param {Function|RegExp} testCallbackOrPattern RegExp literal to execute on text or test callback returning Object with offsets to
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
	constructor( editor, testCallbackOrPattern, formatCallbackOrCommand ) {
		this.editor = editor;

		let pattern;
		let command;
		let testCallback;
		let formatCallback;

		if ( typeof testCallbackOrPattern == 'string' ) {
			pattern = new RegExp( testCallbackOrPattern, 'g' );
		} else if ( testCallbackOrPattern instanceof RegExp ) {
			pattern = testCallbackOrPattern;
		} else {
			testCallback = testCallbackOrPattern;
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
		formatCallback = formatCallback || ( ( editor, range, batch ) => {
			editor.execute( command, { batch: batch } );
		} );

		editor.document.on( 'change', ( evt, type ) => {
			if ( type !== 'insert' ) {
				return;
			}

			const batch = editor.document.batch();
			const selection = this.editor.document.selection;
			const block = selection.focus.parent;
			const text = getText( block );

			if ( block.name !== 'paragraph' || !text ) {
				return;
			}

			const ranges = testCallback( text );

			// Apply format before deleting text.
			ranges.format.forEach( ( range ) => {
				if ( range[ 0 ] === undefined || range[ 1 ] === undefined ) {
					return;
				}

				const rangeToFormat = Range.createFromParentsAndOffsets(
					block, range[ 0 ],
					block, range[ 1 ]
				);

				editor.document.enqueueChanges( () => {
					selection.setRanges( [ rangeToFormat ] );
				} );

				// No `enqueueChanges()` here. The formatCallback executes command that has its own enqueueChanges block.
				formatCallback( this.editor, rangeToFormat, batch );

				editor.document.enqueueChanges( () => {
					selection.collapseToEnd();
				} );
			} );

			// Reverse order to not mix the offsets while removing.
			ranges.remove.slice().reverse().forEach( ( range ) => {
				if ( range[ 0 ] === undefined || range[ 1 ] === undefined ) {
					return;
				}

				const rangeToDelete = Range.createFromParentsAndOffsets(
					block, range[ 0 ],
					block, range[ 1 ]
				);

				editor.document.enqueueChanges( () => {
					batch.remove( rangeToDelete );
				} );
			} );
		} );
	}
}

// Gets whole text from provided element.
//
// @private
// @param {engine.model.Element} element
// @returns {String}
function getText( element ) {
	let text = '';
	const walker = new TreeWalker( {
		boundaries: Range.createIn( element )
	} );

	for ( let value of walker ) {
		text += value.type == 'text' ? value.item.data : '';
	}

	return text;
}
