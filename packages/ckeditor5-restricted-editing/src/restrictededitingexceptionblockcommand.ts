/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/restrictededitingexceptionblockcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';
import type { ModelDocumentFragment, ModelElement, ModelPosition, ModelRange, ModelSchema, ModelWriter } from 'ckeditor5/src/engine.js';

/**
 * The command that toggles exception blocks for the restricted editing.
 */
export class RestrictedEditingExceptionBlockCommand extends Command {
	/**
	 * Whether the selection starts in a block exception.
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
	 * Wraps or unwraps the selected blocks with non-restricted area.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply a block exception,
	 * otherwise the command will remove the block exception. If not set, the command will act basing on its current value.
	 */
	public override execute( options: { forceValue?: boolean } = {} ): void {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		const blocks = Array.from( selection.getSelectedBlocks() );
		const value = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		model.change( writer => {
			if ( !value ) {
				const blocksToUnwrap = blocks.map( block => {
					// Find blocks directly nested inside an exception.
					return findExceptionContentBlock( block );
				} ).filter( ( exception ): exception is ModelElement => !!exception );

				this._removeException( writer, blocksToUnwrap );
			} else {
				const blocksToWrap = blocks.filter( block => {
					// Already wrapped blocks needs to be considered while wrapping too
					// in order to reuse their wrapper elements.
					return findException( block ) || checkCanBeWrapped( schema, block );
				} );

				this._applyException( writer, blocksToWrap );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 */
	private _getValue(): boolean {
		const selection = this.editor.model.document.selection;
		const firstBlock = first( selection.getSelectedBlocks() );

		return !!( firstBlock && findException( firstBlock ) );
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

		return checkCanBeWrapped( schema, firstBlock );
	}

	/**
	 * Unwraps the exception from given blocks.
	 *
	 * If blocks which are supposed to be unwrapped are in the middle of an exception,
	 * start it or end it, then the exception will be split (if needed) and the blocks
	 * will be moved out of it, so other exception blocks remained wrapped.
	 */
	private _removeException( writer: ModelWriter, blocks: Array<ModelElement> ): void {
		// Unwrap all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( writer, blocks ).reverse().forEach( groupRange => {
			if ( groupRange.start.isAtStart && groupRange.end.isAtEnd ) {
				writer.unwrap( groupRange.start.parent as ModelElement );

				return;
			}

			// The group of blocks are at the beginning of an exception so let's move them left (out of the exception).
			if ( groupRange.start.isAtStart ) {
				const positionBefore = writer.createPositionBefore( groupRange.start.parent as ModelElement );

				writer.move( groupRange, positionBefore );

				return;
			}

			// The blocks are in the middle of an exception so we need to split the exception after the last block
			// so we move the items there.
			if ( !groupRange.end.isAtEnd ) {
				writer.split( groupRange.end );
			}

			// Now we are sure that groupRange.end.isAtEnd is true, so let's move the blocks right.

			const positionAfter = writer.createPositionAfter( groupRange.end.parent as ModelElement );

			writer.move( groupRange, positionAfter );
		} );
	}

	/**
	 * Applies the exception to given blocks.
	 */
	private _applyException( writer: ModelWriter, blocks: Array<ModelElement> ): void {
		const schema = this.editor.model.schema;
		const exceptionsToMerge: Array<ModelElement | ModelDocumentFragment> = [];

		// Wrap all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( writer, blocks ).reverse().forEach( groupRange => {
			let exception = findException( groupRange.start );

			if ( !exception ) {
				exception = writer.createElement( 'restrictedEditingException' );

				writer.wrap( groupRange, exception );
			}

			exceptionsToMerge.push( exception );
		} );

		// Merge subsequent exception elements. Reverse the order again because this time we want to go through
		// the exception elements in the source order (due to how merge works – it moves the right element's content
		// to the first element and removes the right one. Since we may need to merge a couple of subsequent exception elements
		// we want to keep the reference to the first (furthest left) one.
		exceptionsToMerge.reverse();

		// But first add any neighbouring block exceptions to the list.
		if ( exceptionsToMerge.length ) {
			const previousSibling = exceptionsToMerge.at( 0 )!.previousSibling;
			const nextSibling = exceptionsToMerge.at( -1 )!.nextSibling;

			if ( previousSibling?.is( 'element', 'restrictedEditingException' ) ) {
				exceptionsToMerge.unshift( previousSibling );
			}

			if ( nextSibling?.is( 'element', 'restrictedEditingException' ) ) {
				exceptionsToMerge.push( nextSibling );
			}
		}

		// Merge subsequent exceptions.
		exceptionsToMerge.reduce( ( currentException, nextException ) => {
			if ( currentException.nextSibling == nextException ) {
				writer.merge( writer.createPositionAfter( currentException ) );

				return currentException;
			}

			return nextException;
		} );

		// Remove inline exceptions from block exception.
		schema.removeDisallowedAttributes( blocks, writer );
	}
}

function findException( elementOrPosition: ModelElement | ModelPosition ): ModelElement | ModelDocumentFragment | null {
	return elementOrPosition.findAncestor( 'restrictedEditingException', { includeSelf: true } );
}

function findExceptionContentBlock( element: ModelElement ): ModelElement | null {
	let node = element;

	while ( node.parent ) {
		if ( node.parent.name == 'restrictedEditingException' ) {
			return node;
		}

		node = node.parent as ModelElement;
	}

	return null;
}

/**
 * Returns a minimal array of ranges containing groups of subsequent blocks.
 *
 * content:         abcdefgh
 * blocks:          [ a, b, d, f, g, h ]
 * output ranges:   [ab]c[d]e[fgh]
 */
function getRangesOfBlockGroups( writer: ModelWriter, blocks: Array<ModelElement> ): Array<ModelRange> {
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
 * Checks whether exception can wrap the block.
 */
function checkCanBeWrapped( schema: ModelSchema, block: ModelElement ): boolean {
	const parentContext = schema.createContext( block.parent as ModelElement );

	// Is block exception allowed in parent of block.
	if ( !schema.checkChild( parentContext, 'restrictedEditingException' ) ) {
		return false;
	}

	// Is block allowed inside block exception.
	if ( !schema.checkChild( parentContext.push( 'restrictedEditingException' ), block ) ) {
		return false;
	}

	return true;
}
