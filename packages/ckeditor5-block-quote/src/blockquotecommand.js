/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module block-quote/blockquotecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The block quote command.
 *
 * @extends module:core/command/command~Command
 */
export default class BlockQuoteCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Flag indicating whether the command is active. It's on when the selection starts
		 * in a quoted block.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #value
		 */
		this.set( 'value', false );

		// Update current value each time changes are done to the document.
		this.listenTo( editor.document, 'changesDone', () => {
			this.refreshValue();
			this.refreshState();
		} );
	}

	/**
	 * Updates command's {@link #value} based on the current selection.
	 */
	refreshValue() {
		const firstBlock = first( this.editor.document.selection.getSelectedBlocks() );

		// In the current implementation, the block quote must be an immediate parent of a block element.
		this.value = !!( firstBlock && findQuote( firstBlock ) );
	}

	/**
	 * Executes the command. When the command {@link #value is on}, then all block quotes within
	 * the selection will be removed. If it's off, then all selected blocks will be wrapped with
	 * a block quote.
	 *
	 * @protected
	 * @param {Object} [options] Options for executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 */
	_doExecute( options = {} ) {
		const doc = this.editor.document;
		const batch = options.batch || doc.batch();
		const blocks = Array.from( doc.selection.getSelectedBlocks() );

		doc.enqueueChanges( () => {
			if ( this.value ) {
				this._removeQuote( batch, blocks.filter( findQuote ) );
			} else {
				this._applyQuote( batch, blocks );
			}
		} );
	}

	/**
	 * @inheritDoc
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

		const isMQAllowed = schema.check( {
			name: 'blockQuote',
			inside: Position.createBefore( firstBlock )
		} );
		const isBlockAllowed = schema.check( {
			name: firstBlock.name,
			attributes: Array.from( firstBlock.getAttributeKeys() ),
			inside: 'blockQuote'
		} );

		// Whether <bQ> can wrap the block.
		return isMQAllowed && isBlockAllowed;
	}

	/**
	 * Removes the quote from the given blocks.
	 *
	 * If blocks which are supposed to be "unquoted" are in the middle of a quote,
	 * start it or end it, then the quote will be split (if needed) and the blocks
	 * will be moved out of it, so other quoted blocks remained quoted.
	 *
	 * @param {module:engine/model/batch~Batch} batch
	 * @param {Array.<module:engine/model/element~Element>} blocks
	 */
	_removeQuote( batch, blocks ) {
		// Unquote all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( blocks ).reverse().forEach( ( groupRange ) => {
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
	 * Applies the quote to the given blocks.
	 *
	 * @param {module:engine/model/batch~Batch} batch
	 * @param {Array.<module:engine/model/element~Element>} blocks
	 */
	_applyQuote( batch, blocks ) {
		const quotesToMerge = [];

		// Quote all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( blocks ).reverse().forEach( ( groupRange ) => {
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
