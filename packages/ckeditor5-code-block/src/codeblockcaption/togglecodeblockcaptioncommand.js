/**
 * @module code-block/codeblockcaption/togglecodeblockcaptioncommand
 */

import { Command } from 'ckeditor5/src/core';
import { getClosestSelectedCodeblockElement } from '../utils';
import { getCaptionFromCodeblockModelElement } from './utils';

/**
 * The toggle codeblock caption command.
 * 
 * This command is registered by {@link module:code-block/codeblockcaption/codeblockcaptionediting~CodeblockCaptionEditing} as the `'toggleCodeblockCaption'` editor command.
 * 
 * Executing this command:
 * 
 * * either adds or removes the image caption of a selected image (depending on whether the caption is present or not),
 * * removes the image caption if the selection is anchored in one.
 * 
 *      // Toggle the presence of the caption.
 *      editor.execute( 'toggleCodeblockCaption' );
 * 
 * **Note**: Upon executing this command, the selection will be set on the codeblock if previously anchored in the caption element.
 * 
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using the `focusCaptionOnShow` option:
 * 
 *      editor.execute( 'toggleCodeblockCaption', { focusCaptionOnShow: true } );
 * 
 * @extends module:core/command~Command
 */
export default class ToggleCodeblockCaptionCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const editor = this.editor;

        // Only codeblock caption plugin is loaded.
        if ( !editor.plugins.has( 'CodeblockCaption' ) ) {
            this.isEnabled = false;
            this.value = false;
            return;
        }

        const selection = editor.model.document.selection;

        if ( !selection ) {

            this.isEnabled = false;
            this.value = false;

            return;
        }

        const selectedCodeblockElement = getClosestSelectedCodeblockElement( selection );

        this.isEnabled = !!selectedCodeblockElement
        
        if ( !this.isEnabled ) {
            this.value = false;
        } else {
            this.value = !!getCaptionFromCodeblockModelElement( selectedCodeblockElement );
        }


    }

    /**
     * Executes the command
     * 
     *      editor.execute( 'toggleCodeblockCaption' );
     * @fires execute
     */
    execute() {
        this.editor.model.change( writer => {
            if ( this.value ) {
                this._hideCodeblockCaption( writer );
            } else {
                this._showCodeblockCaption( writer );
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
    _showCodeblockCaption( writer ) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const codeblockCaptionEditing = editor.plugins.get( 'CodeblockCaptionEditing' );

        let selectedCodeblock = getClosestSelectedCodeblockElement( selection );

        const savedCaption = codeblockCaptionEditing._getSavedCaption( selectedCodeblock );

        const newCaptionElement = savedCaption || writer.createElement( 'caption' );

        writer.append( newCaptionElement, selectedCodeblock );

        // TODO: Slight UI Bug -> Even though selection is inside newCaptionElement, it is not editable immediately. Additional click is required to trigger editable status.
        writer.setSelection( newCaptionElement, 'in' );
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
    _hideCodeblockCaption( writer ) {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const codeblockCaptionEditing = this.editor.plugins.get( 'CodeblockCaptionEditing' );

        let selectedCodeblock = getClosestSelectedCodeblockElement( selection );
        let captionElement = getCaptionFromCodeblockModelElement( selectedCodeblock );

        // Store the caption content so it can be restored quickly if the user changes their mind.
        codeblockCaptionEditing._saveCaption( selectedCodeblock, captionElement );

        writer.setSelection( selectedCodeblock, 'end' );
        writer.remove( captionElement );
    }
}
