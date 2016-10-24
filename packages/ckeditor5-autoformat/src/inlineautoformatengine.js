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

		testClb = testClb || ( ( text ) => {
			let result;
			let remove = [];
			let format = [];

			// First run.
			result = pattern.exec( text );

			// There should be full match and 3 capture groups.
			if ( result.length < 4 ) {
				throw new CKEditorError( 'inlineautoformat-missing-capture-groups: Less than 3 capture groups in regular expression.' );
			}

			do {
				const {
					index: start,
					'1': leftDelimiter,
					'2': content,
					'3': rightDelimiter
				} = result;

				const delStart = [ start,           start + leftDelimiter.length ];
				const delEnd =   [ start + content, start + content.length + rightDelimiter.length ];

				remove.push( delStart );
				remove.push( delEnd );

				format.push( [ start + leftDelimiter.length, start + leftDelimiter.length + content.length ] );
			} while ( ( result = pattern.exec( text ) ) !== null );
		} );

		formatClb = formatClb || ( ( editor, range, batch ) => {
			editor.execute( command, { batch: batch } );
		} );

		editor.document.on( 'change', ( evt, type ) => {
			if ( type !== 'insert' ) {
				return;
			}

			const batch = editor.document.batch();
			const block = editor.document.selection.focus.parent;
			const text = getText( block );

			if ( block.name !== 'paragraph' || !text ) {
				return;
			}

			const ranges = testClb( text );

			// Apply format before deleting text.
			ranges.format.forEach( ( range ) => {
				if ( range[ 0 ] === undefined || range[ 1 ] === undefined ) {
					return;
				}

				const rangeToFormat = Range.createFromParentsAndOffsets(
					block, range[ 0 ],
					block, range[ 1 ]
				);

				const selection = this.editor.document.selection;
				const originalRanges = [ ...selection.getRanges() ];

				editor.document.enqueueChanges( () => {
					selection.setRanges( [ rangeToFormat ] );

					formatClb( this.editor, rangeToFormat, batch );

					selection.setRanges( originalRanges );
				} );
			} );

			// Reverse order of deleted ranges to not mix the positions.
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
