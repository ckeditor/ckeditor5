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

	constructor( editor, testCallback, formatCallback ) {
		this.editor = editor;

		editor.document.on( 'change', ( evt, type ) => {
			if ( type !== 'insert' ) {
				return;
			}

			const batch = editor.document.batch();
			const block = editor.document.selection.focus.parent;
			const text = getText( block );

			if ( block.name !== 'paragraph' ) {
				return;
			}

			const ranges = testCallback( text );

			// Apply format before deleting text.
			ranges.format.forEach( ( range ) => {
				if ( !range || range[ 0 ] === undefined || range[ 1 ] === undefined ) {
					return;
				}

				const rangeToFormat = Range.createFromParentsAndOffsets(
					block, range[ 0 ],
					block, range[ 1 ]
				);

				editor.document.enqueueChanges( () => {
					formatCallback( this.editor, rangeToFormat, batch );
				} );
			} );

			// Reverse order of deleted ranges to not mix the positions.
			ranges.remove.slice().reverse().forEach( ( range ) => {
				if ( !range || range[ 0 ] === undefined || range[ 1 ] === undefined ) {
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
