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
	 * Adds attribute matcher for every registered data schema definition for the given `config.name`.
	 *
	 * @private
	 * @param {module:engine/view/matcher~MatcherPattern} pattern
	 * @param {Object} cache Cache object holding matchers.
	 */
	_addAttributeMatcher( config, cache ) {
		const nameRegExp = toRegExp( config.name );

		config = cloneDeep( config );
		// We don't want match by name when matching attributes.
		// Matcher will be already attached to specific definition.
		delete config.name;

		for ( const { view } of this.dataSchema.getModelViewMapping() ) {
			if ( nameRegExp.test( view ) ) {
				getOrCreateMatcher( view, cache ).add( config );
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

		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: ( viewElement, conversionApi ) => {
				// We will stash only attributes which are not processed by any other features
				// and should be left unchaged.
				const viewConsumable = conversionApi.consumable;

				const viewAttributes = [];
				const allowedAttributes = this._getAllowedAttributes( viewElement );

				// Stash attributes.
				for ( const key of allowedAttributes.attributes ) {
					if ( viewConsumable.test( viewElement, { attributes: key } ) ) {
						viewAttributes.push( [ key, viewElement.getAttribute( key ) ] );
					}
				}

				// Stash classes.
				const classes = allowedAttributes.classes.filter( className => {
					return viewConsumable.test( viewElement, { classes: className } );
				} );

				if ( classes.length ) {
					viewAttributes.push( [ 'class', allowedAttributes.classes ] );
				}

				// Stash styles.
				const styles = allowedAttributes.styles.filter( styleName => {
					return viewConsumable.test( viewElement, { styles: styleName } );
				} );

				if ( styles.length ) {
					const stylesObj = {};

					for ( const styleName of styles ) {
						stylesObj[ styleName ] = viewElement.getStyle( styleName );
					}

					viewAttributes.push( [ 'style', stylesObj ] );
				}

				// Keep compatibility attributes inside a single model attribute.
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
