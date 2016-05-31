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
		this.defaultFormat = this._getDefaultFormat();

		this.set( 'format', this.defaultFormat );

		// Listen on selection change and set current command's format to format in current selection.
		this.listenTo( editor.document.selection, 'change', () => {
			const position = editor.document.selection.getFirstPosition();
			const parent = position.parent;
			const format = this._getFormatById( parent.name );

			// TODO: What should happen if current format is not found? Is it possible?
			if ( format !== undefined ) {
				this.format = format;
			}
		} );
	}

	_doExecute( formatId ) {
		// TODO: Check if format Id is valid.
		const document = this.editor.document;
		const selection = document.selection;
		const newValue = ( formatId === undefined ) ? this.defaultFormat.id : formatId;
		const startPosition = selection.getFirstPosition();
		const elements = [];
		let remove = false;

		// If current format is same as new format - toggle already applied format back to default one.
		if ( newValue === this.format.id ) {
			remove = true;
		}

		// Collect elements to change format.
		if ( selection.isCollapsed ) {
			elements.push( _findTopmostBlock( startPosition.parent ) );
		} else {
			const ranges = selection.getRanges();

			for ( let range in ranges ) {
				// Get topmost blocks element from start and end range position and adds all elements between them.
				let startBlock = _findTopmostBlock( range.start.parent );
				const endBlock = _findTopmostBlock( range.end.parent );

				elements.push( startBlock );

				while ( startBlock !== endBlock ) {
					startBlock = startBlock.getNextSibling();
					elements.push( startBlock );
				}
			}
		}

		//TODO: when selection is not collapsed - gather all elements that needs to be renamed.

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

	_getFormatById( id ) {
		return this.formats.find( ( item ) => {
			return item.id && item.id === id;
		} );
	}

	_getDefaultFormat() {
		return this.formats.find( ( item ) => {
			return item.default;
		} );
	}
}

function _findTopmostBlock( element ) {
	while ( element.parent.name !== '$root' ) {
		element = element.parent;
	}

	return element;
}
