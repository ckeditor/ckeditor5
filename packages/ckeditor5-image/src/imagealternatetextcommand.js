/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/alternatetextcommand
 */

import Command from 'ckeditor5-core/src/command/command';

// TODO: isImage to image utils.
import { isImage } from './imagestyle/utils';

export default class ImageAlternateTextCommand extends Command {
	constructor( editor ) {
		super( editor );

		this.set( 'value', false );

		// Update current value and refresh state each time something change in model document.
		this.listenTo( editor.document, 'changesDone', () => {
			this._updateValue();
			this.refreshState();
		} );
	}

	_updateValue() {
		const doc = this.editor.document;
		const element = doc.selection.getSelectedElement();

		if ( isImage( element ) && element.hasAttribute( 'alt' ) ) {
			this.value = element.getAttribute( 'alt' );
		} else {
			this.value = false;
		}
	}

	_checkEnabled() {
		const element = this.editor.document.selection.getSelectedElement();

		return isImage( element );
	}

	_doExecute() {
		console.log( 'attribute change command execute' );
	}
}
