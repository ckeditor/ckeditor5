/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module enter/entercommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch';

/**
 * Enter command. It is used by the {@link module:enter/enter~Enter Enter feature} to handle the <kbd>Enter</kbd> key.
 *
 * @extends module:core/command~Command
 */
export default class EnterCommand extends Command {
	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const batch = new Batch();

		model.enqueueChange( () => {
			enterBlock( this.editor.data, doc.selection, model.schema );
			this.fire( 'afterExecute', { batch } );
		} );
	}
}

// Creates a new block in the way that the <kbd>Enter</kbd> key is expected to work.
//
// @param {engine.controller.DataController} dataController
// @param {module:engine/model/selection~Selection} selection Selection on which the action should be performed.
// @param {module:engine/model/schema~Schema} schema
function enterBlock( dataController, selection, schema ) {
	const isSelectionEmpty = selection.isCollapsed;
	const range = selection.getFirstRange();
	const startElement = range.start.parent;
	const endElement = range.end.parent;
	const model = dataController.model;

	// Don't touch the roots and other limit elements.
	if ( schema.limits.has( startElement.name ) || schema.limits.has( endElement.name ) ) {
		// Delete the selected content but only if inside a single limit element.
		// Abort, when crossing limit elements boundary (e.g. <limit1>x[x</limit1>donttouchme<limit2>y]y</limit2>).
		// This is an edge case and it's hard to tell what should actually happen because such a selection
		// is not entirely valid.
		if ( !isSelectionEmpty && startElement == endElement ) {
			dataController.deleteContent( selection );
		}

		return;
	}

	if ( isSelectionEmpty ) {
		splitBlock( model, selection, range.start );
	} else {
		const leaveUnmerged = !( range.start.isAtStart && range.end.isAtEnd );
		const isContainedWithinOneElement = ( startElement == endElement );

		dataController.deleteContent( selection, { leaveUnmerged } );

		if ( leaveUnmerged ) {
			// Partially selected elements.
			//
			// <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x</h><h>^x</h>
			if ( isContainedWithinOneElement ) {
				splitBlock( model, selection, selection.focus );
			}
			// Selection over multiple elements.
			//
			// <h>x[x</h><p>y]y<p>	-> <h>x^</h><p>y</p>	-> <h>x</h><p>^y</p>
			else {
				selection.setCollapsedAt( endElement );
			}
		}
	}
}

function splitBlock( model, selection, splitPos ) {
	const oldElement = splitPos.parent;
	const newElement = new oldElement.constructor( oldElement.name, oldElement.getAttributes() );

	model.change( writer => {
		if ( splitPos.isAtEnd ) {
			// If the split is at the end of element, instead of splitting, just create a clone of position's parent
			// element and insert it after split element. The result is the same but less operations are done
			// and it's more semantically correct (when it comes to operational transformation).
			writer.insert( newElement, splitPos.parent, 'after' );
		} else if ( splitPos.isAtStart ) {
			// If the split is at the start of element, instead of splitting, just create a clone of position's parent
			// element and insert it before split element. The result is the same but less operations are done
			// and it's more semantically correct (when it comes to operational transformation).
			writer.insert( newElement, splitPos.parent, 'before' );
		} else {
			writer.split( splitPos );
		}
	} );

	selection.setCollapsedAt( splitPos.parent.nextSibling );
}
