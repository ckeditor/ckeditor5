/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import first from '@ckeditor/ckeditor5-utils/src/first';
import upperFirst from '@ckeditor/ckeditor5-utils/src/lib/lodash/upperFirst';

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
	 * @param {'left'|'right'|'center'|'justify'} alignment Alignment value to be handled by this command.
	 * @param {Boolean} isDefault Indicates if the command is the default alignment.
	 */
	constructor( editor, alignment, isDefault ) {
		super( editor );

		/**
		 * The alignment value handled by the command.
		 *
		 * @readonly
		 * @member {'left'|'right'|'center'|'justify'}
		 */
		this.alignment = alignment;

		/**
		 * Whether this command is the default alignment.
		 *
		 * @readonly
		 * @private
		 * @member {Boolean}
		 */
		this._isDefault = isDefault;

		/**
		 * A flag indicating whether the command is active, which means that the selection starts in a block
		 * which has the same alignment as {@link #alignment this command}.
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
		const firstBlock = first( this.editor.model.document.selection.getSelectedBlocks() );

		// As first check whether to enable or disable command as value will be always false if command cannot be enabled.
		this.isEnabled = !!firstBlock && this._canBeAligned( firstBlock );
		this.value = this._getValue( firstBlock );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 */
	execute() {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;

		model.change( writer => {
			// Get only those blocks from selected that can have alignment set
			const blocks = Array.from( doc.selection.getSelectedBlocks() ).filter( block => this._canBeAligned( block ) );

			// Remove alignment attribute if current alignment is as selected or is default one.
			// Default alignment should not be stored in model as it will bloat model data.
			if ( this.value || this._isDefault ) {
				removeAlignmentFromSelection( blocks, writer );
			} else {
				setAlignmentOnSelection( blocks, writer, this.alignment );
			}
		} );
	}

	/**
	 * Checks whether block can have alignment set.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} block A block to be checked.
	 * @returns {Boolean}
	 */
	_canBeAligned( block ) {
		return this.editor.model.schema.checkAttribute( block, 'alignment' );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} firstBlock A first block in selection to be checked.
	 * @returns {Boolean} The current value.
	 */
	_getValue( firstBlock ) {
		// The #_checkEnabled is checked as first so if command is disabled it's value is also false.
		if ( !this.isEnabled || !firstBlock ) {
			return false;
		}

		const selectionAlignment = firstBlock.getAttribute( 'alignment' );

		// Command's value will be on when command's alignment matches the alignment of the current block,
		// or when it's the default alignment and the block has no alignment set.
		return selectionAlignment ? selectionAlignment === this.alignment : this._isDefault;
	}
}

/**
 * Helper function that returns command name for alignment option.
 *
 * @param {String} option
 * @returns {String}
 */
export function commandNameFromOptionName( option ) {
	return `align${ upperFirst( option ) }`;
}

// Removes alignment attribute from blocks.
// @private
function removeAlignmentFromSelection( blocks, writer ) {
	for ( const block of blocks ) {
		writer.removeAttribute( 'alignment', block );
	}
}

// Sets alignment attribute on blocks.
// @private
function setAlignmentOnSelection( blocks, writer, alignment ) {
	for ( const block of blocks ) {
		writer.setAttribute( 'alignment', alignment, block );
	}
}
