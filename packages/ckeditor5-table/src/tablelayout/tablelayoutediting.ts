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
	UpcastElementEvent
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

		conversion.for( 'upcast' ).add( upcastTableFigure() );

		editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
			return dispatcher.on( 'attribute:tableType:table', ( evt, data, conversionApi ) => {
				const { item, attributeNewValue } = data;
				const { mapper, writer } = conversionApi;

				if ( !conversionApi.consumable.consume( item, evt.name ) ) {
					return;
				}

				const table = mapper.toViewElement( item );

				writer.addClass( `${ attributeNewValue }-table`, table );
				writer.setAttribute( 'role', 'presentation', table );
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
 * TODO: JSDoc
 */
function upcastTableFigure() {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( 'element:figure', ( evt, data, conversionApi ) => {
			if ( !data.viewItem.hasClass( 'table' ) ) {
				return;
			}
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
				}
			}

			// Set the `tableType` to `content` when there is no layout css class present.
			conversionApi.writer.setAttribute( 'tableType', 'content', data.modelRange! );
		} );
	};
}
