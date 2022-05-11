/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/customelement
 */

import { Plugin } from 'ckeditor5/src/core';
import { UpcastWriter } from 'ckeditor5/src/engine';

import DataSchema from '../dataschema';
import DataFilter from '../datafilter';
import { setViewAttributes } from '../conversionutils';

/**
 * Provides the General HTML Support for custom elements (not registered in the DataSchema).
 *
 * @extends module:core/plugin~Plugin
 */
export default class CustomElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DataFilter, DataSchema ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const dataFilter = this.editor.plugins.get( DataFilter );
		const dataSchema = this.editor.plugins.get( DataSchema );

		dataFilter.on( 'register:$customElement', ( evt, definition ) => {
			evt.stop();

			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;
			const unsafeElements = editor.editing.view.domConverter.unsafeElements;

			schema.register( definition.model, definition.modelSchema );
			schema.extend( definition.model, {
				allowAttributes: [ 'htmlElementName', 'htmlAttributes', 'htmlContent' ],
				isContent: true
			} );

			conversion.for( 'upcast' ).elementToElement( {
				view: /.*/,
				model: ( viewElement, conversionApi ) => {
					// Allow for fallback only if this element is not defined in data schema to make sure
					// that this will handle only custom elements not registered in the data schema.
					if ( dataSchema.getDefinitionsForView( viewElement.name ).size ) {
						return;
					}

					const modelElement = conversionApi.writer.createElement( definition.model, {
						htmlElementName: viewElement.name
					} );

					const htmlAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

					if ( htmlAttributes ) {
						conversionApi.writer.setAttribute( 'htmlAttributes', htmlAttributes, modelElement );
					}

					const viewWriter = new UpcastWriter( viewElement.document );
					const childNodes = [];

					// Replace filler offset so the block filler won't get injected.
					for ( const node of Array.from( viewElement.getChildren() ) ) {
						node.getFillerOffset = () => null;
						childNodes.push( node );
					}

					const documentFragment = viewWriter.createDocumentFragment( childNodes );

					if ( !documentFragment.isEmpty ) {
						const htmlContent = editor.data.processor.toData( documentFragment );

						conversionApi.writer.setAttribute( 'htmlContent', htmlContent, modelElement );
					}

					if ( !unsafeElements.includes( viewElement.name ) ) {
						unsafeElements.push( viewElement.name );
					}

					return modelElement;
				},
				converterPriority: 'low'
			} );

			conversion.for( 'downcast' ).elementToElement( {
				model: {
					name: definition.model,
					attributes: [ 'htmlElementName', 'htmlAttributes', 'htmlContent' ]
				},
				view: ( modelElement, { writer } ) => {
					const viewName = modelElement.getAttribute( 'htmlElementName' );
					const htmlContent = modelElement.getAttribute( 'htmlContent' );

					const viewElement = writer.createRawElement( viewName, null, ( domElement, domConverter ) => {
						if ( htmlContent ) {
							domConverter.setContentOf( domElement, htmlContent );
						}
					} );

					if ( modelElement.hasAttribute( 'htmlAttributes' ) ) {
						setViewAttributes( writer, modelElement.getAttribute( 'htmlAttributes' ), viewElement );
					}

					return viewElement;
				}
			} );
		} );
	}
}
