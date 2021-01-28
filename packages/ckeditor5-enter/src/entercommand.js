/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/entercommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { getCopyOnEnterAttributes } from './utils';

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

		model.change( writer => {
			enterBlock( this.editor.model, writer, doc.selection, model.schema );
			this.fire( 'afterExecute', { writer } );
		} );
	}
}

// Creates a new block in the way that the <kbd>Enter</kbd> key is expected to work.
//
// @param {module:engine/model~Model} model
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// Selection on which the action should be performed.
// @param {module:engine/model/schema~Schema} schema
function enterBlock( model, writer, selection, schema ) {
	const isSelectionEmpty = selection.isCollapsed;
	const range = selection.getFirstRange();
	const startElement = range.start.parent;
	const endElement = range.end.parent;

	// Don't touch the roots and other limit elements.
	if ( schema.isLimit( startElement ) || schema.isLimit( endElement ) ) {
		// Delete the selected content but only if inside a single limit element.
		// Abort, when crossing limit elements boundary (e.g. <limit1>x[x</limit1>donttouchme<limit2>y]y</limit2>).
		// This is an edge case and it's hard to tell what should actually happen because such a selection
		// is not entirely valid.
		if ( !isSelectionEmpty && startElement == endElement ) {
			model.deleteContent( selection );
		}

		return;
	}

	if ( isSelectionEmpty ) {
		const attributesToCopy = getCopyOnEnterAttributes( writer.model.schema, selection.getAttributes() );
		splitBlock( writer, range.start );
		writer.setSelectionAttribute( attributesToCopy );
	} else {
		const leaveUnmerged = !( range.start.isAtStart && range.end.isAtEnd );
		const isContainedWithinOneElement = ( startElement == endElement );

		model.deleteContent( selection, { leaveUnmerged } );

		if ( leaveUnmerged ) {
			// Partially selected elements.
			//
			// <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x</h><h>^x</h>
			if ( isContainedWithinOneElement ) {
				splitBlock( writer, selection.focus );
			}
			// Selection over multiple elements.
			//
			// <h>x[x</h><p>y]y<p>	-> <h>x^</h><p>y</p>	-> <h>x</h><p>^y</p>
			else {
				writer.setSelection( endElement, 0 );
			}
		}
	}
}

function splitBlock( writer, splitPos ) {
	writer.split( splitPos );
	writer.setSelection( splitPos.parent.nextSibling, 0 );
}
