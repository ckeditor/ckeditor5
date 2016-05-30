/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from '../command.js';

export default class FormatsCommand extends Command {
	constructor( editor ) {
		super( editor );

		this.set( 'value', 'paragraph' );

		this.listenTo( editor.document.selection, 'change', () => {
			const position = editor.document.selection.getFirstPosition();
			const parent = position.parent;

			switch ( parent.name ) {
				case 'h2':
					this.value = 'heading1';
					break;

				case 'h3':
					this.value = 'heading2';
					break;

				case 'h4':
					this.value = 'heading3';
					break;

				default:
					this.value = 'paragraph';
			}
		} );
	}

	_doExecute( forceValue ) {
		const document = this.editor.document;
		const selection = document.selection;
		const value = ( forceValue === undefined ) ? 'paragraph' : forceValue;
		let element;

		if ( selection.isCollapsed ) {
			const position = selection.getFirstPosition();
			element = position.parent;
		}

		const batch = document.batch();
		batch.rename( value, element );
	}
}
