/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Matcher from '../view/matcher';
import ModelRange from '../model/range';
import ConversionHelpers from './conversionhelpers';

import { cloneDeep } from 'lodash-es';
import ModelSelection from '../model/selection';

/* global console */

/**
 * Contains {@link module:engine/view/view view} to {@link module:engine/model/model model} converters for
 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher}.
 *
 * @module engine/conversion/upcasthelpers
 */

/**
 * Upcast conversion helper functions.
 *
 * @extends module:engine/conversion/conversionhelpers~ConversionHelpers
 */
export default class UpcastHelpers extends ConversionHelpers {
	/**
	 * View element to model element conversion helper.
	 *
	 * This conversion results in creating a model element. For example,
	 * view `<p>Foo</p>` becomes `<paragraph>Foo</paragraph>` in the model.
	 *
	 * Keep in mind that the element will be inserted only if it is allowed
	 * by {@link module:engine/model/schema~Schema schema} configuration.
	 *
	 *		editor.conversion.for( 'upcast' ).elementToElement( {
	 *			view: 'p',
	 *			model: 'paragraph'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToElement( {
	 *			view: 'p',
	 *			model: 'paragraph',
	 *			converterPriority: 'high'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToElement( {
	 *			view: {
	 *				name: 'p',
	 *				classes: 'fancy'
	 *			},
	 *			model: 'fancyParagraph'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToElement( {
	 * 			view: {
	 *				name: 'p',
	 *				classes: 'heading'
	 * 			},
	 * 			model: ( viewElement, modelWriter ) => {
	 * 				return modelWriter.createElement( 'heading', { level: viewElement.getAttribute( 'data-level' ) } );
	 * 			}
	 * 		} );
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @method #elementToElement
	 * @param {Object} config Conversion configuration.
	 * @param {module:engine/view/matcher~MatcherPattern} [config.view] Pattern matching all view elements which should be converted. If not
	 * set, the converter will fire for every view element.
	 * @param {String|module:engine/model/element~Element|Function} config.model Name of the model element, a model element
	 * instance or a function that takes a view element and returns a model element. The model element will be inserted in the model.
	 * @param {module:utils/priorities~PriorityString} [config.converterPriority='normal'] Converter priority.
	 * @returns {module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	elementToElement( config ) {
		return this.add( upcastElementToElement( config ) );
	}

	/**
	 * View element to model attribute conversion helper.
	 *
	 * This conversion results in setting an attribute on a model node. For example, view `<strong>Foo</strong>` becomes
	 * `Foo` {@link module:engine/model/text~Text model text node} with `bold` attribute set to `true`.
	 *
	 * This helper is meant to set a model attribute on all the elements that are inside the converted element:
	 *
	 *		<strong>Foo</strong>   -->   <strong><p>Foo</p></strong>   -->   <paragraph><$text bold="true">Foo</$text></paragraph>
	 *
	 * Above is a sample of HTML code, that goes through autoparagraphing (first step) and then is converted (second step).
	 * Even though `<strong>` is over `<p>` element, `bold="true"` was added to the text. See
	 * {@link module:engine/conversion/upcasthelpers~UpcastHelpers#attributeToAttribute} for comparison.
	 *
	 * Keep in mind that the attribute will be set only if it is allowed by {@link module:engine/model/schema~Schema schema} configuration.
	 *
	 *		editor.conversion.for( 'upcast' ).elementToAttribute( {
	 *			view: 'strong',
	 *			model: 'bold'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToAttribute( {
	 *			view: 'strong',
	 *			model: 'bold',
	 *			converterPriority: 'high'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToAttribute( {
	 *			view: {
	 *				name: 'span',
	 *				classes: 'bold'
	 *			},
	 *			model: 'bold'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToAttribute( {
	 *			view: {
	 *				name: 'span',
	 *				classes: [ 'styled', 'styled-dark' ]
	 *			},
	 *			model: {
	 *				key: 'styled',
	 *				value: 'dark'
	 *			}
	 *		} );
	 *
	 * 		editor.conversion.for( 'upcast' ).elementToAttribute( {
	 *			view: {
	 *				name: 'span',
	 *				styles: {
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
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @method #elementToAttribute
	 * @param {Object} config Conversion configuration.
	 * @param {module:engine/view/matcher~MatcherPattern} config.view Pattern matching all view elements which should be converted.
	 * @param {String|Object} config.model Model attribute key or an object with `key` and `value` properties, describing
	 * the model attribute. `value` property may be set as a function that takes a view element and returns the value.
	 * If `String` is given, the model attribute value will be set to `true`.
	 * @param {module:utils/priorities~PriorityString} [config.converterPriority='low'] Converter priority.
	 * @returns {module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	elementToAttribute( config ) {
		return this.add( upcastElementToAttribute( config ) );
	}

	/**
	 * View attribute to model attribute conversion helper.
	 *
	 * This conversion results in setting an attribute on a model node. For example, view `<img src="foo.jpg"></img>` becomes
	 * `<image source="foo.jpg"></image>` in the model.
	 *
	 * This helper is meant to convert view attributes from view elements which got converted to the model, so the view attribute
	 * is set only on the corresponding model node:
	 *
	 *		<div class="dark"><div>foo</div></div>    -->    <div dark="true"><div>foo</div></div>
	 *
	 * Above, `class="dark"` attribute is added only to the `<div>` elements that has it. This is in contrary to
	 * {@link module:engine/conversion/upcasthelpers~UpcastHelpers#elementToAttribute} which sets attributes for
	 * all the children in the model:
	 *
	 *		<strong>Foo</strong>   -->   <strong><p>Foo</p></strong>   -->   <paragraph><$text bold="true">Foo</$text></paragraph>
	 *
	 * Above is a sample of HTML code, that goes through autoparagraphing (first step) and then is converted (second step).
	 * Even though `<strong>` is over `<p>` element, `bold="true"` was added to the text.
	 *
	 * Keep in mind that the attribute will be set only if it is allowed by {@link module:engine/model/schema~Schema schema} configuration.
	 *
	 *		editor.conversion.for( 'upcast' ).attributeToAttribute( {
	 *			view: 'src',
	 *			model: 'source'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).attributeToAttribute( {
	 *			view: { key: 'src' },
	 *			model: 'source'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).attributeToAttribute( {
	 *			view: { key: 'src' },
	 *			model: 'source',
	 *			converterPriority: 'normal'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).attributeToAttribute( {
	 *			view: {
	 *				key: 'data-style',
	 *				value: /[\s\S]+/
	 *			},
	 *			model: 'styled'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).attributeToAttribute( {
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
	 *		editor.conversion.for( 'upcast' ).attributeToAttribute( {
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
	 * Converting styles works a bit differently as it requires `view.styles` to be an object and by default
	 * a model attribute will be set to `true` by such a converter. You can set the model attribute to any value by providing the `value`
	 * callback that returns the desired value.
	 *
	 *		// Default conversion of font-weight style will result in setting bold attribute to true.
	 *		editor.conversion.for( 'upcast' ).attributeToAttribute( {
	 *			view: {
	 *				styles: {
	 *					'font-weight': 'bold'
	 *				}
	 *			},
	 *			model: 'bold'
	 *		} );
	 *
	 *		// This converter will pass any style value to the `lineHeight` model attribute.
	 *		editor.conversion.for( 'upcast' ).attributeToAttribute( {
	 *			view: {
	 *				styles: {
	 *					'line-height': /[\s\S]+/
	 *				}
	 *			},
	 *			model: {
	 *				key: 'lineHeight',
	 *				value: viewElement => viewElement.getStyle( 'line-height' )
	 *			}
	 *		} );
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @method #attributeToAttribute
	 * @param {Object} config Conversion configuration.
	 * @param {String|Object} config.view Specifies which view attribute will be converted. If a `String` is passed,
	 * attributes with given key will be converted. If an `Object` is passed, it must have a required `key` property,
	 * specifying view attribute key, and may have an optional `value` property, specifying view attribute value and optional `name`
	 * property specifying a view element name from/on which the attribute should be converted. `value` can be given as a `String`,
	 * a `RegExp` or a function callback, that takes view attribute value as the only parameter and returns `Boolean`.
	 * @param {String|Object} config.model Model attribute key or an object with `key` and `value` properties, describing
	 * the model attribute. `value` property may be set as a function that takes a view element and returns the value.
	 * If `String` is given, the model attribute value will be same as view attribute value.
	 * @param {module:utils/priorities~PriorityString} [config.converterPriority='low'] Converter priority.
	 * @returns {module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	attributeToAttribute( config ) {
		return this.add( upcastAttributeToAttribute( config ) );
	}

	/**
	 * View element to model marker conversion helper.
	 *
	 * **Note**: This method was deprecated. Please use {@link #dataToMarker} instead.
	 *
	 * This conversion results in creating a model marker. For example, if the marker was stored in a view as an element:
	 * `<p>Fo<span data-marker="comment" data-comment-id="7"></span>o</p><p>B<span data-marker="comment" data-comment-id="7"></span>ar</p>`,
	 * after the conversion is done, the marker will be available in
	 * {@link module:engine/model/model~Model#markers model document markers}.
	 *
	 *		editor.conversion.for( 'upcast' ).elementToMarker( {
	 *			view: 'marker-search',
	 *			model: 'search'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToMarker( {
	 *			view: 'marker-search',
	 *			model: 'search',
	 *			converterPriority: 'high'
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToMarker( {
	 *			view: 'marker-search',
	 *			model: viewElement => 'comment:' + viewElement.getAttribute( 'data-comment-id' )
	 *		} );
	 *
	 *		editor.conversion.for( 'upcast' ).elementToMarker( {
	 *			view: {
	 *				name: 'span',
	 *				attributes: {
	 *					'data-marker': 'search'
	 *				}
	 *			},
	 *			model: 'search'
	 *		} );
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @deprecated
	 * @method #elementToMarker
	 * @param {Object} config Conversion configuration.
	 * @param {module:engine/view/matcher~MatcherPattern} config.view Pattern matching all view elements which should be converted.
	 * @param {String|Function} config.model Name of the model marker, or a function that takes a view element and returns
	 * a model marker name.
	 * @param {module:utils/priorities~PriorityString} [config.converterPriority='normal'] Converter priority.
	 * @returns {module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	elementToMarker( config ) {
		console.warn(
			'upcast-helpers-element-to-marker-deprecated: ' +
			'The UpcastHelpers#elementToMarker() method has been deprecated and will be removed in the near future. ' +
			'Please use #dataToMarker() method instead.' );

		return this.add( upcastElementToMarker( config ) );
	}

	/**
	 * View to model marker conversion helper.
	 *
	 * Converts view data created by {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToData `#markerToData()`} back to a model marker.
	 *
	 * This converter looks for specific view elements and view attributes that mark marker boundaries. See
	 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToData `#markerToData()`} to learn what view data is expected by this converter.
	 *
	 * The `config.view` property is equal to the marker group name to convert.
	 *
	 * By default, this converter creates markers with `group:name` name convention (to match the default `markerToData` conversion).
	 *
	 * The conversion configuration can take a function that will generate a marker name.
	 * If such function is set as the `config.model` parameter, it is passed the `name` part from the view element or attribute and it is
	 * expected to return a string with the marker name.
	 *
	 *		// Using the default conversion.
	 *		editor.conversion.for( 'upcast' ).dataToMarker( {
	 *			view: 'comment'
	 *		} );
	 *
	 *		// Using custom function which is the same as the default conversion:
	 *		editor.conversion.for( 'upcast' ).dataToMarker( {
	 *			view: 'comment',
	 *			model: name => 'comment:' + name,
	 *		} );
	 *
	 *		// Using converter priority:
	 *		editor.conversion.for( 'upcast' ).dataToMarker( {
	 *			view: 'comment',
	 *			model: name => 'comment:' + name,
	 *			converterPriority: 'high'
	 *		} );
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @method #dataToMarker
	 * @param {Object} config Conversion configuration.
	 * @param {String} config.view Marker group name to convert.
	 * @param {Function} [config.model] Function that takes `name` part from the view element or attribute and returns the marker name.
	 * @param {module:utils/priorities~PriorityString} [config.converterPriority='normal'] Converter priority.
	 * @returns {module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	dataToMarker( config ) {
		return this.add( upcastDataToMarker( config ) );
	}
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

				data.modelRange = ModelRange._createFromPositionAndShift( data.modelCursor, text.offsetSize );
				data.modelCursor = data.modelRange.end;
			}
		}
	};
}

/**
 * Function factory, creates a callback function which converts a {@link module:engine/view/selection~Selection
 * view selection} taken from the {@link module:engine/view/document~Document#event:selectionChange} event
 * and sets in on the {@link module:engine/model/document~Document#selection model}.
 *
 * **Note**: because there is no view selection change dispatcher nor any other advanced view selection to model
 * conversion mechanism, the callback should be set directly on view document.
 *
 *		view.document.on( 'selectionChange', convertSelectionChange( modelDocument, mapper ) );
 *
 * @param {module:engine/model/model~Model} model Data model.
 * @param {module:engine/conversion/mapper~Mapper} mapper Conversion mapper.
 * @returns {Function} {@link module:engine/view/document~Document#event:selectionChange} callback function.
 */
export function convertSelectionChange( model, mapper ) {
	return ( evt, data ) => {
		const viewSelection = data.newSelection;
		const modelSelection = new ModelSelection();

		const ranges = [];

		for ( const viewRange of viewSelection.getRanges() ) {
			ranges.push( mapper.toModelRange( viewRange ) );
		}

		modelSelection.setTo( ranges, { backward: viewSelection.isBackward } );

		if ( !modelSelection.isEqual( model.document.selection ) ) {
			model.change( writer => {
				writer.setSelection( modelSelection );
			} );
		}
	};
}

// View element to model element conversion helper.
//
// See {@link ~UpcastHelpers#elementToElement `.elementToElement()` upcast helper} for examples.
//
// @param {Object} config Conversion configuration.
// @param {module:engine/view/matcher~MatcherPattern} [config.view] Pattern matching all view elements which should be converted. If not
// set, the converter will fire for every view element.
// @param {String|module:engine/model/element~Element|Function} config.model Name of the model element, a model element
// instance or a function that takes a view element and returns a model element. The model element will be inserted in the model.
// @param {module:utils/priorities~PriorityString} [config.converterPriority='normal'] Converter priority.
// @returns {Function} Conversion helper.
function upcastElementToElement( config ) {
	config = cloneDeep( config );

	const converter = prepareToElementConverter( config );

	const elementName = getViewElementNameFromConfig( config.view );
	const eventName = elementName ? 'element:' + elementName : 'element';

	return dispatcher => {
		dispatcher.on( eventName, converter, { priority: config.converterPriority || 'normal' } );
	};
}

// View element to model attribute conversion helper.
//
// See {@link ~UpcastHelpers#elementToAttribute `.elementToAttribute()` upcast helper} for examples.
//
// @param {Object} config Conversion configuration.
// @param {module:engine/view/matcher~MatcherPattern} config.view Pattern matching all view elements which should be converted.
// @param {String|Object} config.model Model attribute key or an object with `key` and `value` properties, describing
// the model attribute. `value` property may be set as a function that takes a view element and returns the value.
// If `String` is given, the model attribute value will be set to `true`.
// @param {module:utils/priorities~PriorityString} [config.converterPriority='low'] Converter priority.
// @returns {Function} Conversion helper.
function upcastElementToAttribute( config ) {
	config = cloneDeep( config );

	normalizeModelAttributeConfig( config );

	const converter = prepareToAttributeConverter( config, false );

	const elementName = getViewElementNameFromConfig( config.view );
	const eventName = elementName ? 'element:' + elementName : 'element';

	return dispatcher => {
		dispatcher.on( eventName, converter, { priority: config.converterPriority || 'low' } );
	};
}

// View attribute to model attribute conversion helper.
//
// See {@link ~UpcastHelpers#attributeToAttribute `.attributeToAttribute()` upcast helper} for examples.
//
// @param {Object} config Conversion configuration.
// @param {String|Object} config.view Specifies which view attribute will be converted. If a `String` is passed,
// attributes with given key will be converted. If an `Object` is passed, it must have a required `key` property,
// specifying view attribute key, and may have an optional `value` property, specifying view attribute value and optional `name`
// property specifying a view element name from/on which the attribute should be converted. `value` can be given as a `String`,
// a `RegExp` or a function callback, that takes view attribute value as the only parameter and returns `Boolean`.
// @param {String|Object} config.model Model attribute key or an object with `key` and `value` properties, describing
// the model attribute. `value` property may be set as a function that takes a view element and returns the value.
// If `String` is given, the model attribute value will be same as view attribute value.
// @param {module:utils/priorities~PriorityString} [config.converterPriority='low'] Converter priority.
// @returns {Function} Conversion helper.
function upcastAttributeToAttribute( config ) {
	config = cloneDeep( config );

	let viewKey = null;

	if ( typeof config.view == 'string' || config.view.key ) {
		viewKey = normalizeViewAttributeKeyValueConfig( config );
	}

	normalizeModelAttributeConfig( config, viewKey );

	const converter = prepareToAttributeConverter( config, true );

	return dispatcher => {
		dispatcher.on( 'element', converter, { priority: config.converterPriority || 'low' } );
	};
}

// View element to model marker conversion helper.
//
// See {@link ~UpcastHelpers#elementToMarker `.elementToMarker()` upcast helper} for examples.
//
// @param {Object} config Conversion configuration.
// @param {module:engine/view/matcher~MatcherPattern} config.view Pattern matching all view elements which should be converted.
// @param {String|Function} config.model Name of the model marker, or a function that takes a view element and returns
// a model marker name.
// @param {module:utils/priorities~PriorityString} [config.converterPriority='normal'] Converter priority.
// @returns {Function} Conversion helper.
function upcastElementToMarker( config ) {
	config = cloneDeep( config );

	normalizeElementToMarkerConfig( config );

	return upcastElementToElement( config );
}

// View data to model marker conversion helper.
//
// See {@link ~UpcastHelpers#dataToMarker} to learn more.
//
// @param {Object} config
// @param {String} config.view
// @param {Function} [config.model]
// @param {module:utils/priorities~PriorityString} [config.converterPriority='normal']
// @returns {Function} Conversion helper.
function upcastDataToMarker( config ) {
	config = cloneDeep( config );

	// Default conversion.
	if ( !config.model ) {
		config.model = name => {
			return name ? config.view + ':' + name : config.view;
		};
	}

	const converterStart = prepareToElementConverter( normalizeDataToMarkerConfig( config, 'start' ) );
	const converterEnd = prepareToElementConverter( normalizeDataToMarkerConfig( config, 'end' ) );

	return dispatcher => {
		dispatcher.on( 'element:' + config.view + '-start', converterStart, { priority: config.converterPriority || 'normal' } );
		dispatcher.on( 'element:' + config.view + '-end', converterEnd, { priority: config.converterPriority || 'normal' } );

		// This is attribute upcast so it has to be done after the element upcast.
		dispatcher.on( 'element', upcastAttributeToMarker( config ), { priority: config.converterPriority || 'low' } );
	};
}

// Function factory, returns a callback function which converts view attributes to a model marker.
//
// The converter looks for elements with `data-group-start-before`, `data-group-start-after`, `data-group-end-before`
// and `data-group-end-after` attributes and inserts `$marker` model elements before/after those elements.
// `group` part is specified in `config.view`.
//
// @param {Object} config
// @param {String} config.view
// @param {Function} [config.model]
// @returns {Function} Marker converter.
function upcastAttributeToMarker( config ) {
	return ( evt, data, conversionApi ) => {
		const attrName = `data-${ config.view }`;

		if ( conversionApi.consumable.consume( data.viewItem, { attributes: attrName + '-end-after' } ) ) {
			addMarkerElements( data.modelRange.end, data.viewItem.getAttribute( attrName + '-end-after' ).split( ',' ) );
		}

		if ( conversionApi.consumable.consume( data.viewItem, { attributes: attrName + '-start-after' } ) ) {
			addMarkerElements( data.modelRange.end, data.viewItem.getAttribute( attrName + '-start-after' ).split( ',' ) );
		}

		if ( conversionApi.consumable.consume( data.viewItem, { attributes: attrName + '-end-before' } ) ) {
			addMarkerElements( data.modelRange.start, data.viewItem.getAttribute( attrName + '-end-before' ).split( ',' ) );
		}

		if ( conversionApi.consumable.consume( data.viewItem, { attributes: attrName + '-start-before' } ) ) {
			addMarkerElements( data.modelRange.start, data.viewItem.getAttribute( attrName + '-start-before' ).split( ',' ) );
		}

		function addMarkerElements( position, markerViewNames ) {
			for ( const markerViewName of markerViewNames ) {
				const markerName = config.model( markerViewName );
				const element = conversionApi.writer.createElement( '$marker', { 'data-name': markerName } );

				conversionApi.writer.insert( element, position );

				if ( data.modelCursor.isEqual( position ) ) {
					data.modelCursor = data.modelCursor.getShiftedBy( 1 );
				} else {
					data.modelCursor = data.modelCursor._getTransformedByInsertion( position, 1 );
				}

				data.modelRange = data.modelRange._getTransformedByInsertion( position, 1 )[ 0 ];
			}
		}
	};
}

// Helper function for from-view-element conversion. Checks if `config.view` directly specifies converted view element's name
// and if so, returns it.
//
// @param {Object} config Conversion view config.
// @returns {String|null} View element name or `null` if name is not directly set.
function getViewElementNameFromConfig( viewConfig ) {
	if ( typeof viewConfig == 'string' ) {
		return viewConfig;
	}

	if ( typeof viewConfig == 'object' && typeof viewConfig.name == 'string' ) {
		return viewConfig.name;
	}

	return null;
}

// Helper for to-model-element conversion. Takes a config object and returns a proper converter function.
//
// @param {Object} config Conversion configuration.
// @returns {Function} View to model converter.
function prepareToElementConverter( config ) {
	const matcher = config.view ? new Matcher( config.view ) : null;

	return ( evt, data, conversionApi ) => {
		let match = {};

		// If `config.view` has not been passed do not try matching. In this case, the converter should fire for all elements.
		if ( matcher ) {
			// This will be usually just one pattern but we support matchers with many patterns too.
			const matcherResult = matcher.match( data.viewItem );

			// If there is no match, this callback should not do anything.
			if ( !matcherResult ) {
				return;
			}

			match = matcherResult.match;
		}

		// Force consuming element's name.
		match.name = true;

		// Create model element basing on config.
		const modelElement = getModelElement( config.model, data.viewItem, conversionApi.writer );

		// Do not convert if element building function returned falsy value.
		if ( !modelElement ) {
			return;
		}

		// When element was already consumed then skip it.
		if ( !conversionApi.consumable.test( data.viewItem, match ) ) {
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
		conversionApi.convertChildren( data.viewItem, conversionApi.writer.createPositionAt( modelElement, 0 ) );

		// Consume appropriate value from consumable values list.
		conversionApi.consumable.consume( data.viewItem, match );

		const parts = conversionApi.getSplitParts( modelElement );

		// Set conversion result range.
		data.modelRange = new ModelRange(
			conversionApi.writer.createPositionBefore( modelElement ),
			conversionApi.writer.createPositionAfter( parts[ parts.length - 1 ] )
		);

		// Now we need to check where the `modelCursor` should be.
		if ( splitResult.cursorParent ) {
			// If we split parent to insert our element then we want to continue conversion in the new part of the split parent.
			//
			// before: <allowed><notAllowed>foo[]</notAllowed></allowed>
			// after:  <allowed><notAllowed>foo</notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>

			data.modelCursor = conversionApi.writer.createPositionAt( splitResult.cursorParent, 0 );
		} else {
			// Otherwise just continue after inserted element.

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
function getModelElement( model, input, writer ) {
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
function normalizeViewAttributeKeyValueConfig( config ) {
	if ( typeof config.view == 'string' ) {
		config.view = { key: config.view };
	}

	const key = config.view.key;
	let normalized;

	if ( key == 'class' || key == 'style' ) {
		const keyName = key == 'class' ? 'classes' : 'styles';

		normalized = {
			[ keyName ]: config.view.value
		};
	} else {
		const value = typeof config.view.value == 'undefined' ? /[\s\S]*/ : config.view.value;

		normalized = {
			attributes: {
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
// @param {String} viewAttributeKeyToCopy Key of the converted view attribute. If it is set, model attribute value
// will be equal to view attribute value.
function normalizeModelAttributeConfig( config, viewAttributeKeyToCopy = null ) {
	const defaultModelValue = viewAttributeKeyToCopy === null ? true : viewElement => viewElement.getAttribute( viewAttributeKeyToCopy );

	const key = typeof config.model != 'object' ? config.model : config.model.key;
	const value = typeof config.model != 'object' || typeof config.model.value == 'undefined' ? defaultModelValue : config.model.value;

	config.model = { key, value };
}

// Helper for to-model-attribute conversion. Takes the model attribute name and conversion configuration and returns
// a proper converter function.
//
// @param {String} modelAttributeKey The key of the model attribute to set on a model node.
// @param {Object|Array.<Object>} config Conversion configuration. It is possible to provide multiple configurations in an array.
// @param {Boolean} shallow If set to `true` the attribute will be set only on top-level nodes. Otherwise, it will be set
// on all elements in the range.
function prepareToAttributeConverter( config, shallow ) {
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

		if ( onlyViewNameIsDefined( config.view, data.viewItem ) ) {
			match.match.name = true;
		} else {
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
			data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		// Set attribute on current `output`. `Schema` is checked inside this helper function.
		const attributeWasSet = setAttributeOn( data.modelRange, { key: modelKey, value: modelValue }, shallow, conversionApi );

		if ( attributeWasSet ) {
			conversionApi.consumable.consume( data.viewItem, match.match );
		}
	};
}

// Helper function that checks if element name should be consumed in attribute converters.
//
// @param {Object} config Conversion view config.
// @returns {Boolean}
function onlyViewNameIsDefined( viewConfig, viewItem ) {
	// https://github.com/ckeditor/ckeditor5-engine/issues/1786
	const configToTest = typeof viewConfig == 'function' ? viewConfig( viewItem ) : viewConfig;

	if ( typeof configToTest == 'object' && !getViewElementNameFromConfig( configToTest ) ) {
		return false;
	}

	return !configToTest.classes && !configToTest.attributes && !configToTest.styles;
}

// Helper function for to-model-attribute converter. Sets model attribute on given range. Checks {@link module:engine/model/schema~Schema}
// to ensure proper model structure.
//
// @param {module:engine/model/range~Range} modelRange Model range on which attribute should be set.
// @param {Object} modelAttribute Model attribute to set.
// @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion API.
// @param {Boolean} shallow If set to `true` the attribute will be set only on top-level nodes. Otherwise, it will be set
// on all elements in the range.
// @returns {Boolean} `true` if attribute was set on at least one node from given `modelRange`.
function setAttributeOn( modelRange, modelAttribute, shallow, conversionApi ) {
	let result = false;

	// Set attribute on each item in range according to Schema.
	for ( const node of Array.from( modelRange.getItems( { shallow } ) ) ) {
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
function normalizeElementToMarkerConfig( config ) {
	const oldModel = config.model;

	config.model = ( viewElement, modelWriter ) => {
		const markerName = typeof oldModel == 'string' ? oldModel : oldModel( viewElement );

		return modelWriter.createElement( '$marker', { 'data-name': markerName } );
	};
}

// Helper function for upcasting-to-marker conversion. Takes the config in a format requested by `upcastDataToMarker()`
// function and converts it to a format that is supported by `upcastElementToElement()` function.
//
// @param {Object} config Conversion configuration.
function normalizeDataToMarkerConfig( config, type ) {
	const configForElements = {};

	// Upcast <markerGroup-start> and <markerGroup-end> elements.
	configForElements.view = config.view + '-' + type;

	configForElements.model = ( viewElement, modelWriter ) => {
		const viewName = viewElement.getAttribute( 'name' );
		const markerName = config.model( viewName );

		return modelWriter.createElement( '$marker', { 'data-name': markerName } );
	};

	return configForElements;
}
