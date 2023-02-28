/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/entercommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import { getCopyOnEnterAttributes } from './utils';

import type {
	DocumentSelection,
	Model,
	Schema,
	Element,
	Position,
	Writer
} from '@ckeditor/ckeditor5-engine';

/**
 * Enter command. It is used by the {@link module:enter/enter~Enter Enter feature} to handle the <kbd>Enter</kbd> keystroke.
 *
 * @extends module:core/command~Command
 */
export default class EnterCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		this.editor.model.change( writer => {
			this.enterBlock( writer );
			this.fire<EnterCommandAfterExecuteEvent>( 'afterExecute', { writer } );
		} );
	}

	/**
	 * Splits a block where the document selection is placed, in the way how the <kbd>Enter</kbd> key is expected to work:
	 *
	 *		<p>Foo[]bar</p>   ->   <p>Foo</p><p>[]bar</p>
	 *		<p>Foobar[]</p>   ->   <p>Foobar</p><p>[]</p>
	 *		<p>Fo[ob]ar</p>   ->   <p>Fo</p><p>[]ar</p>
	 *
	 * In some cases, the split will not happen:
	 *
	 *        // The selection parent is a limit element:
	 *        <figcaption>A[bc]d</figcaption>   ->   <figcaption>A[]d</figcaption>
	 *
	 *        // The selection spans over multiple elements:
	 *        <h>x[x</h><p>y]y<p>   ->   <h>x</h><p>[]y</p>
	 *
	 * @param writer Writer to use when performing the enter action.
	 * @returns `true` if a block was split, `false` otherwise.
	 */
	public enterBlock( writer: Writer ): boolean {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const isSelectionEmpty = selection.isCollapsed;
		const range = selection.getFirstRange()!;
		const startElement = range.start.parent as Element;
		const endElement = range.end.parent as Element;

		// Don't touch the roots and other limit elements.
		if ( schema.isLimit( startElement ) || schema.isLimit( endElement ) ) {
			// Delete the selected content but only if inside a single limit element.
			// Abort, when crossing limit elements boundary (e.g. <limit1>x[x</limit1>donttouchme<limit2>y]y</limit2>).
			// This is an edge case and it's hard to tell what should actually happen because such a selection
			// is not entirely valid.
			if ( !isSelectionEmpty && startElement == endElement ) {
				model.deleteContent( selection );
			}

			return false;
		}

		if ( isSelectionEmpty ) {
			const attributesToCopy = getCopyOnEnterAttributes( writer.model.schema, selection.getAttributes() );

			splitBlock( writer, range.start );
			writer.setSelectionAttribute( attributesToCopy );

			return true;
		} else {
			const leaveUnmerged = !( range.start.isAtStart && range.end.isAtEnd );
			const isContainedWithinOneElement = ( startElement == endElement );

			model.deleteContent( selection, { leaveUnmerged } );

			if ( leaveUnmerged ) {
				// Partially selected elements.
				//
				// <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x</h><h>^x</h>
				if ( isContainedWithinOneElement ) {
					splitBlock( writer, selection.focus! );

					return true;
				}
				// Selection over multiple elements.
				//
				// <h>x[x</h><p>y]y<p>	-> <h>x^</h><p>y</p>	-> <h>x</h><p>^y</p>
				else {
					writer.setSelection( endElement, 0 );
				}
			}
		}

		return false;
	}
}

export type EnterCommandAfterExecuteEvent = {
	name: 'afterExecute';
	args: [ { writer: Writer } ];
};

function splitBlock( writer: Writer, splitPos: Position ): void {
	writer.split( splitPos );
	writer.setSelection( splitPos.parent.nextSibling, 0 );
}
