/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/tableproperites
 */

/**
 * Conversion helper for upcasting attributes using normalized styles.
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {String} modelElement
 * @param {String} modelAttribute
 * @param {String} styleName
 */
export function upcastStyleToAttribute( conversion, modelElement, modelAttribute, styleName ) {
	conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			styles: {
				[ styleName ]: /[\s\S]+/
			}
		},
		model: {
			name: modelElement,
			key: modelAttribute,
			value: viewElement => viewElement.getNormalizedStyle( styleName )
		}
	} );
}

/**
 * Conversion helper for upcasting border styles for view elements.
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {String} viewElementName
 */
export function upcastBorderStyles( conversion, viewElementName ) {
	conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:' + viewElementName, ( evt, data, conversionApi ) => {
		// TODO: this is counter-intuitive: ie.: if only `border-top` is defined then `hasStyle( 'border' )` also returns true.
		// TODO: this might needs to be fixed in styles normalizer.
		const stylesToConsume = [
			'border-top',
			'border-right',
			'border-bottom',
			'border-left'
		].filter( styleName => data.viewItem.hasStyle( styleName ) );

		if ( !stylesToConsume.length ) {
			return;
		}

		const matcherPattern = {
			styles: stylesToConsume
		};

		// Try to consume appropriate values from consumable values list.
		if ( !conversionApi.consumable.test( data.viewItem, matcherPattern ) ) {
			return;
		}

		const modelElement = [ ...data.modelRange.getItems( { shallow: true } ) ].pop();

		conversionApi.consumable.consume( data.viewItem, matcherPattern );

		conversionApi.writer.setAttribute( 'borderStyle', data.viewItem.getNormalizedStyle( 'border-style' ), modelElement );
		conversionApi.writer.setAttribute( 'borderColor', data.viewItem.getNormalizedStyle( 'border-color' ), modelElement );
		conversionApi.writer.setAttribute( 'borderWidth', data.viewItem.getNormalizedStyle( 'border-width' ), modelElement );
	} ) );
}

/**
 * Conversion helper for downcasting an attribute to a style.
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {String} modelElement
 * @param {String} modelAttribute
 * @param {String} styleName
 */
export function downcastAttributeToStyle( conversion, modelElement, modelAttribute, styleName ) {
	conversion.for( 'downcast' ).attributeToAttribute( {
		model: {
			name: modelElement,
			key: modelAttribute
		},
		view: modelAttributeValue => ( {
			key: 'style',
			value: {
				[ styleName ]: modelAttributeValue
			}
		} )
	} );
}

/**
 * Conversion helper for downcasting attributes from the model table to a view table (not to `<figure>`).
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {String} modelAttribute
 * @param {String} styleName
 */
export function downcastTableAttribute( conversion, modelAttribute, styleName ) {
	conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( `attribute:${ modelAttribute }:table`, ( evt, data, conversionApi ) => {
		const { item, attributeNewValue } = data;
		const { mapper, writer } = conversionApi;

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const table = [ ...mapper.toViewElement( item ).getChildren() ].find( child => child.is( 'table' ) );

		if ( attributeNewValue ) {
			writer.setStyle( styleName, attributeNewValue, table );
		} else {
			writer.removeStyle( styleName, table );
		}
	} ) );
}
