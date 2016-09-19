/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';

/**
 * Enter command. It is used by the {@link enter.Enter Enter feature} to handle the <kbd>Enter</kbd> key.
 *
 * @member enter
 * @extends core.command.Command
 */
export default class EnterCommand extends Command {
	/**
	 * @inheritDoc
	 */
	_doExecute() {
		const doc = this.editor.document;
		const batch = doc.batch();

		doc.enqueueChanges( () => {
			enterBlock( batch, doc.selection );

			this.fire( 'afterExecute', { batch } );
		} );
	}
}

/**
 * Creates a new block in the way that the <kbd>Enter</kbd> key is expected to work.
 *
 * @param {engine.model.Batch} batch A batch to which the deltas will be added.
 * @param {engine.model.Selection} selection Selection on which the action should be performed.
 */
function enterBlock( batch, selection ) {
	const doc = batch.document;
	const isSelectionEmpty = selection.isCollapsed;
	const range = selection.getFirstRange();
	const startElement = range.start.parent;
	const endElement = range.end.parent;

	// Don't touch the root.
	if ( startElement.root == startElement ) {
		if ( !isSelectionEmpty ) {
			doc.composer.deleteContents( batch, selection );
		}

		return;
	}

	if ( isSelectionEmpty ) {
		splitBlock( batch, selection, range.start );
	} else {
		const shouldMerge = range.start.isAtStart && range.end.isAtEnd;
		const isContainedWithinOneElement = ( startElement == endElement );

		doc.composer.deleteContents( batch, selection, { merge: shouldMerge } );

		if ( !shouldMerge ) {
			// Partially selected elements.
			//
			// <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x</h><h>^x</h>
			if ( isContainedWithinOneElement ) {
				splitBlock( batch, selection, selection.focus );
			}
			// Selection over multiple elements.
			//
			// <h>x[x</h><p>y]y<p>	-> <h>x^</h><p>y</p>	-> <h>x</h><p>^y</p>
			else {
				selection.collapse( endElement );
			}
		}
	}
}

function splitBlock( batch, selection, splitPos ) {
	batch.split( splitPos );
	selection.collapse( splitPos.parent.nextSibling );
}
