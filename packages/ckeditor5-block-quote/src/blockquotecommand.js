/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module block-quote/blockquotecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The block quote command plugin.
 *
 * @extends module:core/command~Command
 */
export default class BlockQuoteCommand extends Command {
	/**
	 * Whether the selection starts in a block quote.
	 *
	 * @observable
	 * @readonly
	 * @member {Boolean} #value
	 */

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command. When the command {@link #value is on}, all block quotes within
	 * the selection will be removed. If it is off, all selected blocks will be wrapped with
	 * a block quote.
	 *
	 * @fires execute
	 * @param {Object} [options] Options for executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const schema = doc.schema;
		const batch = options.batch || doc.batch();
		const blocks = Array.from( doc.selection.getSelectedBlocks() );

		doc.enqueueChanges( () => {
			if ( this.value ) {
				this._removeQuote( batch, blocks.filter( findQuote ) );
			} else {
				const blocksToQuote = blocks.filter( block => {
					// Already quoted blocks needs to be considered while quoting too
					// in order to reuse their <bQ> elements.
					return findQuote( block ) || checkCanBeQuoted( schema, block );
				} );

				this._applyQuote( batch, blocksToQuote );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Boolean} The current value.
	 */
	_getValue() {
		const firstBlock = first( this.editor.document.selection.getSelectedBlocks() );

		// In the current implementation, the block quote must be an immediate parent of a block element.
		return !!( firstBlock && findQuote( firstBlock ) );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		if ( this.value ) {
			return true;
		}

		const selection = this.editor.document.selection;
		const schema = this.editor.document.schema;

		const firstBlock = first( selection.getSelectedBlocks() );

		if ( !firstBlock ) {
			return false;
		}

		return checkCanBeQuoted( schema, firstBlock );
	}

	/**
	 * Removes the quote from given blocks.
	 *
	 * If blocks which are supposed to be "unquoted" are in the middle of a quote,
	 * start it or end it, then the quote will be split (if needed) and the blocks
	 * will be moved out of it, so other quoted blocks remained quoted.
	 *
	 * @private
	 * @param {module:engine/model/batch~Batch} batch
	 * @param {Array.<module:engine/model/element~Element>} blocks
	 */
	_removeQuote( batch, blocks ) {
		// Unquote all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( blocks ).reverse().forEach( groupRange => {
			if ( groupRange.start.isAtStart && groupRange.end.isAtEnd ) {
				batch.unwrap( groupRange.start.parent );

				return;
			}

			// The group of blocks are at the beginning of an <bQ> so let's move them left (out of the <bQ>).
			if ( groupRange.start.isAtStart ) {
				const positionBefore = Position.createBefore( groupRange.start.parent );

				batch.move( groupRange, positionBefore );

				return;
			}

			// The blocks are in the middle of an <bQ> so we need to split the <bQ> after the last block
			// so we move the items there.
			if ( !groupRange.end.isAtEnd ) {
				batch.split( groupRange.end );
			}

			// Now we are sure that groupRange.end.isAtEnd is true, so let's move the blocks right.

			const positionAfter = Position.createAfter( groupRange.end.parent );

			batch.move( groupRange, positionAfter );
		} );
	}

	/**
	 * Applies the quote to given blocks.
	 *
	 * @private
	 * @param {module:engine/model/batch~Batch} batch
	 * @param {Array.<module:engine/model/element~Element>} blocks
	 */
	_applyQuote( batch, blocks ) {
		const quotesToMerge = [];

		// Quote all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( blocks ).reverse().forEach( groupRange => {
			let quote = findQuote( groupRange.start );

			if ( !quote ) {
				quote = new Element( 'blockQuote' );

				batch.wrap( groupRange, quote );
			}

			quotesToMerge.push( quote );
		} );

		// Merge subsequent <bQ> elements. Reverse the order again because this time we want to go through
		// the <bQ> elements in the source order (due to how merge works – it moves the right element's content
		// to the first element and removes the right one. Since we may need to merge a couple of subsequent `<bQ>` elements
		// we want to keep the reference to the first (furthest left) one.
		quotesToMerge.reverse().reduce( ( currentQuote, nextQuote ) => {
			if ( currentQuote.nextSibling == nextQuote ) {
				batch.merge( Position.createAfter( currentQuote ) );

				return currentQuote;
			}

			return nextQuote;
		} );
	}
}

function findQuote( elementOrPosition ) {
	return elementOrPosition.parent.name == 'blockQuote' ? elementOrPosition.parent : null;
}

// Returns a minimal array of ranges containing groups of subsequent blocks.
//
// content:         abcdefgh
// blocks:          [ a, b, d , f, g, h ]
// output ranges:   [ab]c[d]e[fgh]
//
// @param {Array.<module:engine/model/element~Element>} blocks
// @returns {Array.<module:engine/model/range~Range>}
function getRangesOfBlockGroups( blocks ) {
	let startPosition;
	let i = 0;
	const ranges = [];

	while ( i < blocks.length ) {
		const block = blocks[ i ];
		const nextBlock = blocks[ i + 1 ];

		if ( !startPosition ) {
			startPosition = Position.createBefore( block );
		}

		if ( !nextBlock || block.nextSibling != nextBlock ) {
			ranges.push( new Range( startPosition, Position.createAfter( block ) ) );
			startPosition = null;
		}

		i++;
	}

	return ranges;
}

// Checks whether <bQ> can wrap the block.
function checkCanBeQuoted( schema, block ) {
	const isBQAllowed = schema.check( {
		name: 'blockQuote',
		inside: Position.createBefore( block )
	} );
	const isBlockAllowedInBQ = schema.check( {
		name: block.name,
		attributes: Array.from( block.getAttributeKeys() ),
		inside: 'blockQuote'
	} );

	return isBQAllowed && isBlockAllowedInBQ;
}
