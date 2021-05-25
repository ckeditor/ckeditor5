/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/converters
 */

import { toWidget } from 'ckeditor5/src/widget';
import { consumeViewAttributes, setViewAttributes, mergeViewElementAttributes } from './conversionutils';

/**
 * Conversion helper consuming all attributes from the definition view element
 * matched by the given matcher.
 *
 * This converter listenes on `high` priority to ensure that all attributes are consumed
 * before standard priority converters.
 *
 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
 * @param {module:engine/view/matcher~Matcher} matcher
 * @returns {Function} Returns a conversion callback.
*/
export function consumeViewAttributesConverter( { view: viewName }, matcher ) {
	return dispatcher => {
		dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
			consumeViewAttributes( data.viewItem, conversionApi, matcher );
		}, { priority: 'high' } );
	};
}

/**
 * View-to-model conversion helper preserving attributes on {@link module:code-block/codeblock~CodeBlock Code Block}
 * feature model element matched by the given matcher.
 *
 * Attributes are preserved as a value of `htmlAttributes` model attribute.
 *
 * @param {module:engine/view/matcher~Matcher} matcher
 * @returns {Function} Returns a conversion callback.
*/
export function viewToModelCodeBlockAttributeConverter( matcher ) {
	return dispatcher => {
		dispatcher.on( 'element:code', ( evt, data, conversionApi ) => {
			const viewPreElement = data.viewItem.parent;

			if ( !viewPreElement || !viewPreElement.is( 'element', 'pre' ) ) {
				return;
			}

			const viewAttributes = consumeViewAttributes( viewPreElement, conversionApi, matcher );

			if ( viewAttributes ) {
				conversionApi.writer.setAttribute( 'htmlAttributes', viewAttributes, data.modelRange );
			}
		}, { conversionPriority: 'low' } );
	};
}

/**
 * Model-to-view conversion helper applying attributes from {@link module:code-block/codeblock~CodeBlock Code Block}
 * feature model element.
 *
 * @returns {Function} Returns a conversion callback.
*/
export function modelToViewCodeBlockAttributeConverter() {
	return dispatcher => {
		dispatcher.on( 'attribute:htmlAttributes:codeBlock', ( evt, data, conversionApi ) => {
			if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const viewPreElement = conversionApi.mapper.toViewElement( data.item ).parent;
			setViewAttributes( conversionApi.writer, data.attributeNewValue, viewPreElement );
		} );
	};
}

/**
 * View-to-model conversion helper for object elements.
 *
 * Preserves object element content in `htmlContent` attribute. Also, all matching attributes
 * by the given matcher will be preserved on `htmlAttributes` attribute.
 *
 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
 * @param {module:engine/view/matcher~Matcher} matcher
 * @returns {Function} Returns a conversion callback.
*/
export function viewToModelObjectConverter( { model: modelName }, matcher ) {
	return ( viewElement, conversionApi ) => {
		const htmlAttributes = consumeViewAttributes( viewElement, conversionApi, matcher );

		// Let's keep element HTML and its attributes, so we can rebuild element in downcast conversions.
		return conversionApi.writer.createElement( modelName, {
			htmlContent: viewElement.getCustomProperty( '$rawContent' ),
			...( htmlAttributes && { htmlAttributes } )
		} );
	};
}

/**
 * Conversion helper converting object element to HTML object widget.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
 * @returns {Function} Returns a conversion callback.
*/
export function toObjectWidgetConverter( editor, { view: viewName, isInline } ) {
	return ( modelElement, { writer } ) => {
		const widgetLabel = editor.t( 'HTML object' );

		// Widget cannot be a raw element because the widget system would not be able
		// to add its UI to it. Thus, we need separate view container.
		const viewContainer = writer.createContainerElement( isInline ? 'span' : 'div', {
			class: 'html-object-embed',
			'data-html-object-embed-label': widgetLabel,
			dir: editor.locale.uiLanguageDirection
		}, {
			isAllowedInsideAttributeElement: isInline
		} );

		const viewElement = createObjectView( viewName, modelElement, writer );
		writer.addClass( 'html-object-embed__content', viewElement );

		writer.insert( writer.createPositionAt( viewContainer, 0 ), viewElement );

		return toWidget( viewContainer, writer, { widgetLabel } );
	};
}

/**
* Creates object view element from the given model element.
*
* Applies attributes preserved in `htmlAttributes` model attribute.
*
* @param {String} viewName
* @param {module:engine/model/element~Element} modelElement
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @returns {module:engine/view/element~Element}
*/
export function createObjectView( viewName, modelElement, writer ) {
	const viewAttributes = modelElement.getAttribute( 'htmlAttributes' );
	const viewContent = modelElement.getAttribute( 'htmlContent' );

	const viewElement = writer.createRawElement( viewName, null, function( domElement ) {
		domElement.innerHTML = viewContent;
	} );

	if ( viewAttributes ) {
		setViewAttributes( writer, viewAttributes, viewElement );
	}

	return viewElement;
}

/**
 * View-to-attribute conversion helper preserving inline element attributes on `$text`.
 *
 * All element attributes matched by the given matcher will be preserved as a value of
 * {@link module:content-compatibility/dataschema~DataSchemaInlineElementDefinition~model definition model}
 * attribute.
 *
 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
 * @param {module:engine/view/matcher~Matcher} matcher
 * @returns {Function} Returns a conversion callback.
*/
export function viewToAttributeInlineConverter( { view: viewName, model: attributeKey }, matcher ) {
	return dispatcher => {
		dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
			const viewAttributes = consumeViewAttributes( data.viewItem, conversionApi, matcher );

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
 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
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
 * View-to-model conversion helper preserving attributes on block element matched by the given matcher.
 *
 * All matched attributes will be preserved on `htmlAttributes` attribute.
 *
 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
 * @param {module:engine/view/matcher~Matcher} matcher
 * @returns {Function} Returns a conversion callback.
*/
export function viewToModelBlockAttributeConverter( { view: viewName }, matcher ) {
	return dispatcher => {
		dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
			if ( !data.modelRange ) {
				return;
			}

			const viewAttributes = consumeViewAttributes( data.viewItem, conversionApi, matcher );

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
 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
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
