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
 * * registering the {@link module:code-block/codeblockcaption/togglecodeblockcaptioncommand~ToggleCodeblockCaptionCommand `toggleCodeblockCaption`} command.
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

        /**
         * A map that keeps saved JSONified codeblock captions and codeblock model element 
         * they are associated with.
         * 
         * To learn more about this system, see {@link #_saveCaption}.
         * 
         * @member {WeakMap.<module:engine/model/element~Element,Object>}
         */
        this._savedCaptionsMap = new WeakMap();
    }

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const view = editor.editing.view;
        
        // Schema configuration.
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
    
    /**
     * Configures conversion pipelines to support upcasting and downcasting codeblock captions.
     */
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
                    text: t( 'Enter codeblock caption' ),
                    keepOnFocus: true
                } );

                return toWidgetEditable( figcaptionElement, writer );
            }
        } );
    }

    /**
     * Returns the saved {@link module:engine/model/element~Element#toJSON JSONified} caption
     * of an codeblock model element.
     * 
     * See {@link #_saveCaption}.
     * 
     * @protected
     * @param {module:engine/model/element~Element} codeblockModelElement The model element the caption should be returned for.
     * @returns {module:engine/model/element~Element|null} The model caption element or `null` if there is none.
     */
    _getSavedCaption( codeblockModelElement ) {
        const jsonObject = this._savedCaptionsMap.get( codeblockModelElement );

        return jsonObject ? Element.fromJSON( jsonObject ) : null;
    }

    /**
     * Saves a {@link module:engine/model/element~Element#toJSON JSONified} caption for an codeblock element to allow restoring it in the future.
     * 
     * A caption is saved every time it gets hidden and/or the type of an codeblock changes.
     * The user should be able to restore it on demand.
     * 
     * **Note**: The caption cannot be stored in the codeblock model element attribute because, for the instance, when the model state propagates to collaborators, the attribute would get lost (mainly because it does not convert to anything when the caption is hidden) and the states of collaborators' models would de-synchronize causing numerous issues.
     * See {@link #_getSavedCaption}.
     * @param {module:engine/model/element~Element} codeblockModelElement The model element the caption is saved for.
     * @param {module:engine/model/element~Element} caption The caption model element to be saved.
     */
    _saveCaption( codeblockModelElement, caption ) {
		this._savedCaptionsMap.set( codeblockModelElement, caption.toJSON() );
	}

}
