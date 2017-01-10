/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagelaternatetext/imagealternatetextcommand
 */

import Command from 'ckeditor5-core/src/command/command';

// TODO: isImage to image utils.
import { isImage } from '../utils';

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

	_doExecute( options ) {
		const editor = this.editor;
		const doc = editor.document;
		const imageElement = doc.selection.getSelectedElement();

		doc.enqueueChanges( () => {
			const batch = options.batch || doc.batch();

			batch.setAttribute( imageElement, 'alt', options.newValue );
		} );
	}
}
