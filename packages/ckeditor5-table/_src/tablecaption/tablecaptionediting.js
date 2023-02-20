/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecaption/tablecaptionediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Element, enablePlaceholder } from 'ckeditor5/src/engine';
import { toWidgetEditable } from 'ckeditor5/src/widget';

import injectTableCaptionPostFixer from '../converters/table-caption-post-fixer';
import ToggleTableCaptionCommand from './toggletablecaptioncommand';
import { isTable, matchTableCaptionViewElement } from './utils';

/**
 * The table caption editing plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCaptionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCaptionEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A map that keeps saved JSONified table captions and table model elements they are
		 * associated with.
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
		const schema = editor.model.schema;
		const view = editor.editing.view;
		const t = editor.t;

		if ( !schema.isRegistered( 'caption' ) ) {
			schema.register( 'caption', {
				allowIn: 'table',
				allowContentOf: '$block',
				isLimit: true
			} );
		} else {
			schema.extend( 'caption', {
				allowIn: 'table'
			} );
		}

		editor.commands.add( 'toggleTableCaption', new ToggleTableCaptionCommand( this.editor ) );

		// View -> model converter for the data pipeline.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: matchTableCaptionViewElement,
			model: 'caption'
		} );

		// Model -> view converter for the data pipeline.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isTable( modelElement.parent ) ) {
					return null;
				}

				return writer.createContainerElement( 'figcaption' );
			}
		} );

		// Model -> view converter for the editing pipeline.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isTable( modelElement.parent ) ) {
					return null;
				}

				const figcaptionElement = writer.createEditableElement( 'figcaption' );
				writer.setCustomProperty( 'tableCaption', true, figcaptionElement );

				enablePlaceholder( {
					view,
					element: figcaptionElement,
					text: t( 'Enter table caption' ),
					keepOnFocus: true
				} );

				return toWidgetEditable( figcaptionElement, writer );
			}
		} );

		injectTableCaptionPostFixer( editor.model );
	}

	/**
	 * Returns the saved {@link module:engine/model/element~Element#toJSON JSONified} caption
	 * of a table model element.
	 *
	 * See {@link #_saveCaption}.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} tableModelElement The model element the
	 * caption should be returned for.
	 * @returns {module:engine/model/element~Element|null} The model caption element or `null` if there is none.
	 */
	_getSavedCaption( tableModelElement ) {
		const jsonObject = this._savedCaptionsMap.get( tableModelElement );

		return jsonObject ? Element.fromJSON( jsonObject ) : null;
	}

	/**
	 * Saves a {@link module:engine/model/element~Element#toJSON JSONified} caption for
	 * a table element to allow restoring it in the future.
	 *
	 * A caption is saved every time it gets hidden. The
	 * user should be able to restore it on demand.
	 *
	 * **Note**: The caption cannot be stored in the table model element attribute because,
	 * for instance, when the model state propagates to collaborators, the attribute would get
	 * lost (mainly because it does not convert to anything when the caption is hidden) and
	 * the states of collaborators' models would de-synchronize causing numerous issues.
	 *
	 * See {@link #_getSavedCaption}.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} tableModelElement The model element the
	 * caption is saved for.
	 * @param {module:engine/model/element~Element} caption The caption model element to be saved.
	 */
	_saveCaption( tableModelElement, caption ) {
		this._savedCaptionsMap.set( tableModelElement, caption.toJSON() );
	}
}
