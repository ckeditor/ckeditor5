/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/paragraphable
 */

import { Plugin } from 'ckeditor5/src/core';
import {
	disallowedAttributesConverter,
	viewToModelBlockAttributeConverter,
	modelToViewBlockAttributeConverter
} from '../converters';

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

			const paragraphableDefinition = {
				model: definition.asParagraph,
				view: definition.view
			};

			schema.register( definition.model, definition.modelSchema );
			schema.register( paragraphableDefinition.model, {
				inheritAllFrom: '$block'
			} );

			conversion.for( 'upcast' ).add( viewToModelParagraphableElementConverter( definition ) );

			conversion.for( 'downcast' ).elementToElement( definition );
			this._addAttributeConversion( definition );

			conversion.for( 'downcast' ).elementToElement( paragraphableDefinition );
			this._addAttributeConversion( paragraphableDefinition );

			evt.stop();
		} );
	}

	/**
	 * Adds attribute filtering conversion for the given data schema.
	 *
	 * @private
	 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	_addAttributeConversion( definition ) {
		const editor = this.editor;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );

		editor.model.schema.extend( definition.model, {
			allowAttributes: 'htmlAttributes'
		} );

		conversion.for( 'upcast' ).add( disallowedAttributesConverter( definition, dataFilter ) );
		conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition, dataFilter ) );
		conversion.for( 'downcast' ).add( modelToViewBlockAttributeConverter( definition ) );
	}
}

// View-to-model conversion helper for elements which can behave as a paragraph or block element
// depending on the element content.
//
// If an element includes any block element like paragraph, it should be upcasted using block element model.
//
// 		<div><p>foobar</p></div>
// 		<!-- Should be upcasted to: -->
// 		<htmlDiv><p>foobar</p></htmlDiv>
//
// If an element includes only text nodes or soft breaks, it should be upcasted using paragraph-like element model.
//
// 		<div>foobar</div>
// 		<!-- Should be upcasted to: -->
// 		<htmlDivParagraph>foobar</htmlDivParagraph>
//
// @private
// @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
function viewToModelParagraphableElementConverter( definition ) {
	return dispatcher => {
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
				if ( conversionApi.schema.checkChild( modelElement, child ) ) {
					conversionApi.writer.append( child, modelElement );
				}
			}

			if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
				return;
			}

			conversionApi.consumable.consume( data.viewItem, { name: true } );
			conversionApi.updateConversionResult( modelElement, data );
		} );
	};
}

// Tells whethever the node should be treated as a textable element.
//
// @private
// @param {module:engine/view/element~Element} viewElement
// @returns {Boolean}
function isTextable( node ) {
	return node.is( '$text' ) || node.is( 'element', 'softBreak' );
}

/**
 * Uses the given model name if an element behaves like a paragraph i.e. only contains specific paragraph
 * elements.
 *
 * @member {String} module:html-support/dataschema~DataSchemaBlockElementDefinition#asParagraph
 */
