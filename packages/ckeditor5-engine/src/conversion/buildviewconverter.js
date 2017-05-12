/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/buildviewconverter
 */

import Matcher from '../view/matcher';
import ModelElement from '../model/element';
import ModelPosition from '../model/position';
import modelWriter from '../model/writer';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

/**
 * Provides chainable, high-level API to easily build basic view-to-model converters that are appended to given
 * dispatchers. View-to-model converters are used when external data is added to the editor, i.e. when a user pastes
 * HTML content to the editor. Then, converters are used to translate this structure, possibly removing unknown/incorrect
 * nodes, and add it to the model. Also multiple, different elements might be translated into the same thing in the
 * model, i.e. `<b>` and `<strong>` elements might be converted to `bold` attribute (even though `bold` attribute will
 * be then converted only to `<strong>` tag). Instances of this class are created by
 * {@link module:engine/conversion/buildviewconverter~buildViewConverter}.
 *
 * If you need more complex converters, see {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher},
 * {@link module:engine/conversion/view-to-model-converters}, {@link module:engine/conversion/viewconsumable~ViewConsumable}.
 *
 * Using this API it is possible to create various kind of converters:
 *
 * 1. View element to model element:
 *
 *		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
 *
 * 2. View element to model attribute:
 *
 *		buildViewConverter().for( dispatcher ).fromElement( 'b' ).fromElement( 'strong' ).toAttribute( 'bold', 'true' );
 *
 * 3. View attribute to model attribute:
 *
 *		buildViewConverter().for( dispatcher ).fromAttribute( 'style', { 'font-weight': 'bold' } ).toAttribute( 'bold', 'true' );
 *		buildViewConverter().for( dispatcher )
 *			.fromAttribute( 'class' )
 *			.toAttribute( ( viewElement ) => ( { class: viewElement.getAttribute( 'class' ) } ) );
 *
 * 4. View elements and attributes to model attribute:
 *
 *		buildViewConverter().for( dispatcher )
 *			.fromElement( 'b' ).fromElement( 'strong' ).fromAttribute( 'style', { 'font-weight': 'bold' } )
 *			.toAttribute( 'bold', 'true' );
 *
 * 5. View {@link module:engine/view/matcher~Matcher view element matcher instance} or
 * {@link module:engine/view/matcher~Matcher#add matcher pattern}
 * to model element or attribute:
 *
 *		const matcher = new ViewMatcher();
 *		matcher.add( 'div', { class: 'quote' } );
 *		buildViewConverter().for( dispatcher ).from( matcher ).toElement( 'quote' );
 *
 *		buildViewConverter().for( dispatcher ).from( { name: 'span', class: 'bold' } ).toAttribute( 'bold', 'true' );
 *
 * Note, that converters built using `ViewConverterBuilder` automatically check {@link module:engine/model/schema~Schema schema}
 * if created model structure is valid. If given conversion would be invalid according to schema, it is ignored.
 *
 * It is possible to provide creator functions as parameters for {@link ~ViewConverterBuilder#toElement}
 * and {@link module:engine/conversion/buildviewconverter~ViewConverterBuilder#toAttribute} methods. See their descriptions to learn more.
 *
 * By default, converter will {@link module:engine/conversion/viewconsumable~ViewConsumable#consume consume} every value specified in
 * given `from...` query, i.e. `.from( { name: 'span', class: 'bold' } )` will make converter consume both `span` name
 * and `bold` class. It is possible to change this behavior using {@link ~ViewConverterBuilder#consuming consuming}
 * modifier. The modifier alters the last `fromXXX` query used before it. To learn more about consuming values,
 * see {@link module:engine/conversion/viewconsumable~ViewConsumable}.
 *
 * It is also possible to {@link module:engine/conversion/buildviewconverter~ViewConverterBuilder#withPriority change default priority}
 * of created converters to decide which converter should be fired earlier and which later. This is useful if you provide
 * a general converter but want to provide different converter for a specific-case (i.e. given view element is converted
 * always to given model element, but if it has given class it is converter to other model element). For this,
 * use {@link module:engine/conversion/buildviewconverter~ViewConverterBuilder#withPriority withPriority} modifier. The modifier alters
 * the last `from...` query used before it.
 *
 * Note that `to...` methods are "terminators", which means that should be the last one used in building converter.
 *
 * You can use {@link module:engine/conversion/buildmodelconverter~ModelConverterBuilder}
 * to create "opposite" converters - from model to view.
 */
class ViewConverterBuilder {
	/**
	 * Creates `ViewConverterBuilder` with given `dispatchers` registered to it.
	 */
	constructor() {
		/**
		 * Dispatchers to which converters will be attached.
		 *
		 * @type {Array.<module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher>}
		 * @private
		 */
		this._dispatchers = [];

		/**
		 * Stores "from" queries.
		 *
		 * @type {Array}
		 * @private
		 */
		this._from = [];
	}

	/**
	 * Set one or more dispatchers which the built converter will be attached to.
	 *
	 * @chainable
	 * @param {...module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher} dispatchers One or more dispatchers.
	 * @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
	 */
	for( ...dispatchers ) {
		this._dispatchers = dispatchers;

		return this;
	}

	/**
	 * Registers what view element should be converted.
	 *
	 *		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
	 *
	 * @chainable
	 * @param {String} elementName View element name.
	 * @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
	 */
	fromElement( elementName ) {
		return this.from( { name: elementName } );
	}

	/**
	 * Registers what view attribute should be converted.
	 *
	 *		buildViewConverter().for( dispatcher ).fromAttribute( 'style', { 'font-weight': 'bold' } ).toAttribute( 'bold', 'true' );
	 *
	 * @chainable
	 * @param {String|RegExp} key View attribute key.
	 * @param {String|RegExp} [value] View attribute value.
	 * @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
	 */
	fromAttribute( key, value = /.*/ ) {
		const pattern = {};

		if ( key === 'style' || key === 'class' ) {
			pattern[ key ] = value;
		} else {
			pattern.attribute = {};
			pattern.attribute[ key ] = value;
		}

		const matcher = new Matcher( pattern );

		this._from.push( {
			matcher,
			consume: false,
			priority: null,
			attributeKey: key
		} );

		return this;
	}

	/**
	 * Registers what view pattern should be converted. The method accepts either {@link module:engine/view/matcher~Matcher view matcher}
	 * or view matcher pattern.
	 *
	 *		const matcher = new ViewMatcher();
	 *		matcher.add( 'div', { class: 'quote' } );
	 *		buildViewConverter().for( dispatcher ).from( matcher ).toElement( 'quote' );
	 *
	 *		buildViewConverter().for( dispatcher ).from( { name: 'span', class: 'bold' } ).toAttribute( 'bold', 'true' );
	 *
	 * @chainable
	 * @param {Object|module:engine/view/matcher~Matcher} matcher View matcher or view matcher pattern.
	 * @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
	 */
	from( matcher ) {
		if ( !( matcher instanceof Matcher ) ) {
			matcher = new Matcher( matcher );
		}

		this._from.push( {
			matcher,
			consume: false,
			priority: null
		} );

		return this;
	}

	/**
	 * Modifies which consumable values will be {@link module:engine/conversion/viewconsumable~ViewConsumable#consume consumed}
	 * by built converter.
	 * It modifies the last `from...` query. Can be used after each `from...` query in given chain. Useful for providing
	 * more specific matches.
	 *
	 *		// This converter will only handle class bold conversion (to proper attribute) but span element
	 *		// conversion will have to be done in separate converter.
	 *		// Without consuming modifier, the converter would consume both class and name, so a converter for
	 *		// span element would not be fired.
	 *		buildViewConverter().for( dispatcher )
	 *			.from( { name: 'span', class: 'bold' } ).consuming( { class: 'bold' } )
	 *			.toAttribute( 'bold', 'true' } );
	 *
	 *		buildViewConverter().for( dispatcher )
	 *			.fromElement( 'img' ).consuming( { name: true, attribute: [ 'src', 'title' ] } )
	 *			.toElement( ( viewElement ) => new ModelElement( 'image', { src: viewElement.getAttribute( 'src' ),
	 *			                                                            title: viewElement.getAttribute( 'title' ) } );
	 *
	 * **Note:** All and only values from passed object has to be consumable on converted view element. This means that
	 * using `consuming` method, you can either make looser conversion conditions (like in first example) or tighter
	 * conversion conditions (like in second example). So, the view element, to be converter, has to match query of
	 * `from...` method and then have to have enough consumable values to consume.
	 *
	 * @see module:engine/conversion/viewconsumable~ViewConsumable
	 * @chainable
	 * @param {Object} consume Values to consume.
	 * @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
	 */
	consuming( consume ) {
		const lastFrom = this._from[ this._from.length - 1 ];
		lastFrom.consume = consume;

		return this;
	}

	/**
	 * Changes default priority for built converter. It modifies the last `from...` query. Can be used after each
	 * `from...` query in given chain. Useful for overwriting converters. The lower the number, the earlier converter will be fired.
	 *
	 *		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
	 *		// Register converter with proper priority, otherwise "p" element would get consumed by first
	 *		// converter and the second converter would not be fired.
	 *		buildViewConverter().for( dispatcher )
	 *			.from( { name: 'p', class: 'custom' } ).withPriority( 9 )
	 *			.toElement( 'customParagraph' );
	 *
	 * **Note:** `ViewConverterBuilder` takes care of applying all `toElement()` conversions before all `toAttribute()`
	 * conversions. This is done by setting default `toElement()` priority to `normal` and `toAttribute()` priority to `low`.
	 * It is recommended to set converter priority for `toElement()` around `0` (the value of `normal` priority)
	 * and `toAttribute()` priority around `-1000` (the value of `low` priority).
	 * It is important that model elements are created before attributes, otherwise attributes would
	 * not be applied or other errors may occur.
	 *
	 * @chainable
	 * @param {Number} priority Converter priority.
	 * @returns {module:engine/conversion/buildviewconverter~ViewConverterBuilder}
	 */
	withPriority( priority ) {
		const lastFrom = this._from[ this._from.length - 1 ];
		lastFrom.priority = priority;

		return this;
	}

	/**
	 * Registers what model element will be created by converter.
	 *
	 * Method accepts two ways of providing what kind of model element will be created. You can pass model element
	 * name as a `string` or a function that will return model element instance. If you provide creator function,
	 * it will be passed converted view element as first and only parameter.
	 *
	 *		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
	 *		buildViewConverter().for( dispatcher )
	 *			.fromElement( 'img' )
	 *			.toElement( ( viewElement ) => new ModelElement( 'image', { src: viewElement.getAttribute( 'src' ) } );
	 *
	 * @param {String|Function} element Model element name or model element creator function.
	 */
	toElement( element ) {
		function eventCallbackGen( from ) {
			return ( evt, data, consumable, conversionApi ) => {
				// There is one callback for all patterns in the matcher.
				// This will be usually just one pattern but we support matchers with many patterns too.
				const matchAll = from.matcher.matchAll( data.input );

				// If there is no match, this callback should not do anything.
				if ( !matchAll ) {
					return;
				}

				// Now, for every match between matcher and actual element, we will try to consume the match.
				for ( const match of matchAll ) {
					// Create model element basing on creator function or element name.
					const modelElement = element instanceof Function ? element( data.input ) : new ModelElement( element );

					// Do not convert if element building function returned falsy value.
					if ( !modelElement ) {
						continue;
					}

					// Check whether generated structure is okay with `Schema`.
					const keys = Array.from( modelElement.getAttributeKeys() );

					if ( !conversionApi.schema.check( { name: modelElement.name, attributes: keys, inside: data.context } ) ) {
						continue;
					}

					// Try to consume appropriate values from consumable values list.
					if ( !consumable.consume( data.input, from.consume || match.match ) ) {
						continue;
					}

					// If everything is fine, we are ready to start the conversion.
					// Add newly created `modelElement` to the parents stack.
					data.context.push( modelElement );

					// Convert children of converted view element and append them to `modelElement`.
					const modelChildren = conversionApi.convertChildren( data.input, consumable, data );
					const insertPosition = ModelPosition.createAt( modelElement, 'end' );
					modelWriter.insert( insertPosition, modelChildren );

					// Remove created `modelElement` from the parents stack.
					data.context.pop();

					// Add `modelElement` as a result.
					data.output = modelElement;

					// Prevent multiple conversion if there are other correct matches.
					break;
				}
			};
		}

		this._setCallback( eventCallbackGen, 'normal' );
	}

	/**
	 * Registers what model attribute will be created by converter.
	 *
	 * Method accepts two ways of providing what kind of model attribute will be created. You can either pass two strings
	 * representing attribute key and attribute value or a function that returns an object with `key` and `value` properties.
	 * If you provide creator function, it will be passed converted view element as first and only parameter.
	 *
	 *		buildViewConverter().for( dispatcher ).fromAttribute( 'alt' ).toAttribute( 'alt' );
	 *		buildViewConverter().for( dispatcher ).fromAttribute( 'style', { 'font-weight': 'bold' } ).toAttribute( 'bold', true );
	 *		buildViewConverter().for( dispatcher )
	 *			.fromAttribute( 'class' )
	 *			.toAttribute( ( viewElement ) => ( { key: 'class', value: 'class-' + viewElement.getAttribute( 'class' ) } ) );
	 *
	 * @param {String|Function} keyOrCreator Attribute key or a creator function.
	 * @param {String} [value] Attribute value. Ignored if `keyOrCreator` is not a `string`. If `keyOrCreator` is `string`,
	 * if `value` is not set, attribute value from converted element will be used.
	 */
	toAttribute( keyOrCreator, value ) {
		function eventCallbackGen( from ) {
			return ( evt, data, consumable, conversionApi ) => {
				// There is one callback for all patterns in the matcher.
				// This will be usually just one pattern but we support matchers with many patterns too.
				const matchAll = from.matcher.matchAll( data.input );

				// If there is no match, this callback should not do anything.
				if ( !matchAll ) {
					return;
				}

				// Now, for every match between matcher and actual element, we will try to consume the match.
				for ( const match of matchAll ) {
					// Try to consume appropriate values from consumable values list.
					if ( !consumable.consume( data.input, from.consume || match.match ) ) {
						continue;
					}

					// Since we are converting to attribute we need an output on which we will set the attribute.
					// If the output is not created yet, we will create it.
					if ( !data.output ) {
						data.output = conversionApi.convertChildren( data.input, consumable, data );
					}

					// Use attribute creator function, if provided.
					let attribute;

					if ( keyOrCreator instanceof Function ) {
						attribute = keyOrCreator( data.input );

						if ( !attribute ) {
							return;
						}
					} else {
						attribute = {
							key: keyOrCreator,
							value: value ? value : data.input.getAttribute( from.attributeKey )
						};
					}

					// Set attribute on current `output`. `Schema` is checked inside this helper function.
					setAttributeOn( data.output, attribute, data, conversionApi );

					// Prevent multiple conversion if there are other correct matches.
					break;
				}
			};
		}

		this._setCallback( eventCallbackGen, 'low' );
	}

	/**
	 * Registers how model element marking marker range will be created by converter.
	 *
	 * Created element has to match the following pattern:
	 *
	 * 		{ name: '$marker', attribute: { data-name: /^\w/ } }
	 *
	 * There are two ways of creating this element:
	 *
	 * 1. Makes sure that converted view element will have property `data-name` then converter will
	 * automatically take this property value. In this case there is no need to provide creator function.
	 * For the following view:
	 *
	 *		<marker data-name="search"></marker>foo<marker data-name="search"></marker>
	 *
	 * converter should look like this:
	 *
	 *		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker();
	 *
	 * 2. Creates element by creator:
	 *
	 * For the following view:
	 *
	 * 		<span foo="search"></span>foo<span foo="search"></span>
	 *
	 * converter should look like this:
	 *
	 * 		buildViewConverter().for( dispatcher ).from( { name: 'span', { attribute: foo: /^\w/ } } ).toMarker( ( data ) => {
	 * 			return new Element( '$marker', { 'data-name': data.getAttribute( 'foo' ) } );
	 * 		} );
	 *
	 * @param {Function} [creator] Creator function.
	 */
	toMarker( creator ) {
		function eventCallbackGen( from ) {
			return ( evt, data, consumable ) => {
				// There is one callback for all patterns in the matcher.
				// This will be usually just one pattern but we support matchers with many patterns too.
				const matchAll = from.matcher.matchAll( data.input );

				// If there is no match, this callback should not do anything.
				if ( !matchAll ) {
					return;
				}

				let modelElement;

				// When creator is provided then create model element basing on creator function.
				if ( creator instanceof Function ) {
					modelElement = creator( data.input );
				// When there is no creator then create model element basing on data from view element.
				} else {
					modelElement = new ModelElement( '$marker', { 'data-name': data.input.getAttribute( 'data-name' ) } );
				}

				// Check if model element is correct (has proper name and property).
				if ( modelElement.name != '$marker' || typeof modelElement.getAttribute( 'data-name' ) != 'string' ) {
					throw new CKEditorError(
						'build-view-converter-invalid-marker: Invalid model element to mark marker range.'
					);
				}

				// Now, for every match between matcher and actual element, we will try to consume the match.
				for ( const match of matchAll ) {
					// Try to consume appropriate values from consumable values list.
					if ( !consumable.consume( data.input, from.consume || match.match ) ) {
						continue;
					}

					data.output = modelElement;

					// Prevent multiple conversion if there are other correct matches.
					break;
				}
			};
		}

		this._setCallback( eventCallbackGen, 'normal' );
	}

	/**
	 * Helper function that uses given callback generator to created callback function and sets it on registered dispatchers.
	 *
	 * @param eventCallbackGen
	 * @param defaultPriority
	 * @private
	 */
	_setCallback( eventCallbackGen, defaultPriority ) {
		// We will add separate event callback for each registered `from` entry.
		for ( const from of this._from ) {
			// We have to figure out event name basing on matcher's patterns.
			// If there is exactly one pattern and it has `name` property we will used that name.
			const matcherElementName = from.matcher.getElementName();
			const eventName = matcherElementName ? 'element:' + matcherElementName : 'element';
			const eventCallback = eventCallbackGen( from );

			const priority = from.priority === null ? defaultPriority : from.priority;

			// Add event to each registered dispatcher.
			for ( const dispatcher of this._dispatchers ) {
				dispatcher.on( eventName, eventCallback, { priority } );
			}
		}
	}
}

// Helper function that sets given attributes on given `module:engine/model/node~Node` or
// `module:engine/model/documentfragment~DocumentFragment`.
function setAttributeOn( toChange, attribute, data, conversionApi ) {
	if ( isIterable( toChange ) ) {
		for ( const node of toChange ) {
			setAttributeOn( node, attribute, data, conversionApi );
		}

		return;
	}

	const keys = Array.from( toChange.getAttributeKeys() );
	keys.push( attribute.key );

	const schemaQuery = {
		name: toChange.name || '$text',
		attributes: keys,
		inside: data.context
	};

	if ( conversionApi.schema.check( schemaQuery ) ) {
		toChange.setAttribute( attribute.key, attribute.value );
	}
}

/**
 * Entry point for view-to-model converters builder. This chainable API makes it easy to create basic, most common
 * view-to-model converters and attach them to provided dispatchers. The method returns an instance of
 * {@link module:engine/conversion/buildviewconverter~ViewConverterBuilder}.
 */
export default function buildViewConverter() {
	return new ViewConverterBuilder();
}
