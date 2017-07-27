/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/utils
 */

import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';

/**
 * Checks if given file is an image.
 *
 * @param {File} file
 * @returns {Boolean}
 */
export function isImageType( file ) {
	const types = /^image\/(jpeg|png|gif|bmp)$/;

	return types.test( file.type );
}

/**
 * Returns a model position which is optimal (in terms of UX) for inserting an image.
 *
 * For instance, if a selection is in a middle of a paragraph, position before this paragraph
 * will be returned, so that it's not split. If the selection is at the end of a paragraph,
 * position after this paragraph will be returned.
 *
 * Note: If selection is placed in an empty block, that block will be returned. If that position
 * is then passed to {@link module:engine/controller/datacontroller~DataController#insertContent}
 * that block will be fully replaced by the image.
 *
 * @param {module:engine/model/selection~Selection} selection Selection based on which the
 * insertion position should be calculated.
 * @returns {module:engine/model/position~Position} The optimal position.
 */
export function findOptimalInsertionPosition( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement ) {
		return ModelPosition.createAfter( selectedElement );
	}

	const firstBlock = selection.getSelectedBlocks().next().value;

	if ( firstBlock ) {
		// If inserting into an empty block – return position in that block. It will get
		// replaced with the image by insertContent(). #42.
		if ( firstBlock.isEmpty ) {
			return ModelPosition.createAt( firstBlock );
		}

		const positionAfter = ModelPosition.createAfter( firstBlock );

		// If selection is at the end of the block - return position after the block.
		if ( selection.focus.isTouching( positionAfter ) ) {
			return positionAfter;
		}

		// Otherwise return position before the block.
		return ModelPosition.createBefore( firstBlock );
	}

	return selection.focus;
}
