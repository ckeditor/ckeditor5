/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecaption/tablecaptionediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ModelElement, enableViewPlaceholder, type ViewDocumentTabEvent } from 'ckeditor5/src/engine.js';
import { type Widget, toWidgetEditable } from 'ckeditor5/src/widget.js';

import { injectTableCaptionPostFixer } from '../converters/table-caption-post-fixer.js';
import { ToggleTableCaptionCommand } from './toggletablecaptioncommand.js';
import {
	getCaptionFromModelSelection,
	getCaptionFromTableModelElement,
	getCaptionVisualSide,
	isTable,
	matchTableCaptionViewElement
} from './utils.js';

import type { TableEditing } from '../tableediting.js';
import { isTableWidget } from '../utils/ui/widget.js';
import { TableUtils } from '../tableutils.js';
import { getSelectionAffectedTable } from '../utils/common.js';

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

		injectTableCaptionPostFixer( editor.model );

		this._setupKeyboardHandlers();
	}

	/**
	 * Tab/Shift+Tab handling with caption visually on top of table.
	 */
	private _setupKeyboardHandlers(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const model = editor.model;
		const selection = model.document.selection;
		const mapper = editor.editing.mapper;

		const widget: Widget = editor.plugins.get( 'Widget' );

		// Tab/Shift+Tab when the table widget is selected.
		this.listenTo<ViewDocumentTabEvent>( viewDocument, 'tab', ( evt, data ) => {
			if ( evt.eventPhase != 'atTarget' ) {
				return;
			}

			const table = selection.getSelectedElement()!;
			const tableCaption = getCaptionFromTableModelElement( table );

			if ( !tableCaption ) {
				return;
			}

			// Only top side caption needs tuning as normal in-flow navigation is handled out of the box.
			if ( getCaptionVisualSide( tableCaption, editor.editing ) != 'top' ) {
				return;
			}

			const direction = data.shiftKey ? 'backward' : 'forward';
			const startPosition = model.createPositionBefore( tableCaption );

			if ( widget._selectNextEditableStartingFromPosition( mapper.toViewPosition( startPosition ), direction ) ) {
				view.scrollToTheSelection();
				data.preventDefault();
				data.stopPropagation();
				evt.stop();
			}
		}, { context: isTableWidget } );

		// Tab/Shift+Tab when selection is inside a table caption.
		this.listenTo<ViewDocumentTabEvent>( viewDocument, 'tab', ( evt, data ) => {
			const tableCaption = getCaptionFromModelSelection( selection );

			if ( !tableCaption ) {
				return;
			}

			if ( getCaptionVisualSide( tableCaption, editor.editing ) != 'top' ) {
				return;
			}

			const table = tableCaption.parent as ModelElement;
			const direction = data.shiftKey ? 'backward' : 'forward';
			const startPosition = model.createPositionAt( table, 0 );

			if ( widget._selectNextEditableStartingFromPosition( mapper.toViewPosition( startPosition ), direction ) ) {
				view.scrollToTheSelection();
				data.preventDefault();
				data.stopPropagation();
				evt.stop();
			}
		}, { context: [ 'figcaption', 'caption' ] } );

		// Tab/Shift+Tab when selection is inside first table cell.
		this.listenTo<ViewDocumentTabEvent>( viewDocument, 'tab', ( evt, data ) => {
			const direction = data.shiftKey ? 'backward' : 'forward';

			// Only backward; forward is handled in table-keyboard as adding a new table row.
			if ( direction != 'backward' ) {
				return;
			}

			const tableUtils: TableUtils = this.editor.plugins.get( TableUtils );
			const tableCells = tableUtils.getSelectionAffectedTableCells( editor.model.document.selection );
			const table = getSelectionAffectedTable( editor.model.document.selection );

			if ( !table || !tableCells.length ) {
				return;
			}

			if ( tableCells[ 0 ] != ( table.getChild( 0 ) as ModelElement ).getChild( 0 ) ) {
				return;
			}

			const tableCaption = getCaptionFromTableModelElement( table );

			if ( !tableCaption ) {
				return;
			}

			if ( getCaptionVisualSide( tableCaption, this.editor.editing ) != 'top' ) {
				return;
			}

			const startPosition = model.createPositionAt( table, 'end' );

			if ( widget._selectNextEditableStartingFromPosition( mapper.toViewPosition( startPosition ), direction ) ) {
				view.scrollToTheSelection();
				data.preventDefault();
				data.stopPropagation();
				evt.stop();
			}
		}, { context: [ 'td', 'th' ] } );
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
