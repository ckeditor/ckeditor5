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

		this.set( 'value', this.defaultFormat );

		// Listen on selection change and set current command's format to format in current selection.
		this.listenTo( editor.document.selection, 'change', () => {
			const position = editor.document.selection.getFirstPosition();
			const block = findTopmostBlock( position );

			if ( block ) {
				const format = this._getFormatById( block.name );

				// TODO: What should happen if format is not found?
				this.value = format;
			}
		} );
	}

	/**
	 * The default format.
	 *
	 * @type {Object}
	 */
	get defaultFormat() {
		// See https://github.com/ckeditor/ckeditor5/issues/98.
		return this._getFormatById( 'paragraph' );
	}

	_doExecute( formatId = this.defaultFormat.id ) {
		// TODO: What should happen if format is not found?
		const doc = this.editor.document;
		const selection = doc.selection;
		const startPosition = selection.getFirstPosition();
		const elements = [];
		// Storing selection ranges and direction to fix selection after renaming. See ckeditor5-engine#367.
		const ranges = [ ...selection.getRanges() ];
		const isSelectionBackward = selection.isBackward;
		// If current format is same as new format - toggle already applied format back to default one.
		const shouldRemove = ( formatId === this.value.id );

		// Collect elements to change format.
		// This implementation may not be future proof but it's satisfactory at this stage.
		if ( selection.isCollapsed ) {
			const block = findTopmostBlock( startPosition );

			if ( block ) {
				elements.push( block );
			}
		} else {
			for ( let range of ranges ) {
				let startBlock = findTopmostBlock( range.start );
				const endBlock = findTopmostBlock( range.end, false );

				elements.push( startBlock );

				while ( startBlock !== endBlock ) {
					startBlock = startBlock.nextSibling;
					elements.push( startBlock );
				}
			}
		}

		doc.enqueueChanges( () => {
			const batch = doc.batch();

			for ( let element of elements ) {
				// When removing applied format.
				if ( shouldRemove ) {
					if ( element.name === formatId ) {
						batch.rename( this.defaultFormat.id, element );
					}
				}
				// When applying new format.
				else {
					batch.rename( formatId, element );
				}
			}

			// If range's selection start/end is placed directly in renamed block - we need to restore it's position
			// after renaming, because renaming puts new element there.
			doc.selection.setRanges( ranges, isSelectionBackward );
		} );
	}

	/**
	 * Returns format by given id.
	 *
	 * @private
	 * @param {String} id
	 * @returns {Object}
	 */
	_getFormatById( id ) {
		return this.formats.find( item => item.id === id );
	}
}

// Looks for topmost element from position parent to element placed in root.
//
// NOTE: This method does not checks schema directly - assumes that only block elements can be placed directly inside
// root.
//
// @private
// @param {engine.model.Position} position
// @param {Boolean} [nodeAfter=true] When position is placed inside root element this will determine if element before
// or after given position will be returned.
// @returns {engine.model.Element}
function findTopmostBlock( position, nodeAfter = true ) {
	let parent = position.parent;

	// If position is placed inside root - get element after/before it.
	if ( parent instanceof RootElement ) {
		return nodeAfter ? position.nodeAfter : position.nodeBefore;
	}

	while ( !( parent.parent instanceof RootElement ) ) {
		parent = parent.parent;
	}

	return parent;
}
