/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/datafilter
 */

import { escapeRegExp, cloneDeep, uniq } from 'lodash-es';
import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import toArray from '@ckeditor/ckeditor5-utils/src/toarray';

import DataSchema from './dataschema';

const DATA_SCHEMA_ATTRIBUTE_KEY = 'ghsAttributes';

/**
 * Allows to validate elements and element attributes registered by {@link @module content-compatibility/dataschema~DataSchema}.
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
	constructor( editor ) {
		this.editor = editor;

		this.dataSchema = new DataSchema( editor );

		this._allowedAttributes = {};
		this._disallowedAttributes = {};
	}

	/**
	 * Allow the given element registered by {@link #register} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all view elements which should be allowed.
	 */
	allowElement( config ) {
		const nameRegExp = toRegExp( config.name );

		for ( const mapping of this.dataSchema.getModelViewMapping() ) {
			if ( nameRegExp.test( mapping.view ) ) {
				this.dataSchema.enable( mapping.model );
				this._defineConverters( mapping );
			}
		}

		this.allowAttributes( config );
	}

	/**
	 * Allow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all attributes which should be allowed.
	 */
	allowAttributes( config ) {
		this._addAttributeMatcher( config, this._allowedAttributes );
	}

	/**
	 * Disallowe the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all attributes which should be disallowed.
	 */
	disallowAttributes( config ) {
		this._addAttributeMatcher( config, this._disallowedAttributes );
	}

	/**
	 * Adds attribute matcher for every registered data schema definition for the given `config.name`.
	 *
	 * @private
	 * @param {module:engine/view/matcher~MatcherPattern} pattern
	 * @param {Object} rules Rules object holding matchers.
	 */
	_addAttributeMatcher( config, rules ) {
		const nameRegExp = toRegExp( config.name );

		config = cloneDeep( config );
		// We don't want match by name when matching attributes.
		// Matcher will be already attached to specific definition.
		delete config.name;

		for ( const { view } of this.dataSchema.getModelViewMapping() ) {
			if ( nameRegExp.test( view ) ) {
				getOrCreateMatcher( view, rules ).add( config );
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

				const allowedAttributes = mergeMatchResults( matches );
				const viewAttributes = [];

				// Stash attributes.
				for ( const key of allowedAttributes.attributes ) {
					viewAttributes.push( [ key, viewElement.getAttribute( key ) ] );
				}

				// Stash classes.
				if ( allowedAttributes.classes.length ) {
					viewAttributes.push( [ 'class', allowedAttributes.classes ] );
				}

				// Stash styles.
				if ( allowedAttributes.styles.length ) {
					const stylesObj = {};

					for ( const styleName of allowedAttributes.styles ) {
						stylesObj[ styleName ] = viewElement.getStyle( styleName );
					}

					viewAttributes.push( [ 'style', stylesObj ] );
				}

				const element = conversionApi.writer.createElement( modelName );

				if ( viewAttributes.length ) {
					conversionApi.writer.setAttribute( DATA_SCHEMA_ATTRIBUTE_KEY, viewAttributes, element );
				}

				return element;
			},
			converterPriority: 'low'
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
}

/**
 * Helper function restoring matcher for the given key from `rules` object.
 *
 * If matcher for the given key does not exist, this function will create a new one
 * inside `rules` object under the given key.
 *
 * @private
 * @param {String} key
 * @param {Object} rules
 */
function getOrCreateMatcher( key, rules ) {
	if ( !rules[ key ] ) {
		rules[ key ] = new Matcher();
	}

	return rules[ key ];
}

/**
 * Alias for {@link module:engine/view/matcher~Matcher#matchAll matchAll}.
 *
 * @private
 * @param {module:engine/view/element~Element} viewElement
 * @param {Object} rules Rules object holding matchers.
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

function toRegExp( value ) {
	// Match everything if name not given.
	if ( !value ) {
		value = /[^]/;
	}

	if ( !( value instanceof RegExp ) ) {
		value = new RegExp( escapeRegExp( value ) );
	}

	return value;
}
