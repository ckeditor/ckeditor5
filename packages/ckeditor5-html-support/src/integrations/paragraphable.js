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
	modelToViewBlockAttributeConverter,
	viewToModelBlockAttributeConverter
} from '../converters';

import { priorities } from 'ckeditor5/src/utils';

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

			conversion.for( 'upcast' ).elementToElement( {
				view: definition.view,
				model: ( viewElement, { writer } ) => {
					if ( this._hasBlockContent( viewElement ) ) {
						return writer.createElement( definition.model );
					}

					return writer.createElement( definition.asParagraph );
				},
				// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
				// this listener is called before it. If not, some elements will be transformed into a paragraph.
				converterPriority: priorities.get( 'low' ) + 1
			} );

			conversion.for( 'downcast' ).elementToElement( {
				view: definition.view,
				model: definition.model
			} );
			this._addAttributeConversion( definition );

			conversion.for( 'downcast' ).elementToElement( {
				view: paragraphableDefinition.view,
				model: paragraphableDefinition.model
			} );
			this._addAttributeConversion( paragraphableDefinition );

			evt.stop();
		} );
	}

	/**
	 * Checks whethever the given view element includes any other block element.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement
	 * @returns {Boolean}
	 */
	_hasBlockContent( viewElement ) {
		const blockElements = this.editor.editing.view.domConverter.blockElements;

		return Array.from( viewElement.getChildren() )
			.some( node => blockElements.includes( node.name ) );
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

/**
 * Uses the given model name if an element behaves like a paragraph i.e. only contains specific paragraph
 * elements.
 *
 * @member {String} module:html-support/dataschema~DataSchemaBlockElementDefinition#asParagraph
 */
