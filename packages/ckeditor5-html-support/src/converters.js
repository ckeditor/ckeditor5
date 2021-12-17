/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/converters
 */

import { toWidget } from 'ckeditor5/src/widget';
import { setViewAttributes, mergeViewElementAttributes } from './conversionutils';

/**
 * View-to-model conversion helper for object elements.
 *
 * Preserves object element content in `htmlContent` attribute.
 *
 * @param {module:html-support/dataschema~DataSchemaDefinition} definition
 * @returns {Function} Returns a conversion callback.
*/
export function viewToModelObjectConverter( { model: modelName } ) {
	return ( viewElement, conversionApi ) => {
		// Let's keep element HTML and its attributes, so we can rebuild element in downcast conversions.
		return conversionApi.writer.createElement( modelName, {
			htmlContent: viewElement.getCustomProperty( '$rawContent' )
		} );
	};
}

/**
 * Conversion helper converting object element to HTML object widget.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
 * @returns {Function} Returns a conversion callback.
*/
export function toObjectWidgetConverter( editor, { view: viewName, isInline } ) {
	const t = editor.t;

	return ( modelElement, { writer, consumable } ) => {
		const widgetLabel = t( 'HTML object' );

		// Widget cannot be a raw element because the widget system would not be able
		// to add its UI to it. Thus, we need separate view container.
		const viewContainer = writer.createContainerElement( isInline ? 'span' : 'div', {
			class: 'html-object-embed',
			'data-html-object-embed-label': widgetLabel
		}, {
			isAllowedInsideAttributeElement: isInline
		} );

		const viewElement = createObjectView( viewName, modelElement, writer );
		writer.addClass( 'html-object-embed__content', viewElement );

		const viewAttributes = modelElement.getAttribute( 'htmlAttributes' );
		if ( viewAttributes && consumable.consume( modelElement, `attribute:htmlAttributes:${ modelElement.name }` ) ) {
			setViewAttributes( writer, viewAttributes, viewElement );
		}

		writer.insert( writer.createPositionAt( viewContainer, 0 ), viewElement );

		return toWidget( viewContainer, writer, { widgetLabel } );
	};
}

/**
* Creates object view element from the given model element.
*
* @param {String} viewName
* @param {module:engine/model/element~Element} modelElement
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @returns {module:engine/view/element~Element}
*/
export function createObjectView( viewName, modelElement, writer ) {
	return writer.createRawElement( viewName, null, ( domElement, domConverter ) => {
		domConverter.setContentOf( domElement, modelElement.getAttribute( 'htmlContent' ) );
	} );
}

/**
 * View-to-attribute conversion helper preserving inline element attributes on `$text`.
 *
 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
 * @param {module:html-support/datafilter~DataFilter} dataFilter
 * @returns {Function} Returns a conversion callback.
*/
export function viewToAttributeInlineConverter( { view: viewName, model: attributeKey }, dataFilter ) {
	return dispatcher => {
		dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
			const viewAttributes = dataFilter._consumeAllowedAttributes( data.viewItem, conversionApi );

			// Since we are converting to attribute we need a range on which we will set the attribute.
			// If the range is not created yet, we will create it.
			if ( !data.modelRange ) {
				data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
			}

			// Set attribute on each item in range according to the schema.
			for ( const node of data.modelRange.getItems() ) {
				if ( conversionApi.schema.checkAttribute( node, attributeKey ) ) {
					// Node's children are converted recursively, so node can already include model attribute.
					// We want to extend it, not replace.
					const nodeAttributes = node.getAttribute( attributeKey );
					const attributesToAdd = mergeViewElementAttributes( viewAttributes || {}, nodeAttributes || {} );

					conversionApi.writer.setAttribute( attributeKey, attributesToAdd, node );
				}
			}
		}, { priority: 'low' } );
	};
}

/**
 * Attribute-to-view conversion helper applying attributes to view element preserved on `$text`.
 *
 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
 * @returns {Function} Returns a conversion callback.
*/
export function attributeToViewInlineConverter( { priority, view: viewName } ) {
	return ( attributeValue, conversionApi ) => {
		if ( !attributeValue ) {
			return;
		}

		const { writer } = conversionApi;
		const viewElement = writer.createAttributeElement( viewName, null, { priority } );

		setViewAttributes( writer, attributeValue, viewElement );

		return viewElement;
	};
}

/**
 * View-to-model conversion helper preserving allowed attributes on block element.
 *
 * All matched attributes will be preserved on `htmlAttributes` attribute.
 *
 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
 * @param {module:html-support/datafilter~DataFilter} dataFilter
 * @returns {Function} Returns a conversion callback.
*/
export function viewToModelBlockAttributeConverter( { view: viewName }, dataFilter ) {
	return dispatcher => {
		dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
			if ( !data.modelRange ) {
				return;
			}

			const viewAttributes = dataFilter._consumeAllowedAttributes( data.viewItem, conversionApi );

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
 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
 * @returns {Function} Returns a conversion callback.
*/
export function modelToViewBlockAttributeConverter( { model: modelName } ) {
	return dispatcher => {
		dispatcher.on( `attribute:htmlAttributes:${ modelName }`, ( evt, data, conversionApi ) => {
			const viewAttributes = data.attributeNewValue;

			if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const viewWriter = conversionApi.writer;
			const viewElement = conversionApi.mapper.toViewElement( data.item );

			setViewAttributes( viewWriter, viewAttributes, viewElement );
		} );
	};
}
