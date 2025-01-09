/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/converters
 */

import type { Editor } from 'ckeditor5/src/core.js';
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
	ViewElement,
	Item
} from 'ckeditor5/src/engine.js';
import { toWidget } from 'ckeditor5/src/widget.js';
import {
	setViewAttributes,
	mergeViewElementAttributes,
	updateViewAttributes,
	getHtmlAttributeName,
	type GHSViewAttributes
} from './utils.js';
import type DataFilter from './datafilter.js';
import type { DataSchemaBlockElementDefinition, DataSchemaDefinition, DataSchemaInlineElementDefinition } from './dataschema.js';

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
		const viewAttributes = modelElement.getAttribute( getHtmlAttributeName( viewName! ) );

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
	{ view: viewName, model: attributeKey, allowEmpty }: DataSchemaInlineElementDefinition,
	dataFilter: DataFilter
): ( dispatcher: UpcastDispatcher ) => void {
	return dispatcher => {
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

			// Convert empty inline element if allowed and has any attributes.
			if ( allowEmpty && data.modelRange!.isCollapsed && Object.keys( viewAttributes ).length ) {
				const modelElement = conversionApi.writer.createElement( 'htmlEmptyElement' );

				if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
					return;
				}

				const parts = conversionApi.getSplitParts( modelElement );

				data.modelRange = conversionApi.writer.createRange(
					data.modelRange!.start,
					conversionApi.writer.createPositionAfter( parts[ parts.length - 1 ] )
				);

				conversionApi.updateConversionResult( modelElement, data );
				setAttributeOnItem( modelElement, viewAttributes, conversionApi );

				return;
			}

			// Set attribute on each item in range according to the schema.
			for ( const node of data.modelRange!.getItems() ) {
				setAttributeOnItem( node, viewAttributes, conversionApi );
			}
		}, { priority: 'low' } );
	};

	function setAttributeOnItem( node: Item, viewAttributes: GHSViewAttributes, conversionApi: UpcastConversionApi ): void {
		if ( conversionApi.schema.checkAttribute( node, attributeKey ) ) {
			// Node's children are converted recursively, so node can already include model attribute.
			// We want to extend it, not replace.
			const nodeAttributes = node.getAttribute( attributeKey );
			const attributesToAdd = mergeViewElementAttributes( viewAttributes, nodeAttributes || {} );

			conversionApi.writer.setAttribute( attributeKey, attributesToAdd, node );
		}
	}
}

/**
 * Conversion helper converting an empty inline model element to an HTML element or widget.
 */
export function emptyInlineModelElementToViewConverter(
	{ model: attributeKey, view: viewName }: DataSchemaInlineElementDefinition,
	asWidget?: boolean
): ElementCreatorFunction {
	return ( item, { writer, consumable } ) => {
		if ( !item.hasAttribute( attributeKey ) ) {
			return null;
		}

		const viewElement = writer.createContainerElement( viewName! );
		const attributeValue = item.getAttribute( attributeKey ) as GHSViewAttributes;

		consumable.consume( item, `attribute:${ attributeKey }` );
		setViewAttributes( writer, attributeValue, viewElement );

		viewElement.getFillerOffset = () => null;

		return asWidget ? toWidget( viewElement, writer ) : viewElement;
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
 * All matched attributes will be preserved on `html*Attributes` attribute.
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

			if ( !viewAttributes ) {
				return;
			}

			conversionApi.writer.setAttribute(
				getHtmlAttributeName( data.viewItem.name ),
				viewAttributes,
				data.modelRange
			);
		}, { priority: 'low' } );
	};
}

/**
 * Model-to-view conversion helper applying attributes preserved in `html*Attributes` attribute
 * for block elements.
 *
 * @returns Returns a conversion callback.
*/
export function modelToViewBlockAttributeConverter( { view: viewName, model: modelName }: DataSchemaBlockElementDefinition ) {
	return ( dispatcher: DowncastDispatcher ): void => {
		dispatcher.on<DowncastAttributeEvent>(
			`attribute:${ getHtmlAttributeName( viewName! ) }:${ modelName }`,
			( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const { attributeOldValue, attributeNewValue } = data;
				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item as Element )!;

				updateViewAttributes(
					viewWriter,
					attributeOldValue as GHSViewAttributes,
					attributeNewValue as GHSViewAttributes,
					viewElement
				);
			}
		);
	};
}
