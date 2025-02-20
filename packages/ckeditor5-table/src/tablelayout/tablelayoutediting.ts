/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout/tablelayoutediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { EventInfo } from 'ckeditor5/src/utils.js';
import type {
	UpcastConversionApi,
	UpcastConversionData,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement
} from 'ckeditor5/src/engine.js';

import { createEmptyTableCell } from '../utils/common.js';
import { scanTable } from '../converters/upcasttable.js';

import InsertTableLayoutCommand from './../commands/inserttablelayoutcommand.js';

/**
 * The table layout editing plugin.
 */
export default class TableLayoutEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableLayoutEditing' as const;
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
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertTableLayout', new InsertTableLayoutCommand( this.editor ) );
	}

	/**
	 * Defines the schema for the table layout feature.
	 */
	private _defineSchema() {
		const { schema } = this.editor.model;

		schema.extend( 'table', {
			allowAttributes: 'tableType'
		} );

		// Disallow adding caption to layout table.
		schema.addChildCheck( context => {
			if ( context.endsWith( 'table' ) && context.last.getAttribute( 'tableType' ) == 'layout' ) {
				return false;
			}
		}, 'caption' );
	}

	/**
	 * Defines the converters for the table layout feature.
	 */
	private _defineConverters() {
		const { editor } = this;
		const { conversion } = editor;

		conversion.for( 'upcast' ).add( upcastTableOverride() );
		conversion.for( 'upcast' ).add( upcastTableToSetTableType() );

		editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
			return dispatcher.on( 'attribute:tableType:table', ( evt, data, conversionApi ) => {
				const { item, attributeNewValue } = data;
				const { mapper, writer } = conversionApi;

				if ( !conversionApi.consumable.test( item, evt.name ) ) {
					return;
				}

				const table = mapper.toViewElement( item );

				writer.addClass( `${ attributeNewValue }-table`, table );
				writer.setAttribute( 'role', 'presentation', table );

				conversionApi.consumable.consume( item, evt.name );
			} );
		} );

		conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on( 'attribute:tableType', ( evt, data, conversionApi ) => {
				const { item, attributeNewValue } = data;
				const { mapper, writer } = conversionApi;
				const modelElement = item;
				const viewElement = mapper.toViewElement( modelElement );

				writer.addClass( `${ attributeNewValue }-table`, viewElement );
			} );
		} );
	}
}

/**
 * View table element to model table element conversion helper.
 *
 * This conversion helper overrides the default table converter to meet table layout conditions.
 *
 * @returns Conversion helper.
 */
function upcastTableOverride() {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( 'element:table', (
			evt: EventInfo,
			data: UpcastConversionData<ViewElement>,
			conversionApi: UpcastConversionApi
		) => {
			const viewTable = data.viewItem;

			// When element was already consumed then skip it.
			if ( !conversionApi.consumable.test( viewTable, { name: true } ) ) {
				return;
			}

			const { rows, headingRows, headingColumns } = scanTable( viewTable );

			// Only set attributes if values are greater then 0.
			const attributes: { headingColumns?: number; headingRows?: number } = {};

			const hasTableTypeContent = isTableTypeContent( viewTable );

			if ( headingColumns && hasTableTypeContent ) {
				attributes.headingColumns = headingColumns;
			}

			if ( headingRows && hasTableTypeContent ) {
				attributes.headingRows = headingRows;
			}

			const table = conversionApi.writer.createElement( 'table', attributes );

			if ( !conversionApi.safeInsert( table, data.modelCursor ) ) {
				return;
			}

			conversionApi.consumable.consume( viewTable, { name: true } );

			// Upcast table rows in proper order (heading rows first).
			rows.forEach( row => conversionApi.convertItem( row, conversionApi.writer.createPositionAt( table, 'end' ) ) );

			// Convert everything else.
			conversionApi.convertChildren( viewTable, conversionApi.writer.createPositionAt( table, 'end' ) );

			// Create one row and one table cell for empty table.
			if ( table.isEmpty ) {
				const row = conversionApi.writer.createElement( 'tableRow' );
				conversionApi.writer.insert( row, conversionApi.writer.createPositionAt( table, 'end' ) );

				createEmptyTableCell( conversionApi.writer, conversionApi.writer.createPositionAt( row, 'end' ) );
			}

			conversionApi.updateConversionResult( table, data );
		}, { priority: 'high' } );
	};
}

/**
 * Sets only the table type attribute.
 */
function upcastTableToSetTableType() {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( 'element:table', (
			evt: EventInfo,
			data: UpcastConversionData<ViewElement>,
			conversionApi: UpcastConversionApi
		) => {
			const { viewItem, modelRange } = data;

			if ( modelRange ) {
				conversionApi.writer.setAttribute(
					'tableType',
					isTableTypeContent( viewItem ) ? 'content' : 'layout',
					modelRange
				);
			}
		}, { priority: 'low' } );
	};
}

/**
 * Checks if the table is a content table.
 * Returns `true` if any of the following conditions are met:
 * - the `<table>` is wrapped with `<figure>`,
 * - the `<table>` has class `content-table`
 * - the `<table>` has a `<caption>` element.
 * `false` otherwise.
 */
function isTableTypeContent( viewTable: ViewElement ): boolean {
	const parent = viewTable.parent!;

	return parent.is( 'element', 'figure' ) ||
		viewTable.hasClass( 'content-table' ) ||
		Array.from( viewTable.getChildren() ).some( child => child.is( 'element', 'caption' ) );
}
