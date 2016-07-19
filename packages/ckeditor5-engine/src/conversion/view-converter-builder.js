/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Matcher from '../view/matcher.js';
import ModelElement from '../model/element.js';
import isIterable from '../../utils/isiterable.js';

/**
 * Provides chainable, high-level API to easily build basic view-to-model converters that are appended to given
 * dispatchers. View-to-model converters are used when external data is added to the editor, i.e. when a user pastes
 * HTML content to the editor. Then, converters are used to translate this structure, possibly removing unknown/incorrect
 * nodes, and add it to the model. Also multiple, different elements might be translated into the same thing in the
 * model, i.e. `<b>` and `<strong>` elements might be converted to `bold` attribute (even though `bold` attribute will
 * be then converted only to `<strong>` tag). Instances of this class are created by {@link engine.conversion.BuildViewConverterFor}.
 *
 * If you need more complex converters, see {@link engine.conversion.ViewConversionDispatcher},
 * {@link engine.conversion.viewToModel}, {@link engine.conversion.ViewConsumable}.
 *
 * Using this API it is possible to create various kind of converters:
 *
 * 1. View element to model element:
 *
 *		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
 *
 * 2. View element to model attribute:
 *
 *		BuildViewConverterFor( dispatcher ).fromElement( 'b' ).fromElement( 'strong' ).toAttribute( 'bold', 'true' );
 *
 * 3. View attribute to model attribute:
 *
 *		BuildViewConverterFor( dispatcher ).fromAttribute( 'style', { 'font-weight': 'bold' } ).toAttribute( 'bold', 'true' );
 *		BuildViewConverterFor( dispatcher )
 *			.fromAttribute( 'class' )
 *			.toAttribute( ( viewElement ) => ( { class: viewElement.getAttribute( 'class' ) } ) );
 *
 * 4. View elements and attributes to model attribute:
 *
 *		BuildViewConverterFor( dispatcher )
 *			.fromElement( 'b' ).fromElement( 'strong' ).fromAttribute( 'style', { 'font-weight': 'bold' } )
 *			.toAttribute( 'bold', 'true' );
 *
 * 5. View {@link engine.view.Matcher view element matcher instance} or {@link engine.view.Matcher#add matcher pattern}
 * to model element or attribute:
 *
 *		const matcher = new ViewMatcher();
 *		matcher.add( 'div', { class: 'quote' } );
 *		BuildViewConverterFor( dispatcher ).from( matcher ).toElement( 'quote' );
 *
 *		BuildViewConverterFor( dispatcher ).from( { name: 'span', class: 'bold' } ).toAttribute( 'bold', 'true' );
 *
 * Note, that converters built using `ViewConverterBuilder` automatically check {@link engine.model.Schema schema}
 * if created model structure is valid. If given conversion would be invalid according to schema, it is ignored.
 *
 * It is possible to provide creator functions as parameters for {@link engine.conversion.ViewConverterBuilder#toElement}
 * and {@link engine.conversion.ViewConverterBuilder#toAttribute} methods. See their descriptions to learn more.
 *
 * By default, converter will {@link engine.conversion.ViewConsumable#consume consume} every value specified in
 * given `from...` query, i.e. `.from( { name: 'span', class: 'bold' } )` will make converter consume both `span` name
 * and `bold` class. It is possible to change this behavior using {@link engine.conversion.ViewConverterBuilder#consuming consuming}
 * modifier. The modifier alters the last `fromXXX` query used before it. To learn more about consuming values,
 * see {@link engine.conversion.ViewConsumable}.
 *
 * It is also possible to {@link engine.conversion.ViewConverterBuilder#withPriority change default priority}
 * of created converters to decide which converter should be fired earlier and which later. This is useful if you provide
 * a general converter but want to provide different converter for a specific-case (i.e. given view element is converted
 * always to given model element, but if it has given class it is converter to other model element). For this,
 * use {@link engine.conversion.ViewConverterBuilder#withPriority withPriority} modifier. The modifier alters
 * the last `from...` query used before it.
 *
 * Note that `to...` methods are "terminators", which means that should be the last one used in building converter.
 *
 * You can use {@link engine.conversion.ModelConverterBuilder} to create "opposite" converters - from model to view.
 *
 * @memberOf engine.conversion
 */
class ViewConverterBuilder {
	/**
	 * Creates `ViewConverterBuilder` with given `dispatchers` registered to it.
	 *
	 * @param {Array.<engine.conversion.ViewConversionDispatcher>} dispatchers Dispatchers to which converters will
	 * be attached.
	 */
	constructor( dispatchers ) {
		/**
		 * Dispatchers to which converters will be attached.
		 *
		 * @type {Array.<engine.conversion.ViewConversionDispatcher>}
		 * @private
		 */
		this._dispatchers = dispatchers;

		/**
		 * Stores "from" queries.
		 *
		 * @type {Array}
		 * @private
		 */
		this._from = [];
	}

	/**
	 * Registers what view element should be converted.
	 *
	 *		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
	 *
	 * @chainable
	 * @param {String} elementName View element name.
	 * @returns {engine.conversion.ViewConverterBuilder}
	 */
	fromElement( elementName ) {
		return this.from( { name: elementName } );
	}

	/**
	 * Registers what view attribute should be converted.
	 *
	 *		BuildViewConverterFor( dispatcher ).fromAttribute( 'style', { 'font-weight': 'bold' } ).toAttribute( 'bold', 'true' );
	 *
	 * @chainable
	 * @param {String|RegExp} key View attribute key.
	 * @param {String|RegExp} [value] View attribute value.
	 * @returns {engine.conversion.ViewConverterBuilder}
	 */
	fromAttribute( key, value = /.*/ ) {
		let pattern = {};
		pattern[ key ] = value;

		return this.from( pattern );
	}

	/**
	 * Registers what view pattern should be converted. The method accepts either {@link engine.view.Matcher view matcher}
	 * or view matcher pattern.
	 *
	 *		const matcher = new ViewMatcher();
	 *		matcher.add( 'div', { class: 'quote' } );
	 *		BuildViewConverterFor( dispatcher ).from( matcher ).toElement( 'quote' );
	 *
	 *		BuildViewConverterFor( dispatcher ).from( { name: 'span', class: 'bold' } ).toAttribute( 'bold', 'true' );
	 *
	 * @chainable
	 * @param {Object|engine.view.Matcher} matcher View matcher or view matcher pattern.
	 * @returns {engine.conversion.ViewConverterBuilder}
	 */
	from( matcher ) {
		if ( !( matcher instanceof Matcher ) ) {
			matcher = new Matcher( matcher );
		}

		this._from.push( {
			matcher: matcher,
			consume: false,
			priority: null
		} );

		return this;
	}

	/**
	 * Modifies which consumable values will be {@link engine.conversion.ViewConsumable#consume consumed} by built converter.
	 * It modifies the last `from...` query. Can be used after each `from...` query in given chain. Useful for providing
	 * more specific matches.
	 *
	 *		// This converter will only handle class bold conversion (to proper attribute) but span element
	 *		// conversion will have to be done in separate converter.
	 *		// Without consuming modifier, the converter would consume both class and name, so a converter for
	 *		// span element would not be fired.
	 *		BuildViewConverterFor( dispatcher )
	 *			.from( { name: 'span', class: 'bold' } ).consuming( { class: 'bold' } )
	 *			.toAttribute( 'bold', 'true' } );
	 *
	 *		BuildViewConverterFor( dispatcher )
	 *			.fromElement( 'img' ).consuming( { name: true, attributes: [ 'src', 'title' ] } )
	 *			.toElement( ( viewElement ) => new ModelElement( 'image', { src: viewElement.getAttribute( 'src' ),
	 *																		title: viewElement.getAttribute( 'title' ) } );
	 *
	 * **Note:** All and only values from passed object has to be consumable on converted view element. This means that
	 * using `consuming` method, you can either make looser conversion conditions (like in first example) or tighter
	 * conversion conditions (like in second example). So, the view element, to be converter, has to match query of
	 * `from...` method and then have to have enough consumable values to consume.
	 *
	 * @see engine.conversion.ViewConsumable
	 * @chainable
	 * @param {Object} consume Values to consume.
	 * @returns {engine.conversion.ViewConverterBuilder}
	 */
	consuming( consume ) {
		let lastFrom = this._from[ this._from.length - 1 ];
		lastFrom.consume = consume;

		return this;
	}

	/**
	 * Changes default priority for built converter. It modifies the last `from...` query. Can be used after each
	 * `from...` query in given chain. Useful for overwriting converters. The lower the number, the earlier converter will be fired.
	 *
	 *		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
	 *		// Register converter with proper priority, otherwise "p" element would get consumed by first
	 *		// converter and the second converter would not be fired.
	 *		BuildViewConverterFor( dispatcher )
	 *			.from( { name: 'p', class: 'custom' } ).withPriority( 9 )
	 *			.toElement( 'customParagraph' );
	 *
	 * **Note:** `ViewConverterBuilder` takes care so all `toElement` conversions takes place before all `toAttribute`
	 * conversions. This is done by setting default `toElement` priority to `10` and `toAttribute` priority to `1000`.
	 * It is recommended to set converter priority for `toElement` conversions below `500` and `toAttribute` priority
	 * above `500`. It is important that model elements are created before attributes, otherwise attributes would
	 * not be applied or other errors may occur.
	 *
	 * @chainable
	 * @param {Number} priority Converter priority.
	 * @returns {engine.conversion.ViewConverterBuilder}
	 */
	withPriority( priority ) {
		let lastFrom = this._from[ this._from.length - 1 ];
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
	 *		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
	 *		BuildViewConverterFor( dispatcher )
	 *			.fromElement( 'img' )
	 *			.toElement( ( viewElement ) => new ModelElement( 'image', { src: viewElement.getAttribute( 'src' ) } );
	 *
	 * @param {String|Function} element Model element name or model element creator function.
	 */
	toElement( element ) {
		const eventCallbackGen = function( from ) {
			return ( evt, data, consumable, conversionApi ) => {
				// There is one callback for all patterns in the matcher.
				// This will be usually just one pattern but we support matchers with many patterns too.
				let matchAll = from.matcher.matchAll( data.input );

				// If there is no match, this callback should not do anything.
				if ( !matchAll ) {
					return;
				}

				// Now, for every match between matcher and actual element, we will try to consume the match.
				for ( let match of matchAll ) {
					// Create model element basing on creator function or element name.
					const modelElement = element instanceof Function ? element( data.input ) : new ModelElement( element );

					// Check whether generated structure is okay with `Schema`.
					// TODO: Make it more sane after .getAttributeKeys() is available for ModelElement.
					const keys = Array.from( modelElement.getAttributes() ).map( ( attribute ) => attribute[ 0 ] );

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
					modelElement.appendChildren( conversionApi.convertChildren( data.input, consumable, data ) );

					// Remove created `modelElement` from the parents stack.
					data.context.pop();

					// Add `modelElement` as a result.
					data.output = modelElement;

					// Prevent multiple conversion if there are other correct matches.
					break;
				}
			};
		};

		this._setCallback( eventCallbackGen, 10 );
	}

	/**
	 * Registers what model attribute will be created by converter.
	 *
	 * Method accepts two ways of providing what kind of model attribute will be created. You can either pass two strings
	 * representing attribute key and attribute value or a function that returns an object with `key` and `value` properties.
	 * If you provide creator function, it will be passed converted view element as first and only parameter.
	 *
	 *		BuildViewConverterFor( dispatcher ).fromAttribute( 'style', { 'font-weight': 'bold' } ).toAttribute( 'bold', 'true' );
	 *		BuildViewConverterFor( dispatcher )
	 *			.fromAttribute( 'class' )
	 *			.toAttribute( ( viewElement ) => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );
	 *
	 * @param {String|Function} keyOrCreator Attribute key or a creator function.
	 * @param {String} [value] Attribute value. Required if `keyOrCreator` is a `string`. Ignored otherwise.
	 */
	toAttribute( keyOrCreator, value ) {
		const eventCallbackGen = function( from ) {
			return ( evt, data, consumable, conversionApi ) => {
				// There is one callback for all patterns in the matcher.
				// This will be usually just one pattern but we support matchers with many patterns too.
				let matchAll = from.matcher.matchAll( data.input );

				// If there is no match, this callback should not do anything.
				if ( !matchAll ) {
					return;
				}

				// Now, for every match between matcher and actual element, we will try to consume the match.
				for ( let match of matchAll ) {
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
					let attribute = keyOrCreator instanceof Function ? keyOrCreator( data.input ) : { key: keyOrCreator, value: value };

					// Set attribute on current `output`. `Schema` is checked inside this helper function.
					setAttributeOn( data.output, attribute, data, conversionApi );

					// Prevent multiple conversion if there are other correct matches.
					break;
				}
			};
		};

		this._setCallback( eventCallbackGen, 1000 );
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
		for ( let from of this._from ) {
			// We have to figure out event name basing on matcher's patterns.
			// If there is exactly one pattern and it has `name` property we will used that name.
			const matcherElementName = from.matcher.getElementName();
			const eventName = matcherElementName ? 'element:' + matcherElementName : 'element';
			const eventCallback = eventCallbackGen( from );

			const priority = from.priority === null ? defaultPriority : from.priority;

			// Add event to each registered dispatcher.
			for ( let dispatcher of this._dispatchers ) {
				dispatcher.on( eventName, eventCallback, null, priority );
			}
		}
	}
}

// Helper function that sets given attributes on given `engine.model.Item` or `engine.model.DocumentFragment`.
function setAttributeOn( toChange, attribute, data, conversionApi ) {
	if ( isIterable( toChange ) ) {
		for ( let node of toChange ) {
			setAttributeOn( node, attribute, data, conversionApi );
		}

		return;
	}

	// TODO: Make it more sane after .getAttributeKeys() is available for ModelElement.
	const keys = Array.from( toChange.getAttributes() ).map( ( attribute ) => attribute[ 0 ] ).concat( attribute.key );

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
 * {@link engine.conversion.ViewConverterBuilder}.
 *
 * @external engine.conversion.BuildViewConverterFor
 * @memberOf engine.conversion
 * @param {...engine.conversion.ViewConversionDispatcher} dispatchers One or more dispatchers to which
 * the built converter will be attached.
 */
export default function BuildViewConverterFor( ...dispatchers ) {
	return new ViewConverterBuilder( dispatchers );
}
