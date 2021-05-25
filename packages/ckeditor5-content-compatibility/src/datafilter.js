/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/datafilter
 */

import DataSchema from './dataschema';

import { Plugin } from 'ckeditor5/src/core';
import { Matcher } from 'ckeditor5/src/engine';
import { priorities, CKEditorError } from 'ckeditor5/src/utils';
import { Widget } from 'ckeditor5/src/widget';
import {
	consumeViewAttributesConverter,

	viewToModelCodeBlockAttributeConverter,
	modelToViewCodeBlockAttributeConverter,

	viewToModelObjectConverter,
	toObjectWidgetConverter,
	createObjectView,

	viewToAttributeInlineConverter,
	attributeToViewInlineConverter,

	viewToModelBlockAttributeConverter,
	modelToViewBlockAttributeConverter
} from './converters';

import '../theme/datafilter.css';

/**
 * Allows to validate elements and element attributes registered by {@link module:content-compatibility/dataschema~DataSchema}.
 *
 * To enable registered element in the editor, use {@link module:content-compatibility/datafilter~DataFilter#allowElement} method:
 *
 *		dataFilter.allowElement( {
 *			name: 'section'
 *		} );
 *
 * You can also allow or disallow specific element attributes:
 *
 *		// Allow `data-foo` attribute on `section` element.
 *		dataFilter.allowedAttributes( {
 *			name: 'section',
 *			attributes: {
 *				'data-foo': true
 *			}
 *		} );
 *
 *		// Disallow `color` style attribute on 'section' element.
 *		dataFilter.disallowedAttributes( {
 *			name: 'section',
 *			styles: {
 *				color: /[\s\S]+/
 *			}
 *		} );
 *
 * @extends module:core/plugin~Plugin
 */
export default class DataFilter extends Plugin {
	constructor( editor ) {
		super( editor );

		/**
		 * An instance of the {@link module:content-compatibility/dataschema~DataSchema}.
		 *
		 * @readonly
		 * @private
		 * @member {module:content-compatibility/dataschema~DataSchema} #_dataSchema
		 */
		this._dataSchema = editor.plugins.get( 'DataSchema' );

		/**
		 * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
		 * content attributes should be allowed.
		 *
		 * @readonly
		 * @private
		 * @member {module:engine/view/matcher~Matcher} #_allowedAttributes
		 */
		this._allowedAttributes = new Matcher();

		/**
		 * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
		 * content attributes should be disallowed.
		 *
		 * @readonly
		 * @private
		 * @member {module:engine/view/matcher~Matcher} #_disallowedAttributes
		 */
		this._disallowedAttributes = new Matcher();

		/**
		 * Allowed element definitions by {@link module:content-compatibility/datafilter~DataFilter#allowElement} method.
		 *
		 * @readonly
		 * @private
		 * @member {Set.<module:content-compatibility/dataschema~DataSchemaDefinition>} #_allowedElements
		*/
		this._allowedElements = new Set();

		/**
		 * Indicates if {@link module:core/editor~Editor#data editor's data controller} data has been already initialized.
		 *
		 * @private
		 * @member {Boolean} [#_dataInitialized=false]
		*/
		this._dataInitialized = false;

		this._registerElementsAfterInit();
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DataFilter';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DataSchema, Widget ];
	}

	/**
	 * Allow the given element in the editor context.
	 *
	 * This method will only allow elements described by the {@link module:content-compatibility/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all view elements which should be allowed.
	 */
	allowElement( config ) {
		for ( const definition of this._dataSchema.getDefinitionsForView( config.name, true ) ) {
			if ( this._allowedElements.has( definition ) ) {
				continue;
			}

			this._allowedElements.add( definition );

			// We need to wait for all features to be initialized before we can register
			// element, so we can access existing features model schemas.
			// If the data has not been initialized yet, _registerElementsAfterInit() method will take care of
			// registering elements.
			if ( this._dataInitialized ) {
				this._registerElement( definition );
			}
		}

		this.allowAttributes( config );
	}

	/**
	 * Allow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all attributes which should be allowed.
	 */
	allowAttributes( config ) {
		this._allowedAttributes.add( config );
	}

	/**
	 * Disallow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all attributes which should be disallowed.
	 */
	disallowAttributes( config ) {
		this._disallowedAttributes.add( config );
	}

	/**
	 * Registers elements allowed by {@link module:content-compatibility/datafilter~DataFilter#allowElement} method
	 * once {@link module:core/editor~Editor#data editor's data controller} is initialized.
	 *
	 * @private
	*/
	_registerElementsAfterInit() {
		this.editor.data.on( 'init', () => {
			this._dataInitialized = true;

			for ( const definition of this._allowedElements ) {
				this._registerElement( definition );
			}
		}, {
			// With high priority listener we are able to register elements right before
			// running data conversion. Make also sure that priority is higher than the one
			// used by `RealTimeCollaborationClient`, as RTC is stopping event propagation.
			priority: priorities.get( 'high' ) + 1
		} );
	}

	/**
	 * Registers element and attribute converters for the given data schema definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	_registerElement( definition ) {
		// Note that the order of element handlers is important,
		// as the handler may interrupt handlers execution in case of returning
		// anything else than `false` value.
		const elementHandlers = [
			this._handleCodeBlockElement,
			this._handleObjectElement,
			this._handleInlineElement,
			this._handleBlockElement
		];

		for ( const elementHandler of elementHandlers ) {
			if ( elementHandler.call( this, definition ) !== false ) {
				return;
			}
		}

		/**
		 * The definition cannot be handled by the data filter.
		 *
		 * Make sure that the registered definition is correct.
		 *
		 * @error data-filter-invalid-definition
		 */
		throw new CKEditorError(
			'data-filter-invalid-definition',
			null,
			definition
		);
	}

	/**
	 * Registers attribute converters for {@link module:code-block/codeblock~CodeBlock Code Block} feature.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 * @returns {Boolean}
	 */
	_handleCodeBlockElement( definition ) {
		const editor = this.editor;

		// We should only handle codeBlock model if CodeBlock plugin is available.
		// Otherwise, let #_handleBlockElement() do the job.
		if ( !editor.plugins.has( 'CodeBlock' ) || definition.model !== 'codeBlock' ) {
			return false;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;

		// CodeBlock plugin is filtering out all attributes on `code` element. Let's add
		// exception for `htmlCode` required for data filtration mechanism.
		schema.on( 'checkAttribute', ( evt, [ context, attributeName ] ) => {
			if ( attributeName === 'htmlCode' && context.endsWith( 'codeBlock $text' ) ) {
				evt.return = true;
				evt.stop();
			}
		}, { priority: priorities.get( 'high' ) + 1 } );

		conversion.for( 'upcast' ).add( consumeViewAttributesConverter( definition, this._disallowedAttributes ) );
		conversion.for( 'upcast' ).add( viewToModelCodeBlockAttributeConverter( this._allowedAttributes ) );
		conversion.for( 'downcast' ).add( modelToViewCodeBlockAttributeConverter() );
	}

	/**
	 * Registers object element and attribute converters for the given data schema definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 * @returns {Boolean}
	 */
	_handleObjectElement( definition ) {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const { view: viewName, model: modelName } = definition;

		if ( !definition.isObject ) {
			return false;
		}

		// If feature is already registered, #_handleBlockElement should take care of it.
		if ( schema.isRegistered( modelName ) ) {
			return false;
		}

		schema.register( modelName, definition.modelSchema );

		if ( !viewName ) {
			return;
		}

		// Store element content in special `$rawContent` custom property to
		// avoid editor's data filtering mechanism.
		editor.data.registerRawContentMatcher( {
			name: viewName
		} );

		conversion.for( 'upcast' ).add( consumeViewAttributesConverter( definition, this._disallowedAttributes ) );
		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: viewToModelObjectConverter( definition, this._allowedAttributes ),
			// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
			// this listener is called before it. If not, some elements will be transformed into a paragraph.
			converterPriority: priorities.get( 'low' ) + 1
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: modelName,
			view: ( modelElement, { writer } ) => {
				return createObjectView( viewName, modelElement, writer );
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: modelName,
			view: toObjectWidgetConverter( editor, definition )
		} );
	}

	/**
	 * Registers block element and attribute converters for the given data schema definition.
	 *
	 * If the element model schema is already registered, this method will do nothing.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
	 * @returns {Boolean}
	 */
	_handleBlockElement( definition ) {
		if ( !definition.isBlock ) {
			return false;
		}

		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const { view: viewName, model: modelName } = definition;

		if ( !schema.isRegistered( definition.model ) ) {
			schema.register( definition.model, definition.modelSchema );

			if ( !viewName ) {
				return;
			}

			conversion.for( 'upcast' ).elementToElement( {
				model: modelName,
				view: viewName,
				// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
				// this listener is called before it. If not, some elements will be transformed into a paragraph.
				converterPriority: priorities.get( 'low' ) + 1
			} );

			conversion.for( 'downcast' ).elementToElement( {
				model: modelName,
				view: viewName
			} );
		}

		if ( !viewName ) {
			return;
		}

		conversion.for( 'upcast' ).add( consumeViewAttributesConverter( definition, this._disallowedAttributes ) );
		conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition, this._allowedAttributes ) );
		conversion.for( 'downcast' ).add( modelToViewBlockAttributeConverter( definition ) );
	}

	/**
	 * Registers inline element and attribute converters for the given data schema definition.
	 *
	 * Extends `$text` model schema to allow the given definition model attribute and its properties.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
	 * @returns {Boolean}
	 */
	_handleInlineElement( definition ) {
		if ( !definition.isInline ) {
			return false;
		}

		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const attributeKey = definition.model;

		schema.extend( '$text', {
			allowAttributes: attributeKey
		} );

		if ( definition.attributeProperties ) {
			schema.setAttributeProperties( attributeKey, definition.attributeProperties );
		}

		conversion.for( 'upcast' ).add( consumeViewAttributesConverter( definition, this._disallowedAttributes ) );
		conversion.for( 'upcast' ).add( viewToAttributeInlineConverter( definition, this._allowedAttributes ) );

		conversion.for( 'downcast' ).attributeToElement( {
			model: attributeKey,
			view: attributeToViewInlineConverter( definition )
		} );
	}
}
