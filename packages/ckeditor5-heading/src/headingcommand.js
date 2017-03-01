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
	 * @param {Array.<module:heading/headingcommand~HeadingOption>} options Heading options to be used by the command instance.
	 */
	constructor( editor, options, defaultOptionId ) {
		super( editor );

		/**
		 * Heading options used by this command.
		 *
		 * @readonly
		 * @member {module:heading/headingcommand~HeadingOption}
		 */
		this.options = options;

		/**
		 * The id of the default option among {@link #options}.
		 *
		 * @readonly
		 * @private
		 * @member {module:heading/headingcommand~HeadingOption#id}
		 */
		this._defaultOptionId = defaultOptionId;

		/**
		 * The currently selected heading option.
		 *
		 * @readonly
		 * @observable
		 * @member {module:heading/headingcommand~HeadingOption} #value
		 */
		this.set( 'value', this.defaultOption );

		// Update current value each time changes are done on document.
		this.listenTo( editor.document, 'changesDone', () => this._updateValue() );
	}

	/**
	 * The default option.
	 *
	 * @member {module:heading/headingcommand~HeadingOption} #defaultOption
	 */
	get defaultOption() {
		// See https://github.com/ckeditor/ckeditor5/issues/98.
		return this._getOptionById( this._defaultOptionId );
	}

	/**
	 * Executes command.
	 *
	 * @protected
	 * @param {Object} [options] Options for executed command.
	 * @param {String} [options.id] The identifier of the heading option that should be applied. It should be one of the
	 * {@link module:heading/headingcommand~HeadingOption heading options} provided to the command constructor. If this parameter is not
	 * provided,
	 * the value from {@link #defaultOption defaultOption} will be used.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 */
	_doExecute( options = {} ) {
		// TODO: What should happen if option is not found?
		const id = options.id || this.defaultOption.id;
		const doc = this.editor.document;
		const selection = doc.selection;
		const startPosition = selection.getFirstPosition();
		const elements = [];
		// Storing selection ranges and direction to fix selection after renaming. See ckeditor5-engine#367.
		const ranges = [ ...selection.getRanges() ];
		const isSelectionBackward = selection.isBackward;
		// If current option is same as new option - toggle already applied option back to default one.
		const shouldRemove = ( id === this.value.id );

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
				// When removing applied option.
				if ( shouldRemove ) {
					if ( element.name === id ) {
						batch.rename( element, this.defaultOption.id );
					}
				}
				// When applying new option.
				else {
					batch.rename( element, id );
				}
			}

			// If range's selection start/end is placed directly in renamed block - we need to restore it's position
			// after renaming, because renaming puts new element there.
			doc.selection.setRanges( ranges, isSelectionBackward );
		} );
	}

	/**
	 * Returns the option by a given ID.
	 *
	 * @private
	 * @param {String} id
	 * @returns {module:heading/headingcommand~HeadingOption}
	 */
	_getOptionById( id ) {
		return this.options.find( item => item.id === id ) || this.defaultOption;
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
			this.value = this._getOptionById( block.name );
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
