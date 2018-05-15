/**
 * @module enter/shiftentercommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * Soft break command.
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

// Checks whether the soft enter command should be enabled in the specified selection.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
function isEnabled( schema, selection ) {
	if ( selection.rangeCount > 1 ) {
		return false;
	}

	const anchorPos = selection.anchor;

	// Check whether the break element can be inserted in the current selection anchor.
	if ( !anchorPos || !schema.checkChild( anchorPos, 'break' ) ) {
		return false;
	}

	const range = selection.getFirstRange();
	const startElement = range.start.parent;
	const endElement = range.end.parent;

	// If the selection contains at least two elements and one of them is the limit element, the soft enter shouldn't be enabled.
	if ( ( schema.isLimit( startElement ) || schema.isLimit( endElement ) ) && startElement !== endElement ) {
		return false;
	}

	return true;
}

// Creates a break in the way that the <kbd>Shift+Enter</kbd> key is expected to work.
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
		insertBreak( writer, range.end );
	} else {
		const leaveUnmerged = !( range.start.isAtStart && range.end.isAtEnd );
		model.deleteContent( selection, { leaveUnmerged } );

		// Partially selected elements.
		//
		// <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x<br>^x</h>
		if ( isContainedWithinOneElement ) {
			insertBreak( writer, selection.focus );
		}

		if ( leaveUnmerged && !isContainedWithinOneElement ) {
			writer.setSelection( endElement, 0 );
		}
	}
}

function insertBreak( writer, position ) {
	const breakLineElement = writer.createElement( 'break' );

	writer.insert( breakLineElement, position );
	writer.setSelection( breakLineElement, 'after' );
}
