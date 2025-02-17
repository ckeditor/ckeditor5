/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout/tablelayoutediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { EventInfo } from 'ckeditor5/src/utils.js';
import type { ClipboardContentInsertionEvent, ClipboardPipeline } from 'ckeditor5/src/clipboard.js';
import type {
	UpcastConversionApi,
	UpcastConversionData,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement
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
		this._handleClipboardPasting();

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

		// Disallow adding caption to table.
		schema.addChildCheck( context => {
			if ( context.endsWith( 'table' ) ) {
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

		// Figure conversion.
		conversion.for( 'upcast' ).add( upcastTableFigure() );

		// Table conversion.
		conversion.for( 'upcast' ).add( upcastTable() );

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

	/**
	 * Handle clipboard paste events:
	 *
	 * * It does not affect *copying* content from the editor, only *pasting*.
	 * * When content is pasted from another editor instance, tables are always converted to content tables,
	 *   regardless of their original type.
	 * * When content is pasted from the same editor instance, table types are preserved:
	 *   - layout tables remain layout tables.
	 *   - content tables remain content tables.
	 */
	private _handleClipboardPasting(): void {
		const { plugins } = this.editor;

		if ( !plugins.has( 'ClipboardPipeline' ) ) {
			return;
		}

		const clipboardPipeline: ClipboardPipeline = plugins.get( 'ClipboardPipeline' );

		this.listenTo<ClipboardContentInsertionEvent>( clipboardPipeline, 'contentInsertion', ( evt, data ) => {
			// If content is pasted from the same editor, keep original table types.
			if ( data.sourceEditorId === this.editor.id ) {
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
}

/**
 * TODO: JSDoc
 */
function upcastTableFigure() {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( 'element:figure', (
			evt: EventInfo,
			data: UpcastConversionData<ViewElement>,
			conversionApi: UpcastConversionApi
		) => {
			let viewTable = null;

			// Find a table element inside the figure element.
			for ( const figureChild of data.viewItem.getChildren() ) {
				if ( figureChild.is( 'element', 'table' ) ) {
					viewTable = figureChild;
				}
			}

			// Do not convert if table element is absent.
			if ( !viewTable ) {
				return;
			}

			setTableTypeAttribute( data, conversionApi );
		}, { priority: 'lowest' } );
	};
}

/**
 * TODO: JSDoc
 */
function upcastTable() {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( 'element:table', (
			evt: EventInfo,
			data: UpcastConversionData<ViewElement>,
			conversionApi: UpcastConversionApi
		) => {
			const parent = data.viewItem.parent;

			// When parent `figure` element was already consumed then skip it.
			if ( parent!.is( 'element', 'figure' ) && !conversionApi.consumable.test( parent!, { name: true } ) ) {
				return;
			}

			setTableTypeAttribute( data, conversionApi );
		}, { priority: 'low' } );
	};
}

/**
 * Sets the `tableType` attribute based on the layout css class present in the table element.
 */
function setTableTypeAttribute( data: UpcastConversionData<ViewElement>, conversionApi: UpcastConversionApi ): void {
	const LAYOUT_CSS_CLASSES = [ 'layout-table', 'content-table' ];

	for ( const cssClass of LAYOUT_CSS_CLASSES ) {
		if ( data.viewItem.hasClass( cssClass ) ) {
			const tableType = cssClass.replace( '-table', '' );

			conversionApi.writer.setAttribute(
				'tableType',
				tableType,
				data.modelRange!
			);
			conversionApi.consumable.consume( data.viewItem, { name: true, classes: cssClass } );

			return;
		}
	}

	// Set the `tableType` to `content` when there is no layout css class present.
	conversionApi.writer.setAttribute( 'tableType', 'content', data.modelRange! );
}
