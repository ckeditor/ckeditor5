/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from '../position.js';
import TreeWalker from '../treewalker.js';
import Range from '../range.js';

/**
 * Modifies the selection. Currently the supported modifications are:
 *
 * * Extending. The selection focus is moved in the specified `options.direction` with a step specified in `options.unit`
 * (defaults to `'CHARACTER'`, other values are not not yet supported).
 * Note: if you extend a forward selection in a backward direction you will in fact shrink it.
 *
 * @method engine.model.composer.modifySelection
 * @param {engine.model.Selection} The selection to modify.
 * @param {Object} [options]
 * @param {'FORWARD'|'BACKWARD'} [options.direction='FORWARD'] The direction in which the selection should be modified.
 */
export default function modifySelection( selection, options = {} ) {
	const isForward = options.direction != 'BACKWARD';

	const focus = selection.focus;
	const walker = new TreeWalker( {
		boundaries: getSearchRange( focus, isForward ),
		singleCharacters: true
	} );

	const items = Array.from( walker );
	let next = items[ isForward ? 'shift' : 'pop' ]();

	// 1. Nothing to do here.
	if ( !next ) {
		return;
	}

	// 2. Consume next character.
	if ( next.type == 'CHARACTER' ) {
		selection.setFocus( next[ isForward ? 'nextPosition' : 'previousPosition' ] );

		return;
	}

	// 3. We're entering an element, so let's consume it fully.
	if ( next.type == ( isForward ? 'ELEMENT_START' : 'ELEMENT_END' ) ) {
		selection.setFocus( next.item, isForward ? 'AFTER' : 'BEFORE' );

		return;
	}

	// 4. We're leaving an element. That's more tricky.

	next = items[ isForward ? 'shift' : 'pop' ]();

	// 4.1. Nothing left, so let's stay where we were.
	if ( !next ) {
		return;
	}

	// 4.2. Character found after element end. Not really a valid case in our data model, but let's
	// do something sensible and put the selection focus before that character.
	if ( next.type == 'CHARACTER' ) {
		selection.setFocus( next[ isForward ? 'previousPosition' : 'nextPosition' ] );
	}
	// 4.3. OK, we're entering a new element. So let's place there the focus.
	else {
		selection.setFocus( next.item, isForward ? 0 : 'END' );
	}
}

function getSearchRange( start, isForward ) {
	const root = start.root;
	const searchEnd = Position.createAt( root, isForward ? 'END' : 0 );

	if ( isForward ) {
		return new Range( start, searchEnd );
	} else {
		return new Range( searchEnd, start );
	}
}
