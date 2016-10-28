/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/range.js';

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
		formatCallback = formatCallback || ( ( editor, options ) => {
			editor.execute( command, options );
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

			if ( rangesToFormat.length === 0 ) {
				return;
			}

			const batch = editor.document.batch();
			editor.document.enqueueChanges( () => {
				selection.setRanges( rangesToFormat );
			} );

			formatCallback( this.editor, { batch } );

			editor.document.enqueueChanges( () => {
				selection.collapseToEnd();
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
