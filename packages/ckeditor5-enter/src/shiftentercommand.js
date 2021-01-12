/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/shiftentercommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { getCopyOnEnterAttributes } from './utils';

/**
 * ShiftEnter command. It is used by the {@link module:enter/shiftenter~ShiftEnter ShiftEnter feature} to handle
 * the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke.
 *
 * @extends module:core/command~Command
 */
export default class ShiftEnterCommand extends Command {
	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;

		model.change( writer => {
			softBreakAction( model, writer, doc.selection );
			this.fire( 'afterExecute', { writer } );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.isEnabled = isEnabled( model.schema, doc.selection );
	}
}

// Checks whether the ShiftEnter command should be enabled in the specified selection.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
function isEnabled( schema, selection ) {
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

	const range = selection.getFirstRange();
	const startElement = range.start.parent;
	const endElement = range.end.parent;

	// Do not modify the content if selection is cross-limit elements.
	if ( ( isInsideLimitElement( startElement, schema ) || isInsideLimitElement( endElement, schema ) ) && startElement !== endElement ) {
		return false;
	}

	return true;
}

// Creates a break in the way that the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke is expected to work.
//
// @param {module:engine/model~Model} model
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// Selection on which the action should be performed.
function softBreakAction( model, writer, selection ) {
	const isSelectionEmpty = selection.isCollapsed;
	const range = selection.getFirstRange();
	const startElement = range.start.parent;
	const endElement = range.end.parent;
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
			insertBreak( model, writer, selection.focus );
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

function insertBreak( model, writer, position ) {
	const breakLineElement = writer.createElement( 'softBreak' );

	model.insertContent( breakLineElement, position );
	writer.setSelection( breakLineElement, 'after' );
}

// Checks whether the specified `element` is a child of the limit element.
//
// Checking whether the `<p>` element is inside a limit element:
//   - <$root><p>Text.</p></$root> => false
//   - <$root><limitElement><p>Text</p></limitElement></$root> => true
//
// @param {module:engine/model/element~Element} element
// @param {module:engine/schema~Schema} schema
// @returns {Boolean}
function isInsideLimitElement( element, schema ) {
	// `$root` is a limit element but in this case is an invalid element.
	if ( element.is( 'rootElement' ) ) {
		return false;
	}

	return schema.isLimit( element ) || isInsideLimitElement( element.parent, schema );
}
