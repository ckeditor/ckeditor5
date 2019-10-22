/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperites/utils
 */

export function upcastAttribute( conversion, modelElement, modelAttribute, styleName ) {
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

export function upcastBorderStyles( conversion, viewElement ) {
	conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:' + viewElement, ( evt, data, conversionApi ) => {
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
		const toMatch = matcherPattern;

		if ( !conversionApi.consumable.test( data.viewItem, toMatch ) ) {
			return;
		}

		const modelElement = [ ...data.modelRange.getItems( { shallow: true } ) ].pop();

		conversionApi.consumable.consume( data.viewItem, toMatch );

		conversionApi.writer.setAttribute( 'borderStyle', data.viewItem.getNormalizedStyle( 'border-style' ), modelElement );
		conversionApi.writer.setAttribute( 'borderColor', data.viewItem.getNormalizedStyle( 'border-color' ), modelElement );
		conversionApi.writer.setAttribute( 'borderWidth', data.viewItem.getNormalizedStyle( 'border-width' ), modelElement );
	} ) );
}

export function downcastToStyle( conversion, modelElement, modelAttribute, styleName ) {
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

// Properly downcast table border attribute on <table> and not on <figure>.
export function downcastTableAttribute( conversion, modelAttribute, styleName ) {
	conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( `attribute:${ modelAttribute }:table`, ( evt, data, conversionApi ) => {
		const { item, attributeNewValue } = data;
		const { mapper, writer } = conversionApi;

		const table = [ ...mapper.toViewElement( item ).getChildren() ].find( child => child.is( 'table' ) );

		if ( attributeNewValue ) {
			writer.setStyle( styleName, attributeNewValue, table );
		} else {
			writer.removeAttribute( styleName, table );
		}
	} ) );
}
