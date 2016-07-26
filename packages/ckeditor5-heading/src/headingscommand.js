/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../command/command.js';
import RootElement from '../engine/model/rootelement.js';

/**
 * The headings command. It is used by the {@link headings.Headings headings feature}.
 *
 * @memberOf headings
 * @extends ckeditor5.command.Command
 */
export default class HeadingsCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {ckeditor5.editor.Editor} editor Editor instance.
	 * @param {Array.<headings.HeadingsFormat>} formats Heading formats to be used by the command instance.
	 */
	constructor( editor, formats ) {
		super( editor );

		/**
		 * Heading formats used by this command.
		 *
		 * @readonly
		 * @member {headings.HeadingsFormat} headings.HeadingsCommand#formats
		 */
		this.formats = formats;

		/**
		 * The currently selected heading format.
		 *
		 * @readonly
		 * @observable
		 * @member {headings.HeadingsFormat} headings.HeadingsCommand#value
		 */
		this.set( 'value', this.defaultFormat );

		// Listen on selection change and set current command's format to format in the current selection.
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
	 * @type {headings.HeadingsFormat}
	 */
	get defaultFormat() {
		// See https://github.com/ckeditor/ckeditor5/issues/98.
		return this._getFormatById( 'paragraph' );
	}

	/**
	 * Executes the command if it is enabled.
	 *
	 * @param {String} [formatId] The identifier of the heading format that should be applied. It should be one of the
	 * {@link headings.HeadingsFormat heading formats} provided to the command constructor. If this parameter is not provided,
	 * the value from {@link headings.HeadingsCommand#defaultFormat defaultFormat} will be used.
	 */
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
	 * Returns the format by a given ID.
	 *
	 * @private
	 * @param {String} id
	 * @returns {headings.HeadingsFormat}
	 */
	_getFormatById( id ) {
		return this.formats.find( item => item.id === id );
	}
}

// Looks for the topmost element in the position's ancestor (up to an element in the root).
//
// NOTE: This method does not check the schema directly &mdash; it assumes that only block elements can be placed directly inside
// the root.
//
// @private
// @param {engine.model.Position} position
// @param {Boolean} [nodeAfter=true] When the position is placed inside the root element, this will determine if the element before
// or after a given position will be returned.
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

/**
 * Heading format descriptor.
 *
 * @typedef {Object} headings.HeadingsFormat
 * @property {String} id Format identifier. It will be used as the element's name in the model.
 * @property {String} viewElement The name of the view element that will be used to represent the model element in the view.
 * @property {String} label The display name of the format.
 */
