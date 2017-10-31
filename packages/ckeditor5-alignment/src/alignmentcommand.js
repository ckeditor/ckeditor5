/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The alignment command plugin.
 *
 * @extends module:core/command~Command
 */
export default class AlignmentCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {'left'|'right'|'center'|'justify'} type Alignment type to be handled by this command.
	 */
	constructor( editor, type ) {
		super( editor );

		/**
		 * The type of the list created by the command.
		 *
		 * @readonly
		 * @member {'left'|'right'|'center'|'justify'}
		 */
		this.type = type;

		/**
		 * A flag indicating whether the command is active, which means that the selection starts in a block
		 * that has defined alignment of the same type.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const firstBlock = first( this.editor.document.selection.getSelectedBlocks() );

		// As first check whether to enable or disable command as value will be always false if command cannot be enabled.
		this.isEnabled = this._checkEnabled( firstBlock );
		this.value = this._getValue( firstBlock );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 */
	execute( options = {} ) {
		const editor = this.editor;
		const document = editor.document;

		document.enqueueChanges( () => {
			const batch = options.batch || document.batch();
			const blocks = Array.from( document.selection.getSelectedBlocks() );

			if ( this._isDefault() ) {
				removeAlignmentFromSelection( blocks, batch );
			} else {
				addAlignmentToSelection( blocks, batch, this.type );
			}
		} );
	}

	/**
	 * Checks whether the command is default in given context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_isDefault() {
		return this.type === 'left';
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled( firstBlock ) {
		if ( !firstBlock ) {
			return false;
		}

		const schema = this.editor.document.schema;

		return schema.check( {
			name: firstBlock.name,
			attributes: [ ...firstBlock.getAttributeKeys(), 'alignment' ]
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Boolean} The current value.
	 */
	_getValue( firstBlock ) {
		if ( !this.isEnabled || !firstBlock ) {
			return false;
		}

		const currentAlignment = firstBlock.getAttribute( 'alignment' );

		return currentAlignment ? currentAlignment === this.type : this._isDefault();
	}
}

// Removes alignment attribute from blocks.
// @private
function removeAlignmentFromSelection( blocks, batch ) {
	for ( const block of blocks ) {
		batch.removeAttribute( block, 'alignment' );
	}
}

// Sets alignment attribute on blocks.
// @private
function addAlignmentToSelection( blocks, batch, type ) {
	for ( const block of blocks ) {
		batch.setAttribute( block, 'alignment', type );
	}
}
