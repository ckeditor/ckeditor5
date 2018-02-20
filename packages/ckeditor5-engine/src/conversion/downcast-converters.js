/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelRange from '../model/range';
import ModelSelection from '../model/selection';
import ModelElement from '../model/element';

import ViewAttributeElement from '../view/attributeelement';
import ViewRange from '../view/range';
import DocumentSelection from '../model/documentselection';

import cloneDeep from '@ckeditor/ckeditor5-utils/src/lib/lodash/cloneDeep';

/**
 * Contains downcast (model to view) converters for {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}.
 *
 * @module engine/conversion/downcast-converters
 */

/**
 * Model element to view element conversion helper.
 *
 * This conversion results in creating a view element. For example, model `<paragraph>Foo</paragraph>` becomes `<p>Foo</p>` in the view.
 *
 *		downcastElementToElement( { model: 'paragraph', view: 'p' } );
 *
 *		downcastElementToElement( { model: 'paragraph', view: 'div', priority: 'high' } );
 *
 *		downcastElementToElement( {
 *			model: 'fancyParagraph',
 *			view: {
 *				name: 'p',
 *				class: 'fancy'
 *			}
 *		} );
 *
 * 		downcastElementToElement( {
 * 			model: 'heading',
 * 			view: ( modelElement, viewWriter ) => viewWriter.createContainerElement( 'h' + modelElement.getAttribute( 'level' ) )
 * 		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String} config.model Name of the model element to convert.
 * @param {module:engine/view/elementdefinition~ElementDefinition|Function} config.view View element definition or a function
 * that takes model element and view writer as a parameters and returns a view container element.
 * @returns {Function} Conversion helper.
 */
export function downcastElementToElement( config ) {
	config = cloneDeep( config );

	config.view = _normalizeToElementConfig( config.view, 'container' );

	return dispatcher => {
		dispatcher.on( 'insert:' + config.model, insertElement( config.view ), { priority: config.priority || 'normal' } );
	};
}

/**
 * Model attribute to view element conversion helper.
 *
 * This conversion results in wrapping view nodes in a view attribute element. For example, model text node with data
 * `"Foo"` and `bold` attribute becomes `<strong>Foo</strong>` in the view.
 *
 *		downcastAttributeToElement( { model: 'bold', view: 'strong' } );
 *
 *		downcastAttributeToElement( { model: 'bold', view: 'b', priority: 'high' } );
 *
 *		downcastAttributeToElement( {
 *			model: 'invert',
 *			view: {
 *				name: 'span',
 *				class: [ 'font-light', 'bg-dark' ]
 *			}
 *		} );
 *
 *		downcastAttributeToElement( {
 *			model: {
 *				key: 'fontSize',
 *				values: [ 'big', 'small' ]
 *			},
 *			view: {
 *				big: {
 *					name: 'span',
 *					style: {
 *						'font-size': '1.2em'
 *					}
 *				},
 *				small: {
 *					name: 'span',
 *					style: {
 *						'font-size': '0.8em'
 *					}
 *				}
 *			}
 *		} );
 *
 * 		downcastAttributeToElement( {
 * 			model: 'bold',
 * 			view: ( modelAttributeValue, viewWriter ) => {
 * 				return viewWriter.createAttributeElement( 'span', { style: 'font-weight:' + modelAttributeValue } );
 * 			}
 * 		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String|Object} config.model Key of the attribute to convert from or a `{ key, values }` object. `values` is an array
 * of `String`s with possible values if the model attribute is enumerable.
 * @param {module:engine/view/elementdefinition~ElementDefinition|Function|Object} config.view View element definition or a function
 * that takes model attribute value and view writer as parameters and returns a view attribute element. If `config.model.values` is
 * given, `config.view` should be an object assigning values from `config.model.values` to view element definitions or functions.
 * @param {module:utils/priorities~PriorityString} [config.priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function downcastAttributeToElement( config ) {
	config = cloneDeep( config );

	const modelKey = config.model.key ? config.model.key : config.model;

	if ( config.model.values ) {
		for ( const modelValue of config.model.values ) {
			config.view[ modelValue ] = _normalizeToElementConfig( config.view[ modelValue ], 'attribute' );
		}
	} else {
		config.view = _normalizeToElementConfig( config.view, 'attribute' );
	}

	const elementCreator = _getFromAttributeCreator( config );

	return dispatcher => {
		dispatcher.on( 'attribute:' + modelKey, wrap( elementCreator ), { priority: config.priority || 'normal' } );
	};
}

/**
 * Model attribute to view attribute conversion helper.
 *
 * This conversion results in adding an attribute on a view node, basing on an attribute from a model node. For example,
 * `<image src='foo.jpg'></image>` is converted to `<img src='foo.jpg'></img>`.
 *
 *		downcastAttributeToAttribute( { model: 'source', view: 'src' } );
 *
 *		downcastAttributeToAttribute( { model: 'source', view: 'href', priority: 'high' } );
 *
 *		downcastAttributeToAttribute( {
 *			model: {
 *				name: 'image',
 *				key: 'source'
 *			},
 *			view: 'src'
 *		} );
 *
 *		downcastAttributeToAttribute( {
 *			model: {
 *				name: 'styled',
 *				values: [ 'dark', 'light' ]
 *			},
 *			view: {
 *				dark: {
 *					key: 'class',
 *					value: [ 'styled', 'styled-dark' ]
 *				},
 *				light: {
 *					key: 'class',
 *					value: [ 'styled', 'styled-light' ]
 *				}
 *			}
 *		} );
 *
 *		downcastAttributeToAttribute( {
 *			model: 'styled',
 *			view: modelAttributeValue => ( { key: 'class', value: 'styled-' + modelAttributeValue } )
 *		} );
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String|Object} config.model Key of the attribute to convert from or a `{ key, values, [ name ] }` object describing
 * the attribute key, possible values and, optionally, an element name to convert from.
 * @param {String|Object|Function} config.view View attribute key, or a `{ key, value }` object or a function that takes
 * model attribute value and returns a `{ key, value }` object. If `key` is `'class'`, `value` can be a `String` or an
 * array of `String`s. If `key` is `'style'`, `value` is an object with key-value pairs. In other cases, `value` is a `String`.
 * If `config.model.values` is set, `config.view` should be an object assigning values from `config.model.values` to
 * `{ key, value }` objects or a functions.
 * @param {module:utils/priorities~PriorityString} [config.priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function downcastAttributeToAttribute( config ) {
	config = cloneDeep( config );

	const modelKey = config.model.key ? config.model.key : config.model;
	let eventName = 'attribute:' + modelKey;

	if ( config.model.name ) {
		eventName += ':' + config.model.name;
	}

	if ( config.model.values ) {
		for ( const modelValue of config.model.values ) {
			config.view[ modelValue ] = _normalizeToAttributeConfig( config.view[ modelValue ] );
		}
	} else {
		config.view = _normalizeToAttributeConfig( config.view );
	}

	const elementCreator = _getFromAttributeCreator( config );

	return dispatcher => {
		dispatcher.on( eventName, changeAttribute( elementCreator ), { priority: config.priority || 'normal' } );
	};
}

/**
 * Model marker to view element conversion helper.
 *
 * This conversion results in creating a view element on the boundaries of the converted marker. If converted marker
 * is collapsed, only one element is created. For example, model marker set like this `<paragraph>F[oo b]ar</paragraph>`
 * becomes `<p>F<span data-marker="search"></span>oo b<span data-marker="search"></span>ar</p>` in the view.
 *
 *		downcastMarkerToElement( { model: 'search', view: 'marker-search' } );
 *
 *		downcastMarkerToElement( { model: 'search', view: 'search-result', priority: 'high' } );
 *
 *		downcastMarkerToElement( {
 *			model: 'search',
 *			view: {
 *				name: 'span',
 *				attribute: {
 *					'data-marker': 'search'
 *				}
 *			}
 *		} );
 *
 * 		downcastMarkerToElement( {
 * 			model: 'search',
 * 			view: ( markerData, viewWriter ) => {
 *	 			return viewWriter.createUIElement( 'span', { 'data-marker': 'search', 'data-start': markerData.isOpening } );
 * 			}
 * 		} );
 *
 * If function is passed as `config.view` parameter, it will be used to generate both boundary elements. The function
 * receives `data` object as parameter and should return an instance of {@link module:engine/view/uielement~UIElement view.UIElement}.
 * The `data` and `conversionApi` objects are passed from
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker}. Additionally,
 * `data.isOpening` parameter is passed, which is set to `true` for marker start boundary element, and `false` to
 * marker end boundary element.
 *
 * This kind of conversion is useful for saving data into data base, so it should be used in data conversion pipeline.
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String} config.model Name of the model marker (or model marker group) to convert.
 * @param {module:engine/view/elementdefinition~ElementDefinition|Function} config.view View element definition or a function
 * that takes model marker data as a parameter and returns view ui element.
 * @param {module:utils/priorities~PriorityString} [config.priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function downcastMarkerToElement( config ) {
	config = cloneDeep( config );

	config.view = _normalizeToElementConfig( config.view, 'ui' );

	return dispatcher => {
		dispatcher.on( 'addMarker:' + config.model, insertUIElement( config.view ), { priority: config.priority || 'normal' } );
		dispatcher.on( 'removeMarker:' + config.model, removeUIElement( config.view ), { priority: config.priority || 'normal' } );
	};
}

/**
 * Model marker to highlight conversion helper.
 *
 * This conversion results in creating a highlight on view nodes. For this kind of conversion,
 * {@link module:engine/conversion/downcast-converters~HighlightDescriptor} should be provided.
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
 *		downcastMarkerToHighlight( { model: 'comment', view: { class: 'comment' } } );
 *
 *		downcastMarkerToHighlight( { model: 'comment', view: { class: 'new-comment' }, priority: 'high' } );
 *
 * 		downcastMarkerToHighlight( {
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
 * receives `data` object as parameter and should return a {@link module:engine/conversion/downcast-converters~HighlightDescriptor}.
 * The `data` object properties are passed from {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker}.
 *
 * See {@link module:engine/conversion/conversion~Conversion#for} to learn how to add converter to conversion process.
 *
 * @param {Object} config Conversion configuration.
 * @param {String} config.model Name of the model marker (or model marker group) to convert.
 * @param {module:engine/conversion/downcast-converters~HighlightDescriptor|Function} config.view Highlight descriptor
 * which will be used for highlighting or a function that takes model marker data as a parameter and returns a highlight descriptor.
 * @param {module:utils/priorities~PriorityString} [config.priority='normal'] Converter priority.
 * @returns {Function} Conversion helper.
 */
export function downcastMarkerToHighlight( config ) {
	return dispatcher => {
		dispatcher.on( 'addMarker:' + config.model, highlightText( config.view ), { priority: config.priority || 'normal' } );
		dispatcher.on( 'addMarker:' + config.model, highlightElement( config.view ), { priority: config.priority || 'normal' } );
		dispatcher.on( 'removeMarker:' + config.model, removeHighlight( config.view ), { priority: config.priority || 'normal' } );
	};
}

// Takes `config.view`, and if it is a {@link module:engine/view/elementdefinition~ElementDefinition}, converts it
// to a function (because lower level converters accepts only element creator functions).
//
// @param {module:engine/view/elementdefinition~ElementDefinition|Function} view View configuration.
// @param {'container'|'attribute'|'ui'} viewElementType View element type to create.
// @returns {Function} Element creator function to use in lower level converters.
function _normalizeToElementConfig( view, viewElementType ) {
	if ( typeof view == 'function' ) {
		// If `view` is already a function, don't do anything.
		return view;
	}

	return ( modelData, viewWriter ) => _createViewElementFromDefinition( view, viewWriter, viewElementType );
}

// Creates view element instance from provided viewElementDefinition and class.
//
// @param {module:engine/view/elementdefinition~ElementDefinition} viewElementDefinition
// @param {module:engine/view/writer~Writer} viewWriter
// @param {'container'|'attribute'|'ui'} viewElementType
// @returns {module:engine/view/element~Element}
function _createViewElementFromDefinition( viewElementDefinition, viewWriter, viewElementType ) {
	if ( typeof viewElementDefinition == 'string' ) {
		// If `viewElementDefinition` is given as a `String`, normalize it to an object with `name` property.
		viewElementDefinition = { name: viewElementDefinition };
	}

	let element;

	if ( viewElementType == 'container' ) {
		element = viewWriter.createContainerElement( viewElementDefinition.name, Object.assign( {}, viewElementDefinition.attribute ) );
	} else if ( viewElementType == 'attribute' ) {
		element = viewWriter.createAttributeElement( viewElementDefinition.name, Object.assign( {}, viewElementDefinition.attribute ) );
	} else {
		// 'ui'.
		element = viewWriter.createUIElement( viewElementDefinition.name, Object.assign( {}, viewElementDefinition.attribute ) );
	}

	if ( viewElementDefinition.style ) {
		const keys = Object.keys( viewElementDefinition.style );

		for ( const key of keys ) {
			viewWriter.setStyle( key, viewElementDefinition.style[ key ], element );
		}
	}

	if ( viewElementDefinition.class ) {
		const classes = viewElementDefinition.class;

		if ( typeof classes == 'string' ) {
			viewWriter.addClass( classes, element );
		} else {
			for ( const className of classes ) {
				viewWriter.addClass( className, element );
			}
		}
	}

	return element;
}

function _getFromAttributeCreator( config ) {
	if ( config.model.values ) {
		return ( modelAttributeValue, viewWriter ) => {
			const view = config.view[ modelAttributeValue ];

			if ( view ) {
				return view( modelAttributeValue, viewWriter );
			}

			return null;
		};
	} else {
		return config.view;
	}
}

// Takes config and adds default parameters if they don't exist and normalizes other parameters to be used in downcast converters
// for generating view attribute.
//
// @param {Object} view View configuration.
function _normalizeToAttributeConfig( view ) {
	if ( typeof view == 'string' ) {
		return modelAttributeValue => ( { key: view, value: modelAttributeValue } );
	} else if ( typeof view == 'object' ) {
		return () => view;
	} else {
		// function.
		return view;
	}
}

/**
 * Function factory, creates a converter that converts node insertion changes from the model to the view.
 * Passed function will be provided with all the parameters of the dispatcher's
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert insert event}.
 * It's expected that the function returns a {@link module:engine/view/element~Element}.
 * The result of the function will be inserted to the view.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}) and bind model and view elements.
 *
 *		downcastDispatcher.on(
 *			'insert:myElem',
 *			insertElement( ( modelItem, viewWriter ) => {
 *				const text = viewWriter.createText( 'myText' );
 *				const myElem = viewWriter.createElement( 'myElem', { myAttr: 'my-' + modelItem.getAttribute( 'myAttr' ) }, text );
 *
 *				// Do something fancy with myElem using `modelItem` or other parameters.
 *
 *				return myElem;
 *			}
 *		) );
 *
 * @param {Function} elementCreator Function returning a view element, which will be inserted.
 * @returns {Function} Insert element event converter.
 */
export function insertElement( elementCreator ) {
	return ( evt, data, conversionApi ) => {
		const viewElement = elementCreator( data.item, conversionApi.writer );

		if ( !viewElement ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( data.item, viewElement );
		conversionApi.writer.insert( viewPosition, viewElement );
	};
}

/**
 * Function factory, creates a default downcast converter for text insertion changes.
 *
 * The converter automatically consumes corresponding value from consumables list and stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}).
 *
 *		modelDispatcher.on( 'insert:$text', insertText() );
 *
 * @returns {Function} Insert text event converter.
 */
export function insertText() {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		const viewText = viewWriter.createText( data.item.data );

		viewWriter.insert( viewPosition, viewText );
	};
}

/**
 * Function factory, creates a default downcast converter for node remove changes.
 *
 *		modelDispatcher.on( 'remove', remove() );
 *
 * @returns {Function} Remove event converter.
 */
export function remove() {
	return ( evt, data, conversionApi ) => {
		// Find view range start position by mapping model position at which the remove happened.
		const viewStart = conversionApi.mapper.toViewPosition( data.position );

		const modelEnd = data.position.getShiftedBy( data.length );
		const viewEnd = conversionApi.mapper.toViewPosition( modelEnd, { isPhantom: true } );

		const viewRange = new ViewRange( viewStart, viewEnd );

		// Trim the range to remove in case some UI elements are on the view range boundaries.
		const removed = conversionApi.writer.remove( viewRange.getTrimmed() );

		// After the range is removed, unbind all view elements from the model.
		// Range inside view document fragment is used to unbind deeply.
		for ( const child of ViewRange.createIn( removed ).getItems() ) {
			conversionApi.mapper.unbindViewElement( child );
		}
	};
}

/**
 * Function factory, creates a converter that converts marker adding change to the view ui element.
 * The view ui element that will be added to the view depends on passed parameter. See {@link ~insertElement}.
 * In a case of collapsed range element will not wrap range but separate elements will be placed at the beginning
 * and at the end of the range.
 *
 * **Note:** unlike {@link ~insertElement}, the converter does not bind view element to model, because this converter
 * uses marker as "model source of data". This means that view ui element does not have corresponding model element.
 *
 * @param {module:engine/view/uielement~UIElement|Function} elementCreator View ui element, or function returning a view element, which
 * will be inserted.
 * @returns {Function} Insert element event converter.
 */
export function insertUIElement( elementCreator ) {
	return ( evt, data, conversionApi ) => {
		// Create two view elements. One will be inserted at the beginning of marker, one at the end.
		// If marker is collapsed, only "opening" element will be inserted.
		data.isOpening = true;
		const viewStartElement = elementCreator( data, conversionApi.writer );

		data.isOpening = false;
		const viewEndElement = elementCreator( data, conversionApi.writer );

		if ( !viewStartElement || !viewEndElement ) {
			return;
		}

		const markerRange = data.markerRange;

		// Marker that is collapsed has consumable build differently that non-collapsed one.
		// For more information see `addMarker` event description.
		// If marker's range is collapsed - check if it can be consumed.
		if ( markerRange.isCollapsed && !conversionApi.consumable.consume( markerRange, evt.name ) ) {
			return;
		}

		// If marker's range is not collapsed - consume all items inside.
		for ( const value of markerRange ) {
			if ( !conversionApi.consumable.consume( value.item, evt.name ) ) {
				return;
			}
		}

		const mapper = conversionApi.mapper;
		const viewWriter = conversionApi.writer;

		// Add "opening" element.
		viewWriter.insert( mapper.toViewPosition( markerRange.start ), viewStartElement );

		// Add "closing" element only if range is not collapsed.
		if ( !markerRange.isCollapsed ) {
			viewWriter.insert( mapper.toViewPosition( markerRange.end ), viewEndElement );
		}

		evt.stop();
	};
}

/**
 * Function factory, creates a default downcast converter for removing {@link module:engine/view/uielement~UIElement ui element}
 * basing on marker remove change.
 *
 * @param {module:engine/view/uielement~UIElement|Function} elementCreator View ui element, or function returning
 * a view ui element, which will be used as a pattern when look for element to remove at the marker start position.
 * @returns {Function} Remove ui element converter.
 */
export function removeUIElement( elementCreator ) {
	return ( evt, data, conversionApi ) => {
		// Create two view elements. One will be used to remove "opening element", the other for "closing element".
		// If marker was collapsed, only "opening" element will be removed.
		data.isOpening = true;
		const viewStartElement = elementCreator( data, conversionApi.writer );

		data.isOpening = false;
		const viewEndElement = elementCreator( data, conversionApi.writer );

		if ( !viewStartElement || !viewEndElement ) {
			return;
		}

		const markerRange = data.markerRange;
		const viewWriter = conversionApi.writer;

		// When removing the ui elements, we map the model range to view twice, because that view range
		// may change after the first clearing.
		if ( !markerRange.isCollapsed ) {
			viewWriter.clear( conversionApi.mapper.toViewRange( markerRange ).getEnlarged(), viewEndElement );
		}

		// Remove "opening" element.
		viewWriter.clear( conversionApi.mapper.toViewRange( markerRange ).getEnlarged(), viewStartElement );

		evt.stop();
	};
}

/**
 * Function factory, creates a converter that converts set/change/remove attribute changes from the model to the view.
 *
 * Attributes from model are converted to the view element attributes in the view. You may provide a custom function to generate
 * a key-value attribute pair to add/change/remove. If not provided, model attributes will be converted to view elements
 * attributes on 1-to-1 basis.
 *
 * **Note:** Provided attribute creator should always return the same `key` for given attribute from the model.
 *
 * The converter automatically consumes corresponding value from consumables list and stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}).
 *
 *		modelDispatcher.on( 'attribute:customAttr:myElem', changeAttribute( ( value, data ) => {
 *			// Change attribute key from `customAttr` to `class` in view.
 *			const key = 'class';
 *			let value = data.attributeNewValue;
 *
 *			// Force attribute value to 'empty' if the model element is empty.
 *			if ( data.item.childCount === 0 ) {
 *				value = 'empty';
 *			}
 *
 *			// Return key-value pair.
 *			return { key, value };
 *		} ) );
 *
 * @param {Function} [attributeCreator] Function returning an object with two properties: `key` and `value`, which
 * represents attribute key and attribute value to be set on a {@link module:engine/view/element~Element view element}.
 * The function is passed model attribute value as first parameter and additional data about the change as a second parameter.
 * @returns {Function} Set/change attribute converter.
 */
export function changeAttribute( attributeCreator ) {
	attributeCreator = attributeCreator || ( ( value, data ) => ( { value, key: data.attributeKey } ) );

	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewElement = conversionApi.mapper.toViewElement( data.item );
		const viewWriter = conversionApi.writer;

		// First remove the old attribute if there was one.
		const oldAttribute = attributeCreator( data.attributeOldValue, data );

		if ( data.attributeOldValue !== null && oldAttribute ) {
			if ( oldAttribute.key == 'class' ) {
				const classes = Array.isArray( oldAttribute.value ) ? oldAttribute.value : [ oldAttribute.value ];

				for ( const className of classes ) {
					viewWriter.removeClass( className, viewElement );
				}
			} else if ( oldAttribute.key == 'style' ) {
				const keys = Object.keys( oldAttribute.value );

				for ( const key of keys ) {
					viewWriter.removeStyle( key, viewElement );
				}
			} else {
				viewWriter.removeAttribute( oldAttribute.key, viewElement );
			}
		}

		// Then, if conversion was successful, set the new attribute.
		const newAttribute = attributeCreator( data.attributeNewValue, data );

		if ( data.attributeNewValue !== null && newAttribute ) {
			if ( newAttribute.key == 'class' ) {
				const classes = Array.isArray( newAttribute.value ) ? newAttribute.value : [ newAttribute.value ];

				for ( const className of classes ) {
					viewWriter.addClass( className, viewElement );
				}
			} else if ( newAttribute.key == 'style' ) {
				const keys = Object.keys( newAttribute.value );

				for ( const key of keys ) {
					viewWriter.setStyle( key, newAttribute.value[ key ], viewElement );
				}
			} else {
				viewWriter.setAttribute( newAttribute.key, newAttribute.value, viewElement );
			}
		}
	};
}

/**
 * Function factory, creates a converter that converts set/change/remove attribute changes from the model to the view.
 * Also can be used to convert selection attributes. In that case, an empty attribute element will be created and the
 * selection will be put inside it.
 *
 * Attributes from model are converted to a view element that will be wrapping those view nodes that are bound to
 * model elements having given attribute. This is useful for attributes like `bold`, which may be set on text nodes in model
 * but are represented as an element in the view:
 *
 *		[paragraph]              MODEL ====> VIEW        <p>
 *			|- a {bold: true}                             |- <b>
 *			|- b {bold: true}                             |   |- ab
 *			|- c                                          |- c
 *
 * Passed `Function` will be provided with attribute value and then all the parameters of the
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute attribute event}.
 * It's expected that the function returns a {@link module:engine/view/element~Element}.
 * The result of the function will be the wrapping element.
 * When provided `Function` does not return element, then will be no conversion.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}).
 *
 *		modelDispatcher.on( 'attribute:bold', wrapItem( ( modelAttributeValue, viewWriter ) => {
 *			return viewWriter.createAttributeElement( 'strong' );
 *		} );
 *
 * @param {Function} elementCreator Function returning a view element, which will be used for wrapping.
 * @returns {Function} Set/change attribute converter.
 */
export function wrap( elementCreator ) {
	return ( evt, data, conversionApi ) => {
		// Recreate current wrapping node. It will be used to unwrap view range if the attribute value has changed
		// or the attribute was removed.
		const oldViewElement = elementCreator( data.attributeOldValue, conversionApi.writer );

		// Create node to wrap with.
		const newViewElement = elementCreator( data.attributeNewValue, conversionApi.writer );

		if ( !oldViewElement && !newViewElement ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const viewSelection = viewWriter.document.selection;

		if ( data.item instanceof ModelSelection || data.item instanceof DocumentSelection ) {
			// Selection attribute conversion.
			viewWriter.wrap( viewSelection.getFirstRange(), newViewElement );
		} else {
			// Node attribute conversion.
			let viewRange = conversionApi.mapper.toViewRange( data.range );

			// First, unwrap the range from current wrapper.
			if ( data.attributeOldValue !== null && oldViewElement ) {
				viewRange = viewWriter.unwrap( viewRange, oldViewElement );
			}

			if ( data.attributeNewValue !== null && newViewElement ) {
				viewWriter.wrap( viewRange, newViewElement );
			}
		}
	};
}

/**
 * Function factory, creates converter that converts text inside marker's range. Converter wraps the text with
 * {@link module:engine/view/attributeelement~AttributeElement} created from provided descriptor.
 * See {link module:engine/conversion/downcast-converters~createViewElementFromHighlightDescriptor}.
 *
 * Also can be used to convert selection that is inside a marker. In that case, an empty attribute element will be
 * created and the selection will be put inside it.
 *
 * If the highlight descriptor will not provide `priority` property, `10` will be used.
 *
 * If the highlight descriptor will not provide `id` property, name of the marker will be used.
 *
 * @param {module:engine/conversion/downcast-converters~HighlightDescriptor|Function} highlightDescriptor
 * @return {Function}
 */
export function highlightText( highlightDescriptor ) {
	return ( evt, data, conversionApi ) => {
		if ( data.markerRange.isCollapsed ) {
			return;
		}

		if ( !( data.item instanceof ModelSelection || data.item instanceof DocumentSelection ) && !data.item.is( 'textProxy' ) ) {
			return;
		}

		const descriptor = _prepareDescriptor( highlightDescriptor, data, conversionApi );

		if ( !descriptor ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewElement = createViewElementFromHighlightDescriptor( descriptor );
		const viewWriter = conversionApi.writer;
		const viewSelection = viewWriter.document.selection;

		if ( data.item instanceof ModelSelection || data.item instanceof DocumentSelection ) {
			viewWriter.wrap( viewSelection.getFirstRange(), viewElement, viewSelection );
		} else {
			const viewRange = conversionApi.mapper.toViewRange( data.range );
			viewWriter.wrap( viewRange, viewElement );
		}
	};
}

/**
 * Converter function factory. Creates a function which applies the marker's highlight to an element inside the marker's range.
 *
 * The converter checks if an element has `addHighlight` function stored as
 * {@link module:engine/view/element~Element#_setCustomProperty custom property} and, if so, uses it to apply the highlight.
 * In such case converter will consume all element's children, assuming that they were handled by element itself.
 *
 * When `addHighlight` custom property is not present, element is not converted in any special way.
 * This means that converters will proceed to convert element's child nodes.
 *
 * If the highlight descriptor will not provide `priority` property, `10` will be used.
 *
 * If the highlight descriptor will not provide `id` property, name of the marker will be used.
 *
 * @param {module:engine/conversion/downcast-converters~HighlightDescriptor|Function} highlightDescriptor
 * @return {Function}
 */
export function highlightElement( highlightDescriptor ) {
	return ( evt, data, conversionApi ) => {
		if ( data.markerRange.isCollapsed ) {
			return;
		}

		if ( !( data.item instanceof ModelElement ) ) {
			return;
		}

		const descriptor = _prepareDescriptor( highlightDescriptor, data, conversionApi );

		if ( !descriptor ) {
			return;
		}

		if ( !conversionApi.consumable.test( data.item, evt.name ) ) {
			return;
		}

		const viewElement = conversionApi.mapper.toViewElement( data.item );

		if ( viewElement && viewElement.getCustomProperty( 'addHighlight' ) ) {
			// Consume element itself.
			conversionApi.consumable.consume( data.item, evt.name );

			// Consume all children nodes.
			for ( const value of ModelRange.createIn( data.item ) ) {
				conversionApi.consumable.consume( value.item, evt.name );
			}

			viewElement.getCustomProperty( 'addHighlight' )( viewElement, descriptor, conversionApi.writer );
		}
	};
}

/**
 * Function factory, creates a converter that converts model marker remove to the view.
 *
 * Both text nodes and elements are handled by this converter by they are handled a bit differently.
 *
 * Text nodes are unwrapped using {@link module:engine/view/attributeelement~AttributeElement} created from provided
 * highlight descriptor. See {link module:engine/conversion/downcast-converters~highlightDescriptorToAttributeElement}.
 *
 * For elements, the converter checks if an element has `removeHighlight` function stored as
 * {@link module:engine/view/element~Element#_setCustomProperty custom property}. If so, it uses it to remove the highlight.
 * In such case, children of that element will not be converted.
 *
 * When `removeHighlight` is not present, element is not converted in any special way.
 * Instead converter will proceed to convert element's child nodes.
 *
 * If the highlight descriptor will not provide `priority` property, `10` will be used.
 *
 * If the highlight descriptor will not provide `id` property, name of the marker will be used.
 *
 * @param {module:engine/conversion/downcast-converters~HighlightDescriptor|Function} highlightDescriptor
 * @return {Function}
 */
export function removeHighlight( highlightDescriptor ) {
	return ( evt, data, conversionApi ) => {
		// This conversion makes sense only for non-collapsed range.
		if ( data.markerRange.isCollapsed ) {
			return;
		}

		const descriptor = _prepareDescriptor( highlightDescriptor, data, conversionApi );

		if ( !descriptor ) {
			return;
		}

		const viewRange = conversionApi.mapper.toViewRange( data.markerRange );

		// Retrieve all items in the affected range. We will process them and remove highlight from them appropriately.
		const items = new Set( viewRange.getItems() );

		// First, iterate through all items and remove highlight from those container elements that have custom highlight handling.
		for ( const item of items ) {
			if ( item.is( 'containerElement' ) && item.getCustomProperty( 'removeHighlight' ) ) {
				item.getCustomProperty( 'removeHighlight' )( item, descriptor.id, conversionApi.writer );

				// If container element had custom handling, remove all it's children from further processing.
				for ( const descendant of ViewRange.createIn( item ) ) {
					items.delete( descendant );
				}
			}
		}

		// Then, iterate through all other items. Look for text nodes and unwrap them. Start from the end
		// to prevent errors when view structure changes when unwrapping (and, for example, some attributes are merged).
		const viewHighlightElement = createViewElementFromHighlightDescriptor( descriptor );
		const viewWriter = conversionApi.writer;

		for ( const item of Array.from( items ).reverse() ) {
			if ( item.is( 'textProxy' ) ) {
				viewWriter.unwrap( ViewRange.createOn( item ), viewHighlightElement );
			}
		}
	};
}

// Helper function for `highlight`. Prepares the actual descriptor object using value passed to the converter.
function _prepareDescriptor( highlightDescriptor, data, conversionApi ) {
	// If passed descriptor is a creator function, call it. If not, just use passed value.
	const descriptor = typeof highlightDescriptor == 'function' ?
		highlightDescriptor( data, conversionApi ) :
		highlightDescriptor;

	if ( !descriptor ) {
		return null;
	}

	// Apply default descriptor priority.
	if ( !descriptor.priority ) {
		descriptor.priority = 10;
	}

	// Default descriptor id is marker name.
	if ( !descriptor.id ) {
		descriptor.id = data.markerName;
	}

	return descriptor;
}

/**
 * Creates `span` {@link module:engine/view/attributeelement~AttributeElement view attribute element} from information
 * provided by {@link module:engine/conversion/downcast-converters~HighlightDescriptor} object. If priority
 * is not provided in descriptor - default priority will be used.
 *
 * @param {module:engine/conversion/downcast-converters~HighlightDescriptor} descriptor
 * @return {module:engine/conversion/downcast-converters~HighlightAttributeElement}
 */
export function createViewElementFromHighlightDescriptor( descriptor ) {
	const viewElement = new HighlightAttributeElement( 'span', descriptor.attributes );

	if ( descriptor.class ) {
		viewElement._addClass( descriptor.class );
	}

	if ( descriptor.priority ) {
		viewElement._priority = descriptor.priority;
	}

	viewElement._setCustomProperty( 'highlightDescriptorId', descriptor.id );

	return viewElement;
}

/**
 * Special kind of {@link module:engine/view/attributeelement~AttributeElement} that is created and used in
 * marker-to-highlight conversion.
 *
 * The difference between `HighlightAttributeElement` and {@link module:engine/view/attributeelement~AttributeElement}
 * is {@link module:engine/view/attributeelement~AttributeElement#isSimilar} method.
 *
 * For `HighlightAttributeElement` it checks just `highlightDescriptorId` custom property, that is set during marker-to-highlight
 * conversion basing on {@link module:engine/conversion/downcast-converters~HighlightDescriptor} object.
 * `HighlightAttributeElement`s with same `highlightDescriptorId` property are considered similar.
 */
class HighlightAttributeElement extends ViewAttributeElement {
	isSimilar( otherElement ) {
		if ( otherElement.is( 'attributeElement' ) ) {
			return this.getCustomProperty( 'highlightDescriptorId' ) === otherElement.getCustomProperty( 'highlightDescriptorId' );
		}

		return false;
	}
}

/**
 * Object describing how the marker highlight should be represented in the view.
 *
 * Each text node contained in a highlighted range will be wrapped in a `span` {@link module:engine/view/attributeelement~AttributeElement}
 * with CSS class(es), attributes and priority described by this object.
 *
 * Additionally, each {@link module:engine/view/containerelement~ContainerElement} can handle displaying the highlight separately
 * by providing `addHighlight` and `removeHighlight` custom properties. In this case:
 *
 *  * `HighlightDescriptor` object is passed to the `addHighlight` function upon conversion and should be used to apply the highlight to
 *  the element,
 *  * descriptor `id` is passed to the `removeHighlight` function upon conversion and should be used to remove the highlight of given
 *  id from the element.
 *
 * @typedef {Object} module:engine/conversion/downcast-converters~HighlightDescriptor
 *
 * @property {String|Array.<String>} class CSS class or array of classes to set. If descriptor is used to
 * create {@link module:engine/view/attributeelement~AttributeElement} over text nodes, those classes will be set
 * on that {@link module:engine/view/attributeelement~AttributeElement}. If descriptor is applied to an element,
 * usually those class will be set on that element, however this depends on how the element converts the descriptor.
 *
 * @property {String} [id] Descriptor identifier. If not provided, defaults to converted marker's name.
 *
 * @property {Number} [priority] Descriptor priority. If not provided, defaults to `10`. If descriptor is used to create
 * {@link module:engine/view/attributeelement~AttributeElement}, it will be that element's
 * {@link module:engine/view/attributeelement~AttributeElement#priority}. If descriptor is applied to an element,
 * the priority will be used to determine which descriptor is more important.
 *
 * @property {Object} [attributes] Attributes to set. If descriptor is used to create
 * {@link module:engine/view/attributeelement~AttributeElement} over text nodes, those attributes will be set on that
 * {@link module:engine/view/attributeelement~AttributeElement}. If descriptor is applied to an element, usually those
 * attributes will be set on that element, however this depends on how the element converts the descriptor.
 */
