/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout/tablelayoutediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type {
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement,
	SchemaContext
} from 'ckeditor5/src/engine.js';

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

		// Disallow adding `caption` to layout table.
		schema.addChildCheck( layoutTableCheck(), 'caption' );

		// Disallow adding `headingRows` attribute to layout table.
		schema.addAttributeCheck( layoutTableCheck(), 'headingRows' );

		// Disallow adding `headingColumns` attribute to layout table.
		schema.addAttributeCheck( layoutTableCheck(), 'headingColumns' );
	}

	/**
	 * Defines the converters for the table layout feature.
	 */
	private _defineConverters() {
		const { editor } = this;
		const { conversion } = editor;

		conversion.for( 'upcast' ).add( upcastLayoutTable() );

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

		editor.conversion.for( 'editingDowncast' ).attributeToAttribute( {
			model: {
				key: 'tableType',
				values: [ 'layout', 'content' ]
			},
			view: {
				layout: {
					key: 'class',
					value: [ 'layout-table' ]
				},
				content: {
					key: 'class',
					value: [ 'content-table' ]
				}
			}
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
function upcastLayoutTable() {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( 'element:table', ( evt, data, conversionApi ) => {
			const viewTable = data.viewItem;
			const hasTableTypeContent = isTableTypeContent( viewTable );

			// TODO: What to do with empty table `<table></table>`??
			// const hasTableRows = Array.from( viewTable.getChildren() ).some( child => !child.is( 'element', 'tr' ) );

			// When element was already consumed or it is a layout table then skip it.
			if (
				!conversionApi.consumable.test( viewTable, { name: true } ) ||
				hasTableTypeContent /* ||
				!hasTableRows */
			) {
				return;
			}

			const table = conversionApi.writer.createElement( 'table' );

			// if ( !hasTableRows ) {
			// 	conversionApi.consumable.consume( viewTable, { name: true } );
			// 	return;
			// }

			if ( !conversionApi.safeInsert( table, data.modelCursor ) ) {
				return;
			}

			conversionApi.consumable.consume( viewTable, { name: true } );
			conversionApi.consumable.consume( viewTable, { attributes: [ 'role' ] } );

			// Get all rows from the table and convert them.
			// While looping over the children on `<table>` we can be sure that firts will be `<tbody>`
			// and optionally `<thead>` and `<tfoot>`, and in these elements are the table rows found.
			// We can be sure of that because of `DomParser` handle it.
			for ( const tableChild of viewTable.getChildren() ) {
				if ( tableChild.is( 'element' ) ) {
					for ( const row of tableChild.getChildren() ) {
						if ( row.is( 'element', 'tr' ) ) {
							conversionApi.convertItem( row, conversionApi.writer.createPositionAt( table, 'end' ) );
						}
					}
				}
			}

			// Convert everything else.
			conversionApi.convertChildren( viewTable, conversionApi.writer.createPositionAt( table, 'end' ) );

			conversionApi.updateConversionResult( table, data );
		}, { priority: 'high' } );

		// Sets only the table type attribute.
		dispatcher.on<UpcastElementEvent>( 'element:table', ( evt, data, conversionApi ) => {
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

/**
 * Returns callback that checks if the element is a layout table.
 * It is used to disallow attributes or children that is managed by `Schema`.
 */
function layoutTableCheck() {
	return ( context: SchemaContext ) => {
		if ( context.endsWith( 'table' ) && context.last.getAttribute( 'tableType' ) == 'layout' ) {
			return false;
		}
	};
}
