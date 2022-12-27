/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockcaption/togglecodeblockcaptioncommand
 */

import { Command } from 'ckeditor5/src/core';
import { getClosestSelectedCodeblockElement } from '../utils';
import { getCaptionFromCodeblockModelElement } from './utils';
import type CodeblockCaptionEditing from './codeblockcaptionediting';
import type { Writer } from 'ckeditor5/src/engine';

const CODEBLOCKCAPTIONEDITING = 'CodeblockCaptionEditing';

/**
 * The toggle codeblock caption command.
 *
 * This command is registered by {@link module:code-block/codeblockcaption/codeblockcaptionediting~CodeblockCaptionEditing}
 * as the `'toggleCodeblockCaption'` editor command.
 *
 * Executing this command:
 *
 * * either adds or removes the image caption of a selected image (depending on whether the caption is present or not),
 * * removes the image caption if the selection is anchored in one.
 *
 *	  // Toggle the presence of the caption.
 *	  editor.execute( 'toggleCodeblockCaption' );
 *
 * **Note**: Upon executing this command, the selection will be set on the codeblock if previously anchored in the caption element.
 *
 * **Note**: You can move the selection to the caption right
 * away as it shows up upon executing this command by using the `focusCaptionOnShow` option:
 *
 *	  editor.execute( 'toggleCodeblockCaption', { focusCaptionOnShow: true } );
 *
 * @extends module:core/command~Command
 */
export default class ToggleCodeblockCaptionCommand extends Command {
	/**
	 * Command which toggle existance of caption for codeblock.
	 *
	 * @observable
	 */
	declare public value: boolean;
	declare public isEnabled: boolean;

	public override refresh(): void {
		const editor = this.editor;

		// Only codeblock caption plugin is loaded.
		if ( !editor.plugins.has( 'CodeblockCaption' ) ) {
			this.isEnabled = false;
			this.value = false;
			return;
		}

		const selection = editor.model.document.selection;

		const selectedCodeblockElement = getClosestSelectedCodeblockElement( selection );

		this.isEnabled = !!selectedCodeblockElement;

		if ( !this.isEnabled ) {
			this.value = false;
		} else {
			this.value = !!getCaptionFromCodeblockModelElement( selectedCodeblockElement! );
		}
	}

	/**
	 * Executes the command
	 *
	 *	  editor.execute( 'toggleCodeblockCaption' );
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.focusCaptionOnShow] When true and the caption shows up, the selection will be moved into it straight away.
	 * @fires execute
	 */
	public override execute( options: {
		focusCaptionOnShow?: boolean;
	} = {} ): void {
		const { focusCaptionOnShow } = options;
		this.editor.model.change( writer => {
			if ( this.value ) {
				this._hideCodeblockCaption( writer );
			} else {
				this._showCodeblockCaption( writer, focusCaptionOnShow );
			}
		} );
	}

	/**
	 * Shows the caption of the `<codeBlock>`. Also:
	 *
	 * * it attempts to restore the caption content from the `CodeblockCaptionEditing` caption registry.
	 * * it shall moves the selection to the captino right away, but with some UI focus bug issue, it is not editable right away.
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	private _showCodeblockCaption( writer: Writer, focusCaptionOnShow: boolean | undefined ): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const codeblockCaptionEditing = editor.plugins.get( CODEBLOCKCAPTIONEDITING ) as CodeblockCaptionEditing;

		const selectedCodeblock = getClosestSelectedCodeblockElement( selection )!;

		const savedCaption = codeblockCaptionEditing._getSavedCaption( selectedCodeblock );

		const newCaptionElement = savedCaption || writer.createElement( 'caption' );

		writer.append( newCaptionElement, selectedCodeblock );

		editor.editing.view.document.isFocused = true;
		if ( focusCaptionOnShow ) {
			writer.setSelection( newCaptionElement, 'in' );
		} else if ( selection.getFirstPosition()!.isAtEnd ) {
			writer.setSelection( newCaptionElement, 'before' );
		}
	}

	/**
	 * Hides the caption of a selected image (or an image caption the selection is anchored to).
	 *
	 * The content of the caption is stored in the `CodeblockCaptionEditing` caption registry to make this
	 * a reversible action.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	private _hideCodeblockCaption( writer: Writer ): void {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const codeblockCaptionEditing = this.editor.plugins.get( CODEBLOCKCAPTIONEDITING ) as CodeblockCaptionEditing;

		const selectedCodeblock = getClosestSelectedCodeblockElement( selection )!;
		const captionElement = getCaptionFromCodeblockModelElement( selectedCodeblock );

		// Store the caption content so it can be restored quickly if the user changes their mind.
		codeblockCaptionEditing._saveCaption( selectedCodeblock, captionElement! );

		// writer.setSelection( selectedCodeblock, 'end' );
		writer.remove( captionElement! );
	}
}

