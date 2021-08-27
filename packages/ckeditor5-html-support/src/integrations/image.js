/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/image
 */

import { Plugin } from 'ckeditor5/src/core';

import DataFilter from '../datafilter';
import { setViewAttributes } from '../conversionutils.js';

/**
 * Provides the General HTML Support integration with the {@link module:image/image~Image Image} feature.
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

		// At least one image plugin should be loaded for the integration to work properly.
		if ( !editor.plugins.has( 'ImageInlineEditing' ) && !editor.plugins.has( 'ImageBlockEditing' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );

		dataFilter.on( 'register:img', ( evt, definition ) => {
			if ( definition.model !== 'imageBlock' && definition.model !== 'imageInline' ) {
				return;
			}

			if ( schema.isRegistered( 'imageBlock' ) ) {
				schema.extend( 'imageBlock', {
					allowAttributes: [
						'htmlAttributes',
						// Figure and Link don't have model counterpart.
						// We will preserve attributes on image model element using these attribute keys.
						'htmlFigureAttributes',
						'htmlLinkAttributes'
					]
				} );
			}

			if ( schema.isRegistered( 'imageInline' ) ) {
				schema.extend( 'imageInline', {
					allowAttributes: [
						// `htmlA` is needed for standard GHS link integration.
						'htmlA',
						'htmlAttributes'
					]
				} );
			}

			conversion.for( 'upcast' ).add( viewToModelImageAttributeConverter( dataFilter ) );
			conversion.for( 'downcast' ).add( modelToViewImageAttributeConverter() );

			evt.stop();
		} );
	}
}

// View-to-model conversion helper preserving allowed attributes on the {@link module:image/image~Image Image}
// feature model element.
//
// @private
// @param {module:html-support/datafilter~DataFilter} dataFilter
// @returns {Function} Returns a conversion callback.
function viewToModelImageAttributeConverter( dataFilter ) {
	return dispatcher => {
		dispatcher.on( 'element:img', ( evt, data, conversionApi ) => {
			const viewImageElement = data.viewItem;
			const viewContainerElement = viewImageElement.parent;

			preserveElementAttributes( viewImageElement, 'htmlAttributes' );

			if ( viewContainerElement.is( 'element', 'figure' ) ) {
				preserveElementAttributes( viewContainerElement, 'htmlFigureAttributes' );
			} else if ( viewContainerElement.is( 'element', 'a' ) ) {
				preserveLinkAttributes( viewContainerElement );
			}

			function preserveElementAttributes( viewElement, attributeName ) {
				const viewAttributes = dataFilter._consumeAllowedAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
				}
			}

			// For a block image, we want to preserve the attributes on our own.
			// The inline image attributes will be handled by the GHS automatically.
			function preserveLinkAttributes( viewContainerElement ) {
				if ( data.modelRange && data.modelRange.getContainedElement().is( 'element', 'imageBlock' ) ) {
					preserveElementAttributes( viewContainerElement, 'htmlLinkAttributes' );
				}

				// If we're in a link, then the `<figure>` element should be one level higher.
				if ( viewContainerElement.parent.is( 'element', 'figure' ) ) {
					preserveElementAttributes( viewContainerElement.parent, 'htmlFigureAttributes' );
				}
			}
		}, { priority: 'low' } );
	};
}

// A model-to-view conversion helper applying attributes from the {@link module:image/image~Image Image}
// feature.
//
// @private
// @returns {Function} Returns a conversion callback.
function modelToViewImageAttributeConverter() {
	return dispatcher => {
		addInlineAttributeConversion( 'htmlAttributes' );

		addBlockAttributeConversion( 'img', 'htmlAttributes' );
		addBlockAttributeConversion( 'figure', 'htmlFigureAttributes' );
		addBlockImageLinkAttributeConversion();

		function addInlineAttributeConversion( attributeName ) {
			dispatcher.on( `attribute:${ attributeName }:imageInline`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewElement = conversionApi.mapper.toViewElement( data.item );

				setViewAttributes( conversionApi.writer, data.attributeNewValue, viewElement );
			}, { priority: 'low' } );
		}

		function addBlockAttributeConversion( elementName, attributeName ) {
			dispatcher.on( `attribute:${ attributeName }:imageBlock`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const containerElement = conversionApi.mapper.toViewElement( data.item );
				const viewElement = getDescendantElement( conversionApi.writer, containerElement, elementName );

				setViewAttributes( conversionApi.writer, data.attributeNewValue, viewElement );
			}, { priority: 'low' } );
		}

		// To have a link element in the view, we need to attach a converter to the `linkHref` attribute.
		// Doing this directly on `htmlLinkAttributes` will fail, as the link wrapper is not yet called at that moment.
		function addBlockImageLinkAttributeConversion( ) {
			dispatcher.on( 'attribute:linkHref:imageBlock', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, 'attribute:htmlLinkAttributes:imageBlock' ) ) {
					return;
				}

				const containerElement = conversionApi.mapper.toViewElement( data.item );
				const viewElement = getDescendantElement( conversionApi.writer, containerElement, 'a' );

				setViewAttributes( conversionApi.writer, data.item.getAttribute( 'htmlLinkAttributes' ), viewElement );
			}, { priority: 'low' } );
		}
	};
}

// Returns the first view element descendant matching the given view name.
// Includes view element itself.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:engine/view/element~Element} containerElement
// @param {String} elementName
// @returns {module:engine/view/element~Element|null}
function getDescendantElement( writer, containerElement, elementName ) {
	const range = writer.createRangeOn( containerElement );

	for ( const { item } of range.getWalker() ) {
		if ( item.is( 'element', elementName ) ) {
			return item;
		}
	}
}
