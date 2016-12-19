/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import Command from '../../core/command/command.js';
import { isImage, getStyleByValue } from './utils.js';

export default class ImageStyleCommand extends Command {
	constructor( editor, styles ) {
		super( editor );

		this.set( 'value', false );

		this.styles = styles;

		this.listenTo( editor.document, 'changesDone', () => {
			this._updateValue();
			this.refreshState();
		} );
	}

	_updateValue() {
		const doc = this.editor.document;
		const element = doc.selection.getSelectedElement();

		if ( isImage( element ) ) {
			if ( element.hasAttribute( 'style' ) ) {
				const value = element.getAttribute( 'style' );

				// Check if value exists.
				this.value = ( getStyleByValue( value, this.styles ) ? value : false );
			} else {
				// When there is no `style` attribute - set value to null.
				this.value = null;
			}
		} else {
			this.value = false;
		}
	}

	_checkEnabled() {
		const element = this.editor.document.selection.getSelectedElement();

		return isImage( element );
	}

	_doExecute( options = {} ) {
		// TODO: add batch to options.
		const currentValue = this.value;
		const newValue = options.value;

		// Check if new value is valid.
		if ( getStyleByValue( newValue, this.styles ) === undefined ) {
			return;
		}

		// Stop if same value is already applied.
		if ( currentValue == newValue ) {
			return;
		}

		const editor = this.editor;
		const doc = editor.document;
		const selection = doc.selection;
		const imageElement = selection.getSelectedElement();

		doc.enqueueChanges( () => {
			const batch = options.batch || doc.batch();

			batch.setAttribute( imageElement, 'style', newValue );
		} );
	}
}

