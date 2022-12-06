/**
 * @module code-block/codeblockcaption/codeblockcaptionediting
 */

import { enablePlaceholder } from '@ckeditor/ckeditor5-engine';
import { isIterable } from '@ckeditor/ckeditor5-utils';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget';
import { Plugin } from 'ckeditor5/src/core';
import ToggleCodeblockCaptionCommand from './togglecodeblockcaptioncommand';
import { matchCodeblockCaptionViewElement, isCodeblockWrapper } from './utils';

/**
 * The codeblock caption engine plugin. It is responsible for:
 * 
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the 
 * 
 * @extends module:core/plugin~Plugin
 */

export default class CodeblockCaptionEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get require() {
        return [];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CodeblockCaptionEditing';
    }

    /**
     * @inheritDoc
     */
    constructor( editor ) {
        super ( editor );
    }

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        
        this._defineSchema();
        this._defineConverter();
        
        editor.commands.add( 'toggleCodeblockCaption' , new ToggleCodeblockCaptionCommand( this.editor ) );
        
    }
    
    _defineSchema() {
        console.log(`codeblockCaptionEditing define Schema Called!`);

        const editor = this.editor;
        const schema = editor.model.schema;
        if ( !schema.isRegistered( 'caption' ) ) {
            schema.register( 'caption', {
                allowIn: 'codeBlock',
                allowContentOf: '$block',
                isLimit: true
            } );
        } else {
            schema.extend( 'caption', {
                allowIn: 'codeBlock'
            } );
        }
        
    }
    
    _defineConverter() {
        const editor = this.editor;
        const view = editor.editing.view;
        const t = editor.t;
        // View -> model converter for the data pipeline.
        editor.conversion.for( 'upcast' ).elementToElement( {
            view: matchCodeblockCaptionViewElement,
            model: 'caption'
        } );

        // Model -> view converter for the data pipeline.
        editor.conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'caption',
            view: ( modelElement, { writer } ) => {
                if ( !isCodeblockWrapper( modelElement.parent ) ) {
                    return null;
                }

                return writer.createContainerElement( 'figcaption' );
            }
        } );

        // Model -> view converter for the editing pipeline.
        editor.conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'cation',
            view: ( modelElement, { writer } ) => {
                if ( !isCodeblockWrapper( modelElement.parent ) ) {
                    return null;
                }

                const figcaptionElement = writer.createEditableElement( 'figcaption' );
                writer.setCustomProperty( 'codeblockCaption', true, figcaptionElement );

                enablePlaceholder( {
                    view,
                    element: figcaptionElement,
                    text: t( 'Enter codeblock caption' ),
                    keepOnFocus: true
                } );

                return toWidgetEditable( figcaptionElement, writer );
            }
        } );
    }

}