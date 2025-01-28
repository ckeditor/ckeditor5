/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module enter/shiftentercommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import { getCopyOnEnterAttributes } from './utils.js';

import type {
	DocumentSelection,
	Model,
	Position,
	Schema,
	Element,
	Writer
} from '@ckeditor/ckeditor5-engine';

/**
 * ShiftEnter command. It is used by the {@link module:enter/shiftenter~ShiftEnter ShiftEnter feature} to handle
 * the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke.
 */
export default class ShiftEnterCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const model = this.editor.model;
		const doc = model.document;

		model.change( writer => {
			softBreakAction( model, writer, doc.selection );
			this.fire<ShiftEnterCommandAfterExecuteEvent>( 'afterExecute', { writer } );
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const doc = model.document;

		this.isEnabled = isEnabled( model.schema, doc.selection );
	}
}

/**
 * Fired after the the {@link module:enter/shiftentercommand~ShiftEnterCommand} is finished executing.
 *
 * @eventName ~ShiftEnterCommand#afterExecute
 */
export type ShiftEnterCommandAfterExecuteEvent = {
	name: 'afterExecute';
	args: [ { writer: Writer } ];
};

/**
 * Checks whether the ShiftEnter command should be enabled in the specified selection.
 */
function isEnabled( schema: Schema, selection: DocumentSelection ): boolean {
	// At this moment it is okay to support single range selections only.
	// But in the future we may need to change that.
	if ( selection.rangeCount > 1 ) {
		return false;
	}

	const anchorPos = selection.anchor;

	// Check whether the break element can be inserted in the current selection anchor.
	if ( !anchorPos || !schema.checkChild( anchorPos, 'softBreak' ) ) {
		return false;
	}

	const range = selection.getFirstRange()!;
	const startElement = range.start.parent as Element;
	const endElement = range.end.parent as Element;

	// Do not modify the content if selection is cross-limit elements.
	if ( ( isInsideLimitElement( startElement, schema ) || isInsideLimitElement( endElement, schema ) ) && startElement !== endElement ) {
		return false;
	}

	return true;
}

/**
 * Creates a break in the way that the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke is expected to work.
 */
function softBreakAction( model: Model, writer: Writer, selection: DocumentSelection ): void {
	const isSelectionEmpty = selection.isCollapsed;
	const range = selection.getFirstRange()!;
	const startElement = range.start.parent as Element;
	const endElement = range.end.parent as Element;
	const isContainedWithinOneElement = ( startElement == endElement );

	if ( isSelectionEmpty ) {
		const attributesToCopy = getCopyOnEnterAttributes( model.schema, selection.getAttributes() );

		insertBreak( model, writer, range.end );

		writer.removeSelectionAttribute( selection.getAttributeKeys() );
		writer.setSelectionAttribute( attributesToCopy );
	} else {
		const leaveUnmerged = !( range.start.isAtStart && range.end.isAtEnd );

		model.deleteContent( selection, { leaveUnmerged } );

		// Selection within one element:
		//
		// <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x<br>^x</h>
		if ( isContainedWithinOneElement ) {
			insertBreak( model, writer, selection.focus! );
		}
		// Selection over multiple elements.
		//
		// <h>x[x</h><p>y]y<p>	-> <h>x^</h><p>y</p>	-> <h>x</h><p>^y</p>
		//
		// We chose not to insert a line break in this case because:
		//
		// * it's not a very common scenario,
		// * it actually surprised me when I saw the "expected behavior" in real life.
		//
		// It's ok if the user will need to be more specific where they want the <br> to be inserted.
		else {
			// Move the selection to the 2nd element (last step of the example above).
			if ( leaveUnmerged ) {
				writer.setSelection( endElement, 0 );
			}
		}
	}
}

function insertBreak( model: Model, writer: Writer, position: Position ): void {
	const breakLineElement = writer.createElement( 'softBreak' );

	model.insertContent( breakLineElement, position );
	writer.setSelection( breakLineElement, 'after' );
}

/**
 * Checks whether the specified `element` is a child of the limit element.
 *
 * Checking whether the `<p>` element is inside a limit element:
 *   - `<$root><p>Text.</p></$root> => false`
 *   - `<$root><limitElement><p>Text</p></limitElement></$root> => true`
 */
function isInsideLimitElement( element: Element, schema: Schema ): boolean {
	// `$root` is a limit element but in this case is an invalid element.
	if ( element.is( 'rootElement' ) ) {
		return false;
	}

	return schema.isLimit( element ) || isInsideLimitElement( element.parent as Element, schema );
}
