/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from '../command/command.js';
import RootElement from '../engine/model/rootelement.js';

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
			const block = _findTopmostBlock( startPosition );

			if ( block ) {
				elements.push( block );
			}
		} else {
			const ranges = selection.getRanges();

			for ( let range in ranges ) {
				let startBlock = _findTopmostBlock( range.start );
				const endBlock = _findTopmostBlock( range.end, false );

				elements.push( startBlock );

				while ( startBlock !== endBlock ) {
					startBlock = startBlock.getNextSibling();
					elements.push( startBlock );
				}
			}
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

function _findTopmostBlock( position, nodeAfter = true ) {
	let parent = position.parent;

	// If position is placed inside root - get element after/before it.
	if ( parent instanceof RootElement ) {
		return nodeAfter ? position.nodeAfter : position.nodeBefore ;
	}

	while ( !( parent instanceof RootElement ) ) {
		parent = parent.parent;
	}

	return parent;
}
