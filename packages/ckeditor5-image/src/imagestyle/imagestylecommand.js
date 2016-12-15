/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import Command from '../../core/command/command.js';
import ModelElement from '../../engine/model/element.js';

export default class ImageStyleCommand extends Command {
	constructor( editor ) {
		super( editor );

		this.set( 'value', false );

		const document = this.editor.document;

		this.listenTo( document.selection, 'change', () => {
			const element = getSelectedElement( document.selection );

			if ( element && element.name === 'image' && element.hasAttribute( 'style' ) ) {
				this.value = element.getAttribute( 'style' );
			} else {
				this.value = false;
			}
		} );

		this.listenTo( document, 'changesDone', () => {
			this.refreshState();
		} );
	}

	_checkEnabled() {
		const document = this.editor.document;
		const element = getSelectedElement( document.selection );

		// Todo: add schema checking.
		return element && element.name === 'image';
	}
}

// TODO: duplicated code - move to model selection.
function getSelectedElement( modelSelection ) {
	if ( modelSelection.rangeCount !== 1 ) {
		return null;
	}

	const range = modelSelection.getFirstRange();
	const nodeAfterStart = range.start.nodeAfter;
	const nodeBeforeEnd = range.end.nodeBefore;

	return ( nodeAfterStart instanceof ModelElement && nodeAfterStart == nodeBeforeEnd ) ? nodeAfterStart : null;
}
