/**
 * @module code-block/codeblockcaption/codeblockcaptionediting
 */

import { Element, enablePlaceholder } from 'ckeditor5/src/engine';
import { toWidgetEditable } from 'ckeditor5/src/widget';
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

        this._savedCaptionsMap = new WeakMap();
    }

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const view = editor.editing.view;
        
        this._defineSchema();
        this._setupConversion();
        
        editor.commands.add( 'toggleCodeblockCaption' , new ToggleCodeblockCaptionCommand( this.editor ) );

        // Disable enter key event inside codeblock caption to prevent bug
        this.listenTo( view.document, 'enter', ( evt, data ) => {
            const doc = this.editor.model.document;
            const positionParent = doc.selection.getLastPosition().parent;
            
            if ( positionParent.name == 'caption' ) {
                data.stopPropagation();
                data.preventDefault();
                evt.stop();
            }

        } );
        
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
    
    _setupConversion() {
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
            model: 'caption',
            view: ( modelElement, { writer } ) => {
                if ( !isCodeblockWrapper( modelElement.parent ) ) {
                    return null;
                }

                const figcaptionElement = writer.createEditableElement( 'figcaption' );
                writer.setCustomProperty( 'codeblockCaption', true, figcaptionElement );

                enablePlaceholder( {
                    view,
                    element: figcaptionElement,
                    text: t( 'Enter image caption' ), //TODO: locale text change required
                    keepOnFocus: true
                } );

                return toWidgetEditable( figcaptionElement, writer );
            }
        } );
    }

    _getSavedCaption( codeblockModelElement ) {
        const jsonObject = this._savedCaptionsMap.get( codeblockModelElement );

        return jsonObject ? Element.fromJSON( jsonObject ) : null;
    }

    _saveCaption( codeblockModelElement, caption ) {
		this._savedCaptionsMap.set( codeblockModelElement, caption.toJSON() );
	}

}