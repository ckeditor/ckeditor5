/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
	ViewElement } from 'ckeditor5/src/engine';
import { Plugin } from 'ckeditor5/src/core';
import { setViewAttributes, type GHSViewAttributes } from '../conversionutils';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter';
import { getDescendantElement } from './integrationutils';

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
	public static get pluginName(): 'TableElementSupport' {
		return 'TableElementSupport';
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

		dataFilter.on<DataFilterRegisterEvent>( 'register:figure', ( ) => {
			conversion.for( 'upcast' ).add( viewToModelFigureAttributeConverter( dataFilter ) );
		} );

		dataFilter.on<DataFilterRegisterEvent>( 'register:table', ( evt, definition ) => {
			if ( definition.model !== 'table' ) {
				return;
			}

			schema.extend( 'table', {
				allowAttributes: [
					'htmlAttributes',
					// Figure, thead and tbody elements don't have model counterparts.
					// We will be preserving attributes on table element using these attribute keys.
					'htmlFigureAttributes', 'htmlTheadAttributes', 'htmlTbodyAttributes'
				]
			} );

			conversion.for( 'upcast' ).add( viewToModelTableAttributeConverter( dataFilter ) );
			conversion.for( 'downcast' ).add( modelToViewTableAttributeConverter() );

			evt.stop();
		} );
	}
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
			const viewTableElement = data.viewItem;

			preserveElementAttributes( viewTableElement, 'htmlAttributes' );

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
		addAttributeConversionDispatcherHandler( 'table', 'htmlAttributes' );
		addAttributeConversionDispatcherHandler( 'figure', 'htmlFigureAttributes' );
		addAttributeConversionDispatcherHandler( 'thead', 'htmlTheadAttributes' );
		addAttributeConversionDispatcherHandler( 'tbody', 'htmlTbodyAttributes' );

		function addAttributeConversionDispatcherHandler( elementName: string, attributeName: string ) {
			dispatcher.on<DowncastAttributeEvent>( `attribute:${ attributeName }:table`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const containerElement = conversionApi.mapper.toViewElement( data.item as Element );
				const viewElement = getDescendantElement( conversionApi.writer, containerElement!, elementName );

				setViewAttributes( conversionApi.writer, data.attributeNewValue as GHSViewAttributes, viewElement! );
			} );
		}
	};
}
