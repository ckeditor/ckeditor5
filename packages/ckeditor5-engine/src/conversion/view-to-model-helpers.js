/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Matcher from '../view/matcher';

import ModelRange from '../model/range';
import ModelPosition from '../model/position';

import cloneDeep from '@ckeditor/ckeditor5-utils/src/lib/lodash/cloneDeep';

/**
 * @module engine/conversion/view-to-model-helpers
 */

/**
 * View element to model element conversion helper.
 *
 * This conversion results in creating a model element. For example, view `<p>Foo</p>` becomes `<paragraph>Foo</paragraph>` in the model.
 *
 * Keep in mind that the element will be inserted only if it is allowed by {@link module:engine/model/schema~Schema schema} configuration.
 *
 *		elementToElement( { view: 'p', model: 'paragraph' } );
 *
 *		elementToElement( { view: 'p', model: 'paragraph' }, 'high' );
 *
 *		elementToElement( {
 *			view: {
 *				name: 'p',
 *				class: 'fancy'
 *			},
 *			model: 'fancyParagraph'
 *		} );
 *
 *		elementToElement( {
 *			view: {
 *				name: 'p',
 *				class: 'fancy'
 *			},
 *			model: new ModelElement( 'p', { fancy: true } )
 *		} );
 *
 *		elementToElement( {
 * 			view: {
 *				name: 'p',
 *				class: 'heading'
 * 			},
 * 			model: viewElement => new ModelElement( 'heading', { level: viewElement.getAttribute( 'data-level' ) } )
 * 		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {module:engine/view/matcher~MatcherPattern} config.view Pattern matching all view elements which should be converted.
 * @param {String|module:engine/model/element~Element|Function} config.model Name of the model element, a model element
 * instance or a function that takes a view element and returns a model element. The model element will be inserted in the model.
 * @param {module:utils/priorities~PriorityString} [priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function elementToElement( config, priority = 'normal' ) {
	config = cloneDeep( config );

	const converter = _prepareToElementConverter( config );

	const elementName = _getViewElementNameFromConfig( config );
	const eventName = elementName ? 'element:' + elementName : 'element';

	return dispatcher => {
		dispatcher.on( eventName, converter, { priority } );
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
 *		elementToAttribute( { view: 'strong', model: 'bold' } );
 *
 *		elementToAttribute( { view: 'strong', model: 'bold' }, 'normal' );
 *
 *		elementToAttribute( {
 *			view: {
 *				name: 'span',
 *				class: 'bold'
 *			},
 *			model: 'bold'
 *		} );
 *
 *		elementToAttribute( {
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
 * 		elementToAttribute( {
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
 * @param {module:utils/priorities~PriorityString} [priority='low'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function elementToAttribute( config, priority = 'low' ) {
	config = cloneDeep( config );

	_normalizeModelAttributeConfig( config );

	const converter = _prepareToAttributeConverter( config, false );

	const elementName = _getViewElementNameFromConfig( config );
	const eventName = elementName ? 'element:' + elementName : 'element';

	return dispatcher => {
		dispatcher.on( eventName, converter, { priority } );
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
 *		attributeToAttribute( { view: 'src', model: 'source' } );
 *
 *		attributeToAttribute( { view: { key: 'src' }, model: 'source' } );
 *
 *		attributeToAttribute( { view: { key: 'src' }, model: 'source' }, 'normal' );
 *
 *		attributeToAttribute( {
 *			view: {
 *				key: 'data-style',
 *				value: /[\s\S]+/
 *			},
 *			model: 'styled'
 *		} );
 *
 *		attributeToAttribute( {
 *			view: {
 *				name: 'span',
 *				key: 'class',
 *				value: 'styled-dark'
 *			},
 *			model: {
 *				key: 'styled',
 *				value: 'dark'
 *			}
 *		} );
 *
 *		attributeToAttribute( {
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
 * @param {String|Object} config Conversion configuration. If given as a `String`, the conversion will be set for a
 * view attribute with given key. The model attribute key and value will be same as view attribute key and value.
 * @param {String|Object} config.view Specifies which view attribute will be converted. If a `String` is passed,
 * attributes with given key will be converted. If an `Object` is passed, it must have a required `key` property,
 * specifying view attribute key, and may have an optional `value` property, specifying view attribute value and optional `name`
 * property specifying a view element name from/on which the attribute should be converted. `value` can be given as a `String`,
 * a `RegExp` or a function callback, that takes view attribute value as the only parameter and returns `Boolean`.
 * @param {String|Object} config.model Model attribute key or an object with `key` and `value` properties, describing
 * the model attribute. `value` property may be set as a function that takes a view element and returns the value.
 * If `String` is given, the model attribute value will be same as view attribute value.
 * @param {module:utils/priorities~PriorityString} [priority='low'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function attributeToAttribute( config, priority = 'low' ) {
	config = cloneDeep( config );

	let viewKey = null;

	if ( typeof config.view == 'string' || config.view.key ) {
		viewKey = _normalizeViewAttributeKeyValueConfig( config );
	}

	_normalizeModelAttributeConfig( config, viewKey );

	const converter = _prepareToAttributeConverter( config, true );

	return dispatcher => {
		dispatcher.on( 'element', converter, { priority } );
	};
}

/**
 * View element to model marker conversion helper.
 *
 * This conversion results in creating a model marker. For example, if the marker was stored in a view as an element:
 * `<p>Fo<span data-marker="comment" data-comment-id="7"></span>o</p><p>B<span data-marker="comment" data-comment-id="7"></span>ar</p>`,
 * after the conversion is done, the marker will be available in
 * {@link module:engine/model/document~Document#markers model document markers}.
 *
 *		elementToMarker( { view: 'marker-search', model: 'search' } );
 *
 *		elementToMarker( { view: 'marker-search', model: 'search' }, 'high' );
 *
 *		elementToMarker( { view: 'marker-search', model: viewElement => 'comment:' + viewElement.getAttribute( 'data-comment-id' ) } );
 *
 *		elementToMarker( {
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
 * @param {module:utils/priorities~PriorityString} [priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function elementToMarker( config, priority = 'normal' ) {
	config = cloneDeep( config );

	_normalizeToMarkerConfig( config );

	return elementToElement( config, priority );
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
		const splitResult = conversionApi.splitToAllowedParent( modelElement, data.cursorPosition );

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
			ModelPosition.createAfter( childrenResult.cursorPosition.parent )
		);

		// Now we need to check where the cursorPosition should be.
		// If we had to split parent to insert our element then we want to continue conversion inside split parent.
		//
		// before: <allowed><notAllowed>[]</notAllowed></allowed>
		// after:  <allowed><notAllowed></notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>
		if ( splitResult.cursorParent ) {
			data.cursorPosition = ModelPosition.createAt( splitResult.cursorParent );

			// Otherwise just continue after inserted element.
		} else {
			data.cursorPosition = data.modelRange.end;
		}
	};
}

// Helper function for view-to-model-element converter. Takes the model configuration, the converted view element
// and a writer instance and returns a model element instance to be inserted in the model.
//
// @param {String|Function|module:engine/model/element~Element} model Model conversion configuration.
// @param {module:engine/view/node~Node} input The converted view node.
// @param {module:engine/model/writer~Writer} writer A writer instance to use to create the model element.
function _getModelElement( model, input, writer ) {
	if ( model instanceof Function ) {
		return model( input, writer );
	} else if ( typeof model == 'string' ) {
		return writer.createElement( model );
	} else {
		return model;
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
	const value = typeof config.view.value == 'undefined' ? /[\s\S]*/ : config.view.value;

	const normalized = {
		attribute: {
			[ key ]: value
		}
	};

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
// @param {Boolean} consumeName If set to `true` converter will not consume element's name.
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
		}

		// Try to consume appropriate values from consumable values list.
		if ( !conversionApi.consumable.test( data.viewItem, match.match ) ) {
			return;
		}

		// Since we are converting to attribute we need an range on which we will set the attribute.
		// If the range is not created yet, we will create it.
		if ( !data.modelRange ) {
			// Convert children and set conversion result as a current data.
			data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.cursorPosition ) );
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

// Helper function for view-to-model-marker conversion. Takes the config in a format requested by `elementToMarker()`
// function and converts it to a format that is supported by `elementToElement()` function.
//
// @param {Object} config Conversion configuration.
function _normalizeToMarkerConfig( config ) {
	const oldModel = config.model;

	config.model = ( viewElement, writer ) => {
		const markerName = typeof oldModel == 'string' ? oldModel : oldModel( viewElement );

		return writer.createElement( '$marker', { 'data-name': markerName } );
	};
}
