/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Utilities used in modules from {@link module:list/list list} package.
 *
 * @module list/utils
 */

import Position from '@ckeditor/ckeditor5-engine/src/model/position';

/**
 * For given {@link module:engine/model/position~Position position}, returns the closest ancestor of that position which is a
 * `listItem` element.
 *
 * @param {module:engine/model/position~Position} position Position which ancestor should be check looking for `listItem` element.
 * @returns {module:engine/model/element~Element|null} Element with `listItem` name that is a closest ancestor of given `position`, or
 * `null` if neither of `position` ancestors is a `listItem`.
 */
export function getClosestListItem( position ) {
	return Array.from( position.getAncestors() ).find( ( parent ) => parent.name == 'listItem' ) || null;
}

/**
 * For given {@link module:engine/model/selection~Selection selection} and {@link module:engine/model/schema~Schema schema},
 * returns an array with all elements that are in the selection and are extending `$block` schema item.
 *
 * @param {module:engine/model/selection~Selection} selection Selection from which blocks will be taken.
 * @param {module:engine/model/schema~Schema} schema Schema which will be used to check if a model element extends `$block`.
 * @returns {Array.<module:engine/model/element~Element>} All blocks from the selection.
 */
export function getSelectedBlocks( selection, schema ) {
	let position = getPositionBeforeBlock( selection.getFirstPosition(), schema );

	const endPosition = selection.getLastPosition();
	const blocks = [];

	// Traverse model from the first position before a block to the end position of selection.
	// Store all elements that were after the correct positions.
	while ( position !== null && position.isBefore( endPosition ) ) {
		blocks.push( position.nodeAfter );

		position.offset++;
		position = getPositionBeforeBlock( position, schema );
	}

	return blocks;
}

/**
 * For given {@link module:engine/model/position~Position position}, finds a model element extending `$block` schema item which is
 * closest element to that position. First node after the position is checked and then the position's ancestors. `null`
 * is returned if such element has not been found or found element is a root element.
 *
 * @param position
 * @param schema
 * @returns {*}
 */
export function getPositionBeforeBlock( position, schema ) {
	// Start from the element right after the position. Maybe it is already a `$block` element.
	let element = position.nodeAfter;

	// If the position is not before an element, check the parent.
	if ( !element ) {
		element = position.parent;
	}

	// If proper element is still not found, check the ancestors.
	while ( element !== null && !schema.itemExtends( element.name || '$text', '$block' ) ) {
		element = element.parent;
	}

	// If proper element has been found, return position before it, otherwise return null;
	return element !== null && element.parent !== null ? Position.createBefore( element ) : null;
}
