/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module block-quote/blockquotecommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';
import type { DocumentFragment, Element, Position, Range, Schema, Writer } from 'ckeditor5/src/engine.js';

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
	 */
	declare public value: boolean;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command. When the command {@link #value is on}, all top-most block quotes within
	 * the selection will be removed. If it is off, all selected blocks will be wrapped with
	 * a block quote.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply a block quote,
	 * otherwise the command will remove the block quote. If not set, the command will act basing on its current value.
	 */
	public override execute( options: { forceValue?: boolean } = {} ): void {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		const blocks = Array.from( selection.getSelectedBlocks() );

		const value = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		model.change( writer => {
			if ( !value ) {
				this._removeQuote( writer, blocks.filter( findQuote ) );
			} else {
				const blocksToQuote = blocks.filter( block => {
					// Already quoted blocks needs to be considered while quoting too
					// in order to reuse their <bQ> elements.
					return findQuote( block ) || checkCanBeQuoted( schema, block );
				} );

				this._applyQuote( writer, blocksToQuote );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 */
	private _getValue(): boolean {
		const selection = this.editor.model.document.selection;

		const firstBlock = first( selection.getSelectedBlocks() );

		// In the current implementation, the block quote must be an immediate parent of a block element.
		return !!( firstBlock && findQuote( firstBlock ) );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */
	private _checkEnabled(): boolean {
		if ( this.value ) {
			return true;
		}

		const selection = this.editor.model.document.selection;
		const schema = this.editor.model.schema;

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
	 */
	private _removeQuote( writer: Writer, blocks: Array<Element> ): void {
		// Unquote all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( writer, blocks ).reverse().forEach( groupRange => {
			if ( groupRange.start.isAtStart && groupRange.end.isAtEnd ) {
				writer.unwrap( groupRange.start.parent as Element );

				return;
			}

			// The group of blocks are at the beginning of an <bQ> so let's move them left (out of the <bQ>).
			if ( groupRange.start.isAtStart ) {
				const positionBefore = writer.createPositionBefore( groupRange.start.parent as Element );

				writer.move( groupRange, positionBefore );

				return;
			}

			// The blocks are in the middle of an <bQ> so we need to split the <bQ> after the last block
			// so we move the items there.
			if ( !groupRange.end.isAtEnd ) {
				writer.split( groupRange.end );
			}

			// Now we are sure that groupRange.end.isAtEnd is true, so let's move the blocks right.

			const positionAfter = writer.createPositionAfter( groupRange.end.parent as Element );

			writer.move( groupRange, positionAfter );
		} );
	}

	/**
	 * Applies the quote to given blocks.
	 */
	private _applyQuote( writer: Writer, blocks: Array<Element> ): void {
		const quotesToMerge: Array<Element | DocumentFragment> = [];

		// Quote all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( writer, blocks ).reverse().forEach( groupRange => {
			let quote = findQuote( groupRange.start );

			if ( !quote ) {
				quote = writer.createElement( 'blockQuote' );

				writer.wrap( groupRange, quote );
			}

			quotesToMerge.push( quote );
		} );

		// Merge subsequent <bQ> elements. Reverse the order again because this time we want to go through
		// the <bQ> elements in the source order (due to how merge works – it moves the right element's content
		// to the first element and removes the right one. Since we may need to merge a couple of subsequent `<bQ>` elements
		// we want to keep the reference to the first (furthest left) one.
		quotesToMerge.reverse().reduce( ( currentQuote, nextQuote ) => {
			if ( currentQuote.nextSibling == nextQuote ) {
				writer.merge( writer.createPositionAfter( currentQuote ) );

				return currentQuote;
			}

			return nextQuote;
		} );
	}
}

function findQuote( elementOrPosition: Element | Position ): Element | DocumentFragment | null {
	return elementOrPosition.parent!.name == 'blockQuote' ? elementOrPosition.parent : null;
}

/**
 * Returns a minimal array of ranges containing groups of subsequent blocks.
 *
 * content:         abcdefgh
 * blocks:          [ a, b, d, f, g, h ]
 * output ranges:   [ab]c[d]e[fgh]
 */
function getRangesOfBlockGroups( writer: Writer, blocks: Array<Element> ): Array<Range> {
	let startPosition;
	let i = 0;
	const ranges = [];

	while ( i < blocks.length ) {
		const block = blocks[ i ];
		const nextBlock = blocks[ i + 1 ];

		if ( !startPosition ) {
			startPosition = writer.createPositionBefore( block );
		}

		if ( !nextBlock || block.nextSibling != nextBlock ) {
			ranges.push( writer.createRange( startPosition, writer.createPositionAfter( block ) ) );
			startPosition = null;
		}

		i++;
	}

	return ranges;
}

/**
 * Checks whether <bQ> can wrap the block.
 */
function checkCanBeQuoted( schema: Schema, block: Element ): boolean {
	// TMP will be replaced with schema.checkWrap().
	const isBQAllowed = schema.checkChild( block.parent as Element, 'blockQuote' );
	const isBlockAllowedInBQ = schema.checkChild( [ '$root', 'blockQuote' ], block );

	return isBQAllowed && isBlockAllowedInBQ;
}
