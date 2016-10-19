/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/range.js';
import RootElement from '../engine/model/rootelement.js';

/**
 * A paragraph feature for editor.
 * Introduces `<paragraph>` element in the model which renders as `<p>` in the DOM and data.
 *
 * @memberOf paragraph
 * @extends ckeditor5.Feature
 */
export default class InlineAutoformatEngine {

	constructor( editor, pattern, command, delimiterLen ) {
		this.editor = editor;
		const doc = editor.document;

		// Listen to model changes and add attributes.
		editor.document.on( 'change', ( evt, type, data ) => {
			if ( type === 'insert' ) {
				const insertPosition = data.range.start;
				const insertBlock = findTopmostBlock( insertPosition );

				applyAttributes( insertBlock );
			} else
			if ( type === 'remove' ) {
				const removePosition = data.sourcePosition;
				const removeBlock = findTopmostBlock( removePosition );

				if ( removeBlock !== null ) {
					applyAttributes( removeBlock );
				}
			}
		} );

		function applyAttributes( block ) {
			const text = getText( block );
			let result;
			let index = 0;

			while ( ( result = pattern.exec( text ) ) !== null ) {
				let matched;

				if ( result[ 1 ] ) {
					matched = result[ 1 ];
				} else {
					return;
				}

				index = text.indexOf( matched, index )

				doc.enqueueChanges( () => {
					const batch = doc.batch();
					const rangeToDeleteStart = Range.createFromParentsAndOffsets(
						block, index,
						block, index + delimiterLen
					);
					const rangeToDeleteEnd = Range.createFromParentsAndOffsets(
						block, index + matched.length - delimiterLen,
						block, index + matched.length
					);

					// Delete from the end to not change indices.
					batch.remove( rangeToDeleteEnd );
					batch.remove( rangeToDeleteStart );

					const range = Range.createFromParentsAndOffsets(
						block, index,
						block, index + matched.length - delimiterLen * 2
					);

					batch.setAttribute( range, command, true );
				} );
			}
		}
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

// Looks for topmost element from position parent to element placed in root.
//
// NOTE: This method does not checks schema directly - assumes that only block elements can be placed directly inside
// root.
//
// @private
// @param {engine.model.Position} position
// @param {Boolean} [nodeAfter=true] When position is placed inside root element this will determine if element before
// or after given position will be returned.
// @returns {engine.model.Element}
export function findTopmostBlock( position, nodeAfter = true ) {
	let parent = position.parent;

	// If position is placed inside root - get element after/before it.
	if ( parent instanceof RootElement ) {
		return nodeAfter ? position.nodeAfter : position.nodeBefore;
	}

	while ( !( parent.parent instanceof RootElement ) ) {
		parent = parent.parent;
	}

	return parent;
}
