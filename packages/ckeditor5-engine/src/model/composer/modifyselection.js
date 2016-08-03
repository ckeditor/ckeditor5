/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Position from '../position.js';
import TreeWalker from '../treewalker.js';
import Range from '../range.js';
import { isInsideSurrogatePair, isInsideCombinedSymbol } from '../../../utils/unicode.js';

/* jshint -W100 */
/**
 * Modifies the selection. Currently the supported modifications are:
 *
 * * Extending. The selection focus is moved in the specified `options.direction` with a step specified in `options.unit`.
 * Possible values for `unit` are:
 *  * `'character'` (default) - moves selection by one user-perceived character. In most cases this means moving by one
 *  character in {String} sense. However, unicode also defines "combing marks". These are special symbols, that combines
 *  with a symbol before it ("base character") to create one user-perceived character. For example, `q̣̇` is a normal
 *  letter `q` with two "combining marks": upper dot (`Ux0307`) and lower dot (`Ux0323`). For most actions, i.e. extending
 *  selection by one position, it is correct to include both "base character" and all of it's "combining marks". That is
 *  why `'character'` value is most natural and common method of modifying selection.
 *  * `'codePoint'` - moves selection by one unicode code point. In contrary to, `'character'` unit, this will insert
 *  selection between "base character" and "combining mark", because "combining marks" have their own unicode code points.
 *  However, for technical reasons, unicode code points with values above `UxFFFF` are represented in native {String} by
 *  two characters, called "surrogate pairs". Halves of "surrogate pairs" have a meaning only when placed next to each other.
 *  For example `𨭎` is represented in {String} by `\uD862\uDF4E`. Both `\uD862` and `\uDF4E` do not have any meaning
 *  outside the pair (are rendered as ? when alone). Position between them would be incorrect. In this case, selection
 *  extension will include whole "surrogate pair".
 *
 * **Note:** if you extend a forward selection in a backward direction you will in fact shrink it.
 *
 * **Note:** you may use `CKEditor5 Graphemes` feature available at https://github.com/ckeditor/ckeditor5-graphemes
 * to enhance `'character'` option to support so-called "graphemes". This feature is not available in
 * `engine` out-of-the-box due to it's big size and niche usage.
 *
 * @method engine.model.composer.modifySelection
 * @param {engine.model.Selection} selection The selection to modify.
 * @param {Object} [options]
 * @param {'forward'|'backward'} [options.direction='forward'] The direction in which the selection should be modified.
 * @param {'character'|'codePoint'} [options.unit='character'] The unit by which selection should be modified.
 */
/* jshint +W100 */
export default function modifySelection( selection, options = {} ) {
	const isForward = options.direction != 'backward';
	options.unit = options.unit ? options.unit : 'character';

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

	// 2. Focus is before/after text. Extending by text data.
	if ( value.type == 'text' ) {
		selection.setFocus( getCorrectPosition( walker, options.unit ) );

		return;
	}

	// 3. Focus is before/after element. Extend by whole element.
	if ( value.type == ( isForward ? 'elementStart' : 'elementEnd' ) ) {
		selection.setFocus( value.item, isForward ? 'after' : 'before' );

		return;
	}

	// 4. If previous scenarios are false, it means that focus is at the beginning/at the end of element and by
	// extending we are "leaving" the element. Let's see what is further.
	next = walker.next();

	// 4.1. Nothing left, so let's stay where we were.
	if ( next.done ) {
		return;
	}

	value = next.value;

	// 4.2. Text data found after leaving an element end. Put selection before it. This way extension will include
	// "opening" element tag.
	if ( value.type == 'text' ) {
		selection.setFocus( value.previousPosition );
	}
	// 4.3. An element found after leaving previous element. Put focus inside that element, at it's beginning or end.
	else {
		selection.setFocus( value.item, isForward ? 0 : 'end' );
	}
}

// Finds a correct position by walking in a text node and checking whether selection can be extended to given position
// or should be extended further.
function getCorrectPosition( walker, unit ) {
	const textNode = walker.position.textNode;

	if ( textNode ) {
		const data = textNode.data;
		let offset = walker.position.offset - textNode.startOffset;

		while ( isInsideSurrogatePair( data, offset ) || ( unit == 'character' && isInsideCombinedSymbol( data, offset ) ) ) {
			walker.next();

			offset = walker.position.offset - textNode.startOffset;
		}
	}

	return walker.position;
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
