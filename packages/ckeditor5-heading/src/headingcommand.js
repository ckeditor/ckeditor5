/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';

/**
 * The heading command. It is used by the {@link module:heading/heading~Heading heading feature} to apply headings.
 *
 * @extends module:core/command/command~Command
 */
export default class HeadingCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {Array.<module:heading/headingcommand~HeadingFormat>} formats Heading formats to be used by the command instance.
	 */
	constructor( editor, formats ) {
		super( editor );

		/**
		 * Heading formats used by this command.
		 *
		 * @readonly
		 * @member {module:heading/headingcommand~HeadingFormat}
		 */
		this.formats = formats;

		/**
		 * The currently selected heading format.
		 *
		 * @readonly
		 * @observable
		 * @member {module:heading/headingcommand~HeadingFormat} #value
		 */
		this.set( 'value', this.defaultFormat );

		// Update current value each time changes are done on document.
		this.listenTo( editor.document, 'changesDone', () => this._updateValue() );
	}

	/**
	 * The default format.
	 *
	 * @member {module:heading/headingcommand~HeadingFormat} #defaultFormat
	 */
	get defaultFormat() {
		// See https://github.com/ckeditor/ckeditor5/issues/98.
		return this._getFormatById( 'paragraph' );
	}

	/**
	 * Executes command.
	 *
	 * @protected
	 * @param {Object} [options] Options for executed command.
	 * @param {String} [options.formatId] The identifier of the heading format that should be applied. It should be one of the
	 * {@link module:heading/headingcommand~HeadingFormat heading formats} provided to the command constructor. If this parameter is not
	 * provided,
	 * the value from {@link #defaultFormat defaultFormat} will be used.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 */
	_doExecute( options = {} ) {
		// TODO: What should happen if format is not found?
		const formatId = options.formatId || this.defaultFormat.id;
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
			const batch = options.batch || doc.batch();

			for ( let element of elements ) {
				// When removing applied format.
				if ( shouldRemove ) {
					if ( element.name === formatId ) {
						batch.rename( element, this.defaultFormat.id );
					}
				}
				// When applying new format.
				else {
					batch.rename( element, formatId );
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
	 * @returns {module:heading/headingcommand~HeadingFormat}
	 */
	_getFormatById( id ) {
		return this.formats.find( item => item.id === id ) || this.defaultFormat;
	}

	/**
	 * Updates command's {@link #value value} based on current selection.
	 *
	 * @private
	 */
	_updateValue() {
		const position = this.editor.document.selection.getFirstPosition();
		const block = findTopmostBlock( position );

		if ( block ) {
			this.value = this._getFormatById( block.name );
		}
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
 * @typedef {Object} module:heading/headingcommand~HeadingFormat
 * @property {String} id Format identifier. It will be used as the element's name in the model.
 * @property {String} viewElement The name of the view element that will be used to represent the model element in the view.
 * @property {String} label The display name of the format.
 */
