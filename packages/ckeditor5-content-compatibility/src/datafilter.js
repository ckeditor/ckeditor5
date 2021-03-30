/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/datafilter
 * @publicApi
 */

import { Matcher } from 'ckeditor5/src/engine';
import { priorities, toArray, CKEditorError } from 'ckeditor5/src/utils';

import { cloneDeep } from 'lodash-es';

const DATA_SCHEMA_ATTRIBUTE_KEY = 'htmlAttributes';

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
 */
export default class DataFilter {
	constructor( editor, dataSchema ) {
		this.editor = editor;

		/**
		 * An instance of the {@link module:content-compatibility/dataschema~DataSchema}.
		 *
		 * @readonly
		 * @private
		 * @member {module:content-compatibility/dataschema~DataSchema} #_dataSchema
		 */
		this._dataSchema = dataSchema;

		/**
		 * A map of registered {@link module:engine/view/matcher~Matcher Matcher} instances.
		 *
		 * Describes rules upon which content attributes should be allowed.
		 *
		 * @readonly
		 * @private
		 * @member {Map.<String, module:engine/view/matcher~Matcher>} #_allowedAttributes
		 */
		this._allowedAttributes = new Map();

		/**
		 * A map of registered {@link module:engine/view/matcher~Matcher Matcher} instances.
		 *
		 * Describes rules upon which content attributes should be disallowed.
		 *
		 * @readonly
		 * @private
		 * @member {Map.<String, module:engine/view/matcher~Matcher>} #_disallowedAttributes
		 */
		this._disallowedAttributes = new Map();
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
			this._registerElement( definition );
		}

		this.allowAttributes( config );
	}

	/**
	 * Allow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all attributes which should be allowed.
	 */
	allowAttributes( config ) {
		this._addAttributeMatcher( config, this._allowedAttributes );
	}

	/**
	 * Disallow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all attributes which should be disallowed.
	 */
	disallowAttributes( config ) {
		this._addAttributeMatcher( config, this._disallowedAttributes );
	}

	/**
	 * Adds attribute matcher for every registered data schema definition for the given `config.name`.
	 *
	 * @private
	 * @param {module:engine/view/matcher~MatcherPattern} config
	 * @param {Map.<String, module:engine/view/matcher~Matcher>} rules Rules map holding matchers.
	 */
	_addAttributeMatcher( config, rules ) {
		const viewName = config.name;

		config = cloneDeep( config );

		// We don't want match by name when matching attributes. Matcher will be already attached to specific definition.
		delete config.name;

		for ( const definition of this._dataSchema.getDefinitionsForView( viewName ) ) {
			getOrCreateMatcher( definition.view, rules ).add( config );
		}
	}

	/**
	 * Registers element and attribute converters for the given data schema definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	_registerElement( definition ) {
		if ( definition.isInline ) {
			this._defineInlineElement( definition );
		} else if ( definition.isBlock ) {
			this._defineBlockElement( definition );
		} else {
			/**
			 * Only a definition marked as inline or block can be allowed.
			 *
			 * @error data-filter-invalid-definition-type
			 */
			throw new CKEditorError(
				'data-filter-invalid-definition-type',
				null,
				definition
			);
		}
	}

	/**
	 * Registers block element and attribute converters for the given data schema definition.
	 *
	 * If the element model schema is already registered, this method will do nothing.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	_defineBlockElement( definition ) {
		if ( this.editor.model.schema.isRegistered( definition.model ) ) {
			return;
		}

		this._defineBlockElementSchema( definition );

		if ( definition.view ) {
			this._defineBlockElementConverters( definition );
		}
	}

	/**
	 * Registers inline element and attribute converters for the given data schema definition.
	 *
	 * Extends `$text` model schema to allow the given definition model attribute and its properties.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
	 */
	_defineInlineElement( definition ) {
		const schema = this.editor.model.schema;

		schema.extend( '$text', {
			allowAttributes: definition.model
		} );

		if ( definition.attributeProperties ) {
			schema.setAttributeProperties( definition.model, definition.attributeProperties );
		}

		this._defineInlineElementConverters( definition );
	}

	/**
	 * Registers model schema definition for the given block element definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	_defineBlockElementSchema( definition ) {
		const schema = this.editor.model.schema;

		schema.register( definition.model, definition.modelSchema );

		const allowedChildren = toArray( definition.allowChildren || [] );

		for ( const child of allowedChildren ) {
			if ( schema.isRegistered( child ) ) {
				schema.extend( child, {
					allowIn: definition.model
				} );
			}
		}
	}

	/**
	 * Registers attribute converters for the given inline element definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
	 */
	_defineInlineElementConverters( definition ) {
		const conversion = this.editor.conversion;
		const viewName = definition.view;
		const attributeKey = definition.model;

		this._addDisallowedAttributesConverter( viewName );

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
				const viewAttributes = this._matchAndConsumeAllowedAttributes( data.viewItem, conversionApi );

				// Since we are converting to attribute we need a range on which we will set the attribute.
				// If the range is not created yet, we will create it.
				if ( !data.modelRange ) {
					data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
				}

				// Set attribute on each item in range according to the schema.
				for ( const node of data.modelRange.getItems() ) {
					if ( conversionApi.schema.checkAttribute( node, attributeKey ) ) {
						// Node's children are converted recursively, so node can already include model attribute.
						// We want to extend it, not replace.
						const nodeAttributes = node.getAttribute( attributeKey );
						const attributesToAdd = mergeViewElementAttributes( viewAttributes || {}, nodeAttributes || {} );

						conversionApi.writer.setAttribute( attributeKey, attributesToAdd, node );
					}
				}
			}, { priority: 'low' } );
		} );

		conversion.for( 'downcast' ).attributeToElement( {
			model: attributeKey,
			view: ( attributeValue, conversionApi ) => {
				if ( !attributeValue ) {
					return;
				}

				const { writer } = conversionApi;
				const viewElement = writer.createAttributeElement( viewName );

				setViewElementAttributes( writer, attributeValue, viewElement );

				return viewElement;
			}
		} );
	}

	/**
	 * Registers attribute converters for the given block element definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	_defineBlockElementConverters( definition ) {
		const conversion = this.editor.conversion;
		const viewName = definition.view;
		const modelName = definition.model;

		this._addDisallowedAttributesConverter( viewName );

		// Stash unused, allowed element attributes, so they can be reapplied later in data conversion.
		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: ( viewElement, conversionApi ) => {
				const element = conversionApi.writer.createElement( modelName );
				const viewAttributes = this._matchAndConsumeAllowedAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( DATA_SCHEMA_ATTRIBUTE_KEY, viewAttributes, element );
				}

				return element;
			},
			// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
			// this listener is called before it. If not, some elements will be transformed into a paragraph.
			converterPriority: priorities.get( 'low' ) + 1
		} );

		conversion.for( 'downcast' ).elementToElement( {
			model: modelName,
			view: viewName
		} );

		conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( `attribute:${ DATA_SCHEMA_ATTRIBUTE_KEY }:${ modelName }`, ( evt, data, conversionApi ) => {
				const viewAttributes = data.attributeNewValue;

				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item );

				setViewElementAttributes( viewWriter, viewAttributes, viewElement );
			} );
		} );
	}

	/**
	 * Adds converter responsible for consuming disallowed view attributes.
	 *
	 * @private
	 * @param {String} viewName
	 */
	_addDisallowedAttributesConverter( viewName ) {
		const conversion = this.editor.conversion;

		// Consumes disallowed element attributes to prevent them of being processed by other converters.
		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
				consumeAttributeMatches( data.viewItem, conversionApi, this._disallowedAttributes );
			}, { priority: 'high' } );
		} );
	}

	/**
	 * Matches and consumes allowed view attributes.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
	 * @returns {Object} [result]
	 * @returns {Object} result.attributes Set with matched attribute names.
	 * @returns {Object} result.styles Set with matched style names.
	 * @returns {Array.<String>} result.classes Set with matched class names.
	 */
	_matchAndConsumeAllowedAttributes( viewElement, conversionApi ) {
		const matches = consumeAttributeMatches( viewElement, conversionApi, this._allowedAttributes );
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
}

// Consumes attributes matched for the given `rules`.
//
// Returns sucessfully consumed attribute matches.
//
// @private
// @param {module:engine/view/element~Element} viewElement
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @param {Map.<String, module:engine/view/matcher~Matcher>} rules
// @returns {Array.<Object>} Array with match information about found attributes.
function consumeAttributeMatches( viewElement, { consumable }, rules ) {
	const matches = [];

	for ( const match of matchAll( viewElement, rules ) ) {
		if ( consumable.consume( viewElement, match.match ) ) {
			matches.push( match );
		}
	}

	return matches;
}

// Helper function for downcast converter. Sets attributes on the given view element.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {Object} viewAttributes
// @param {module:engine/view/element~Element} viewElement
function setViewElementAttributes( writer, viewAttributes, viewElement ) {
	if ( viewAttributes.attributes ) {
		for ( const [ key, value ] of Object.entries( viewAttributes.attributes ) ) {
			writer.setAttribute( key, value, viewElement );
		}
	}

	if ( viewAttributes.styles ) {
		writer.setStyle( viewAttributes.styles, viewElement );
	}

	if ( viewAttributes.classes ) {
		writer.addClass( viewAttributes.classes, viewElement );
	}
}

// Helper function restoring matcher for the given key from `rules` object.
//
// If matcher for the given key does not exist, this function will create a new one
// inside `rules` object under the given key.
//
// @private
// @param {String} key
// @param {Map.<String, module:engine/view/matcher~Matcher>} rules
// @returns {module:engine/view/matcher~Matcher}
function getOrCreateMatcher( key, rules ) {
	if ( !rules.has( key ) ) {
		rules.set( key, new Matcher() );
	}

	return rules.get( key );
}

// Alias for {@link module:engine/view/matcher~Matcher#matchAll matchAll}.
//
// @private
// @param {module:engine/view/element~Element} viewElement
// @param {Map.<String, module:engine/view/matcher~Matcher>} rules Rules map holding matchers.
// @returns {Array.<Object>} Array with match information about found elements.
function matchAll( viewElement, rules ) {
	const matcher = getOrCreateMatcher( viewElement.name, rules );

	return matcher.matchAll( viewElement ) || [];
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
		attributesObject[ prop ] = getValue( prop );
	}

	return attributesObject;
}

// Merges view element attribute objects.
//
// @private
// @param {Object} oldValue
// @param {Object} newValue
// @returns {Object}
function mergeViewElementAttributes( oldValue, newValue ) {
	const result = cloneDeep( oldValue );

	for ( const key in newValue ) {
		// Merge classes.
		if ( Array.isArray( newValue[ key ] ) ) {
			result[ key ] = Array.from( new Set( [ ...oldValue[ key ], ...newValue[ key ] ] ) );
		}

		// Merge attributes or styles.
		else {
			result[ key ] = { ...oldValue[ key ], ...newValue[ key ] };
		}
	}

	return result;
}
