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
            console.log(`Einstrasse: the codeblock caption plugin is not loaded!`);
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
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const codeblockCaptionEditing = editor.plugins.get( 'CodeblockCaptionEditing' );

        let selectedCodeblock = getClosestSelectedCodeblockElement( selection );

        const savedCaption = codeblockCaptionEditing._getSavedCaption( selectedCodeblock );

        const newCaptionElement = savedCaption || writer.createElement( 'caption' );

        writer.append( newCaptionElement, selectedCodeblock );

        // To enable editable focus, setSelection for selectedCodeblock should be called in advance.
        writer.setSelection( selectedCodeblock, 'on' );
        writer.setSelection( newCaptionElement, 'on' );
    }

    _hideCodeblockCaption( writer ) {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const codeblockCaptionEditing = this.editor.plugins.get( 'CodeblockCaptionEditing' );

        let selectedCodeblock = getClosestSelectedCodeblockElement( selection );
        let captionElement = getCaptionFromCodeblockModelElement( selectedCodeblock );

        codeblockCaptionEditing._saveCaption( selectedCodeblock, captionElement );

        writer.setSelection( selectedCodeblock, 'end' );
        writer.remove( captionElement );
    }
}