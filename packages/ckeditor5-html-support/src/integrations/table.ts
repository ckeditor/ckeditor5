/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/table
 */

import type {
	DowncastAttributeEvent,
	DowncastDispatcher,
	Element,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement,
	ModelPostFixer,
	Model
} from 'ckeditor5/src/engine.js';

import { Plugin } from 'ckeditor5/src/core.js';
import type { TableUtils } from '@ckeditor/ckeditor5-table';

import { updateViewAttributes, type GHSViewAttributes } from '../utils.js';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter.js';
import { getDescendantElement } from './integrationutils.js';

/**
 * Provides the General HTML Support integration with {@link module:table/table~Table Table} feature.
 */
export default class TableElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableElementSupport' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'TableEditing' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );
		const tableUtils: TableUtils = editor.plugins.get( 'TableUtils' );

		dataFilter.on<DataFilterRegisterEvent>( 'register:figure', ( ) => {
			conversion.for( 'upcast' ).add( viewToModelFigureAttributeConverter( dataFilter ) );
		} );

		dataFilter.on<DataFilterRegisterEvent>( 'register:table', ( evt, definition ) => {
			if ( definition.model !== 'table' ) {
				return;
			}

			schema.extend( 'table', {
				allowAttributes: [
					'htmlTableAttributes',
					// Figure, thead and tbody elements don't have model counterparts.
					// We will be preserving attributes on table element using these attribute keys.
					'htmlFigureAttributes', 'htmlTheadAttributes', 'htmlTbodyAttributes'
				]
			} );

			conversion.for( 'upcast' ).add( viewToModelTableAttributeConverter( dataFilter ) );
			conversion.for( 'downcast' ).add( modelToViewTableAttributeConverter() );

			editor.model.document.registerPostFixer( createHeadingRowsPostFixer( editor.model, tableUtils ) );

			evt.stop();
		} );
	}
}

/**
 * Creates a model post-fixer for thead and tbody GHS related attributes.
 */
function createHeadingRowsPostFixer( model: Model, tableUtils: TableUtils ): ModelPostFixer {
	return writer => {
		const changes = model.document.differ.getChanges();
		let wasFixed = false;

		for ( const change of changes ) {
			if ( change.type != 'attribute' || change.attributeKey != 'headingRows' ) {
				continue;
			}

			const table = change.range.start.nodeAfter as Element;
			const hasTHeadAttributes = table.getAttribute( 'htmlTheadAttributes' );
			const hasTBodyAttributes = table.getAttribute( 'htmlTbodyAttributes' );

			if ( hasTHeadAttributes && !change.attributeNewValue ) {
				writer.removeAttribute( 'htmlTheadAttributes', table );
				wasFixed = true;
			}
			else if ( hasTBodyAttributes && change.attributeNewValue == tableUtils.getRows( table ) ) {
				writer.removeAttribute( 'htmlTbodyAttributes', table );
				wasFixed = true;
			}
		}

		return wasFixed;
	};
}

/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:table/table~Table Table}
 * feature model element.
 *
 * @returns Returns a conversion callback.
 */
function viewToModelTableAttributeConverter( dataFilter: DataFilter ) {
	return ( dispatcher: UpcastDispatcher ) => {
		dispatcher.on<UpcastElementEvent>( 'element:table', ( evt, data, conversionApi ) => {
			if ( !data.modelRange ) {
				return;
			}

			const viewTableElement = data.viewItem;

			preserveElementAttributes( viewTableElement, 'htmlTableAttributes' );

			for ( const childNode of viewTableElement.getChildren() ) {
				if ( childNode.is( 'element', 'thead' ) ) {
					preserveElementAttributes( childNode, 'htmlTheadAttributes' );
				}

				if ( childNode.is( 'element', 'tbody' ) ) {
					preserveElementAttributes( childNode, 'htmlTbodyAttributes' );
				}
			}

			function preserveElementAttributes( viewElement: ViewElement, attributeName: string ) {
				const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( attributeName, viewAttributes as GHSViewAttributes, data.modelRange! );
				}
			}
		}, { priority: 'low' } );
	};
}

/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:table/table~Table Table}
 * feature model element from figure view element.
 *
 * @returns Returns a conversion callback.
 */
function viewToModelFigureAttributeConverter( dataFilter: DataFilter ) {
	return ( dispatcher: UpcastDispatcher ) => {
		dispatcher.on<UpcastElementEvent>( 'element:figure', ( evt, data, conversionApi ) => {
			const viewFigureElement = data.viewItem;

			if ( !data.modelRange || !viewFigureElement.hasClass( 'table' ) ) {
				return;
			}

			const viewAttributes = dataFilter.processViewAttributes( viewFigureElement, conversionApi );

			if ( viewAttributes ) {
				conversionApi.writer.setAttribute( 'htmlFigureAttributes', viewAttributes, data.modelRange );
			}
		}, { priority: 'low' } );
	};
}

/**
 * Model-to-view conversion helper applying attributes from {@link module:table/table~Table Table}
 * feature.
 *
 * @returns Returns a conversion callback.
 */
function modelToViewTableAttributeConverter() {
	return ( dispatcher: DowncastDispatcher ) => {
		addAttributeConversionDispatcherHandler( 'table', 'htmlTableAttributes' );
		addAttributeConversionDispatcherHandler( 'figure', 'htmlFigureAttributes' );
		addAttributeConversionDispatcherHandler( 'thead', 'htmlTheadAttributes' );
		addAttributeConversionDispatcherHandler( 'tbody', 'htmlTbodyAttributes' );

		function addAttributeConversionDispatcherHandler( elementName: string, attributeName: string ) {
			dispatcher.on<DowncastAttributeEvent>( `attribute:${ attributeName }:table`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.test( data.item, evt.name ) ) {
					return;
				}

				const containerElement = conversionApi.mapper.toViewElement( data.item as Element );
				const viewElement = getDescendantElement( conversionApi.writer, containerElement!, elementName );

				if ( !viewElement ) {
					return;
				}

				conversionApi.consumable.consume( data.item, evt.name );

				updateViewAttributes(
					conversionApi.writer,
					data.attributeOldValue as GHSViewAttributes,
					data.attributeNewValue as GHSViewAttributes,
					viewElement!
				);
			} );
		}
	};
}
