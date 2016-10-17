/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import Range from '../engine/model/range.js';
import RootElement from '../engine/model/rootelement.js';

/**
 * A paragraph feature for editor.
 * Introduces `<paragraph>` element in the model which renders as `<p>` in the DOM and data.
 *
 * @memberOf paragraph
 * @extends ckeditor5.Feature
 */
export default class Inline extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.document;
		let blockEvents = false;

		// Listen to model changes and add attributes.
		this.listenTo( doc, 'change', ( evt, type, data ) => {
			if ( type === 'insert' && !blockEvents ) {
				const insertPosition = data.range.start;
				const insertBlock = findTopmostBlock( insertPosition );

				applyAttributes( insertBlock );
			} else
			if ( type === 'remove' && !blockEvents ) {
				const removePosition = data.sourcePosition;
				const removeBlock = findTopmostBlock( removePosition );

				if ( removeBlock !== null ) {
					applyAttributes( removeBlock );
				}
			} else
			if ( type === 'move' ) {
				const movePosition = data.sourcePosition;
				const moveBlock = findTopmostBlock( movePosition );

				applyAttributes( moveBlock );

				const destPosition = data.range.start;
				const destBlock = findTopmostBlock( destPosition );

				applyAttributes( destBlock );
			}
		} );

		function applyAttributes( block ) {
			const text = getText( block );
			const regexp = new RegExp( /(\*\*.+?\*\*)|(\*.+?\*)/g );

			let delimiterLen;
			let result;

			while ( ( result = regexp.exec( text ) ) !== null ) {
				let matched;
				let attr;

				if ( result[ 1 ] ) {
					matched = result[ 1 ];
					attr = 'bold';
					delimiterLen = 2;
				} else {
					return;
				}

				// if ( result[ 2 ] ) {
				// 	matched = result[ 2 ];
				// 	attr = 'italic';
				// 	delimiterLen = 1;
				// }

				const index = result.index;

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

					batch.remove( rangeToDeleteEnd );
					batch.remove( rangeToDeleteStart );

					const range = Range.createFromParentsAndOffsets(
						block, index,
						block, index + matched.length - delimiterLen * 2
					);

					batch.setAttribute( range, attr, true );
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
