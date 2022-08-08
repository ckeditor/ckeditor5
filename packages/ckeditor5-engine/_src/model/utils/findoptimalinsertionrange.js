/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/utils/findoptimalinsertionrange
 */

import first from '@ckeditor/ckeditor5-utils/src/first';

// Returns a model range which is optimal (in terms of UX) for inserting a widget block.
//
// For instance, if a selection is in the middle of a paragraph, the collapsed range before this paragraph
// will be returned so that it is not split. If the selection is at the end of a paragraph,
// the collapsed range after this paragraph will be returned.
//
// Note: If the selection is placed in an empty block, the range in that block will be returned. If that range
// is then passed to {@link module:engine/model/model~Model#insertContent}, the block will be fully replaced
// by the inserted widget block.
//
// **Note:** Use {@link module:widget/utils#findOptimalInsertionRange} instead of this function outside engine.
// This function is only exposed to be used by {@link module:widget/utils#findOptimalInsertionRange findOptimalInsertionRange()}
// in the `widget` package and inside the `engine` package.
//
// @private
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// The selection based on which the insertion position should be calculated.
// @param {module:engine/model/model~Model} model Model instance.
// @param {'auto'|'before'|'after'} [place='auto'] The place where to look for optimal insertion range.
// The default `auto` value will determine itself the best position for insertion.
// The `before` value will try to find a position before selection.
// The `after` value will try to find a position after selection.
// @returns {module:engine/model/range~Range} The optimal range.
export function findOptimalInsertionRange( selection, model, place = 'auto' ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && model.schema.isObject( selectedElement ) && !model.schema.isInline( selectedElement ) ) {
		if ( [ 'before', 'after' ].includes( place ) ) {
			return model.createRange( model.createPositionAt( selectedElement, place ) );
		}

		return model.createRangeOn( selectedElement );
	}

	const firstBlock = first( selection.getSelectedBlocks() );

	// There are no block elements within ancestors (in the current limit element).
	if ( !firstBlock ) {
		return model.createRange( selection.focus );
	}

	// If inserting into an empty block – return position in that block. It will get
	// replaced with the image by insertContent(). #42.
	if ( firstBlock.isEmpty ) {
		return model.createRange( model.createPositionAt( firstBlock, 0 ) );
	}

	const positionAfter = model.createPositionAfter( firstBlock );

	// If selection is at the end of the block - return position after the block.
	if ( selection.focus.isTouching( positionAfter ) ) {
		return model.createRange( positionAfter );
	}

	// Otherwise, return position before the block.
	return model.createRange( model.createPositionBefore( firstBlock ) );
}
