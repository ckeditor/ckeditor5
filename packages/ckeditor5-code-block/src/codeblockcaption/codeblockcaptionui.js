/**
 * @module code-block/codeblockcaption/codeblockcaptionui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import { getCodeblockCaptionFromModelSelection } from './utils';

/**
 * The codeblock caption UI plugin. It introduces the `'toggleCodeblockCaption'` UI button.
 * 
 * @extends module:core/plugin~Plugin
 */
export default class CodeblockCaptionUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CodeblockCaptionUI';
    }

    /**
     * @inheritDoc
     */
    init() {

        const editor = this.editor;
        const editingView = editor.editing.view;
        const t = editor.t;

        editor.ui.componentFactory.add( 'toggleCodeblockCaption', locale => {
            const command = editor.commands.get( 'toggleCodeblockCaption' );
            const view = new ButtonView( locale );

            view.set( {
                icon: icons.caption,
                tooltip: true,
                isToggleable: true
            } );

            view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
            view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

            this.listenTo( view, 'execute', () => {
                editor.execute( 'toggleCodeblockCaption' );
                
                // Scroll to the selection and highlight the caption if the caption showed up.
                const modelCaptionElement = getCodeblockCaptionFromModelSelection( editor.model.document.selection );

                if ( modelCaptionElement ) {
                    const figcaptionElement = editor.editing.mapper.toViewElement ( modelCaptionElement );

                    editingView.scrollToTheSelection();

                    editingView.change( writer => {
                        writer.addClass( 'codeblock__caption_highlighted', figcaptionElement );
                    } );
                }
                
                editor.editing.view.focus();
            } );


            return view;
        } );
        
    }

}
