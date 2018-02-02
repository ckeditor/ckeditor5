/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewContainerElement from '../view/containerelement';
import ViewAttributeElement from '../view/attributeelement';
import ViewUIElement from '../view/uielement';

import {
	insertElement, wrap, changeAttribute,
	insertUIElement, removeUIElement, highlightText, highlightElement, removeHighlight
} from './model-to-view-converters';

import cloneDeep from '@ckeditor/ckeditor5-utils/src/lib/lodash/cloneDeep';

/**
 * @module engine/conversion/model-to-view-helpers
 */

/**
 * Model element to view element conversion helper.
 *
 * This conversion results in creating a view element. For example, model `<paragraph>Foo</paragraph>` becomes `<p>Foo</p>` in the view.
 *
 *		elementToElement( { model: 'paragraph', view: 'p' } );
 *
 *		elementToElement( { model: 'paragraph', view: 'p' }, 'high' );
 *
 *		elementToElement( { model: 'paragraph', view: new ViewContainerElement( 'p' ) } );
 *
 *		elementToElement( {
 *			model: 'fancyParagraph',
 *			view: {
 *				name: 'p',
 *				class: 'fancy'
 *			}
 *		} );
 *
 * 		elementToElement( {
 * 			model: 'heading',
 * 			view: modelElement => new ViewContainerElement( 'h' + modelElement.getAttribute( 'level' ) )
 * 		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String} config.model Name of the model element to convert.
 * @param {String|module:engine/view/viewelementdefinition~ViewElementDefinition|Function|
 * module:engine/view/containerelement~ContainerElement} config.view View element name, or a view element definition,
 * or a function that takes model element as a parameter and returns a view container element,
 * or a view container element instance. The view element will be used then in conversion.
 * @param {module:utils/priorities~PriorityString} [priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function elementToElement( config, priority = 'normal' ) {
	config = cloneDeep( config );

	_normalizeToElementConfig( config, ViewContainerElement );

	return dispatcher => {
		dispatcher.on( 'insert:' + config.model, insertElement( config.view ), { priority } );
	};
}

/**
 * Model attribute to view element conversion helper.
 *
 * This conversion results in wrapping view nodes in a view attribute element. For example, model text node with data
 * `"Foo"` and `bold` attribute becomes `<strong>Foo</strong>` in the view.
 *
 *		attributeToElement( 'bold', { view: 'strong' } );
 *
 *		attributeToElement( 'bold', { view: 'strong' }, 'high' );
 *
 *		attributeToElement( 'bold', { view: new ViewAttributeElement( 'strong' ) } );
 *
 *		attributeToElement( 'bold', {
 *			view: {
 *				name: 'span',
 *				class: 'bold'
 *			}
 *		} );
 *
 *		attributeToElement( 'styled', {
 *			model: 'dark',
 *			view: {
 *				name: 'span',
 *				class: [ 'styled', 'styled-dark' ]
 *			}
 *		} );
 *
 *		attributeToElement( 'fontSize', [
 *			{
 *				model: 'big',
 *				view: {
 *					name: 'span',
 *					style: {
 *						'font-size': '1.2em'
 *					}
 *				}
 *			},
 *			{
 *				model: 'small',
 *				view: {
 *					name: 'span',
 *					style: {
 *						'font-size': '0.8em'
 *					}
 *				}
 *			}
 *		] );
 *
 * 		attributeToElement( 'bold', {
 * 			view: modelAttributeValue => new ViewAttributeElement( 'span', { style: 'font-weight:' + modelAttributeValue } )
 * 		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {String} modelAttributeKey The key of the attribute to convert.
 * @param {Object|Array.<Object>} config Conversion configuration. It is possible to provide multiple configurations in an array.
 * @param {*} [config.model] The value of the converted model attribute for which the `view` property is defined.
 * If omitted, the configuration item will be used as a "default" configuration when no other item matches the attribute value.
 * @param {String|module:engine/view/viewelementdefinition~ViewElementDefinition|Function|
 * module:engine/view/attributeelement~AttributeElement} config.view View element name, or a view element definition,
 * or a function that takes model element as a parameter and returns a view attribute element, or a view attribute element instance.
 * The view element will be used then in conversion.
 * @param {module:utils/priorities~PriorityString} [priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function attributeToElement( modelAttributeKey, config, priority = 'normal' ) {
	config = cloneDeep( config );

	_normalizeToElementConfig( config, ViewAttributeElement );

	const elementCreator = _getCreatorForArrayConfig( config );

	return dispatcher => {
		dispatcher.on( 'attribute:' + modelAttributeKey, wrap( elementCreator ), { priority } );
	};
}

/**
 * Model attribute to view attribute conversion helper.
 *
 * This conversion results in adding an attribute on a view node, basing on an attribute from a model node. For example,
 * `<image src='foo.jpg'></image>` is converted to `<img src='foo.jpg'></img>`.
 *
 *		attributeToAttribute( 'src' );
 *
 *		attributeToAttribute( 'source', { view: 'src' } );
 *
 *		attributeToAttribute( 'source', { view: 'src' }, 'high' );
 *
 *		attributeToAttribute( 'stylish', {
 *			view: {
 *				key: 'class',
 *				value: 'styled'
 *			}
 *		} );
 *
 *		attributeToAttribute( 'styled', {
 *			model: 'dark',
 *			view: {
 *				key: 'class',
 *				value: 'styled styled-dark'
 *			}
 *		} );
 *
 *		attributeToAttribute( 'style', [
 *			{
 *				model: 'dark',
 *				view: {
 *					key: 'class',
 *					value: 'styled-dark'
 *				}
 *			},
 *			{
 *				model: 'light',
 *				view: {
 *					key: 'class',
 *					value: 'styled-light'
 *				}
 *			}
 *		] );
 *
 *		attributeToAttribute( 'style', {
 *			view: attributeValue => ( { key: 'class', value: 'style-' + attributeValue } )
 *		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {String} modelAttributeKey The key of the attribute to convert.
 * @param {Object|Array.<Object>} [config] Conversion configuration. It is possible to provide multiple configurations in an array.
 * If not set, the conversion helper will assume 1-to-1 conversion, that is the view attribute key and view attribute value
 * will be same as model attribute key and model attribute value.
 * @param {*} [config.model] The value of the converted model attribute for which the `view` property is defined.
 * If `true` is provided, the configuration item will be used as a "default" configuration when no other item matches
 * the attribute value.
 * @param {String|Object|Function} [config.view] View attribute key, or an object with `key` and `value` properties (both `String`),
 * or a function that takes model attribute value and returns an object with `key` and `value` properties (both `String`).
 * If nothing is passed, the view attribute key and value will be equal to the model attribute key and value.
 * If a `String` is passed, it will be used as view attribute key and view attribute value will be equal to model attribute value.
 * If an object or a function returning an object is passed, its properties will be used to set view attribute key and value.
 * @param {module:utils/priorities~PriorityString} [priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function attributeToAttribute( modelAttributeKey, config = {}, priority = 'normal' ) {
	config = cloneDeep( config );

	_normalizeToAttributeConfig( modelAttributeKey, config );

	const elementCreator = _getCreatorForArrayConfig( config );

	return dispatcher => {
		dispatcher.on( 'attribute:' + modelAttributeKey, changeAttribute( elementCreator ), { priority } );
	};
}

/**
 * Model marker to view element conversion helper.
 *
 * This conversion results in creating a view element on the boundaries of the converted marker. If converted marker
 * is collapsed, only one element is created. For example, model marker set like this `<paragraph>F[oo b]ar</paragraph>`
 * becomes `<p>F<span data-marker="search"></span>oo b<span data-marker="search"></span>ar</p>` in the view.
 *
 *		markerToElement( { model: 'search', view: 'marker-search' } );
 *
 *		markerToElement( { model: 'search', view: 'marker-search' }, 'high' );
 *
 *		markerToElement( { model: 'search', view: new ViewUIElement( 'span', { data-marker: 'search' } ) } );
 *
 *		markerToElement( {
 *			model: 'search',
 *			view: {
 *				name: 'span',
 *				attribute: {
 *					'data-marker': 'search'
 *				}
 *			}
 *		} );
 *
 * 		markerToElement( {
 * 			model: 'search',
 * 			view: data => {
 *	 			return new ViewUIElement( 'span', { 'data-marker': 'search', 'data-start': data.isOpening } );
 * 			}
 * 		} );
 *
 * If function is passed as `config.view` parameter, it will be used to generate both boundary elements. The function
 * receives `data` object as parameter and should return an instance of {@link module:engine/view/uielement~UIElement view.UIElement}.
 * The `data` object properties are passed from
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:addMarker}. Additionally,
 * `data.isOpening` parameter is passed, which is set to `true` for marker start boundary element, and `false` to
 * marker end boundary element.
 *
 * This kind of conversion is useful for saving data into data base, so it should be used in data conversion pipeline.
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String} config.model Name of the model marker (or model marker group) to convert.
 * @param {module:engine/view/viewelementdefinition~ViewElementDefinition|Function} config.view View element definition
 * which will be used to build a view element for conversion or a function that takes model marker data as a parameter and
 * returns view element to use in conversion.
 * @param {module:utils/priorities~PriorityString} [priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function markerToElement( config, priority = 'normal' ) {
	config = cloneDeep( config );

	_normalizeToElementConfig( config, ViewUIElement );

	return dispatcher => {
		dispatcher.on( 'addMarker:' + config.model, insertUIElement( config.view ), { priority } );
		dispatcher.on( 'removeMarker:' + config.model, removeUIElement( config.view ), { priority } );
	};
}

/**
 * Model marker to highlight conversion helper.
 *
 * This conversion results in creating a highlight on view nodes. For this kind of conversion,
 * {@link module:engine/conversion/model-to-view-converters~HighlightDescriptor} should be provided.
 *
 * For text nodes, a `span` {@link module:engine/view/attributeelement~AttributeElement} is created and it wraps all text nodes
 * in the converted marker range. For example, model marker set like this `<paragraph>F[oo b]ar</paragraph>` becomes
 * `<p>F<span class="comment">oo b</span>ar</p>` in the view.
 *
 * {@link module:engine/view/containerelement~ContainerElement} may provide custom way of handling highlight. Most often,
 * the element itself is given classes and attributes described in the highlight descriptor (instead of being wrapped in `span`).
 * For example, model marker set like this `[<image src="foo.jpg"></image>]` becomes `<img src="foo.jpg" class="comment"></img>`
 * in the view.
 *
 * For container elements, the conversion is two-step. While the converter processes highlight descriptor and passes it
 * to a container element, it is the container element instance itself which applies values from highlight descriptor.
 * So, in a sense, converter takes care of stating what should be applied on what, while element decides how to apply that.
 *
 *		markerToHighlight( { model: 'comment', view: { class: 'comment' } } );
 *
 *		markerToHighlight( { model: 'comment', view: { class: 'new-comment' } }, 'high' );
 *
 * 		markerToHighlight( {
 * 			model: 'comment',
 * 			view: data => {
 * 				// Assuming that marker name is in a form of comment:commentType.
 *	 			const commentType = data.markerName.split( ':' )[ 1 ];
 *
 *	 			return {
 *	 				class: [ 'comment', 'comment-' + commentType ]
 *	 			};
 * 			}
 * 		} );
 *
 * If function is passed as `config.view` parameter, it will be used to generate highlight descriptor. The function
 * receives `data` object as parameter and should return an instance of {@link module:engine/view/uielement~UIElement view.UIElement}.
 * The `data` object properties are passed from
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:addMarker}.
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String} config.model Name of the model marker (or model marker group) to convert.
 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor|Function} config.view Highlight descriptor
 * which will be used for highlighting or a function that takes model marker data as a parameter and returns a highlight descriptor.
 * @param {module:utils/priorities~PriorityString} [priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function markerToHighlight( config, priority = 'normal' ) {
	return dispatcher => {
		dispatcher.on( 'addMarker:' + config.model, highlightText( config.view ), { priority } );
		dispatcher.on( 'addMarker:' + config.model, highlightElement( config.view ), { priority } );
		dispatcher.on( 'removeMarker:' + config.model, removeHighlight( config.view ), { priority } );
	};
}

// Takes config and adds default parameters if they don't exist and normalizes other parameters to be used in model-to-view converters
// for generating a view element.
//
// @param {Object} config Object with conversion helper configuration.
// @param {Function} ViewElementClass View element class to use when generating view element from config.
function _normalizeToElementConfig( config, ViewElementClass ) {
	// If config is given as an array, normalize each entry separately.
	if ( Array.isArray( config ) ) {
		for ( const configEntry of config ) {
			_normalizeToElementConfig( configEntry, ViewElementClass );
		}

		return;
	}

	// Build `.view` property.
	// It is expected to be either creator function or view element instance.
	if ( typeof config.view == 'string' ) {
		// If `.view` is a string, create a proper view element instance out of given `ViewElementClass` and name given in `.view`.
		config.view = new ViewElementClass( config.view );
	} else if ( typeof config.view == 'object' && !( config.view instanceof ViewElementClass ) ) {
		// If `.view` is an object, use it to build view element instance.
		config.view = _createViewElementFromDefinition( config.view, ViewElementClass );
	}
	// `.view` can be also a function or already a view element instance.
	// These are already valid types which don't have to be normalized.
}

// Creates view element instance from provided viewElementDefinition and class.
//
// @param {module:engine/view/viewelementdefinition~ViewElementDefinition} viewElementDefinition
// @param {Function} ViewElementClass
// @returns {module:engine/view/element~Element}
function _createViewElementFromDefinition( viewElementDefinition, ViewElementClass ) {
	const element = new ViewElementClass( viewElementDefinition.name, Object.assign( {}, viewElementDefinition.attribute ) );

	if ( viewElementDefinition.style ) {
		element.setStyle( viewElementDefinition.style );
	}

	if ( viewElementDefinition.class ) {
		const classes = viewElementDefinition.class;

		if ( typeof classes == 'string' ) {
			element.addClass( classes );
		} else {
			element.addClass( ...classes );
		}
	}

	return element;
}

// Takes config and adds default parameters if they don't exist and normalizes other parameters to be used in model-to-view converters
// for generating view attribute.
//
// @param {String} modelAttributeKey Model attribute key for which config is defined.
// @param {Object} [config] Config with conversion helper configuration.
function _normalizeToAttributeConfig( modelAttributeKey, config ) {
	// If config is given as an array, normalize each entry separately.
	if ( Array.isArray( config ) ) {
		for ( const configEntry of config ) {
			_normalizeToAttributeConfig( modelAttributeKey, configEntry );
		}

		return;
	}

	// Build `.view` property.
	// It is expected to be a creator function, that takes attribute value and model item and returns an object
	// with `key` property and `value` property which are view attribute key and view attribute value.
	if ( !config.view ) {
		// If `.view` is not set, take both attribute name and attribute value from model.
		const viewAttributeKey = modelAttributeKey;
		config.view = modelAttributeValue => ( { key: viewAttributeKey, value: modelAttributeValue } );
	} else if ( typeof config.view == 'string' ) {
		// If `.view` is set as a string, use it as a view attribute name. Value will be taken from model attribute value.
		const viewAttributeKey = config.view;
		config.view = modelAttributeValue => ( { key: viewAttributeKey, value: modelAttributeValue } );
	} else if ( typeof config.view == 'object' ) {
		// If `.view` is set as an object, use set key and value.
		const viewAttributeKey = config.view.key;
		const viewAttributeValue = config.view.value;
		config.view = () => ( { key: viewAttributeKey, value: viewAttributeValue } );
	}
	// `.view` can be also already a function.
}

// Takes config and creates a view element creator function that chooses an appropriate entry from the config depending on
// the value of model attribute.
//
// Supports specifying config as a single object or an array of objects.
// Supports `.view` defined as an object and as a function.
//
// @param {Object|Array.<Object>} config Config with conversion helper configuration.
function _getCreatorForArrayConfig( config ) {
	if ( !Array.isArray( config ) ) {
		config = [ config ];
	}

	// Get "default config" entry. It is the entry with `.model` property set to `true`.
	// "Default" entry should be used if no other entry matched model attribute value.
	const defaultConfig = config.find( configEntry => configEntry.model === undefined );

	// Return a creator function.
	return modelAttributeValue => {
		// Set default config at first. It will be used if no other entry matches model attribute value.
		let matchedConfigEntry = defaultConfig;

		// Creator should check all entries from the config...
		for ( const configEntry of config ) {
			if ( configEntry.model === modelAttributeValue ) {
				// If `.model` specified in entry matches converted attribute's value, choose it.
				matchedConfigEntry = configEntry;
				break;
			}
		}

		// If there was default config or matched config...
		if ( matchedConfigEntry ) {
			// If the entry `.view` is a function, execute it and return the value...
			if ( typeof matchedConfigEntry.view == 'function' ) {
				return matchedConfigEntry.view( modelAttributeValue );
			}
			// Else, just return `.view`, it should be a view element instance after it got normalized earlier.
			return matchedConfigEntry.view;
		}

		return null;
	};
}
