/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/datafilter
 */

import { cloneDeep } from 'lodash-es';

import { Matcher } from 'ckeditor5/src/engine';
import { priorities, toArray } from 'ckeditor5/src/utils';

import StylesMap from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

const DATA_SCHEMA_ATTRIBUTE_KEY = 'ghsAttributes';

/**
 * Allows to validate elements and element attributes registered by {@link module:content-compatibility/dataschema~DataSchema}.
 *
 * To enable registered element in the editor, use {@link #allowElement} method:
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
 *				color: /[^]/
 *			}
 *		} );
 */
export default class DataFilter {
	constructor( editor, dataSchema ) {
		this.editor = editor;

		this._dataSchema = dataSchema;

		this._allowedAttributes = new Map();
		this._disallowedAttributes = new Map();
	}

	/**
	 * Allow the given element registered by {@link #register} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all view elements which should be allowed.
	 */
	allowElement( config ) {
		for ( const definition of this._dataSchema.getDefinitionsForView( config.name ) ) {
			for ( const reference of definition.references ) {
				this._registerElement( reference );
			}

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
	 * Disallowe the given attributes for view element allowed by {@link #allowElement} method.
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
	 * @param {Map} rules Rules map holding matchers.
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
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	_registerElement( definition ) {
		if ( this.editor.model.schema.isRegistered( definition.model ) ) {
			return;
		}

		this._defineSchema( definition );

		if ( definition.view ) {
			this._defineConverters( definition );
		}
	}

	/**
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	_defineSchema( definition ) {
		const schema = this.editor.model.schema;

		schema.register( definition.model, definition.schema );

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
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition}
	 */
	_defineConverters( definition ) {
		const conversion = this.editor.conversion;
		const viewName = definition.view;
		const modelName = definition.model;

		// Consumes disallowed element attributes to prevent them of being processed by other converters.
		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
				for ( const match of matchAll( data.viewItem, this._disallowedAttributes ) ) {
					conversionApi.consumable.consume( data.viewItem, match.match );
				}
			}, { priority: 'high' } );
		} );

		// Stash unused, allowed element attributes, so they can be reapplied later in data conversion.
		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: ( viewElement, conversionApi ) => {
				const matches = [];
				for ( const match of matchAll( viewElement, this._allowedAttributes ) ) {
					if ( conversionApi.consumable.consume( viewElement, match.match ) ) {
						matches.push( match );
					}
				}

				const { attributes, classes, styles } = mergeMatchResults( matches );
				const viewAttributes = {};

				// Stash attributes.
				for ( const key of attributes.values() ) {
					viewAttributes[ key ] = viewElement.getAttribute( key );
				}

				// Stash classes.
				if ( classes.size ) {
					viewAttributes.class = [ ...classes.values() ].join( ' ' );
				}

				// Stash styles.
				if ( styles.size ) {
					const stylesObj = {};

					for ( const styleName of styles.values() ) {
						stylesObj[ styleName ] = viewElement.getStyle( styleName );
					}

					viewAttributes.style = this.inlineStyles( stylesObj );
				}

				const element = conversionApi.writer.createElement( modelName );

				if ( Object.keys( viewAttributes ).length ) {
					conversionApi.writer.setAttribute( DATA_SCHEMA_ATTRIBUTE_KEY, viewAttributes, element );
				}

				return element;
			},
			// With a `low` priority, `paragraph` plugin autoparagraphing mechanism is executed. Make sure
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

				if ( viewAttributes === null ) {
					return;
				}

				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item );

				// Apply new values.
				for ( const key in viewAttributes ) {
					viewWriter.setAttribute( key, viewAttributes[ key ], viewElement );
				}
			} );
		} );
	}

	/**
	 * Inlines styles object into normalized style string.
	 *
	 * @param {Object} stylesObject
	 * @returns {String}
	 */
	inlineStyles( stylesObj ) {
		const stylesProcessor = this.editor.editing.view.document.stylesProcessor;
		const stylesMap = new StylesMap( stylesProcessor );

		stylesMap.set( stylesObj );

		return stylesMap.toString();
	}
}

/**
 * Helper function restoring matcher for the given key from `rules` object.
 *
 * If matcher for the given key does not exist, this function will create a new one
 * inside `rules` object under the given key.
 *
 * @private
 * @param {String} key
 * @param {Map} rules
 */
function getOrCreateMatcher( key, rules ) {
	if ( !rules.has( key ) ) {
		rules.set( key, new Matcher() );
	}

	return rules.get( key );
}

/**
 * Alias for {@link module:engine/view/matcher~Matcher#matchAll matchAll}.
 *
 * @private
 * @param {module:engine/view/element~Element} viewElement
 * @param {Map} rules Rules map holding matchers.
 * @returns {Object} result
 * @returns {Array} result.attributes Array with matched attribute names.
 * @returns {Array} result.classes Array with matched class names.
 * @returns {Array} result.styles Array with matched style names.
 */
function matchAll( viewElement, rules ) {
	const matcher = getOrCreateMatcher( viewElement.name, rules );

	return matcher.matchAll( viewElement ) || [];
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
function mergeMatchResults( matches ) {
	const matchResult = { attributes: new Set(), classes: new Set(), styles: new Set() };

	for ( const match of matches ) {
		for ( const key in matchResult ) {
			const values = match.match[ key ] || [];
			values.forEach( value => matchResult[ key ].add( value ) );
		}
	}

	return matchResult;
}
