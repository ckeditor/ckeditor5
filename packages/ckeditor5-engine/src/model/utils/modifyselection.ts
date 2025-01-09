/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/utils/modifyselection
 */

import DocumentSelection from '../documentselection.js';
import Position from '../position.js';
import Range from '../range.js';
import TreeWalker, { type TreeWalkerValue } from '../treewalker.js';

import type Model from '../model.js';
import type Schema from '../schema.js';
import type Selection from '../selection.js';
import type Text from '../text.js';
import type Node from '../node.js';

import { isInsideSurrogatePair, isInsideCombinedSymbol, isInsideEmojiSequence } from '@ckeditor/ckeditor5-utils';

const wordBoundaryCharacters = ' ,.?!:;"-()';

/**
 * Modifies the selection. Currently, the supported modifications are:
 *
 * * Extending. The selection focus is moved in the specified `options.direction` with a step specified in `options.unit`.
 * Possible values for `unit` are:
 *  * `'character'` (default) - moves selection by one user-perceived character. In most cases this means moving by one
 *  character in `String` sense. However, unicode also defines "combing marks". These are special symbols, that combines
 *  with a symbol before it ("base character") to create one user-perceived character. For example, `q̣̇` is a normal
 *  letter `q` with two "combining marks": upper dot (`Ux0307`) and lower dot (`Ux0323`). For most actions, i.e. extending
 *  selection by one position, it is correct to include both "base character" and all of it's "combining marks". That is
 *  why `'character'` value is most natural and common method of modifying selection.
 *  * `'codePoint'` - moves selection by one unicode code point. In contrary to, `'character'` unit, this will insert
 *  selection between "base character" and "combining mark", because "combining marks" have their own unicode code points.
 *  However, for technical reasons, unicode code points with values above `UxFFFF` are represented in native `String` by
 *  two characters, called "surrogate pairs". Halves of "surrogate pairs" have a meaning only when placed next to each other.
 *  For example `𨭎` is represented in `String` by `\uD862\uDF4E`. Both `\uD862` and `\uDF4E` do not have any meaning
 *  outside the pair (are rendered as ? when alone). Position between them would be incorrect. In this case, selection
 *  extension will include whole "surrogate pair".
 *  * `'word'` - moves selection by a whole word.
 *
 * **Note:** if you extend a forward selection in a backward direction you will in fact shrink it.
 *
 * **Note:** Use {@link module:engine/model/model~Model#modifySelection} instead of this function.
 * This function is only exposed to be reusable in algorithms
 * which change the {@link module:engine/model/model~Model#modifySelection}
 * method's behavior.
 *
 * @param model The model in context of which the selection modification should be performed.
 * @param selection The selection to modify.
 * @param options.direction The direction in which the selection should be modified. Default 'forward'.
 * @param options.unit The unit by which selection should be modified. Default 'character'.
 * @param options.treatEmojiAsSingleUnit Whether multi-characer emoji sequences should be handled as single unit.
 */
export default function modifySelection(
	model: Model,
	selection: Selection | DocumentSelection,
	options: {
		direction?: 'forward' | 'backward';
		unit?: 'character' | 'codePoint' | 'word';
		treatEmojiAsSingleUnit?: boolean;
	} = {}
): void {
	const schema = model.schema;
	const isForward = options.direction != 'backward';
	const unit = options.unit ? options.unit : 'character';
	const treatEmojiAsSingleUnit = !!options.treatEmojiAsSingleUnit;

	const focus = selection.focus!;

	const walker = new TreeWalker( {
		boundaries: getSearchRange( focus, isForward ),
		singleCharacters: true,
		direction: isForward ? 'forward' : 'backward'
	} );

	const data = { walker, schema, isForward, unit, treatEmojiAsSingleUnit };

	let next;

	while ( ( next = walker.next() ) ) {
		if ( next.done ) {
			return;
		}

		const position = tryExtendingTo( data, next.value );

		if ( position ) {
			if ( selection instanceof DocumentSelection ) {
				model.change( writer => {
					writer.setSelectionFocus( position );
				} );
			} else {
				selection.setFocus( position );
			}

			return;
		}
	}
}

/**
 * Checks whether the selection can be extended to the the walker's next value (next position).
 */
function tryExtendingTo(
	data: {
		walker: TreeWalker;
		schema: Schema;
		isForward: boolean;
		unit: 'character' | 'codePoint' | 'word';
		treatEmojiAsSingleUnit: boolean;
	},
	value: TreeWalkerValue
): Position | undefined {
	const { isForward, walker, unit, schema, treatEmojiAsSingleUnit } = data;
	const { type, item, nextPosition } = value;

	// If found text, we can certainly put the focus in it. Let's just find a correct position
	// based on the unit.
	if ( type == 'text' ) {
		if ( data.unit === 'word' ) {
			return getCorrectWordBreakPosition( walker, isForward );
		}

		return getCorrectPosition( walker, unit, treatEmojiAsSingleUnit );
	}

	// Entering an element.
	if ( type == ( isForward ? 'elementStart' : 'elementEnd' ) ) {
		// If it's a selectable, we can select it now.
		if ( schema.isSelectable( item ) ) {
			return Position._createAt( item, isForward ? 'after' : 'before' );
		}

		// If text allowed on this position, extend to this place.
		if ( schema.checkChild( nextPosition, '$text' ) ) {
			return nextPosition;
		}
	}
	// Leaving an element.
	else {
		// If leaving a limit element, stop.
		if ( schema.isLimit( item ) ) {
			// NOTE: Fast-forward the walker until the end.
			walker.skip( () => true );

			return;
		}

		// If text allowed on this position, extend to this place.
		if ( schema.checkChild( nextPosition, '$text' ) ) {
			return nextPosition;
		}
	}
}

/**
 * Finds a correct position by walking in a text node and checking whether selection can be extended to given position
 * or should be extended further.
 */
function getCorrectPosition(
	walker: TreeWalker,
	unit: 'character' | 'codePoint' | 'word',
	treatEmojiAsSingleUnit: boolean
): Position {
	const textNode = walker.position.textNode;

	if ( textNode ) {
		const data = textNode.data;
		let offset = walker.position.offset - textNode.startOffset!;

		while (
			isInsideSurrogatePair( data, offset ) ||
			( unit == 'character' && isInsideCombinedSymbol( data, offset ) ) ||
			( treatEmojiAsSingleUnit && isInsideEmojiSequence( data, offset ) )
		) {
			walker.next();

			offset = walker.position.offset - textNode.startOffset!;
		}
	}

	return walker.position;
}

/**
 * Finds a correct position of a word break by walking in a text node and checking whether selection can be extended to given position
 * or should be extended further.
 */
function getCorrectWordBreakPosition( walker: TreeWalker, isForward: boolean ): Position {
	let textNode: Node | null = walker.position.textNode;

	if ( !textNode ) {
		textNode = isForward ? walker.position.nodeAfter : walker.position.nodeBefore;
	}

	while ( textNode && textNode.is( '$text' ) ) {
		const offset = walker.position.offset - textNode.startOffset!;

		// Check of adjacent text nodes with different attributes (like BOLD).
		// Example          : 'foofoo []bar<$text bold="true">bar</$text> bazbaz'
		// should expand to : 'foofoo [bar<$text bold="true">bar</$text>] bazbaz'.
		if ( isAtNodeBoundary( textNode, offset, isForward ) ) {
			textNode = isForward ? walker.position.nodeAfter : walker.position.nodeBefore;
		}
		// Check if this is a word boundary.
		else if ( isAtWordBoundary( textNode.data, offset, isForward ) ) {
			break;
		}
		// Maybe one more character.
		else {
			walker.next();
		}
	}

	return walker.position;
}

function getSearchRange( start: Position, isForward: boolean ) {
	const root = start.root;
	const searchEnd = Position._createAt( root, isForward ? 'end' : 0 );

	if ( isForward ) {
		return new Range( start, searchEnd );
	} else {
		return new Range( searchEnd, start );
	}
}

/**
 * Checks if selection is on word boundary.
 */
function isAtWordBoundary( data: string, offset: number, isForward: boolean ) {
	// The offset to check depends on direction.
	const offsetToCheck = offset + ( isForward ? 0 : -1 );

	return wordBoundaryCharacters.includes( data.charAt( offsetToCheck ) );
}

/**
 * Checks if selection is on node boundary.
 */
function isAtNodeBoundary( textNode: Text, offset: number, isForward: boolean ) {
	return offset === ( isForward ? textNode.offsetSize : 0 );
}
