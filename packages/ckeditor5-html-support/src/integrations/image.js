/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/table
 */

import { Plugin } from 'ckeditor5/src/core';
import { disallowedAttributesConverter } from '../converters';
import { setViewAttributes } from '../conversionutils.js';

import DataFilter from '../datafilter';

/**
 * Provides the General HTML Support integration with {@link module:image/image~Image Image} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DataFilter ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		if ( !( editor.plugins.has( 'ImageInlineEditing' ) && editor.plugins.has( 'ImageBlockEditing' ) ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );

		dataFilter.on( 'register:img', ( evt, definition ) => {
			if ( definition.model !== 'htmlImg' ) {
				return;
			}

			if ( schema.isRegistered( 'imageBlock' ) ) {
				schema.extend( 'imageBlock', {
					allowAttributes: [
						'htmlAttributes',
						// Figure doesn't have model counterpart.
						// We will be preserving attributes on image model element using these attribute keys.
						'htmlFigureAttributes',
						// Link doesn't have model counterpart for other attributes than `href`. We will preserve them on image model.
						'htmlLinkAttributes'
					]
				} );
			}

			if ( schema.isRegistered( 'imageInline' ) ) {
				schema.extend( 'imageInline', {
					allowAttributes: [
						// It's needed for standard GHS link integration.
						'htmlA',
						'htmlAttributes'
					]
				} );
			}

			conversion.for( 'upcast' ).add( disallowedAttributesConverter( definition, dataFilter ) );
			conversion.for( 'upcast' ).add( viewToModelImageAttributeConverter( dataFilter ) );
			conversion.for( 'downcast' ).add( modelToViewImageAttributeConverter() );

			evt.stop();
		} );

		dataFilter.on( 'register:figure', () => {
			conversion.for( 'upcast' ).add( consumeTableFigureConverter() );
		} );
	}
}

// View-to-model conversion helper preserving allowed attributes on {@link module:image/image~Image Image}
// feature model element.
//
// @private
// @param {module:html-support/datafilter~DataFilter} dataFilter
// @returns {Function} Returns a conversion callback.
function viewToModelImageAttributeConverter( dataFilter ) {
	return dispatcher => {
		dispatcher.on( 'element:img', ( evt, data, conversionApi ) => {
			const viewImageElement = data.viewItem;

			preserveElementAttributes( viewImageElement, 'htmlAttributes' );

			const viewContainerElement = viewImageElement.parent;

			if ( viewContainerElement.is( 'element', 'figure' ) ) {
				preserveElementAttributes( viewContainerElement, 'htmlFigureAttributes' );
			} else if ( viewContainerElement.is( 'element', 'a' ) ) {
				// For block image, we want to preserve the attributes on our own. The inline image attributes will be handled
				// by the GHS automatically.
				if ( data.modelRange && data.modelRange.getContainedElement().is( 'element', 'imageBlock' ) ) {
					preserveElementAttributes( viewContainerElement, 'htmlLinkAttributes' );
				}

				// If we're in a link, then the `<figure>` element should be one level higher.
				if ( viewContainerElement.parent.is( 'element', 'figure' ) ) {
					preserveElementAttributes( viewContainerElement.parent, 'htmlFigureAttributes' );
				}
			}

			function preserveElementAttributes( viewElement, attributeName ) {
				const viewAttributes = dataFilter._consumeAllowedAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
				}
			}
		}, { priority: 'low' } );
	};
}

// Model-to-view conversion helper applying attributes from {@link module:image/image~Image Image}
// feature.
//
// @private
// @returns {Function} Returns a conversion callback.
function modelToViewImageAttributeConverter() {
	return dispatcher => {
		addInlineAttributeConversionDispatcherHandler( 'htmlAttributes' );

		addBlockAttributeConversionDispatcherHandler( 'img', 'htmlAttributes' );
		addBlockAttributeConversionDispatcherHandler( 'figure', 'htmlFigureAttributes' );
		addBlockAttributeConversionDispatcherHandler2();

		function addInlineAttributeConversionDispatcherHandler( attributeName ) {
			dispatcher.on( `attribute:${ attributeName }:imageInline`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewElement = conversionApi.mapper.toViewElement( data.item );

				setViewAttributes( conversionApi.writer, data.attributeNewValue, viewElement );
			}, { priority: 'low' } );
		}

		// TODO: Refactor.
		function addBlockAttributeConversionDispatcherHandler( elementName, attributeName ) {
			dispatcher.on( `attribute:${ attributeName }:imageBlock`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, `attribute:${ attributeName }:imageBlock` ) ) {
					return;
				}

				const containerElement = conversionApi.mapper.toViewElement( data.item );
				const viewElement = getDescendantElement( conversionApi, containerElement, elementName );

				// The viewElement can be empty, e.g. elementName is `a`, but on editing downcast we won't find `a`.
				if ( !viewElement ) {
					return;
				}

				setViewAttributes( conversionApi.writer, data.item.getAttribute( attributeName ), viewElement );
			}, { priority: 'low' } );
		}

		function addBlockAttributeConversionDispatcherHandler2( ) {
			dispatcher.on( 'attribute:linkHref:imageBlock', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, 'attribute:htmlLinkAttributes:imageBlock' ) ) {
					return;
				}

				const containerElement = conversionApi.mapper.toViewElement( data.item );
				const viewElement = getDescendantElement( conversionApi, containerElement, 'a' );

				// The viewElement can be empty, e.g. elementName is `a`, but on editing downcast we won't find `a`.
				if ( !viewElement ) {
					return;
				}

				setViewAttributes( conversionApi.writer, data.item.getAttribute( 'htmlLinkAttributes' ), viewElement );
			}, { priority: 'low' } );
		}
	};
}

// Returns the first view element descendant matching the given view name.
// Includes view element itself.
//
// @private
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @param {module:engine/view/element~Element} containerElement
// @param {String} elementName
// @returns {module:engine/view/element~Element|null}
function getDescendantElement( conversionApi, containerElement, elementName ) {
	const range = conversionApi.writer.createRangeOn( containerElement );

	for ( const { item } of range.getWalker() ) {
		if ( item.is( 'element', elementName ) ) {
			return item;
		}
	}
}

// Conversion helper consuming figure element if it's a part of the Table feature
// to avoid elementToElement conversion for figure with that context.
//
// @private
// @returns {Function} Returns a conversion callback.
function consumeTableFigureConverter() {
	return dispatcher => {
		dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
			for ( const childNode of data.viewItem.getChildren() ) {
				if ( childNode.is( 'element', 'img' ) ) {
					conversionApi.consumable.consume( data.viewItem, { name: true } );
					return;
				}
			}
		} );
	};
}
