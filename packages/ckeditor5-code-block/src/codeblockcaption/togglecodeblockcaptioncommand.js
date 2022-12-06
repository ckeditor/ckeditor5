/**
 * @module code-block/codeblockcaption/togglecodeblockcaptioncommand
 */

import { Command } from 'ckeditor5/src/core';

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

    }

    /**
     * Executes the command
     * 
     *      editor.execute( 'toggleCodeblockCaption' );
     * 
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

    _showCodeblockCaption( writer ) {
        console.log(`ToggleCodeblockCaptionCommand - _showCodeblockCaption called!`);
    }

    _hideCodeblockCaption( writer ) {
        console.log(`ToggleCodeblockCaptionCommand - _hideCodeblockCaption called!`);
    }
}