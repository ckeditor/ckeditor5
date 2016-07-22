/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../command/command.js';
import Element from '../engine/model/element.js';
import LivePosition from '../engine/model/liveposition.js';
import Position from '../engine/model/position.js';

/**
 * Enter command. Used by the {@link enter.Enter enter feature} to handle the <kbd>Enter</kbd> key.
 *
 * @member enter
 * @extends ckeditor5.command.Command
 */
export default class EnterCommand extends Command {
	_doExecute() {
		const doc = this.editor.document;

		doc.enqueueChanges( () => {
			enterBlock( doc.batch(), doc.selection, { defaultBlockName: 'paragraph' } );
		} );
	}
}

/**
 * Enters new block in the way how <kbd>Enter</kbd> is expected to work.
 *
 * @param {engine.model.Batch} batch Batch to which the deltas will be added.
 * @param {engine.model.Selection} selection
 * @param {Object} options
 * @param {Boolean} options.defaultBlockName Name of the block which should be created when enter leaves
 * another block. Usuall set to `'paragraph'`. E.g. when entering block in `<heading>foo^</heading>` the result will be
 * `<heading>foo</heading><paragraph>^</paragraph>`.
 */
export function enterBlock( batch, selection, options = {} ) {
	const defaultBlockName = options.defaultBlockName;
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
		splitBlock( batch, selection, range.start, defaultBlockName );
	} else {
		const shouldMerge = range.start.isAtStart() && range.end.isAtEnd();
		const isContainedWithinOneElement = ( startElement == endElement );

		doc.composer.deleteContents( batch, selection, { merge: shouldMerge } );

		// Fully selected elements.
		//
		// <h>[xx</h><p>yy]<p>	-> <h>^</h>				-> <p>^</p>
		// <h>[xxyy]</h>		-> <h>^</h>				-> <p>^</p>
		if ( shouldMerge ) {
			// We'll lose the ref to the renamed element, so let's keep a position inside it
			// (offsets won't change, so it will stay in place). See ckeditor5-engine#367.
			const pos = Position.createFromPosition( selection.focus );
			const newBlockName = getNewBlockName( doc, startElement, defaultBlockName );

			if ( startElement.name != newBlockName ) {
				batch.rename( newBlockName, startElement );
			}

			selection.collapse( pos );
		}
		// Partially selected elements.
		//
		// <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x</h><h>^x</h>
		else if ( isContainedWithinOneElement ) {
			splitBlock( batch, selection, selection.focus, defaultBlockName );
		}
		// Selection over multilpe elements.
		//
		// <h>x[x</h><p>y]y<p>	-> <h>x^</h><p>y</p>	-> <h>x</h><p>^y</p>
		else {
			selection.collapse( endElement );
		}
	}
}

function splitBlock( batch, selection, splitPos, defaultBlockName ) {
	const doc = batch.document;
	const parent = splitPos.parent;

	if ( splitPos.isAtEnd() ) {
		const newElement = new Element( getNewBlockName( doc, parent, defaultBlockName ) );

		batch.insert( Position.createAfter( parent ), newElement );

		selection.collapse( newElement );
	} else {
		// TODO After ckeditor5-engine#340 is fixed we'll be able to base on splitPos's location.
		const endPos = LivePosition.createFromPosition( splitPos );
		endPos.stickiness = 'STICKS_TO_NEXT';

		batch.split( splitPos );

		selection.collapse( endPos );

		endPos.detach();
	}
}

function getNewBlockName( doc, startElement, defaultBlockName ) {
	if ( doc.schema.check( { name: defaultBlockName, inside: startElement.parent.name } ) ) {
		return defaultBlockName;
	}

	return startElement.name;
}
