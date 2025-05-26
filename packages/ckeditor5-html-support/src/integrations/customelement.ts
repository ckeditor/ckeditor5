/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/customelement
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { UpcastWriter, type ViewDocumentFragment, type ViewNode } from 'ckeditor5/src/engine.js';

import DataSchema from '../dataschema.js';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter.js';
import { type GHSViewAttributes, setViewAttributes } from '../utils.js';

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
	public static get pluginName() {
		return 'CustomElementSupport' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
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
				allowAttributes: [ 'htmlElementName', 'htmlCustomElementAttributes', 'htmlContent' ],
				isContent: true
			} );

			// For the `<template>` element we use only raw-content because DOM API exposes its content
			// only as a document fragment in the `content` property (or innerHTML).
			editor.data.htmlProcessor.domConverter.registerRawContentMatcher( { name: 'template' } );

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
						conversionApi.writer.setAttribute( 'htmlCustomElementAttributes', htmlAttributes, modelElement );
					}

					let htmlContent;

					// For the `<template>` element we use only raw-content because DOM API exposes its content
					// only as a document fragment in the `content` property.
					if ( viewElement.is( 'element', 'template' ) && viewElement.getCustomProperty( '$rawContent' ) ) {
						htmlContent = viewElement.getCustomProperty( '$rawContent' );
					} else {
						// Store the whole element in the attribute so that DomConverter will be able to use the pre like element context.
						const viewWriter = new UpcastWriter( viewElement.document );
						const documentFragment = viewWriter.createDocumentFragment( viewElement );
						const domFragment = editor.data.htmlProcessor.domConverter.viewToDom( documentFragment );
						const domElement = domFragment.firstChild!;

						while ( domElement.firstChild ) {
							domFragment.appendChild( domElement.firstChild );
						}

						domElement.remove();

						htmlContent = editor.data.htmlProcessor.htmlWriter.getHtml( domFragment );
					}

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
					attributes: [ 'htmlElementName', 'htmlCustomElementAttributes', 'htmlContent' ]
				},
				view: ( modelElement, { writer } ) => {
					const viewName = modelElement.getAttribute( 'htmlElementName' ) as string;
					const viewElement = writer.createRawElement( viewName );

					if ( modelElement.hasAttribute( 'htmlCustomElementAttributes' ) ) {
						setViewAttributes(
							writer,
							modelElement.getAttribute( 'htmlCustomElementAttributes' ) as GHSViewAttributes,
							viewElement
						);
					}

					return viewElement;
				}
			} );

			conversion.for( 'dataDowncast' ).elementToElement( {
				model: {
					name: definition.model,
					attributes: [ 'htmlElementName', 'htmlCustomElementAttributes', 'htmlContent' ]
				},
				view: ( modelElement, { writer } ) => {
					const viewName = modelElement.getAttribute( 'htmlElementName' ) as string;
					const htmlContent = modelElement.getAttribute( 'htmlContent' ) as string;

					const viewElement = writer.createRawElement( viewName, null, ( domElement, domConverter ) => {
						domConverter.setContentOf( domElement, htmlContent );
					} );

					if ( modelElement.hasAttribute( 'htmlCustomElementAttributes' ) ) {
						setViewAttributes(
							writer,
							modelElement.getAttribute( 'htmlCustomElementAttributes' ) as GHSViewAttributes,
							viewElement
						);
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
	} catch {
		return false;
	}

	return true;
}
