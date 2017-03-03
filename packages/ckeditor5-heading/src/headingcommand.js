/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';
import camelCase from '@ckeditor/ckeditor5-utils/src/lib/lodash/camelCase';

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
	 * @param {module:heading/headingcommand~HeadingOption} option An option to be used by the command instance.
	 */
	constructor( editor, option ) {
		super( editor );

		Object.assign( this, option );

		/**
		 * Name of the command
		 *
		 * @readonly
		 * @member {String}
		 */
		this.name = camelCase( 'heading ' + this.id );

		/**
		 * TODO
		 *
		 * @readonly
		 * @member {}
		 */
		this.set( 'value', false );

		// Update current value each time changes are done on document.
		this.listenTo( editor.document, 'changesDone', () => this._updateValue() );

		/**
		 * Unique identifier of the command, also element's name in the model.
		 * See {@link module:heading/headingcommand~HeadingOption#id}.
		 *
		 * @readonly
		 * @member {String} #id
		 */

		/**
		 * Element this command creates in the view.
		 * See {@link module:heading/headingcommand~HeadingOption#element}.
		 *
		 * @readonly
		 * @member {String} #element
		 */

		/**
		 * Label of this command.
		 * See {@link module:heading/headingcommand~HeadingOption#label}.
		 *
		 * @readonly
		 * @member {String} #label
		 */
	}

	/**
	 * Executes command.
	 *
	 * @protected
	 * @param {Object} [options] Options for executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 */
	_doExecute( options = {} ) {
		const id = this.id;
		const doc = this.editor.document;
		const selection = doc.selection;
		const startPosition = selection.getFirstPosition();
		const elements = [];
		// Storing selection ranges and direction to fix selection after renaming. See ckeditor5-engine#367.
		const ranges = [ ...selection.getRanges() ];
		const isSelectionBackward = selection.isBackward;

		// Collect elements to change option.
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
				batch.rename( element, id );
			}

			// If range's selection start/end is placed directly in renamed block - we need to restore it's position
			// after renaming, because renaming puts new element there.
			doc.selection.setRanges( ranges, isSelectionBackward );
		} );
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
			this.value = this.id == block.name;
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
 * Heading option descriptor.
 *
 * @typedef {Object} module:heading/headingcommand~HeadingOption
 * @property {String} id Option identifier. It will be used as the element's name in the model.
 * @property {String} element The name of the view element that will be used to represent the model element in the view.
 * @property {String} label The display name of the option.
 */
