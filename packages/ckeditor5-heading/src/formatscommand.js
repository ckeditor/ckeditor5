/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from '../command/command.js';

export default class FormatsCommand extends Command {
	constructor( editor, formats ) {
		super( editor );

		this.formats = formats;
		this.defaultFormat = this.formats[ 0 ];

		this.set( 'value', this.formats[ 0 ] );

		this.listenTo( editor.document.selection, 'change', () => {
			const position = editor.document.selection.getFirstPosition();
			const parent = position.parent;
			this.value = parent.name;
		} );
	}

	_doExecute( forceValue ) {
		const document = this.editor.document;
		const selection = document.selection;
		const newValue = ( forceValue === undefined ) ? 'paragraph' : forceValue;
		const position = selection.getFirstPosition();
		const elements = [];
		let remove = false;

		// If start position is same as new value - we are toggling already applied format back to default one.
		if ( newValue === position.parent.name ) {
			remove = true;
		}

		if ( selection.isCollapsed ) {
			elements.push( position.parent );
		}

		document.enqueueChanges( () => {
			const batch = document.batch();

			for ( let element of elements ) {
				// When removing applied format.
				if ( remove ) {
					if ( element.name === newValue ) {
						batch.rename( this.defaultFormat.id, element );
					}
				}
				// When applying new format.
				else {
					batch.rename( newValue, element );
				}
			}
		} );
	}
}
