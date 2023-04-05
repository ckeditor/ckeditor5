/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/mediaembed
 */

import { Plugin } from 'ckeditor5/src/core';

import DataFilter, { type DataFilterRegisterEvent } from '../datafilter';
import DataSchema from '../dataschema';
import { updateViewAttributes, type GHSViewAttributes } from '../conversionutils';
import type {
	DowncastAttributeEvent,
	DowncastDispatcher,
	Element,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement } from 'ckeditor5/src/engine';
import type { GetCallback } from 'ckeditor5/src/utils';
import { getDescendantElement } from './integrationutils';

/**
 * Provides the General HTML Support integration with {@link module:media-embed/mediaembed~MediaEmbed Media Embed} feature.
 */
export default class MediaEmbedElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'MediaEmbedElementSupport' {
		return 'MediaEmbedElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Stop here if MediaEmbed plugin is not provided or the integrator wants to output markup with previews as
		// we do not support filtering previews.
		if ( !editor.plugins.has( 'MediaEmbed' ) || editor.config.get( 'mediaEmbed.previewsInData' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = this.editor.plugins.get( DataFilter );
		const dataSchema = this.editor.plugins.get( DataSchema );
		const mediaElementName = editor.config.get( 'mediaEmbed.elementName' ) as string;

		// Overwrite GHS schema definition for a given elementName.
		dataSchema.registerBlockElement( {
			model: 'media',
			view: mediaElementName
		} );

		dataFilter.on<DataFilterRegisterEvent>( 'register:figure', ( ) => {
			conversion.for( 'upcast' ).add( viewToModelFigureAttributesConverter( dataFilter ) );
		} );

		dataFilter.on<DataFilterRegisterEvent>( `register:${ mediaElementName }`, ( evt, definition ) => {
			if ( definition.model !== 'media' ) {
				return;
			}

			schema.extend( 'media', {
				allowAttributes: [
					'htmlAttributes',
					'htmlFigureAttributes'
				]
			} );

			conversion.for( 'upcast' ).add( viewToModelMediaAttributesConverter( dataFilter, mediaElementName ) );
			conversion.for( 'dataDowncast' ).add( modelToViewMediaAttributeConverter( mediaElementName ) );

			evt.stop();
		} );
	}
}

function viewToModelMediaAttributesConverter( dataFilter: DataFilter, mediaElementName: string ) {
	const upcastMedia: GetCallback<UpcastElementEvent> = ( evt, data, conversionApi ) => {
		const viewMediaElement = data.viewItem;

		preserveElementAttributes( viewMediaElement, 'htmlAttributes' );

		function preserveElementAttributes( viewElement: ViewElement, attributeName: string ) {
			const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

			if ( viewAttributes ) {
				conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange! );
			}
		}
	};
	return ( dispatcher: UpcastDispatcher ) => {
		dispatcher.on<UpcastElementEvent>( `element:${ mediaElementName }`, upcastMedia, { priority: 'low' } );
	};
}

/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:media-embed/mediaembed~MediaEmbed MediaEmbed}
 * feature model element from figure view element.
 *
 * @returns Returns a conversion callback.
 */
function viewToModelFigureAttributesConverter( dataFilter: DataFilter ) {
	return ( dispatcher: UpcastDispatcher ) => {
		dispatcher.on<UpcastElementEvent>( 'element:figure', ( evt, data, conversionApi ) => {
			const viewFigureElement = data.viewItem;

			if ( !data.modelRange || !viewFigureElement.hasClass( 'media' ) ) {
				return;
			}

			const viewAttributes = dataFilter.processViewAttributes( viewFigureElement, conversionApi );

			if ( viewAttributes ) {
				conversionApi.writer.setAttribute( 'htmlFigureAttributes', viewAttributes, data.modelRange );
			}
		}, { priority: 'low' } );
	};
}

function modelToViewMediaAttributeConverter( mediaElementName: string ) {
	return ( dispatcher: DowncastDispatcher ) => {
		addAttributeConversionDispatcherHandler( mediaElementName, 'htmlAttributes' );
		addAttributeConversionDispatcherHandler( 'figure', 'htmlFigureAttributes' );

		function addAttributeConversionDispatcherHandler( elementName: string, attributeName: string ) {
			dispatcher.on<DowncastAttributeEvent>( `attribute:${ attributeName }:media`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const { attributeOldValue, attributeNewValue } = data;
				const containerElement = conversionApi.mapper.toViewElement( data.item as Element );
				const viewElement = getDescendantElement( conversionApi.writer, containerElement!, elementName );

				updateViewAttributes(
					conversionApi.writer,
					attributeOldValue as GHSViewAttributes,
					attributeNewValue as GHSViewAttributes,
					viewElement! );
			} );
		}
	};
}
