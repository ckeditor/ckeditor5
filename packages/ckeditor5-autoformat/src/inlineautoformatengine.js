/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/range.js';
import CKEditorError from '../utils/ckeditorerror.js';

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
	 *  * {core.editor.Editor} Editor instance,
	 *  * {engine.model.Range} Range of matched text to format,
	 *  * {engine.model.Batch} Batch to group format operations.
	 */
	constructor( editor, testCallbackOrPattern, formatCallbackOrCommand ) {
		this.editor = editor;

		let pattern;
		let command;
		let testClb;
		let formatClb;

		if ( typeof testCallbackOrPattern == 'string' ) {
			pattern = new RegExp( testCallbackOrPattern );
		} else if ( testCallbackOrPattern instanceof RegExp ) {
			pattern = testCallbackOrPattern;
		} else {
			testClb = testCallbackOrPattern;
		}

		if ( typeof formatCallbackOrCommand == 'string' ) {
			command = formatCallbackOrCommand;
		} else {
			formatClb = formatCallbackOrCommand;
		}

		// Callback to run on changed text.
		testClb = testClb || ( ( text ) => {
			let result;
			let remove = [];
			let format = [];

			if ( !text ) {
				return;
			}

			while ( ( result = pattern.exec( text ) ) !== null ) {
				// If nothing matched, stop early.
				if ( !result ) {
					return;
				}

				// There should be full match and 3 capture groups.
				if ( result && result.length < 4 ) {
					throw new CKEditorError( 'inlineautoformat-missing-capture-groups: Less than 3 capture groups in regular expression.' );
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

		// Format callback to run on matched text.
		formatClb = formatClb || ( ( editor, range, batch ) => {
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

			const ranges = testClb( text );

			if ( !ranges ) {
				return;
			}

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

				// formatClb executes command that has its own enqueueChanges block.
				formatClb( this.editor, rangeToFormat, batch );

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

function getText( element ) {
	let text = '';

	for ( let child of element.getChildren() ) {
		if ( child.data ) {
			text += child.data;
		} else if ( child.name ) {
			text += getText( child );
		}
	}

	return text;
}
