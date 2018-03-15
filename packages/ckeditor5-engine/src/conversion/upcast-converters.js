/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Matcher from '../view/matcher';

import ModelRange from '../model/range';
import ModelPosition from '../model/position';

import cloneDeep from '@ckeditor/ckeditor5-utils/src/lib/lodash/cloneDeep';

/**
 * Contains {@link module:engine/view/view view} to {@link module:engine/model/model model} converters for
 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher}.
 *
 * @module engine/conversion/upcast-converters
 */

/**
 * View element to model element conversion helper.
 *
 * This conversion results in creating a model element. For example, view `<p>Foo</p>` becomes `<paragraph>Foo</paragraph>` in the model.
 *
 * Keep in mind that the element will be inserted only if it is allowed by {@link module:engine/model/schema~Schema schema} configuration.
 *
 *		upcastElementToElement( { view: 'p', model: 'paragraph' } );
 *
 *		upcastElementToElement( { view: 'p', model: 'paragraph', priority: 'high' } );
 *
 *		upcastElementToElement( {
 *			view: {
 *				name: 'p',
 *				class: 'fancy'
 *			},
 *			model: 'fancyParagraph'
 *		} );
 *
 *		upcastElementToElement( {
 * 			view: {
 *				name: 'p',
 *				class: 'heading'
 * 			},
 * 			model: ( viewElement, modelWriter ) => {
 * 				return modelWriter.createElement( 'heading', { level: viewElement.getAttribute( 'data-level' ) } );
 * 			}
 * 		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {module:engine/view/matcher~MatcherPattern} config.view Pattern matching all view elements which should be converted.
 * @param {String|module:engine/model/element~Element|Function} config.model Name of the model element, a model element
 * instance or a function that takes a view element and returns a model element. The model element will be inserted in the model.
 * @param {module:utils/priorities~PriorityString} [config.priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function upcastElementToElement( config ) {
	config = cloneDeep( config );

	const converter = _prepareToElementConverter( config );

	const elementName = _getViewElementNameFromConfig( config );
	const eventName = elementName ? 'element:' + elementName : 'element';

	return dispatcher => {
		dispatcher.on( eventName, converter, { priority: config.priority || 'normal' } );
	};
}

/**
 * View element to model attribute conversion helper.
 *
 * This conversion results in setting an attribute on a model node. For example, view `<strong>Foo</strong>` becomes
 * `Foo` {@link module:engine/model/text~Text model text node} with `bold` attribute set to `true`.
 *
 * Keep in mind that the attribute will be set only if it is allowed by {@link module:engine/model/schema~Schema schema} configuration.
 *
 *		upcastElementToAttribute( { view: 'strong', model: 'bold' } );
 *
 *		upcastElementToAttribute( { view: 'strong', model: 'bold', priority: 'high' } );
 *
 *		upcastElementToAttribute( {
 *			view: {
 *				name: 'span',
 *				class: 'bold'
 *			},
 *			model: 'bold'
 *		} );
 *
 *		upcastElementToAttribute( {
 *			view: {
 *				name: 'span',
 *				class: [ 'styled', 'styled-dark' ]
 *			},
 *			model: {
 *				key: 'styled',
 *				value: 'dark'
 *			}
 *		} );
 *
 * 		upcastElementToAttribute( {
 *			view: {
 *				name: 'span',
 *				style: {
 *					'font-size': /[\s\S]+/
 *				}
 *			},
 *			model: {
 *				key: 'fontSize',
 *				value: viewElement => {
 *					const fontSize = viewElement.getStyle( 'font-size' );
 *					const value = fontSize.substr( 0, fontSize.length - 2 );
 *
 *					if ( value <= 10 ) {
 *						return 'small';
 *					} else if ( value > 12 ) {
 *						return 'big';
 *					}
 *
 *					return null;
 *				}
 *			}
 *		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {module:engine/view/matcher~MatcherPattern} config.view Pattern matching all view elements which should be converted.
 * @param {String|Object} config.model Model attribute key or an object with `key` and `value` properties, describing
 * the model attribute. `value` property may be set as a function that takes a view element and returns the value.
 * If `String` is given, the model attribute value will be set to `true`.
 * @param {module:utils/priorities~PriorityString} [config.priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function upcastElementToAttribute( config ) {
	config = cloneDeep( config );

	_normalizeModelAttributeConfig( config );

	const converter = _prepareToAttributeConverter( config, true );

	const elementName = _getViewElementNameFromConfig( config );
	const eventName = elementName ? 'element:' + elementName : 'element';

	return dispatcher => {
		dispatcher.on( eventName, converter, { priority: config.priority || 'normal' } );
	};
}

/**
 * View attribute to model attribute conversion helper.
 *
 * This conversion results in setting an attribute on a model node. For example, view `<img src="foo.jpg"></img>` becomes
 * `<image source="foo.jpg"></image>` in the model.
 *
 * Keep in mind that the attribute will be set only if it is allowed by {@link module:engine/model/schema~Schema schema} configuration.
 *
 *		upcastAttributeToAttribute( { view: 'src', model: 'source' } );
 *
 *		upcastAttributeToAttribute( { view: { key: 'src' }, model: 'source' } );
 *
 *		upcastAttributeToAttribute( { view: { key: 'src' }, model: 'source', priority: 'normal' } );
 *
 *		upcastAttributeToAttribute( {
 *			view: {
 *				key: 'data-style',
 *				value: /[\s\S]+/
 *			},
 *			model: 'styled'
 *		} );
 *
 *		upcastAttributeToAttribute( {
 *			view: {
 *				name: 'img',
 *				key: 'class',
 *				value: 'styled-dark'
 *			},
 *			model: {
 *				key: 'styled',
 *				value: 'dark'
 *			}
 *		} );
 *
 *		upcastAttributeToAttribute( {
 *			view: {
 *				key: 'class',
 *				value: /styled-[\S]+/
 *			},
 *			model: {
 *				key: 'styled'
 *				value: viewElement => {
 *					const regexp = /styled-([\S]+)/;
 *					const match = viewElement.getAttribute( 'class' ).match( regexp );
 *
 *					return match[ 1 ];
 *				}
 *			}
 *		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String|Object} config.view Specifies which view attribute will be converted. If a `String` is passed,
 * attributes with given key will be converted. If an `Object` is passed, it must have a required `key` property,
 * specifying view attribute key, and may have an optional `value` property, specifying view attribute value and optional `name`
 * property specifying a view element name from/on which the attribute should be converted. `value` can be given as a `String`,
 * a `RegExp` or a function callback, that takes view attribute value as the only parameter and returns `Boolean`.
 * @param {String|Object} config.model Model attribute key or an object with `key` and `value` properties, describing
 * the model attribute. `value` property may be set as a function that takes a view element and returns the value.
 * If `String` is given, the model attribute value will be same as view attribute value.
 * @param {module:utils/priorities~PriorityString} [config.priority='low'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function upcastAttributeToAttribute( config ) {
	config = cloneDeep( config );

	let viewKey = null;

	if ( typeof config.view == 'string' || config.view.key ) {
		viewKey = _normalizeViewAttributeKeyValueConfig( config );
	}

	_normalizeModelAttributeConfig( config, viewKey );

	const converter = _prepareToAttributeConverter( config, false );

	return dispatcher => {
		dispatcher.on( 'element', converter, { priority: config.priority || 'low' } );
	};
}

/**
 * View element to model marker conversion helper.
 *
 * This conversion results in creating a model marker. For example, if the marker was stored in a view as an element:
 * `<p>Fo<span data-marker="comment" data-comment-id="7"></span>o</p><p>B<span data-marker="comment" data-comment-id="7"></span>ar</p>`,
 * after the conversion is done, the marker will be available in
 * {@link module:engine/model/model~Model#markers model document markers}.
 *
 *		upcastElementToMarker( { view: 'marker-search', model: 'search' } );
 *
 *		upcastElementToMarker( { view: 'marker-search', model: 'search', priority: 'high' } );
 *
 *		upcastElementToMarker( {
 *			view: 'marker-search',
 *			model: viewElement => 'comment:' + viewElement.getAttribute( 'data-comment-id' )
 *		} );
 *
 *		upcastElementToMarker( {
 *			view: {
 *				name: 'span',
 *				attribute: {
 *					'data-marker': 'search'
 *				}
 *			},
 *			model: 'search'
 *		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {module:engine/view/matcher~MatcherPattern} config.view Pattern matching all view elements which should be converted.
 * @param {String|Function} config.model Name of the model marker, or a function that takes a view element and returns
 * a model marker name.
 * @param {module:utils/priorities~PriorityString} [config.priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function upcastElementToMarker( config ) {
	config = cloneDeep( config );

	_normalizeToMarkerConfig( config );

	return upcastElementToElement( config );
}

// Helper function for from-view-element conversion. Checks if `config.view` directly specifies converted view element's name
// and if so, returns it.
//
// @param {Object} config Conversion config.
// @returns {String|null} View element name or `null` if name is not directly set.
function _getViewElementNameFromConfig( config ) {
	if ( typeof config.view == 'string' ) {
		return config.view;
	}

	if ( typeof config.view == 'object' && typeof config.view.name == 'string' ) {
		return config.view.name;
	}

	return null;
}

// Helper for to-model-element conversion. Takes a config object and returns a proper converter function.
//
// @param {Object} config Conversion configuration.
// @returns {Function} View to model converter.
function _prepareToElementConverter( config ) {
	const matcher = new Matcher( config.view );

	return ( evt, data, conversionApi ) => {
		// This will be usually just one pattern but we support matchers with many patterns too.
		const match = matcher.match( data.viewItem );

		// If there is no match, this callback should not do anything.
		if ( !match ) {
			return;
		}

		// Force consuming element's name.
		match.match.name = true;

		// Create model element basing on config.
		const modelElement = _getModelElement( config.model, data.viewItem, conversionApi.writer );

		// Do not convert if element building function returned falsy value.
		if ( !modelElement ) {
			return;
		}

		// When element was already consumed then skip it.
		if ( !conversionApi.consumable.test( data.viewItem, match.match ) ) {
			return;
		}

		// Find allowed parent for element that we are going to insert.
		// If current parent does not allow to insert element but one of the ancestors does
		// then split nodes to allowed parent.
		const splitResult = conversionApi.splitToAllowedParent( modelElement, data.modelCursor );

		// When there is no split result it means that we can't insert element to model tree, so let's skip it.
		if ( !splitResult ) {
			return;
		}

		// Insert element on allowed position.
		conversionApi.writer.insert( modelElement, splitResult.position );

		// Convert children and insert to element.
		const childrenResult = conversionApi.convertChildren( data.viewItem, ModelPosition.createAt( modelElement ) );

		// Consume appropriate value from consumable values list.
		conversionApi.consumable.consume( data.viewItem, match.match );

		// Set conversion result range.
		data.modelRange = new ModelRange(
			// Range should start before inserted element
			ModelPosition.createBefore( modelElement ),
			// Should end after but we need to take into consideration that children could split our
			// element, so we need to move range after parent of the last converted child.
			// before: <allowed>[]</allowed>
			// after: <allowed>[<converted><child></child></converted><child></child><converted>]</converted></allowed>
			ModelPosition.createAfter( childrenResult.modelCursor.parent )
		);

		// Now we need to check where the modelCursor should be.
		// If we had to split parent to insert our element then we want to continue conversion inside split parent.
		//
		// before: <allowed><notAllowed>[]</notAllowed></allowed>
		// after:  <allowed><notAllowed></notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>
		if ( splitResult.cursorParent ) {
			data.modelCursor = ModelPosition.createAt( splitResult.cursorParent );

			// Otherwise just continue after inserted element.
		} else {
			data.modelCursor = data.modelRange.end;
		}
	};
}

// Helper function for upcasting-to-element converter. Takes the model configuration, the converted view element
// and a writer instance and returns a model element instance to be inserted in the model.
//
// @param {String|Function|module:engine/model/element~Element} model Model conversion configuration.
// @param {module:engine/view/node~Node} input The converted view node.
// @param {module:engine/model/writer~Writer} writer A writer instance to use to create the model element.
function _getModelElement( model, input, writer ) {
	if ( model instanceof Function ) {
		return model( input, writer );
	} else {
		return writer.createElement( model );
	}
}

// Helper function view-attribute-to-model-attribute helper. Normalizes `config.view` which was set as `String` or
// as an `Object` with `key`, `value` and `name` properties. Normalized `config.view` has is compatible with
// {@link module:engine/view/matcher~MatcherPattern}.
//
// @param {Object} config Conversion config.
// @returns {String} Key of the converted view attribute.
function _normalizeViewAttributeKeyValueConfig( config ) {
	if ( typeof config.view == 'string' ) {
		config.view = { key: config.view };
	}

	const key = config.view.key;
	let normalized;

	if ( key == 'class' || key == 'style' ) {
		normalized = {
			[ key ]: config.view.value
		};
	} else {
		const value = typeof config.view.value == 'undefined' ? /[\s\S]*/ : config.view.value;

		normalized = {
			attribute: {
				[ key ]: value
			}
		};
	}

	if ( config.view.name ) {
		normalized.name = config.view.name;
	}

	config.view = normalized;

	return key;
}

// Helper function that normalizes `config.model` in from-model-attribute conversion. `config.model` can be set
// as a `String`, an `Object` with only `key` property or an `Object` with `key` and `value` properties. Normalized
// `config.model` is an `Object` with `key` and `value` properties.
//
// @param {Object} config Conversion config.
// @param {String} viewAttributeKeyToCopy Key of the  converted view attribute. If it is set, model attribute value
// will be equal to view attribute value.
function _normalizeModelAttributeConfig( config, viewAttributeKeyToCopy = null ) {
	const defaultModelValue = viewAttributeKeyToCopy === null ? true : viewElement => viewElement.getAttribute( viewAttributeKeyToCopy );

	const key = typeof config.model != 'object' ? config.model : config.model.key;
	const value = typeof config.model != 'object' ? defaultModelValue : config.model.value;

	config.model = { key, value };
}

// Helper for to-model-attribute conversion. Takes the model attribute name and conversion configuration and returns
// a proper converter function.
//
// @param {String} modelAttributeKey The key of the model attribute to set on a model node.
// @param {Object|Array.<Object>} config Conversion configuration. It is possible to provide multiple configurations in an array.
// @param {Boolean} consumeName If set to `true` converter will try to consume name. If set to `false` converter will not try to
// consume name. This flag overwrites parameter returned by `Matcher#match`.
function _prepareToAttributeConverter( config, consumeName ) {
	const matcher = new Matcher( config.view );

	return ( evt, data, conversionApi ) => {
		const match = matcher.match( data.viewItem );

		// If there is no match, this callback should not do anything.
		if ( !match ) {
			return;
		}

		const modelKey = config.model.key;
		const modelValue = typeof config.model.value == 'function' ? config.model.value( data.viewItem ) : config.model.value;

		// Do not convert if attribute building function returned falsy value.
		if ( modelValue === null ) {
			return;
		}

		if ( !consumeName ) {
			// Do not test or consume `name` consumable.
			delete match.match.name;
		} else {
			match.match.name = true;
		}

		// Try to consume appropriate values from consumable values list.
		if ( !conversionApi.consumable.test( data.viewItem, match.match ) ) {
			return;
		}

		// Since we are converting to attribute we need an range on which we will set the attribute.
		// If the range is not created yet, we will create it.
		if ( !data.modelRange ) {
			// Convert children and set conversion result as a current data.
			data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		// Set attribute on current `output`. `Schema` is checked inside this helper function.
		const attributeWasSet = _setAttributeOn( data.modelRange, { key: modelKey, value: modelValue }, conversionApi );

		if ( attributeWasSet ) {
			conversionApi.consumable.consume( data.viewItem, match.match );
		}
	};
}

// Helper function for to-model-attribute converter. Sets model attribute on given range. Checks {@link module:engine/model/schema~Schema}
// to ensure proper model structure.
//
// @param {module:engine/model/range~Range} modelRange Model range on which attribute should be set.
// @param {Object} modelAttribute Model attribute to set.
// @param {Object} conversionApi Conversion API.
// @returns {Boolean} `true` if attribute was set on at least one node from given `modelRange`.
function _setAttributeOn( modelRange, modelAttribute, conversionApi ) {
	let result = false;

	// Set attribute on each item in range according to Schema.
	for ( const node of Array.from( modelRange.getItems() ) ) {
		if ( conversionApi.schema.checkAttribute( node, modelAttribute.key ) ) {
			conversionApi.writer.setAttribute( modelAttribute.key, modelAttribute.value, node );

			result = true;
		}
	}

	return result;
}

// Helper function for upcasting-to-marker conversion. Takes the config in a format requested by `upcastElementToMarker()`
// function and converts it to a format that is supported by `upcastElementToElement()` function.
//
// @param {Object} config Conversion configuration.
function _normalizeToMarkerConfig( config ) {
	const oldModel = config.model;

	config.model = ( viewElement, modelWriter ) => {
		const markerName = typeof oldModel == 'string' ? oldModel : oldModel( viewElement );

		return modelWriter.createElement( '$marker', { 'data-name': markerName } );
	};
}

/**
 * Function factory, creates a converter that converts {@link module:engine/view/documentfragment~DocumentFragment view document fragment}
 * or all children of {@link module:engine/view/element~Element} into
 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment}.
 * This is the "entry-point" converter for upcast (view to model conversion). This converter starts the conversion of all children
 * of passed view document fragment. Those children {@link module:engine/view/node~Node view nodes} are then handled by other converters.
 *
 * This also a "default", last resort converter for all view elements that has not been converted by other converters.
 * When a view element is being converted to the model but it does not have converter specified, that view element
 * will be converted to {@link module:engine/model/documentfragment~DocumentFragment model document fragment} and returned.
 *
 * @returns {Function} Universal converter for view {@link module:engine/view/documentfragment~DocumentFragment fragments} and
 * {@link module:engine/view/element~Element elements} that returns
 * {@link module:engine/model/documentfragment~DocumentFragment model fragment} with children of converted view item.
 */
export function convertToModelFragment() {
	return ( evt, data, conversionApi ) => {
		// Second argument in `consumable.consume` is discarded for ViewDocumentFragment but is needed for ViewElement.
		if ( !data.modelRange && conversionApi.consumable.consume( data.viewItem, { name: true } ) ) {
			const { modelRange, modelCursor } = conversionApi.convertChildren( data.viewItem, data.modelCursor );

			data.modelRange = modelRange;
			data.modelCursor = modelCursor;
		}
	};
}

/**
 * Function factory, creates a converter that converts {@link module:engine/view/text~Text} to {@link module:engine/model/text~Text}.
 *
 * @returns {Function} {@link module:engine/view/text~Text View text} converter.
 */
export function convertText() {
	return ( evt, data, conversionApi ) => {
		if ( conversionApi.schema.checkChild( data.modelCursor, '$text' ) ) {
			if ( conversionApi.consumable.consume( data.viewItem ) ) {
				const text = conversionApi.writer.createText( data.viewItem.data );

				conversionApi.writer.insert( text, data.modelCursor );

				data.modelRange = ModelRange.createFromPositionAndShift( data.modelCursor, text.offsetSize );
				data.modelCursor = data.modelRange.end;
			}
		}
	};
}
