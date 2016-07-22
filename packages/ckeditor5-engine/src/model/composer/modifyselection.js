/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Position from '../position.js';
import TreeWalker from '../treewalker.js';
import Range from '../range.js';

/**
 * Modifies the selection. Currently the supported modifications are:
 *
 * * Extending. The selection focus is moved in the specified `options.direction` with a step specified in `options.unit`
 * (defaults to `'character'`, other values are not not yet supported).
 * Note: if you extend a forward selection in a backward direction you will in fact shrink it.
 *
 * @method engine.model.composer.modifySelection
 * @param {engine.model.Selection} The selection to modify.
 * @param {Object} [options]
 * @param {'forward'|'backward'} [options.direction='forward'] The direction in which the selection should be modified.
 */
export default function modifySelection( selection, options = {} ) {
	const isForward = options.direction != 'backward';

	const focus = selection.focus;
	const walker = new TreeWalker( {
		boundaries: getSearchRange( focus, isForward ),
		singleCharacters: true,
		direction: isForward ? 'forward' : 'backward'
	} );

	let next = walker.next();

	// 1. Nothing to do here.
	if ( next.done ) {
		return;
	}

	let value = next.value;

	// 2. Consume next character.
	if ( value.type == 'text' ) {
		selection.setFocus( value.nextPosition );

		return;
	}

	// 3. We're entering an element, so let's consume it fully.
	if ( value.type == ( isForward ? 'elementStart' : 'elementEnd' ) ) {
		selection.setFocus( value.item, isForward ? 'after' : 'before' );

		return;
	}

	// 4. We're leaving an element. That's more tricky.
	next = walker.next();

	// 4.1. Nothing left, so let's stay where we were.
	if ( next.done ) {
		return;
	}

	// Replace TreeWalker step wrapper by clean step value.
	value = next.value;

	// 4.2. Character found after element end. Not really a valid case in our data model, but let's
	// do something sensible and put the selection focus before that character.
	if ( value.type == 'text' ) {
		selection.setFocus( value.previousPosition );
	}
	// 4.3. OK, we're entering a new element. So let's place there the focus.
	else {
		selection.setFocus( value.item, isForward ? 0 : 'end' );
	}
}

function getSearchRange( start, isForward ) {
	const root = start.root;
	const searchEnd = Position.createAt( root, isForward ? 'end' : 0 );

	if ( isForward ) {
		return new Range( start, searchEnd );
	} else {
		return new Range( searchEnd, start );
	}
}
