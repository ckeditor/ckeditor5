/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/datafilter
 */

import DataSchema from './dataschema';

import { Plugin } from 'ckeditor5/src/core';
import { Matcher } from 'ckeditor5/src/engine';
import { priorities, CKEditorError } from 'ckeditor5/src/utils';
import { Widget } from 'ckeditor5/src/widget';
import {
	viewToModelObjectConverter,
	toObjectWidgetConverter,
	createObjectView,

	viewToAttributeInlineConverter,
	attributeToViewInlineConverter,

	viewToModelBlockAttributeConverter,
	modelToViewBlockAttributeConverter
} from './converters';
import { isPlainObject, pull as removeItemFromArray } from 'lodash-es';

import '../theme/datafilter.css';

/**
 * Allows to validate elements and element attributes registered by {@link module:html-support/dataschema~DataSchema}.
 *
 * To enable registered element in the editor, use {@link module:html-support/datafilter~DataFilter#allowElement} method:
 *
 *		dataFilter.allowElement( 'section' );
 *
 * You can also allow or disallow specific element attributes:
 *
 *		// Allow `data-foo` attribute on `section` element.
 *		dataFilter.allowAttributes( {
 *			name: 'section',
 *			attributes: {
 *				'data-foo': true
 *			}
 *		} );
 *
 *		// Disallow `color` style attribute on 'section' element.
 *		dataFilter.disallowAttributes( {
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
		 * An instance of the {@link module:html-support/dataschema~DataSchema}.
		 *
		 * @readonly
		 * @private
		 * @member {module:html-support/dataschema~DataSchema} #_dataSchema
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
		 * Allowed element definitions by {@link module:html-support/datafilter~DataFilter#allowElement} method.
		 *
		 * @readonly
		 * @private
		 * @member {Set.<module:html-support/dataschema~DataSchemaDefinition>} #_allowedElements
		*/
		this._allowedElements = new Set();

		/**
		 * Indicates if {@link module:engine/controller/datacontroller~DataController editor's data controller}
		 * data has been already initialized.
		 *
		 * @private
		 * @member {Boolean} [#_dataInitialized=false]
		*/
		this._dataInitialized = false;

		this._registerElementsAfterInit();
		this._registerElementHandlers();
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
	 * Load a configuration of one or many elements, where their attributes should be allowed.
	 *
	 * @param {Array.<module:engine/view/matcher~MatcherPattern>} config Configuration of elements
	 * that should have their attributes accepted in the editor.
	 */
	loadAllowedConfig( config ) {
		this._loadConfig( config, pattern => this.allowAttributes( pattern ) );
	}

	/**
	 * Load a configuration of one or many elements, where their attributes should be disallowed.
	 *
	 * @param {Array.<module:engine/view/matcher~MatcherPattern>} config Configuration of elements
	 * that should have their attributes rejected from the editor.
	 */
	loadDisallowedConfig( config ) {
		this._loadConfig( config, pattern => this.disallowAttributes( pattern ) );
	}

	/**
	 * Allow the given element in the editor context.
	 *
	 * This method will only allow elements described by the {@link module:html-support/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * @param {String|RegExp} viewName String or regular expression matching view name.
	 */
	allowElement( viewName ) {
		for ( const definition of this._dataSchema.getDefinitionsForView( viewName, true ) ) {
			if ( this._allowedElements.has( definition ) ) {
				continue;
			}

			this._allowedElements.add( definition );

			// We need to wait for all features to be initialized before we can register
			// element, so we can access existing features model schemas.
			// If the data has not been initialized yet, _registerElementsAfterInit() method will take care of
			// registering elements.
			if ( this._dataInitialized ) {
				this._fireRegisterEvent( definition );
			}
		}
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
	 * Batch load of the filtering configuration.
	 *
	 * @private
	 * @param {Array.<module:engine/view/matcher~MatcherPattern>} config Filtering configuration.
	 * @param {Function} handleAttributes Callback handling the way the attributes should be processed.
	 */
	_loadConfig( config, handleAttributes ) {
		for ( const pattern of config ) {
			// MatcherPattern allows omitting `name` to widen the search of elements.
			// Let's keep it consistent and match every element if a `name` has not been provided.
			const elementName = pattern.name || /[\s\S]+/;

			this.allowElement( elementName );

			splitRules( pattern ).forEach( handleAttributes );
		}
	}

	/**
	 * Matches and consumes allowed and disallowed view attributes and returns the allowed ones.
	 *
	 * @protected
	 * @param {module:engine/view/element~Element} viewElement
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
	 * @returns {Object} [result]
	 * @returns {Object} result.attributes Set with matched attribute names.
	 * @returns {Object} result.styles Set with matched style names.
	 * @returns {Array.<String>} result.classes Set with matched class names.
	 */
	_consumeAllowedAttributes( viewElement, conversionApi ) {
		// Make sure that the disabled attributes are handled before the allowed attributes are called.
		// For example, for block images the <figure> converter triggers conversion for <img> first and then for other elements, i.e. <a>.
		consumeAttributes( viewElement, conversionApi, this._disallowedAttributes );

		return consumeAttributes( viewElement, conversionApi, this._allowedAttributes );
	}

	/**
	 * Registers elements allowed by {@link module:html-support/datafilter~DataFilter#allowElement} method
	 * once {@link module:engine/controller/datacontroller~DataController editor's data controller} is initialized.
	 *
	 * @private
	*/
	_registerElementsAfterInit() {
		this.editor.data.on( 'init', () => {
			this._dataInitialized = true;

			for ( const definition of this._allowedElements ) {
				this._fireRegisterEvent( definition );
			}
		}, {
			// With high priority listener we are able to register elements right before
			// running data conversion. Make also sure that priority is higher than the one
			// used by `RealTimeCollaborationClient`, as RTC is stopping event propagation.
			priority: priorities.get( 'high' ) + 1
		} );
	}

	/**
	 * Registers default element handlers.
	 *
	 * @private
	 */
	_registerElementHandlers() {
		this.on( 'register', ( evt, definition ) => {
			const schema = this.editor.model.schema;

			// Object element should be only registered for new features.
			// If the model schema is already registered, it should be handled by
			// #_registerBlockElement() or #_registerObjectElement() attribute handlers.
			if ( definition.isObject && !schema.isRegistered( definition.model ) ) {
				this._registerObjectElement( definition );
			} else if ( definition.isBlock ) {
				this._registerBlockElement( definition );
			} else if ( definition.isInline ) {
				this._registerInlineElement( definition );
			} else {
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

			evt.stop();
		}, { priority: 'lowest' } );
	}

	/**
	 * Fires `register` event for the given element definition.
	 *
	 * @private
	 * @param {module:html-support/dataschema~DataSchemaDefinition} definition
	 */
	_fireRegisterEvent( definition ) {
		this.fire( definition.view ? `register:${ definition.view }` : 'register', definition );
	}

	/**
	 * Registers object element and attribute converters for the given data schema definition.
	 *
	 * @private
	 * @param {module:html-support/dataschema~DataSchemaDefinition} definition
	 */
	_registerObjectElement( definition ) {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const { view: viewName, model: modelName } = definition;

		schema.register( modelName, definition.modelSchema );

		if ( !viewName ) {
			return;
		}

		schema.extend( definition.model, {
			allowAttributes: [ 'htmlAttributes', 'htmlContent' ]
		} );

		// Store element content in special `$rawContent` custom property to
		// avoid editor's data filtering mechanism.
		editor.data.registerRawContentMatcher( {
			name: viewName
		} );

		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: viewToModelObjectConverter( definition ),
			// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
			// this listener is called before it. If not, some elements will be transformed into a paragraph.
			converterPriority: priorities.get( 'low' ) + 1
		} );
		conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition, this ) );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: modelName,
			view: toObjectWidgetConverter( editor, definition )
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: modelName,
			view: ( modelElement, { writer } ) => {
				return createObjectView( viewName, modelElement, writer );
			}
		} );
		conversion.for( 'dataDowncast' ).add( modelToViewBlockAttributeConverter( definition ) );
	}

	/**
	 * Registers block element and attribute converters for the given data schema definition.
	 *
	 * @private
	 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	_registerBlockElement( definition ) {
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

		schema.extend( definition.model, {
			allowAttributes: 'htmlAttributes'
		} );

		conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition, this ) );
		conversion.for( 'downcast' ).add( modelToViewBlockAttributeConverter( definition ) );
	}

	/**
	 * Registers inline element and attribute converters for the given data schema definition.
	 *
	 * Extends `$text` model schema to allow the given definition model attribute and its properties.
	 *
	 * @private
	 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
	 */
	_registerInlineElement( definition ) {
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

		conversion.for( 'upcast' ).add( viewToAttributeInlineConverter( definition, this ) );

		conversion.for( 'downcast' ).attributeToElement( {
			model: attributeKey,
			view: attributeToViewInlineConverter( definition )
		} );
	}

	/**
	 * Fired when {@link module:html-support/datafilter~DataFilter} is registering element and attribute
	 * converters for the {@link module:html-support/dataschema~DataSchemaDefinition element definition}.
	 *
	 * The event also accepts {@link module:html-support/dataschema~DataSchemaDefinition#view} value
	 * as an event namespace, e.g. `register:span`.
	 *
	 * 		dataFilter.on( 'register', ( evt, definition ) => {
	 * 			editor.schema.register( definition.model, definition.modelSchema );
	 * 			editor.conversion.elementToElement( { model: definition.model, view: definition.view } );
	 *
	 * 			evt.stop();
	 * 		} );
	 *
	 * 		dataFilter.on( 'register:span', ( evt, definition ) => {
	 * 			editor.schema.extend( '$text', { allowAttributes: 'htmlSpan' } );
	 *
	 * 			editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'span', model: 'htmlSpan' } );
	 * 			editor.conversion.for( 'downcast' ).attributeToElement( { view: 'span', model: 'htmlSpan' } );
	 *
	 * 			evt.stop();
	 * 		}, { priority: 'high' } )
	 *
	 * @event register
	 * @param {module:html-support/dataschema~DataSchemaDefinition} definition
	 */
}

// Matches and consumes the given view attributes.
//
// @private
// @param {module:engine/view/element~Element} viewElement
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @param {module:engine/view/matcher~Matcher Matcher} matcher
// @returns {Object} [result]
// @returns {Object} result.attributes
// @returns {Object} result.styles
// @returns {Array.<String>} result.classes
function consumeAttributes( viewElement, conversionApi, matcher ) {
	const matches = consumeAttributeMatches( viewElement, conversionApi, matcher );
	const { attributes, styles, classes } = mergeMatchResults( matches );
	const viewAttributes = {};

	if ( attributes.size ) {
		viewAttributes.attributes = iterableToObject( attributes, key => viewElement.getAttribute( key ) );
	}

	if ( styles.size ) {
		viewAttributes.styles = iterableToObject( styles, key => viewElement.getStyle( key ) );
	}

	if ( classes.size ) {
		viewAttributes.classes = Array.from( classes );
	}

	if ( !Object.keys( viewAttributes ).length ) {
		return null;
	}

	return viewAttributes;
}

// Consumes matched attributes.
//
// @private
// @param {module:engine/view/element~Element} viewElement
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @param {module:engine/view/matcher~Matcher Matcher} matcher
// @returns {Array.<Object>} Array with match information about found attributes.
function consumeAttributeMatches( viewElement, { consumable }, matcher ) {
	const matches = matcher.matchAll( viewElement ) || [];
	const consumedMatches = [];

	for ( const match of matches ) {
		removeConsumedAttributes( consumable, viewElement, match );

		// We only want to consume attributes, so element can be still processed by other converters.
		delete match.match.name;

		if ( consumable.consume( viewElement, match.match ) ) {
			consumedMatches.push( match );
		}
	}

	return consumedMatches;
}

// Removes attributes from the given match that were already consumed by other converters.
//
// @private
// @param {module:engine/view/element~Element} viewElement
// @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable
// @param {Object} match
function removeConsumedAttributes( consumable, viewElement, match ) {
	for ( const key of [ 'attributes', 'classes', 'styles' ] ) {
		const attributes = match.match[ key ];

		if ( !attributes ) {
			continue;
		}

		for ( const value of attributes ) {
			if ( !consumable.test( viewElement, ( { [ key ]: [ value ] } ) ) ) {
				removeItemFromArray( attributes, value );
			}
		}
	}
}

// Merges the result of {@link module:engine/view/matcher~Matcher#matchAll} method.
//
// @private
// @param {Array.<Object>} matches
// @returns {Object} result
// @returns {Set.<Object>} result.attributes Set with matched attribute names.
// @returns {Set.<Object>} result.styles Set with matched style names.
// @returns {Set.<String>} result.classes Set with matched class names.
function mergeMatchResults( matches ) {
	const matchResult = {
		attributes: new Set(),
		classes: new Set(),
		styles: new Set()
	};

	for ( const match of matches ) {
		for ( const key in matchResult ) {
			const values = match.match[ key ] || [];

			values.forEach( value => matchResult[ key ].add( value ) );
		}
	}

	return matchResult;
}

// Converts the given iterable object into an object.
//
// @private
// @param {Iterable.<String>} iterable
// @param {Function} getValue Should result with value for the given object key.
// @returns {Object}
function iterableToObject( iterable, getValue ) {
	const attributesObject = {};

	for ( const prop of iterable ) {
		const value = getValue( prop );
		if ( value !== undefined ) {
			attributesObject[ prop ] = getValue( prop );
		}
	}

	return attributesObject;
}

// Matcher by default has to match **all** patterns to count it as an actual match. Splitting the pattern
// into separate patterns means that any matched pattern will be count as a match.
//
// @private
// @param {module:engine/view/matcher~MatcherPattern} pattern Pattern to split.
// @param {String} attributeName Name of the attribute to split (e.g. 'attributes', 'classes', 'styles').
// @returns {Array.<module:engine/view/matcher~MatcherPattern>}
function splitPattern( pattern, attributeName ) {
	const { name } = pattern;

	if ( isPlainObject( pattern[ attributeName ] ) ) {
		return Object.entries( pattern[ attributeName ] ).map(
			( [ key, value ] ) => ( {
				name,
				[ attributeName ]: {
					[ key ]: value
				}
			} ) );
	}

	if ( Array.isArray( pattern[ attributeName ] ) ) {
		return pattern[ attributeName ].map(
			value => ( {
				name,
				[ attributeName ]: [ value ]
			} )
		);
	}

	return [ pattern ];
}

// Rules are matched in conjunction (AND operation), but we want to have a match if *any* of the rules is matched (OR operation).
// By splitting the rules we force the latter effect.
//
// @private
// @param {module:engine/view/matcher~MatcherPattern} rules
// @returns {Array.<module:engine/view/matcher~MatcherPattern>}
function splitRules( rules ) {
	const { name, attributes, classes, styles } = rules;
	const splittedRules = [];

	if ( attributes ) {
		splittedRules.push( ...splitPattern( { name, attributes }, 'attributes' ) );
	}
	if ( classes ) {
		splittedRules.push( ...splitPattern( { name, classes }, 'classes' ) );
	}
	if ( styles ) {
		splittedRules.push( ...splitPattern( { name, styles }, 'styles' ) );
	}

	return splittedRules;
}
