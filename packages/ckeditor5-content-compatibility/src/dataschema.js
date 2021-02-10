/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/dataschema
 */

import { escapeRegExp, cloneDeep, uniq } from 'lodash-es';
import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import toArray from '@ckeditor/ckeditor5-utils/src/toarray';

const DATA_SCHEMA_ATTRIBUTE_KEY = 'ghsAttributes';

/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in content compatibility support.
 *
 * Allows to validate additional elements and element attributes using declarative data schema API.
 *
 * Data schema is represented by registered definitions. To register new definition, use {@link #register} method:
 *
 *		dataSchema.register( {
 *			view: 'section',
 *			model: 'my-section',
 *			schema: '$block'
 *		} );
 *
 * Note that the above code will only register new data schema definition describing document structure
 * for the given element.
 *
 * To enable registered element in the editor, use {@link #allowElement}
 * method:
 *
 *		dataSchema.allowElement( {
 *			name: 'section'
 *		} );
 *
 * Additionaly, you can allow or disallow specific element attributes:
 *
 *		// Allow `data-foo` attribute on `section` element.
 *		dataSchema.allowedAttributes( {
 *			name: 'section',
 *			attributes: {
 *				'data-foo': true
 *			}
 *		} );
 *
 *		// Disallow `color` style attribute on 'section' element.
 *		dataSchema.disallowedAttributes( {
 *			name: 'section',
 *			styles: {
 *				color: /[^]/
 *			}
 *		} );
 */
export default class DataSchema {
	constructor( editor ) {
		this.editor = editor;

		this._definitions = {};

		this._viewMatchers = {
			allowedAttributes: {},
			disallowedAttributes: {}
		};
	}

	/**
	 * Allow the given element registered by {@link #register} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all view elements which should be allowed.
	 */
	allowElement( config ) {
		for ( const definition of this._getDefinitions( config.name ) ) {
			this._defineSchema( definition );
			this._defineConverters( definition );

			this.allowAttributes( config );
		}
	}

	/**
	 * Allow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all attributes which should be allowed.
	 */
	allowAttributes( config ) {
		this._addAttributeMatcher( config, this._viewMatchers.allowedAttributes );
	}

	/**
	 * Disallowe the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all attributes which should be disallowed.
	 */
	disallowAttributes( config ) {
		this._addAttributeMatcher( config, this._viewMatchers.disallowedAttributes );
	}

	/**
	 * Register new data schema definition.
	 *
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	register( definition ) {
		this._definitions[ definition.view ] = definition;
	}

	/**
	 * Adds attribute matcher for every registered data schema definition for the given `config.name`.
	 *
	 * @private
	 * @param {module:engine/view/matcher~MatcherPattern} pattern
	 * @param {Object} cache Cache object holding matchers.
	 */
	_addAttributeMatcher( config, cache ) {
		const elementName = config.name;

		config = cloneDeep( config );
		// We don't want match by name when matching attributes.
		// Matcher will be already attached to specific definition.
		delete config.name;

		// 1 to 1 relation between matcher and definition. Single matcher
		// can be extended by adding additional configs.
		for ( const definition of this._getDefinitions( elementName ) ) {
			getOrCreateMatcher( definition.view, cache ).add( config );
		}
	}

	/**
	 * Returns registered data schema definitions for the given view name.
	 *
	 * @private
	 * @param {String|RegExp} name View name registered by {@link #register} method.
	 * @returns {Iterable.<module:content-compatibility/dataschema~DataSchemaDefinition>}
	 */
	* _getDefinitions( name ) {
		// Match everything if name not given.
		if ( !name ) {
			name = /[^]/;
		}

		if ( !( name instanceof RegExp ) ) {
			name = new RegExp( escapeRegExp( name ) );
		}

		for ( const viewName in this._definitions ) {
			if ( name.test( viewName ) ) {
				yield this._definitions[ viewName ];
			}
		}
	}

	/**
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition}
	 */
	_defineSchema( definition ) {
		const schema = this.editor.model.schema;

		if ( typeof definition.schema === 'string' ) {
			schema.register( definition.model, {
				inheritAllFrom: definition.schema,
				allowAttributes: DATA_SCHEMA_ATTRIBUTE_KEY
			} );
		} else {
			const schemaDefinition = cloneDeep( definition.schema );

			schemaDefinition.allowAttributes = toArray( schemaDefinition.allowAttributes || [] );
			schemaDefinition.allowAttributes.push( DATA_SCHEMA_ATTRIBUTE_KEY );

			schema.register( definition.model, schemaDefinition );
		}
	}

	/**
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition}
	 */
	_defineConverters( definition ) {
		const conversion = this.editor.conversion;
		const viewName = definition.view;
		const modelName = definition.model;

		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: ( viewElement, conversionApi ) => {
				const viewAttributes = [];
				const allowedAttributes = this._getAllowedAttributes( viewElement );

				for ( const key of allowedAttributes.attributes ) {
					viewAttributes.push( [ key, viewElement.getAttribute( key ) ] );
				}

				if ( allowedAttributes.classes.length ) {
					viewAttributes.push( [ 'class', allowedAttributes.classes ] );
				}

				if ( allowedAttributes.styles.length ) {
					const stylesObj = {};

					for ( const styleName of allowedAttributes.styles ) {
						stylesObj[ styleName ] = viewElement.getStyle( styleName );
					}

					viewAttributes.push( [ 'style', stylesObj ] );
				}

				let attributesToAdd;
				if ( viewAttributes.length ) {
					attributesToAdd = [ [ DATA_SCHEMA_ATTRIBUTE_KEY, viewAttributes ] ];
				}

				return conversionApi.writer.createElement( modelName, attributesToAdd );
			}
		} );

		conversion.for( 'downcast' ).elementToElement( {
			model: modelName,
			view: viewName
		} );

		conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( `attribute:${ DATA_SCHEMA_ATTRIBUTE_KEY }`, ( evt, data, conversionApi ) => {
				if ( data.item.name != modelName ) {
					return;
				}

				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item );

				// Remove old values.
				if ( data.attributeOldValue !== null ) {
					data.attributeOldValue.forEach( ( [ key, value ] ) => {
						if ( key === 'class' ) {
							const classes = toArray( value );

							for ( const className of classes ) {
								viewWriter.removeClass( className, viewElement );
							}
						} else if ( key === 'style' ) {
							for ( const key in value ) {
								viewWriter.removeStyle( key, viewElement );
							}
						} else {
							viewWriter.removeAttribute( key, viewElement );
						}
					} );
				}

				// Apply new values.
				if ( data.attributeNewValue !== null ) {
					data.attributeNewValue.forEach( ( [ key, value ] ) => {
						if ( key === 'class' ) {
							const classes = toArray( value );

							for ( const className of classes ) {
								viewWriter.addClass( className, viewElement );
							}
						} else if ( key === 'style' ) {
							for ( const key in value ) {
								viewWriter.setStyle( key, value[ key ], viewElement );
							}
						} else {
							viewWriter.setAttribute( key, value, viewElement );
						}
					} );
				}
			} );
		} );
	}

	/**
	 * Returns all allowed view element attributes based on attribute matchers registered via {@link #allowedAttributes}
	 * and {@link #disallowedAttributes} methods.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement
	 * @returns {Object} result
	 * @returns {Array} result.attributes Array with matched attribute names.
	 * @returns {Array} result.classes Array with matched class names.
	 * @returns {Array} result.styles Array with matched style names.
	 */
	_getAllowedAttributes( viewElement ) {
		const allowedAttributes = matchAll( viewElement, this._viewMatchers.allowedAttributes );
		const disallowedAttributes = matchAll( viewElement, this._viewMatchers.disallowedAttributes );

		// Drop disallowed content.
		for ( const key in allowedAttributes ) {
			allowedAttributes[ key ] = removeArray( allowedAttributes[ key ], disallowedAttributes[ key ] );
		}

		return allowedAttributes;
	}
}

/**
 * Helper function restoring matcher for the given key from cache object.
 *
 * If matcher for the given key does not exist, this function will create a new one
 * inside cache object under the given key.
 *
 * @private
 * @param {String} key
 * @param {Object} cache
 */
function getOrCreateMatcher( key, cache ) {
	if ( !cache[ key ] ) {
		cache[ key ] = new Matcher();
	}

	return cache[ key ];
}

/**
 * Helper function matching all attributes for the given element.
 *
 * @private
 * @param {module:engine/view/element~Element} viewElement
 * @param {Object} cache Cache object holding matchers.
 * @returns {Object} result
 * @returns {Array} result.attributes Array with matched attribute names.
 * @returns {Array} result.classes Array with matched class names.
 * @returns {Array} result.styles Array with matched style names.
 */
function matchAll( viewElement, cache ) {
	const matcher = getOrCreateMatcher( viewElement.name, cache );
	const matches = matcher.matchAll( viewElement );

	return mergeMatchAllResult( matches || [] );
}

/**
 * Merges the result of {@link module:engine/view/matcher~Matcher#matchAll} method.
 *
 * @private
 * @param {Array} matches
 * @returns {Object} result
 * @returns {Array} result.attributes Array with matched attribute names.
 * @returns {Array} result.classes Array with matched class names.
 * @returns {Array} result.styles Array with matched style names.
 */
function mergeMatchAllResult( matches ) {
	const matchResult = { attributes: [], classes: [], styles: [] };

	for ( const match of matches ) {
		for ( const key in matchResult ) {
			const values = match.match[ key ] || [];
			matchResult[ key ].push( ...values );
		}
	}

	for ( const key in matchResult ) {
		matchResult[ key ] = uniq( matchResult[ key ] );
	}

	return matchResult;
}

/**
 * Removes array items included in the second array parameter.
 *
 * @param {Array} array
 * @param {Array} toRemove
 * @returns {Array} Filtered array items.
 */
function removeArray( array, toRemove ) {
	return array.filter( item => !toRemove.includes( item ) );
}

/**
 * A definition of {@link module:content-compatibility/dataschema data schema}.
 *
 * @typedef {Object} module:content-compatibility/dataschema~DataSchemaDefinition
 * @property {String} view Name of the view element.
 * @property {String} model Name of the model element.
 * @property {String|module:engine/model/schema~SchemaItemDefinition} schema Name of the schema to inherit
 * or custom schema item definition.
 */
