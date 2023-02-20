/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/converters
 */

import type { Editor } from 'ckeditor5/src/core';
import type {
	AttributeElement,
	DowncastAttributeEvent,
	DowncastConversionApi,
	DowncastDispatcher,
	DowncastWriter,
	Element,
	ElementCreatorFunction,
	UpcastConversionApi,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement
} from 'ckeditor5/src/engine';
import { toWidget } from 'ckeditor5/src/widget';
import {
	setViewAttributes,
	mergeViewElementAttributes,
	updateViewAttributes,
	type GHSViewAttributes
} from './conversionutils';
import type DataFilter from './datafilter';
import type { DataSchemaBlockElementDefinition, DataSchemaDefinition, DataSchemaInlineElementDefinition } from './dataschema';

/**
 * View-to-model conversion helper for object elements.
 *
 * Preserves object element content in `htmlContent` attribute.
 *
 * @returns Returns a conversion callback.
*/
export function viewToModelObjectConverter( { model: modelName }: DataSchemaDefinition ) {
	return ( viewElement: ViewElement, conversionApi: UpcastConversionApi ): Element => {
		// Let's keep element HTML and its attributes, so we can rebuild element in downcast conversions.
		return conversionApi.writer.createElement( modelName, {
			htmlContent: viewElement.getCustomProperty( '$rawContent' )
		} );
	};
}

/**
 * Conversion helper converting an object element to an HTML object widget.
 *
 * @returns Returns a conversion callback.
*/
export function toObjectWidgetConverter(
	editor: Editor,
	{ view: viewName, isInline }: DataSchemaInlineElementDefinition
): ElementCreatorFunction {
	const t = editor.t;

	return ( modelElement: Element, { writer }: DowncastConversionApi ) => {
		const widgetLabel = t( 'HTML object' );

		const viewElement = createObjectView( viewName!, modelElement, writer );
		const viewAttributes = modelElement.getAttribute( 'htmlAttributes' );

		writer.addClass( 'html-object-embed__content', viewElement );

		if ( viewAttributes ) {
			setViewAttributes( writer, viewAttributes, viewElement );
		}

		// Widget cannot be a raw element because the widget system would not be able
		// to add its UI to it. Thus, we need separate view container.
		const viewContainer = writer.createContainerElement( isInline ? 'span' : 'div',
			{
				class: 'html-object-embed',
				'data-html-object-embed-label': widgetLabel
			},
			viewElement
		);

		return toWidget( viewContainer, writer, { label: widgetLabel } );
	};
}

/**
* Creates object view element from the given model element.
*/
export function createObjectView( viewName: string, modelElement: Element, writer: DowncastWriter ): ViewElement {
	return writer.createRawElement( viewName, null, ( domElement, domConverter ) => {
		domConverter.setContentOf( domElement, modelElement.getAttribute( 'htmlContent' ) as string );
	} );
}

/**
 * View-to-attribute conversion helper preserving inline element attributes on `$text`.
 *
 * @returns Returns a conversion callback.
*/
export function viewToAttributeInlineConverter(
	{ view: viewName, model: attributeKey }: DataSchemaInlineElementDefinition,
	dataFilter: DataFilter
) {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( `element:${ viewName }`, ( evt, data, conversionApi ) => {
			let viewAttributes = dataFilter.processViewAttributes( data.viewItem, conversionApi );

			// Do not apply the attribute if the element itself is already consumed and there are no view attributes to store.
			if ( !viewAttributes && !conversionApi.consumable.test( data.viewItem, { name: true } ) ) {
				return;
			}

			// Otherwise, we might need to convert it to an empty object just to preserve element itself,
			// for example `<cite>` => <$text htmlCite="{}">.
			viewAttributes = viewAttributes || {};

			// Consume the element itself if it wasn't consumed by any other converter.
			conversionApi.consumable.consume( data.viewItem, { name: true } );

			// Since we are converting to attribute we need a range on which we will set the attribute.
			// If the range is not created yet, we will create it.
			if ( !data.modelRange ) {
				data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
			}

			// Set attribute on each item in range according to the schema.
			for ( const node of data.modelRange!.getItems() ) {
				if ( conversionApi.schema.checkAttribute( node, attributeKey ) ) {
					// Node's children are converted recursively, so node can already include model attribute.
					// We want to extend it, not replace.
					const nodeAttributes = node.getAttribute( attributeKey );
					const attributesToAdd = mergeViewElementAttributes( viewAttributes, nodeAttributes || {} );

					conversionApi.writer.setAttribute( attributeKey, attributesToAdd, node );
				}
			}
		}, { priority: 'low' } );
	};
}

/**
 * Attribute-to-view conversion helper applying attributes to view element preserved on `$text`.
 *
 * @returns Returns a conversion callback.
*/
export function attributeToViewInlineConverter( { priority, view: viewName }: DataSchemaInlineElementDefinition ) {
	return ( attributeValue: any, conversionApi: DowncastConversionApi ): AttributeElement | undefined => {
		if ( !attributeValue ) {
			return;
		}

		const { writer } = conversionApi;
		const viewElement = writer.createAttributeElement( viewName!, null, { priority } );

		setViewAttributes( writer, attributeValue, viewElement );

		return viewElement;
	};
}

/**
 * View-to-model conversion helper preserving allowed attributes on block element.
 *
 * All matched attributes will be preserved on `htmlAttributes` attribute.
 *
 * @returns Returns a conversion callback.
*/
export function viewToModelBlockAttributeConverter( { view: viewName }: DataSchemaBlockElementDefinition, dataFilter: DataFilter ) {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( `element:${ viewName }`, ( evt, data, conversionApi ) => {
			// Converting an attribute of an element that has not been converted to anything does not make sense
			// because there will be nowhere to set that attribute on. At this stage, the element should've already
			// been converted. A collapsed range can show up in to-do lists (<input>) or complex widgets (e.g. table).
			// (https://github.com/ckeditor/ckeditor5/issues/11000).
			if ( !data.modelRange || data.modelRange.isCollapsed ) {
				return;
			}

			const viewAttributes = dataFilter.processViewAttributes( data.viewItem, conversionApi );

			if ( viewAttributes ) {
				conversionApi.writer.setAttribute( 'htmlAttributes', viewAttributes, data.modelRange );
			}
		}, { priority: 'low' } );
	};
}

/**
 * Model-to-view conversion helper applying attributes preserved in `htmlAttributes` attribute
 * for block elements.
 *
 * @returns Returns a conversion callback.
*/
export function modelToViewBlockAttributeConverter( { model: modelName }: DataSchemaBlockElementDefinition ) {
	return ( dispatcher: DowncastDispatcher ): void => {
		dispatcher.on<DowncastAttributeEvent>( `attribute:htmlAttributes:${ modelName }`, ( evt, data, conversionApi ) => {
			if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const { attributeOldValue, attributeNewValue } = data;
			const viewWriter = conversionApi.writer;
			const viewElement = conversionApi.mapper.toViewElement( data.item as Element )!;

			updateViewAttributes( viewWriter, attributeOldValue as GHSViewAttributes, attributeNewValue as GHSViewAttributes, viewElement );
		} );
	};
}
