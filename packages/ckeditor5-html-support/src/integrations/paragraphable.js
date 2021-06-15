/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/paragraphable
 */

import { Plugin } from 'ckeditor5/src/core';

import DataFilter from '../datafilter';

/**
 * Provides the General HTML Support integration with paragraphable elements.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ParagraphableHtmlSupport extends Plugin {
	static get requires() {
		return [ DataFilter ];
	}

	init() {
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on( 'register', ( evt, definition ) => {
			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;

			if ( !definition.asParagraph ) {
				return;
			}

			// Can only apply to newly registered features.
			if ( schema.isRegistered( definition.model ) || schema.isRegistered( definition.asParagraph ) ) {
				return;
			}

			schema.register( definition.model, definition.modelSchema );
			schema.register( definition.asParagraph, {
				inheritAllFrom: '$block'
			} );

			conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( `element:${ definition.view }`, ( evt, data, conversionApi ) => {
					// We are using document fragment to convert children, as we need them
					// to decide which model element to create.
					const documentFragment = conversionApi.writer.createDocumentFragment();
					conversionApi.convertChildren( data.viewItem, documentFragment );

					// Nodes are moved later on, so we can't use iterable directly.
					const conversionChildren = Array.from( documentFragment.getChildren() );

					const treatAsParagraph = conversionChildren.every( isTextable );
					const modelName = treatAsParagraph ? definition.asParagraph : definition.model;

					const modelElement = conversionApi.writer.createElement( modelName );

					for ( const child of conversionChildren ) {
						// Some child nodes may not be allowed in the model when using document
						// fragment as a conversion context.
						if ( schema.checkChild( modelElement, child ) ) {
							conversionApi.writer.append( child, modelElement );
						}
					}

					if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
						return;
					}

					conversionApi.consumable.consume( data.viewItem, { name: true } );
					conversionApi.updateConversionResult( modelElement, data );
				} );
			} );

			conversion.for( 'downcast' ).elementToElement( {
				view: definition.view,
				model: definition.model
			} );

			conversion.for( 'downcast' ).elementToElement( {
				view: definition.view,
				model: definition.asParagraph
			} );
		} );
	}
}

function isTextable( node ) {
	return node.is( '$text' ) || node.is( 'element', 'softBreak' );
}

/**
 * Uses the given model name if an element behaves like a paragraph i.e. only contains specific paragraph
 * elements.
 *
 * @member {String} module:html-support/dataschema~DataSchemaBlockElementDefinition#asParagraph
 */
