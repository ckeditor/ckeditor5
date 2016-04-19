/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from '../command/command.js';
import Element from '../engine/treemodel/element.js';
import LivePosition from '../engine/treemodel/liveposition.js';
import Position from '../engine/treemodel/position.js';

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
			enterBlock( doc.batch(), doc.selection, { defaultBlock: 'paragraph' } );
		} );
	}
}

export function enterBlock( batch, selection, options = {} ) {
	const defaultBlockName = options.defaultBlockName;
	const doc = batch.doc;
	const isSelectionEmpty = selection.isCollapsed;

	if ( isSelectionEmpty ) {
		const startPos = selection.focus;
		const startElement = startPos.parent;

		// Don't touch the root.
		if ( startElement.root == startElement ) {
			return;
		}

		split( startPos );
	} else {
		const range = selection.getFirstRange();
		const startElement = range.start.parent;
		const endElement = range.end.parent;
		const shouldMerge = range.start.isAtStart() && range.end.isAtEnd();
		const isContainedWithinOneElement = ( startElement == endElement );

		doc.composer.deleteContents( batch, selection, { merge: shouldMerge } );

		// Don't touch the root.
		if ( startElement.root == startElement ) {
			return;
		}

		const newBlockName = getNewBlockName( doc, startElement, defaultBlockName );
		const needsRename = startElement.name != newBlockName;

		// Fully selected elements.
		//
		// <h>[xx</h><p>yy]<p>	-> <h>^</h>		-> <p>^</p>
		// <h>[xxyy]</h>		-> <h>^</h>		-> <p>^</p>
		if ( shouldMerge ) {
			const pos = Position.createFromPosition( selection.focus );

			if ( needsRename ) {
				batch.rename( newBlockName, startElement );
			}

			selection.collapse( pos );
		} else if ( isContainedWithinOneElement ) {
			split( selection.focus );
		} else {
			selection.collapse( endElement );
		}
	}

	function split( splitPos ) {
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
}

function getNewBlockName( doc, startElement, defaultBlockName ) {
	if ( doc.schema.check( { name: defaultBlockName, inside: startElement.parent.name } ) ) {
		return defaultBlockName;
	}

	return startElement.name;
}
