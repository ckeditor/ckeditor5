/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/customelement
 */

/* globals document */

import { Plugin } from 'ckeditor5/src/core';
import { UpcastWriter, type ViewDocumentFragment, type ViewNode } from 'ckeditor5/src/engine';

import DataSchema from '../dataschema';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter';
import { type GHSViewAttributes, setViewAttributes } from '../conversionutils';

/**
 * Provides the General HTML Support for custom elements (not registered in the {@link module:html-support/dataschema~DataSchema}).
 */
export default class CustomElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter, DataSchema ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CustomElementSupport' {
		return 'CustomElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const dataFilter = this.editor.plugins.get( DataFilter );
		const dataSchema = this.editor.plugins.get( DataSchema );

		dataFilter.on<DataFilterRegisterEvent>( 'register:$customElement', ( evt, definition ) => {
			evt.stop();

			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;
			const unsafeElements = editor.editing.view.domConverter.unsafeElements;
			const preLikeElements = editor.data.htmlProcessor.domConverter.preElements;

			schema.register( definition.model, definition.modelSchema );
			schema.extend( definition.model, {
				allowAttributes: [ 'htmlElementName', 'htmlAttributes', 'htmlContent' ],
				isContent: true
			} );

			// Being executed on the low priority, it will catch all elements that were not caught by other converters.
			conversion.for( 'upcast' ).elementToElement( {
				view: /.*/,
				model: ( viewElement, conversionApi ) => {
					// Do not try to convert $comment fake element.
					if ( viewElement.name == '$comment' ) {
						return null;
					}

					if ( !isValidElementName( viewElement.name ) ) {
						return null;
					}

					// Allow for fallback only if this element is not defined in data schema to make sure
					// that this will handle only custom elements not registered in the data schema.
					if ( dataSchema.getDefinitionsForView( viewElement.name ).size ) {
						return null;
					}

					// Make sure that this element will not render in the editing view.
					if ( !unsafeElements.includes( viewElement.name ) ) {
						unsafeElements.push( viewElement.name );
					}

					// Make sure that whitespaces will not be trimmed or replaced by nbsps while stringify content.
					if ( !preLikeElements.includes( viewElement.name ) ) {
						preLikeElements.push( viewElement.name );
					}

					const modelElement = conversionApi.writer.createElement( definition.model, {
						htmlElementName: viewElement.name
					} );

					const htmlAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

					if ( htmlAttributes ) {
						conversionApi.writer.setAttribute( 'htmlAttributes', htmlAttributes, modelElement );
					}

					// Store the whole element in the attribute so that DomConverter will be able to use the pre like element context.
					const viewWriter = new UpcastWriter( viewElement.document );
					const documentFragment = viewWriter.createDocumentFragment( viewElement );
					const htmlContent = editor.data.processor.toData( documentFragment );

					conversionApi.writer.setAttribute( 'htmlContent', htmlContent, modelElement );

					// Consume the content of the element.
					for ( const { item } of editor.editing.view.createRangeIn( viewElement ) ) {
						conversionApi.consumable.consume( item as ViewNode | ViewDocumentFragment, { name: true } );
					}

					return modelElement;
				},
				converterPriority: 'low'
			} );

			// Because this element is unsafe (DomConverter#unsafeElements), it will render as a transparent <span> but it must
			// be rendered anyway for the mapping between the model and the view to exist.
			conversion.for( 'editingDowncast' ).elementToElement( {
				model: {
					name: definition.model,
					attributes: [ 'htmlElementName', 'htmlAttributes', 'htmlContent' ]
				},
				view: ( modelElement, { writer } ) => {
					const viewName = modelElement.getAttribute( 'htmlElementName' ) as string;
					const viewElement = writer.createRawElement( viewName );

					if ( modelElement.hasAttribute( 'htmlAttributes' ) ) {
						setViewAttributes( writer, modelElement.getAttribute( 'htmlAttributes' ) as GHSViewAttributes, viewElement );
					}

					return viewElement;
				}
			} );

			conversion.for( 'dataDowncast' ).elementToElement( {
				model: {
					name: definition.model,
					attributes: [ 'htmlElementName', 'htmlAttributes', 'htmlContent' ]
				},
				view: ( modelElement, { writer } ) => {
					const viewName = modelElement.getAttribute( 'htmlElementName' ) as string;
					const htmlContent = modelElement.getAttribute( 'htmlContent' ) as string;

					const viewElement = writer.createRawElement( viewName, null, ( domElement, domConverter ) => {
						domConverter.setContentOf( domElement, htmlContent );

						// Unwrap the custom element content (it was stored in the attribute as the whole custom element).
						// See the upcast conversion for the "htmlContent" attribute to learn more.
						const customElement = domElement.firstChild!;

						customElement.remove();

						while ( customElement.firstChild ) {
							domElement.appendChild( customElement.firstChild );
						}
					} );

					if ( modelElement.hasAttribute( 'htmlAttributes' ) ) {
						setViewAttributes( writer, modelElement.getAttribute( 'htmlAttributes' ) as GHSViewAttributes, viewElement );
					}

					return viewElement;
				}
			} );
		} );
	}
}

/**
 * Returns true if name is valid for a DOM element name.
 */
function isValidElementName( name: string ): boolean {
	try {
		document.createElement( name );
	} catch ( error ) {
		return false;
	}

	return true;
}
