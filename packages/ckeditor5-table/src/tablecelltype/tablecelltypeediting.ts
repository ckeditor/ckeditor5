/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecelltype/tablecelltypeediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { UpcastElementEvent, Model, EditingController, ModelElement } from 'ckeditor5/src/engine.js';

import { TableEditing } from '../tableediting.js';
import { TableCellTypeCommand } from './commands/tablecelltypecommand.js';

/**
 * The table cell type editing feature.
 *
 * Introduces the `tableCellType` model attribute that switches between `<td>` and `<th>` elements.
 * Also registers the `'tableCellType'` command to manipulate this attribute.
 */
export class TableCellTypeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCellTypeEditing' as const;
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
	public static get requires() {
		return [ TableEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const { editor } = this;
		const { model, config, editing } = editor;

		if ( !config.get( 'experimentalFlags.tableCellTypeSupport' ) ) {
			return;
		}

		this._defineSchema();
		this._defineConversion();

		registerTableCellTypeReconversionHandler( model, editing );

		editor.commands.add( 'tableCellType', new TableCellTypeCommand( editor ) );
	}

	/**
	 * Defines the schema for the `tableCellType` attribute.
	 */
	private _defineSchema() {
		const { schema } = this.editor.model;

		schema.extend( 'tableCell', {
			allowAttributes: [ 'tableCellType' ]
		} );

		schema.setAttributeProperties( 'tableCellType', {
			isFormatting: true
		} );
	}

	/**
	 * Defines the conversion for the `tableCellType` attribute.
	 */
	private _defineConversion() {
		const { conversion } = this.editor;

		// Upcast conversion for td/th elements.
		conversion.for( 'upcast' ).add( dispatcher => dispatcher.on<UpcastElementEvent>( 'element:th', ( evt, data, conversionApi ) => {
			const { writer } = conversionApi;
			const { modelRange } = data;
			const modelElement = modelRange?.start.nodeAfter;

			if ( modelElement?.is( 'element', 'tableCell' ) ) {
				writer.setAttribute( 'tableCellType', 'header', modelElement );
			}
		} ) );
	}
}

/**
 * Registers a handler that forces reconversion of table cells when their `tableCellType` attribute changes.
 * This is necessary because changing from `<td>` to `<th>` (or vice versa) requires rebuilding the element.
 *
 * @param model The editor model.
 * @param editing The editing controller.
 */
function registerTableCellTypeReconversionHandler( model: Model, editing: EditingController ): void {
	model.document.on( 'change:data', () => {
		const cellsToReconvert: Set<ModelElement> = new Set();
		const { differ } = model.document;

		for ( const change of differ.getChanges() ) {
			// Only process attribute changes.
			if ( change.type !== 'attribute' || change.attributeKey !== 'tableCellType' ) {
				continue;
			}

			// Get the table cell element and get the view element for this table cell.
			const tableCell = change.range.start.nodeAfter as ModelElement;
			const viewElement = editing.mapper.toViewElement( tableCell )!;

			// Determine the expected element name based on the new attribute value.
			const cellType = tableCell.getAttribute( 'tableCellType' );
			const expectedElementName = cellType === 'header' ? 'th' : 'td';

			// Only reconvert if the element name actually needs to change.
			if ( viewElement?.name !== expectedElementName ) {
				cellsToReconvert.add( tableCell );
			}
		}

		for ( const cell of cellsToReconvert ) {
			editing.reconvertItem( cell );
		}
	} );
}
