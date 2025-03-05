/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout/tablelayoutediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { ClipboardContentInsertionEvent, ClipboardPipeline } from 'ckeditor5/src/clipboard.js';
import type {
	DowncastDispatcher,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement,
	SchemaContext,
	Writer
} from 'ckeditor5/src/engine.js';

import InsertTableLayoutCommand from './../commands/inserttablelayoutcommand.js';
import { createEmptyTableCell } from '../utils/common.js';

import '../../theme/tablelayout.css';

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
		this._defineClipboardPasteHandlers();
		this._registerTableTypeAttributePostfixer();
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
		schema.addChildCheck( layoutTableCheck, 'caption' );

		// Disallow adding `headingRows` attribute to layout table.
		schema.addAttributeCheck( layoutTableCheck, 'headingRows' );

		// Disallow adding `headingColumns` attribute to layout table.
		schema.addAttributeCheck( layoutTableCheck, 'headingColumns' );
	}

	/**
	 * Defines the converters for the table layout feature.
	 */
	private _defineConverters() {
		const { editor } = this;
		const { conversion } = editor;

		conversion.for( 'upcast' ).add( upcastLayoutTable() );
		conversion.for( 'dataDowncast' ).add( dataDowncastLayoutTable() );
		conversion.for( 'editingDowncast' ).attributeToAttribute( {
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

	/**
	 * Handles the clipboard content insertion events.
	 *
	 * - If the content is from another editor, do not override the table type.
	 * - If the content is from another source, set the table type to 'content'.
	 *
	 * It handles the scenario when user copies `<table></table>` from Word. We do not want to
	 * change the table type to `layout` because it is really `content` table.
	 */
	private _defineClipboardPasteHandlers(): void {
		const { plugins } = this.editor;

		if ( !plugins.has( 'ClipboardPipeline' ) ) {
			return;
		}

		const clipboardPipeline: ClipboardPipeline = plugins.get( 'ClipboardPipeline' );

		this.listenTo<ClipboardContentInsertionEvent>( clipboardPipeline, 'contentInsertion', ( evt, data ) => {
			// If content is pasted from the other editor, skip overriding table type.
			if ( data.sourceEditorId ) {
				return;
			}

			// For content from other sources, always set table type to 'content'.
			this.editor.model.change( writer => {
				for ( const { item } of writer.createRangeIn( data.content ) ) {
					if ( item.is( 'element', 'table' ) ) {
						writer.setAttribute( 'tableType', 'content', item );
					}
				}
			} );
		} );
	}

	/**
	 * Registers a post-fixer that sets the `tableType` attribute to `content` for inserted "default" tables.
	 */
	private _registerTableTypeAttributePostfixer() {
		const editor = this.editor;

		editor.model.document.registerPostFixer( ( writer: Writer ) => {
			const changes = editor.model.document.differ.getChanges();
			let hasChanged = false;

			for ( const entry of changes ) {
				if ( entry.type == 'insert' && entry.name != '$text' ) {
					const element = entry.position.nodeAfter!;
					const range = writer.createRangeOn( element );

					for ( const item of range.getItems() ) {
						if ( item.is( 'element', 'table' ) && !item.hasAttribute( 'tableType' ) ) {
							writer.setAttribute( 'tableType', 'content', item );
							hasChanged = true;
						}
					}
				}
			}

			return hasChanged;
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

			if ( !conversionApi.consumable.test( viewTable, { name: true } ) ) {
				return;
			}

			const hasTableTypeContent = isTableTypeContent( viewTable );

			// When an element is a content table, then skip it.
			if ( hasTableTypeContent ) {
				return;
			}

			const table = conversionApi.writer.createElement( 'table' );

			if ( !conversionApi.safeInsert( table, data.modelCursor ) ) {
				return;
			}

			conversionApi.consumable.consume( viewTable, { name: true } );
			conversionApi.consumable.consume( viewTable, { attributes: [ 'role' ] } );
			conversionApi.consumable.consume( viewTable, { classes: [ 'layout-table' ] } );

			// Get all rows from the table and convert them.
			// While looping over the children of `<table>` we can be sure that first will be `<tbody>`
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

			// Create one row and one table cell for empty table.
			if ( table.isEmpty ) {
				const row = conversionApi.writer.createElement( 'tableRow' );

				conversionApi.writer.insert( row, conversionApi.writer.createPositionAt( table, 'end' ) );
				createEmptyTableCell( conversionApi.writer, conversionApi.writer.createPositionAt( row, 'end' ) );
			}

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
				conversionApi.consumable.consume( viewItem, { classes: [ 'layout-table' ] } );
				conversionApi.consumable.consume( viewItem, { classes: [ 'content-table' ] } );
			}
		}, { priority: 'low' } );
	};
}

/**
 * Model table container element to view table element conversion helper.
 *
 * @returns Conversion helper.
 */
function dataDowncastLayoutTable() {
	return ( dispatcher: DowncastDispatcher ): void => {
		return dispatcher.on( 'attribute:tableType:table', ( evt, data, conversionApi ) => {
			const { item, attributeNewValue } = data;
			const { mapper, writer } = conversionApi;

			if ( !conversionApi.consumable.test( item, evt.name ) ) {
				return;
			}

			const table = mapper.toViewElement( item );

			writer.addClass( `${ attributeNewValue }-table`, table );

			if ( attributeNewValue == 'layout' ) {
				writer.setAttribute( 'role', 'presentation', table );
			}

			conversionApi.consumable.consume( item, evt.name );
		} );
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
 * Checks if the element is a layout table.
 * It is used to disallow attributes or children that is managed by `Schema`.
 */
function layoutTableCheck( context: SchemaContext ) {
	if ( context.endsWith( 'table' ) && context.last.getAttribute( 'tableType' ) == 'layout' ) {
		return false;
	}
}
