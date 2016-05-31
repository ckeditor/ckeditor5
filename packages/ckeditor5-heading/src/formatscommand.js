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
		const position = selection.getFirstPosition();
		const elements = [];
		let remove = false;

		// If current format is same as new format - toggle already applied format back to default one.
		if ( newValue === this.format.id ) {
			remove = true;
		}

		if ( selection.isCollapsed ) {
			elements.push( position.parent );
		} else {
			const ranges = selection.getRanges();

			for ( let range in ranges ) {
				const start = range.start;
				const end = range.end;

				console.log( start );
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
