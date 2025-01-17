/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-caption-post-fixer
 */

import type { Model, Writer, Element, Node } from 'ckeditor5/src/engine.js';

/**
 * Injects a table caption post-fixer into the model.
 *
 * The role of the table caption post-fixer is to ensure that the table with caption have the correct structure
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * The correct structure means that:
 *
 * * If there are many caption model element, they are merged into one model.
 * * A final, merged caption model is placed at the end of the table.
 */
export default function injectTableCaptionPostFixer( model: Model ): void {
	model.document.registerPostFixer( writer => tableCaptionPostFixer( writer, model ) );
}

/**
 * The table caption post-fixer.
 */
function tableCaptionPostFixer( writer: Writer, model: Model ) {
	const changes = model.document.differ.getChanges();
	let wasFixed = false;

	for ( const entry of changes ) {
		if ( entry.type != 'insert' ) {
			continue;
		}

		const positionParent = entry.position.parent;

		if ( positionParent.is( 'element', 'table' ) || entry.name == 'table' ) {
			const table = ( entry.name == 'table' ? entry.position.nodeAfter : positionParent ) as Element;
			const captionsToMerge = Array.from( table.getChildren() )
				.filter( ( child: Node ): child is Element => child.is( 'element', 'caption' ) );
			const firstCaption = captionsToMerge.shift();

			if ( !firstCaption ) {
				continue;
			}

			// Move all the contents of the captions to the first one.
			for ( const caption of captionsToMerge ) {
				writer.move( writer.createRangeIn( caption ), firstCaption, 'end' );
				writer.remove( caption );
			}

			// Make sure the final caption is at the end of the table.
			if ( firstCaption.nextSibling ) {
				writer.move( writer.createRangeOn( firstCaption ), table, 'end' );
				wasFixed = true;
			}

			// Do we merged captions and/or moved the single caption to the end of the table?
			wasFixed = !!captionsToMerge.length || wasFixed;
		}
	}

	return wasFixed;
}
