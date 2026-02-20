/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecaption/tablecaptionediting
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import {
	type DowncastInsertEvent,
	type ViewElement,
	ModelElement,
	enableViewPlaceholder
} from '@ckeditor/ckeditor5-engine';
import { uid } from '@ckeditor/ckeditor5-utils';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget';

import { injectTableCaptionPostFixer } from '../converters/table-caption-post-fixer.js';
import { ToggleTableCaptionCommand } from './toggletablecaptioncommand.js';
import { getCaptionFromTableModelElement, isTable, matchTableCaptionViewElement } from './utils.js';
import type { TableEditing } from '../tableediting.js';

/**
 * The table caption editing plugin.
 */
export class TableCaptionEditing extends Plugin {
	/**
	 * A map that keeps saved JSONified table captions and table model elements they are
	 * associated with.
	 *
	 * To learn more about this system, see {@link #_saveCaption}.
	 */
	private _savedCaptionsMap = new WeakMap<ModelElement, unknown>();

	/**
	 * A map that keeps generated ids for table captions to reuse them if the same caption is rendered again.
	 */
	private _captionIdsMapping = new WeakMap<ModelElement, string>();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCaptionEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const view = editor.editing.view;
		const t = editor.t;
		const useCaptionElement = editor.config.get( 'table.tableCaption.useCaptionElement' );

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

		if ( useCaptionElement ) {
			const tableEditing: TableEditing = editor.plugins.get( 'TableEditing' );

			tableEditing.registerAdditionalSlot( {
				filter: element => element.is( 'element', 'caption' ),
				positionOffset: 'end'
			} );
		}

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

				return writer.createContainerElement( useCaptionElement ? 'caption' : 'figcaption' );
			}
		} );

		// Model -> view converter for the editing pipeline.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isTable( modelElement.parent ) ) {
					return null;
				}

				const captionElement = writer.createEditableElement( useCaptionElement ? 'caption' : 'figcaption' );
				writer.setCustomProperty( 'tableCaption', true, captionElement );

				captionElement.placeholder = t( 'Enter table caption' );

				enableViewPlaceholder( {
					view,
					element: captionElement,
					keepOnFocus: true
				} );

				return toWidgetEditable( captionElement, writer );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on<DowncastInsertEvent<ModelElement>>( 'insert:table', ( evt, data, { writer, mapper } ) => {
				const modelTable = data.item;
				const viewFigure = mapper.toViewElement( modelTable );

				if ( !viewFigure ) {
					return;
				}

				const viewTable = Array
					.from( viewFigure.getChildren() )
					.find( child => child.is( 'element', 'table' ) ) as ViewElement | undefined;

				if ( !viewTable ) {
					return;
				}

				const modelCaption = getCaptionFromTableModelElement( modelTable );

				// Remove `aria-labelledby` from the table if there is no caption.
				if ( !modelCaption ) {
					writer.removeAttribute( 'aria-labelledby', viewTable );

					return;
				}

				const viewCaption = mapper.toViewElement( modelCaption );

				if ( !viewCaption ) {
					return;
				}

				// Try reusing the same id for the caption if it was already created for the given model caption.
				// If it was not created before, generate a new one and save it in the mapping to reuse it in the future if needed.
				let captionId: string;

				if ( viewCaption.hasAttribute( 'id' ) ) {
					captionId = viewCaption.getAttribute( 'id' )!;
				} else {
					captionId = this._captionIdsMapping.get( modelCaption ) ?? `ck-editor__caption_${ uid() }`;
				}

				this._captionIdsMapping.set( modelCaption, captionId );

				writer.setAttribute( 'id', captionId, viewCaption );
				writer.setAttribute( 'aria-labelledby', captionId, viewTable );
			}, { priority: 'low' } );
		} );

		injectTableCaptionPostFixer( editor.model );
	}

	/**
	 * Returns the saved {@link module:engine/model/element~ModelElement#toJSON JSONified} caption
	 * of a table model element.
	 *
	 * See {@link #_saveCaption}.
	 *
	 * @internal
	 * @param tableModelElement The model element the caption should be returned for.
	 * @returns The model caption element or `null` if there is none.
	 */
	public _getSavedCaption( tableModelElement: ModelElement ): ModelElement | null {
		const jsonObject = this._savedCaptionsMap.get( tableModelElement );

		return jsonObject ? ModelElement.fromJSON( jsonObject ) : null;
	}

	/**
	 * Saves a {@link module:engine/model/element~ModelElement#toJSON JSONified} caption for
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
	 * @internal
	 * @param tableModelElement The model element the caption is saved for.
	 * @param caption The caption model element to be saved.
	 */
	public _saveCaption( tableModelElement: ModelElement, caption: ModelElement ): void {
		this._savedCaptionsMap.set( tableModelElement, caption.toJSON() );
	}
}
