/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module alignment/alignmentcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';
import type { Element, Writer } from 'ckeditor5/src/engine.js';

import { isDefault } from './utils.js';
import type { SupportedOption } from './alignmentconfig.js';

const ALIGNMENT = 'alignment';

/**
 * The alignment command plugin.
 */
export default class AlignmentCommand extends Command {
	/**
	 * A value of the current block's alignment.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: SupportedOption;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const firstBlock = first( this.editor.model.document.selection.getSelectedBlocks() )!;

		// As first check whether to enable or disable the command as the value will always be false if the command cannot be enabled.
		this.isEnabled = Boolean( firstBlock ) && this._canBeAligned( firstBlock );

		if ( this.isEnabled && firstBlock.hasAttribute( 'alignment' ) ) {
			this.value = firstBlock.getAttribute( 'alignment' ) as SupportedOption;
		} else {
			this.value = locale.contentLanguageDirection === 'rtl' ? 'right' : 'left';
		}
	}

	/**
	 * Executes the command. Applies the alignment `value` to the selected blocks.
	 * If no `value` is passed, the `value` is the default one or it is equal to the currently selected block's alignment attribute,
	 * the command will remove the attribute from the selected blocks.
	 *
	 * @param options Options for the executed command.
	 * @param options.value The value to apply.
	 * @fires execute
	 */
	public override execute( options: { value?: SupportedOption } = {} ): void {
		const editor = this.editor;
		const locale = editor.locale;
		const model = editor.model;
		const doc = model.document;

		const value = options.value!;

		model.change( writer => {
			// Get only those blocks from selected that can have alignment set
			const blocks = Array.from( doc.selection.getSelectedBlocks() ).filter( block => this._canBeAligned( block ) );
			const currentAlignment = blocks[ 0 ].getAttribute( 'alignment' );

			// Remove alignment attribute if current alignment is:
			// - default (should not be stored in model as it will bloat model data)
			// - equal to currently set
			// - or no value is passed - denotes default alignment.
			const removeAlignment = isDefault( value, locale ) || currentAlignment === value || !value;

			if ( removeAlignment ) {
				removeAlignmentFromSelection( blocks, writer );
			} else {
				setAlignmentOnSelection( blocks, writer, value );
			}
		} );
	}

	/**
	 * Checks whether a block can have alignment set.
	 *
	 * @param block The block to be checked.
	 */
	private _canBeAligned( block: Element ) {
		return this.editor.model.schema.checkAttribute( block, ALIGNMENT );
	}
}

/**
 * Removes the alignment attribute from blocks.
 */
function removeAlignmentFromSelection( blocks: Array<Element>, writer: Writer ) {
	for ( const block of blocks ) {
		writer.removeAttribute( ALIGNMENT, block );
	}
}

/**
 * Sets the alignment attribute on blocks.
 */
function setAlignmentOnSelection( blocks: Array<Element>, writer: Writer, alignment: string ) {
	for ( const block of blocks ) {
		writer.setAttribute( ALIGNMENT, alignment, block );
	}
}
