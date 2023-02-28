/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * Contains downcast (model-to-view) converters for {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}.
 *
 * @module engine/conversion/downcasthelpers
 */

import ModelRange from '../model/range';
import ModelSelection from '../model/selection';
import ModelDocumentSelection from '../model/documentselection';
import ModelElement from '../model/element';
import ModelPosition from '../model/position';

import ViewAttributeElement from '../view/attributeelement';
import ConversionHelpers from './conversionhelpers';

import type {
	default as DowncastDispatcher,
	DiffItemReinsert,
	DowncastConversionApi,
	DowncastInsertEvent,
	DowncastAddMarkerEvent,
	DowncastAttributeEvent,
	DowncastReduceChangesEvent,
	DowncastRemoveMarkerEvent
} from './downcastdispatcher';
import type ModelConsumable from './modelconsumable';
import type { DiffItem } from '../model/differ';
import type ModelNode from '../model/node';
import type ModelItem from '../model/item';
import type ModelTextProxy from '../model/textproxy';
import type ModelText from '../model/text';

import type DowncastWriter from '../view/downcastwriter';
import type ElementDefinition from '../view/elementdefinition';
import type ViewDocumentFragment from '../view/documentfragment';
import type UIElement from '../view/uielement';
import type ViewElement from '../view/element';
import type ViewNode from '../view/node';
import type ViewPosition from '../view/position';
import type ViewRange from '../view/range';
import type {
	default as Mapper,
	MapperModelToViewPositionEvent
} from './mapper';

import {
	CKEditorError,
	toArray,
	type EventInfo,
	type PriorityString
} from '@ckeditor/ckeditor5-utils';

import { cloneDeep } from 'lodash-es';

/**
 * Downcast conversion helper functions.
 *
 * Learn more about {@glink framework/deep-dive/conversion/downcast downcast helpers}.
 *
 * @extends module:engine/conversion/conversionhelpers~ConversionHelpers
 */
export default class DowncastHelpers extends ConversionHelpers<DowncastDispatcher> {
	/**
	 * Model element to view element conversion helper.
	 *
	 * This conversion results in creating a view element. For example, model `<paragraph>Foo</paragraph>` becomes `<p>Foo</p>` in the view.
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).elementToElement( {
	 * 	model: 'paragraph',
	 * 	view: 'p'
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).elementToElement( {
	 * 	model: 'paragraph',
	 * 	view: 'div',
	 * 	converterPriority: 'high'
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).elementToElement( {
	 * 	model: 'fancyParagraph',
	 * 	view: {
	 * 		name: 'p',
	 * 		classes: 'fancy'
	 * 	}
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).elementToElement( {
	 * 	model: 'heading',
	 * 	view: ( modelElement, conversionApi ) => {
	 * 		const { writer } = conversionApi;
	 *
	 * 		return writer.createContainerElement( 'h' + modelElement.getAttribute( 'level' ) );
	 * 	}
	 * } );
	 * ```
	 *
	 * The element-to-element conversion supports the reconversion mechanism. It can be enabled by using either the `attributes` or
	 * the `children` props on a model description. You will find a couple examples below.
	 *
	 * In order to reconvert an element if any of its direct children have been added or removed, use the `children` property on a `model`
	 * description. For example, this model:
	 *
	 * ```xml
	 * <box>
	 * 	<paragraph>Some text.</paragraph>
	 * </box>
	 * ```
	 *
	 * will be converted into this structure in the view:
	 *
	 * ```html
	 * <div class="box" data-type="single">
	 * 	<p>Some text.</p>
	 * </div>
	 * ```
	 *
	 * But if more items were inserted in the model:
	 *
	 * ```xml
	 * <box>
	 * 	<paragraph>Some text.</paragraph>
	 * 	<paragraph>Other item.</paragraph>
	 * </box>
	 * ```
	 *
	 * it will be converted into this structure in the view (note the element `data-type` change):
	 *
	 * ```html
	 * <div class="box" data-type="multiple">
	 * 	<p>Some text.</p>
	 * 	<p>Other item.</p>
	 * </div>
	 * ```
	 *
	 * Such a converter would look like this (note that the `paragraph` elements are converted separately):
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).elementToElement( {
	 * 	model: {
	 * 		name: 'box',
	 * 		children: true
	 * 	},
	 * 	view: ( modelElement, conversionApi ) => {
	 * 		const { writer } = conversionApi;
	 *
	 * 		return writer.createContainerElement( 'div', {
	 * 			class: 'box',
	 * 			'data-type': modelElement.childCount == 1 ? 'single' : 'multiple'
	 * 		} );
	 * 	}
	 * } );
	 * ```
	 *
	 * In order to reconvert element if any of its attributes have been updated, use the `attributes` property on a `model`
	 * description. For example, this model:
	 *
	 * ```xml
	 * <heading level="2">Some text.</heading>
	 * ```
	 *
	 * will be converted into this structure in the view:
	 *
	 * ```html
	 * <h2>Some text.</h2>
	 * ```
	 *
	 * But if the `heading` element's `level` attribute has been updated to `3` for example, then
	 * it will be converted into this structure in the view:
	 *
	 * ```html
	 * <h3>Some text.</h3>
	 * ```
	 *
	 * Such a converter would look as follows:
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).elementToElement( {
	 * 	model: {
	 * 		name: 'heading',
	 * 		attributes: 'level'
	 * 	},
	 * 	view: ( modelElement, conversionApi ) => {
	 * 		const { writer } = conversionApi;
	 *
	 * 		return writer.createContainerElement( 'h' + modelElement.getAttribute( 'level' ) );
	 * 	}
	 * } );
	 * ```
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * You can read more about the element-to-element conversion in the
	 * {@glink framework/deep-dive/conversion/downcast downcast conversion} guide.
	 *
	 * @param config Conversion configuration.
	 * @param config.model The description or a name of the model element to convert.
	 * @param config.model.attributes The list of attribute names that should be consumed while creating
	 * the view element. Note that the view will be reconverted if any of the listed attributes changes.
 	 * @param config.model.children Specifies whether the view element requires reconversion if the list
	 * of the model child nodes changed.
	 * @param config.view A view element definition or a function that takes the model element and
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
	 * as parameters and returns a view container element.
	 */
	public elementToElement( config: {
		model: string | {
			name: string;
			attributes?: string | Array<string>;
			children?: boolean;
		};
		view: ElementDefinition | ElementCreatorFunction;
		converterPriority?: PriorityString;
	} ): this {
		return this.add( downcastElementToElement( config ) );
	}

	/**
	 * The model element to view structure (several elements) conversion helper.
	 *
	 * This conversion results in creating a view structure with one or more slots defined for the child nodes.
	 * For example, a model `<table>` may become this structure in the view:
	 *
	 * ```html
	 * <figure class="table">
	 * 	<table>
	 * 		<tbody>${ slot for table rows }</tbody>
	 * 	</table>
	 * </figure>
	 * ```
	 *
	 * The children of the model's `<table>` element will be inserted into the `<tbody>` element.
	 * If the `elementToElement()` helper was used, the children would be inserted into the `<figure>`.
	 *
	 * An example converter that converts the following model structure:
	 *
	 * ```xml
	 * <wrappedParagraph>Some text.</wrappedParagraph>
	 * ```
	 *
	 * into this structure in the view:
	 *
	 * ```html
	 * <div class="wrapper">
	 * 	<p>Some text.</p>
	 * </div>
	 * ```
	 *
	 * would look like this:
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).elementToStructure( {
	 * 	model: 'wrappedParagraph',
	 * 	view: ( modelElement, conversionApi ) => {
	 * 		const { writer } = conversionApi;
	 *
	 * 		const wrapperViewElement = writer.createContainerElement( 'div', { class: 'wrapper' } );
	 * 		const paragraphViewElement = writer.createContainerElement( 'p' );
	 *
	 * 		writer.insert( writer.createPositionAt( wrapperViewElement, 0 ), paragraphViewElement );
	 * 		writer.insert( writer.createPositionAt( paragraphViewElement, 0 ), writer.createSlot() );
	 *
	 * 		return wrapperViewElement;
	 * 	}
	 * } );
	 * ```
	 *
	 * The `slorFor()` function can also take a callback that allows filtering which children of the model element
	 * should be converted into this slot.
	 *
	 * Imagine a table feature where for this model structure:
	 *
	 * ```xml
	 * <table headingRows="1">
	 * 	<tableRow> ... table cells 1 ... </tableRow>
	 * 	<tableRow> ... table cells 2 ... </tableRow>
	 * 	<tableRow> ... table cells 3 ... </tableRow>
	 * 	<caption>Caption text</caption>
	 * </table>
	 * ```
	 *
	 * we want to generate this view structure:
	 *
	 * ```html
	 * <figure class="table">
	 * 	<table>
	 * 		<thead>
	 * 			<tr> ... table cells 1 ... </tr>
	 * 		</thead>
	 * 		<tbody>
	 * 			<tr> ... table cells 2 ... </tr>
	 * 			<tr> ... table cells 3 ... </tr>
	 * 		</tbody>
	 * 	</table>
	 * 	<figcaption>Caption text</figcaption>
	 * </figure>
	 * ```
	 *
	 * The converter has to take the `headingRows` attribute into consideration when allocating the `<tableRow>` elements
	 * into the `<tbody>` and `<thead>` elements. Hence, we need two slots and need to define proper filter callbacks for them.
	 *
	 * Additionally, all elements other than `<tableRow>` should be placed outside the `<table>` tag.
	 * In the example above, this will handle the table caption.
	 *
	 * Such a converter would look like this:
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).elementToStructure( {
	 * 	model: {
	 * 		name: 'table',
	 * 		attributes: [ 'headingRows' ]
	 * 	},
	 * 	view: ( modelElement, conversionApi ) => {
	 * 		const { writer } = conversionApi;
	 *
	 * 		const figureElement = writer.createContainerElement( 'figure', { class: 'table' } );
	 * 		const tableElement = writer.createContainerElement( 'table' );
	 *
	 * 		writer.insert( writer.createPositionAt( figureElement, 0 ), tableElement );
	 *
	 * 		const headingRows = modelElement.getAttribute( 'headingRows' ) || 0;
	 *
	 * 		if ( headingRows > 0 ) {
	 * 			const tableHead = writer.createContainerElement( 'thead' );
	 *
	 * 			const headSlot = writer.createSlot( node => node.is( 'element', 'tableRow' ) && node.index < headingRows );
	 *
	 * 			writer.insert( writer.createPositionAt( tableElement, 'end' ), tableHead );
	 * 			writer.insert( writer.createPositionAt( tableHead, 0 ), headSlot );
	 * 		}
	 *
	 * 		if ( headingRows < tableUtils.getRows( table ) ) {
	 * 			const tableBody = writer.createContainerElement( 'tbody' );
	 *
	 * 			const bodySlot = writer.createSlot( node => node.is( 'element', 'tableRow' ) && node.index >= headingRows );
	 *
	 * 			writer.insert( writer.createPositionAt( tableElement, 'end' ), tableBody );
	 * 			writer.insert( writer.createPositionAt( tableBody, 0 ), bodySlot );
	 * 		}
	 *
	 * 		const restSlot = writer.createSlot( node => !node.is( 'element', 'tableRow' ) );
	 *
	 * 		writer.insert( writer.createPositionAt( figureElement, 'end' ), restSlot );
	 *
	 * 		return figureElement;
	 * 	}
	 * } );
	 * ```
	 *
	 * Note: The children of a model element that's being converted must be allocated in the same order in the view
	 * in which they are placed in the model.
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @param config Conversion configuration.
 	 * @param config.model The description or a name of the model element to convert.
	 * @param config.model.name The name of the model element to convert.
 	 * @param config.model.attributes The list of attribute names that should be consumed while creating
	 * the view structure. Note that the view will be reconverted if any of the listed attributes will change.
	 * @param config.view A function that takes the model element and
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as parameters
	 * and returns a view container element with slots for model child nodes to be converted into.
	 */
	public elementToStructure( config: {
		model: string | {
			name: string;
			attributes?: string | Array<string>;
		};
		view: StructureCreatorFunction;
		converterPriority?: PriorityString;
	} ): this {
		return this.add( downcastElementToStructure( config ) );
	}

	/**
	 * Model attribute to view element conversion helper.
	 *
	 * This conversion results in wrapping view nodes with a view attribute element. For example, a model text node with
	 * `"Foo"` as data and the `bold` attribute becomes `<strong>Foo</strong>` in the view.
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).attributeToElement( {
	 * 	model: 'bold',
	 * 	view: 'strong'
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToElement( {
	 * 	model: 'bold',
	 * 	view: 'b',
	 * 	converterPriority: 'high'
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToElement( {
	 * 	model: 'invert',
	 * 	view: {
	 * 		name: 'span',
	 * 		classes: [ 'font-light', 'bg-dark' ]
	 * 	}
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToElement( {
	 * 	model: {
	 * 		key: 'fontSize',
	 * 		values: [ 'big', 'small' ]
	 * 	},
	 * 	view: {
	 * 		big: {
	 * 			name: 'span',
	 * 			styles: {
	 * 				'font-size': '1.2em'
	 * 			}
	 * 		},
	 * 		small: {
	 * 			name: 'span',
	 * 			styles: {
	 * 				'font-size': '0.8em'
	 * 			}
	 * 		}
	 * 	}
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToElement( {
	 * 	model: 'bold',
	 * 	view: ( modelAttributeValue, conversionApi ) => {
	 * 		const { writer } = conversionApi;
	 *
	 * 		return writer.createAttributeElement( 'span', {
	 * 			style: 'font-weight:' + modelAttributeValue
	 * 		} );
	 * 	}
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToElement( {
	 * 	model: {
	 * 		key: 'color',
	 * 		name: '$text'
	 * 	},
	 * 	view: ( modelAttributeValue, conversionApi ) => {
	 * 		const { writer } = conversionApi;
	 *
	 * 		return writer.createAttributeElement( 'span', {
	 * 			style: 'color:' + modelAttributeValue
	 * 		} );
	 * 	}
	 * } );
	 * ```
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @param config Conversion configuration.
	 * @param config.model The key of the attribute to convert from or a `{ key, values }` object. `values` is an array
	 * of `String`s with possible values if the model attribute is an enumerable.
	 * @param config.view A view element definition or a function
	 * that takes the model attribute value and
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as parameters and returns a view
	 * attribute element. If `config.model.values` is given, `config.view` should be an object assigning values from `config.model.values`
	 * to view element definitions or functions.
	 * @param config.converterPriority Converter priority.
	 */
	public attributeToElement<TValues extends string>(
		config: {
			model: string | {
				key: string;
				name?: string;
			};
			view: ElementDefinition | AttributeElementCreatorFunction;
			converterPriority?: PriorityString;
		} | {
			model: {
				key: string;
				name?: string;
				values: Array<TValues>;
			};
			view: Record<TValues, ElementDefinition | AttributeElementCreatorFunction>;
			converterPriority?: PriorityString;
		}
	): this {
		return this.add( downcastAttributeToElement( config ) );
	}

	/**
	 * Model attribute to view attribute conversion helper.
	 *
	 * This conversion results in adding an attribute to a view node, basing on an attribute from a model node. For example,
	 * `<imageInline src='foo.jpg'></imageInline>` is converted to `<img src='foo.jpg'></img>`.
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).attributeToAttribute( {
	 * 	model: 'source',
	 * 	view: 'src'
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToAttribute( {
	 * 	model: 'source',
	 * 	view: 'href',
	 * 	converterPriority: 'high'
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToAttribute( {
	 * 	model: {
	 * 		name: 'imageInline',
	 * 		key: 'source'
	 * 	},
	 * 	view: 'src'
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToAttribute( {
	 * 	model: {
	 * 		name: 'styled',
	 * 		values: [ 'dark', 'light' ]
	 * 	},
	 * 	view: {
	 * 		dark: {
	 * 			key: 'class',
	 * 			value: [ 'styled', 'styled-dark' ]
	 * 		},
	 * 		light: {
	 * 			key: 'class',
	 * 			value: [ 'styled', 'styled-light' ]
	 * 		}
	 * 	}
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).attributeToAttribute( {
	 * 	model: 'styled',
	 * 	view: modelAttributeValue => ( {
	 * 		key: 'class',
	 * 		value: 'styled-' + modelAttributeValue
	 * 	} )
	 * } );
	 * ```
	 *
	 * **Note**: Downcasting to a style property requires providing `value` as an object:
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).attributeToAttribute( {
	 * 	model: 'lineHeight',
	 * 	view: modelAttributeValue => ( {
	 * 		key: 'style',
	 * 		value: {
	 * 			'line-height': modelAttributeValue,
	 * 			'border-bottom': '1px dotted #ba2'
	 * 		}
	 * 	} )
	 * } );
	 * ```
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @param config Conversion configuration.
	 * @param config.model The key of the attribute to convert from or a `{ key, values, [ name ] }` object describing
	 * the attribute key, possible values and, optionally, an element name to convert from.
	 * @param config.view A view attribute key, or a `{ key, value }` object or a function that takes the model attribute value and
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
	 * as parameters and returns a `{ key, value }` object. If the `key` is `'class'`, the `value` can be a `String` or an
	 * array of `String`s. If the `key` is `'style'`, the `value` is an object with key-value pairs. In other cases, `value` is a `String`.
	 * If `config.model.values` is set, `config.view` should be an object assigning values from `config.model.values` to
	 * `{ key, value }` objects or a functions.
	 * @param config.converterPriority Converter priority.
	 */
	public attributeToAttribute<TValues extends string>(
		config: {
			model: string | {
				key: string;
				name?: string;
			};
			view: string | AttributeDescriptor | AttributeCreatorFunction;
			converterPriority?: PriorityString;
		} | {
			model: {
				key: string;
				name?: string;
				values?: Array<TValues>;
			};
			view: Record<TValues, AttributeDescriptor | AttributeCreatorFunction>;
			converterPriority?: PriorityString;
		}
	): this {
		return this.add( downcastAttributeToAttribute( config ) );
	}

	/**
	 * Model marker to view element conversion helper.
	 *
	 * **Note**: This method should be used mainly for editing the downcast and it is recommended
	 * to use the {@link #markerToData `#markerToData()`} helper instead.
	 *
	 * This helper may produce invalid HTML code (e.g. a span between table cells).
	 * It should only be used when you are sure that the produced HTML will be semantically correct.
	 *
	 * This conversion results in creating a view element on the boundaries of the converted marker. If the converted marker
	 * is collapsed, only one element is created. For example, a model marker set like this: `<paragraph>F[oo b]ar</paragraph>`
	 * becomes `<p>F<span data-marker="search"></span>oo b<span data-marker="search"></span>ar</p>` in the view.
	 *
	 * ```ts
	 * editor.conversion.for( 'editingDowncast' ).markerToElement( {
	 * 	model: 'search',
	 * 	view: 'marker-search'
	 * } );
	 *
	 * editor.conversion.for( 'editingDowncast' ).markerToElement( {
	 * 	model: 'search',
	 * 	view: 'search-result',
	 * 	converterPriority: 'high'
	 * } );
	 *
	 * editor.conversion.for( 'editingDowncast' ).markerToElement( {
	 * 	model: 'search',
	 * 	view: {
	 * 		name: 'span',
	 * 		attributes: {
	 * 			'data-marker': 'search'
	 * 		}
	 * 	}
	 * } );
	 *
	 * editor.conversion.for( 'editingDowncast' ).markerToElement( {
	 * 	model: 'search',
	 * 	view: ( markerData, conversionApi ) => {
	 * 		const { writer } = conversionApi;
	 *
	 * 		return writer.createUIElement( 'span', {
	 * 			'data-marker': 'search',
	 * 			'data-start': markerData.isOpening
	 * 		} );
	 * 	}
	 * } );
	 * ```
	 *
	 * If a function is passed as the `config.view` parameter, it will be used to generate both boundary elements. The function
	 * receives the `data` object and {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
	 * as a parameters and should return an instance of the
	 * {@link module:engine/view/uielement~UIElement view UI element}. The `data` object and
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi `conversionApi`} are passed from
	 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker}. Additionally,
	 * the `data.isOpening` parameter is passed, which is set to `true` for the marker start boundary element, and `false` for
	 * the marker end boundary element.
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @param config Conversion configuration.
	 * @param config.model The name of the model marker (or model marker group) to convert.
	 * @param config.view A view element definition or a function that takes the model marker data and
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as a parameters
	 * and returns a view UI element.
	 * @param config.converterPriority Converter priority.
	 */
	public markerToElement( config: {
		model: string;
		view: ElementDefinition | MarkerElementCreatorFunction;
		converterPriority?: PriorityString;
	} ): this {
		return this.add( downcastMarkerToElement( config ) );
	}

	/**
	 * Model marker to highlight conversion helper.
	 *
	 * This conversion results in creating a highlight on view nodes. For this kind of conversion,
	 * the {@link module:engine/conversion/downcasthelpers~HighlightDescriptor} should be provided.
	 *
	 * For text nodes, a `<span>` {@link module:engine/view/attributeelement~AttributeElement} is created and it wraps all text nodes
	 * in the converted marker range. For example, a model marker set like this: `<paragraph>F[oo b]ar</paragraph>` becomes
	 * `<p>F<span class="comment">oo b</span>ar</p>` in the view.
	 *
	 * {@link module:engine/view/containerelement~ContainerElement} may provide a custom way of handling highlight. Most often,
	 * the element itself is given classes and attributes described in the highlight descriptor (instead of being wrapped in `<span>`).
	 * For example, a model marker set like this:
	 * `[<imageInline src="foo.jpg"></imageInline>]` becomes `<img src="foo.jpg" class="comment"></img>` in the view.
	 *
	 * For container elements, the conversion is two-step. While the converter processes the highlight descriptor and passes it
	 * to a container element, it is the container element instance itself that applies values from the highlight descriptor.
	 * So, in a sense, the converter takes care of stating what should be applied on what, while the element decides how to apply that.
	 *
	 * ```ts
	 * editor.conversion.for( 'downcast' ).markerToHighlight( { model: 'comment', view: { classes: 'comment' } } );
	 *
	 * editor.conversion.for( 'downcast' ).markerToHighlight( {
	 * 	model: 'comment',
	 * 	view: { classes: 'comment' },
	 * 	converterPriority: 'high'
	 * } );
	 *
	 * editor.conversion.for( 'downcast' ).markerToHighlight( {
	 * 	model: 'comment',
	 * 	view: ( data, conversionApi ) => {
	 * 		// Assuming that the marker name is in a form of comment:commentType:commentId.
	 * 		const [ , commentType, commentId ] = data.markerName.split( ':' );
	 *
	 * 		return {
	 * 			classes: [ 'comment', 'comment-' + commentType ],
	 * 			attributes: { 'data-comment-id': commentId }
	 * 		};
	 * 	}
	 * } );
	 * ```
	 *
	 * If a function is passed as the `config.view` parameter, it will be used to generate the highlight descriptor. The function
	 * receives the `data` object and {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
	 * as the parameters and should return a
	 * {@link module:engine/conversion/downcasthelpers~HighlightDescriptor highlight descriptor}.
	 * The `data` object properties are passed from {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker}.
	 *
	 * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
	 * to the conversion process.
	 *
	 * @param config Conversion configuration.
	 * @param config.model The name of the model marker (or model marker group) to convert.
	 * @param config.view A highlight descriptor that will be used for highlighting or a function that takes the model marker data and
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as a parameters
	 * and returns a highlight descriptor.
	 * @param config.converterPriority Converter priority.
	 */
	public markerToHighlight( config: {
		model: string;
		view: HighlightDescriptor | HighlightDescriptorCreatorFunction;
		converterPriority?: PriorityString;
	} ): this {
		return this.add( downcastMarkerToHighlight( config ) );
	}

	/**
	 * Model marker converter for data downcast.
	 *
	 * This conversion creates a representation for model marker boundaries in the view:
	 *
	 * * If the marker boundary is before or after a model element, a view attribute is set on a corresponding view element.
	 * * In other cases, a view element with the specified tag name is inserted at the corresponding view position.
	 *
	 * Typically, the marker names use the `group:uniqueId:otherData` convention. For example: `comment:e34zfk9k2n459df53sjl34:zx32c`.
	 * The default configuration for this conversion is that the first part is the `group` part and the rest of
	 * the marker name becomes the `name` part.
	 *
	 * Tag and attribute names and values are generated from the marker name:
	 *
	 * * The templates for attributes are `data-[group]-start-before="[name]"`, `data-[group]-start-after="[name]"`,
	 * `data-[group]-end-before="[name]"` and `data-[group]-end-after="[name]"`.
	 * * The templates for view elements are `<[group]-start name="[name]">` and `<[group]-end name="[name]">`.
	 *
	 * Attributes mark whether the given marker's start or end boundary is before or after the given element.
	 * The `data-[group]-start-before` and `data-[group]-end-after` attributes are favored.
	 * The other two are used when the former two cannot be used.
	 *
	 * The conversion configuration can take a function that will generate different group and name parts.
	 * If such a function is set as the `config.view` parameter, it is passed a marker name and it is expected to return an object with two
	 * properties: `group` and `name`. If the function returns a falsy value, the conversion will not take place.
	 *
	 * Basic usage:
	 *
	 * ```ts
	 * // Using the default conversion.
	 * // In this case, all markers with names starting with 'comment:' will be converted.
	 * // The `group` parameter will be set to `comment`.
	 * // The `name` parameter will be the rest of the marker name (without the `:`).
	 * editor.conversion.for( 'dataDowncast' ).markerToData( {
	 * 	model: 'comment'
	 * } );
	 * ```
	 *
	 * An example of a view that may be generated by this conversion (assuming a marker with the name `comment:commentId:uid` marked
	 * by `[]`):
	 *
	 * ```
	 * // Model:
	 * <paragraph>Foo[bar</paragraph>
	 * <imageBlock src="abc.jpg"></imageBlock>]
	 *
	 * // View:
	 * <p>Foo<comment-start name="commentId:uid"></comment-start>bar</p>
	 * <figure data-comment-end-after="commentId:uid" class="image"><img src="abc.jpg" /></figure>
	 * ```
	 *
	 * In the example above, the comment starts before "bar" and ends after the image.
	 *
	 * If the `name` part is empty, the following view may be generated:
	 *
	 * ```html
	 * <p>Foo <myMarker-start></myMarker-start>bar</p>
	 * <figure data-myMarker-end-after="" class="image"><img src="abc.jpg" /></figure>
	 * ```
	 *
	 * **Note:** A situation where some markers have the `name` part and some do not, is incorrect and should be avoided.
	 *
	 * Examples where `data-group-start-after` and `data-group-end-before` are used:
	 *
	 * ```
	 * // Model:
	 * <blockQuote>[]<paragraph>Foo</paragraph></blockQuote>
	 *
	 * // View:
	 * <blockquote><p data-group-end-before="name" data-group-start-before="name">Foo</p></blockquote>
	 * ```
	 *
	 * Similarly, when a marker is collapsed after the last element:
	 *
	 * ```
	 * // Model:
	 * <blockQuote><paragraph>Foo</paragraph>[]</blockQuote>
	 *
	 * // View:
	 * <blockquote><p data-group-end-after="name" data-group-start-after="name">Foo</p></blockquote>
	 * ```
	 *
	 * When there are multiple markers from the same group stored in the same attribute of the same element, their
	 * name parts are put together in the attribute value, for example: `data-group-start-before="name1,name2,name3"`.
	 *
	 * Other examples of usage:
	 *
	 * ```ts
	 * // Using a custom function which is the same as the default conversion:
	 * editor.conversion.for( 'dataDowncast' ).markerToData( {
	 * 	model: 'comment'
	 * 	view: markerName => ( {
	 * 		group: 'comment',
	 * 		name: markerName.substr( 8 ) // Removes 'comment:' part.
	 * 	} )
	 * } );
	 *
	 * // Using the converter priority:
	 * editor.conversion.for( 'dataDowncast' ).markerToData( {
	 * 	model: 'comment'
	 * 	view: markerName => ( {
	 * 		group: 'comment',
	 * 		name: markerName.substr( 8 ) // Removes 'comment:' part.
	 * 	} ),
	 * 	converterPriority: 'high'
	 * } );
	 * ```
	 *
	 * This kind of conversion is useful for saving data into the database, so it should be used in the data conversion pipeline.
	 *
	 * See the {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} API guide to learn how to
	 * add a converter to the conversion process.
	 *
	 * @param config Conversion configuration.
	 * @param config.model The name of the model marker (or the model marker group) to convert.
	 * @param config.view A function that takes the model marker name and
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as the parameters
	 * and returns an object with the `group` and `name` properties.
	 * @param config.converterPriority Converter priority.
	 */
	public markerToData( config: {
		model: string;
		view?: MarkerDataCreatorFunction;
		converterPriority?: PriorityString;
	} ): this {
		return this.add( downcastMarkerToData( config ) );
	}
}

/**
 * Function factory that creates a default downcast converter for text insertion changes.
 *
 * The converter automatically consumes the corresponding value from the consumables list and stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}).
 *
 * ```ts
 * modelDispatcher.on( 'insert:$text', insertText() );
 * ```
 *
 * @returns Insert text event converter.
 */
export function insertText() {
	return (
		evt: EventInfo,
		data: { item: ModelText | ModelTextProxy; range: ModelRange },
		conversionApi: DowncastConversionApi
	): void => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		const viewText = viewWriter.createText( data.item.data );

		viewWriter.insert( viewPosition, viewText );
	};
}

/**
 * Function factory that creates a default downcast converter for triggering attributes and children conversion.
 *
 * @returns The converter.
 */
export function insertAttributesAndChildren() {
	return (
		evt: unknown,
		data: { item: ModelItem; reconversion?: boolean },
		conversionApi: DowncastConversionApi
	): void => {
		conversionApi.convertAttributes( data.item );

		// Start converting children of the current item.
		// In case of reconversion children were already re-inserted or converted separately.
		if ( !data.reconversion && data.item.is( 'element' ) && !data.item.isEmpty ) {
			conversionApi.convertChildren( data.item );
		}
	};
}

/**
 * Function factory that creates a default downcast converter for node remove changes.
 *
 * ```ts
 * modelDispatcher.on( 'remove', remove() );
 * ```
 *
 * @returns Remove event converter.
 */
export function remove() {
	return (
		evt: unknown,
		data: { position: ModelPosition; length: number },
		conversionApi: DowncastConversionApi
	): void => {
		// Find the view range start position by mapping the model position at which the remove happened.
		const viewStart = conversionApi.mapper.toViewPosition( data.position );

		const modelEnd = data.position.getShiftedBy( data.length );
		const viewEnd = conversionApi.mapper.toViewPosition( modelEnd, { isPhantom: true } );

		const viewRange = conversionApi.writer.createRange( viewStart, viewEnd );

		// Trim the range to remove in case some UI elements are on the view range boundaries.
		const removed = conversionApi.writer.remove( viewRange.getTrimmed() );

		// After the range is removed, unbind all view elements from the model.
		// Range inside view document fragment is used to unbind deeply.
		for ( const child of conversionApi.writer.createRangeIn( removed ).getItems() ) {
			conversionApi.mapper.unbindViewElement( child as ViewElement, { defer: true } );
		}
	};
}

/**
 * Creates a `<span>` {@link module:engine/view/attributeelement~AttributeElement view attribute element} from the information
 * provided by the {@link module:engine/conversion/downcasthelpers~HighlightDescriptor highlight descriptor} object. If the priority
 * is not provided in the descriptor, the default priority will be used.
 */
export function createViewElementFromHighlightDescriptor( writer: DowncastWriter, descriptor: HighlightDescriptor ): ViewAttributeElement {
	const viewElement = writer.createAttributeElement( 'span', descriptor.attributes );

	if ( descriptor.classes ) {
		viewElement._addClass( descriptor.classes );
	}

	if ( typeof descriptor.priority === 'number' ) {
		( viewElement as any )._priority = descriptor.priority;
	}

	( viewElement as any )._id = descriptor.id;

	return viewElement;
}

/**
 * Function factory that creates a converter which converts a non-collapsed {@link module:engine/model/selection~Selection model selection}
 * to a {@link module:engine/view/documentselection~DocumentSelection view selection}. The converter consumes appropriate
 * value from the `consumable` object and maps model positions from the selection to view positions.
 *
 * ```ts
 * modelDispatcher.on( 'selection', convertRangeSelection() );
 * ```
 *
 * @returns Selection converter.
 */
export function convertRangeSelection() {
	return (
		evt: EventInfo,
		data: { selection: ModelSelection | ModelDocumentSelection },
		conversionApi: DowncastConversionApi
	): void => {
		const selection = data.selection;

		if ( selection.isCollapsed ) {
			return;
		}

		if ( !conversionApi.consumable.consume( selection, 'selection' ) ) {
			return;
		}

		const viewRanges: Array<ViewRange> = [];

		for ( const range of selection.getRanges() ) {
			viewRanges.push( conversionApi.mapper.toViewRange( range ) );
		}

		conversionApi.writer.setSelection( viewRanges, { backward: selection.isBackward } );
	};
}

/**
 * Function factory that creates a converter which converts a collapsed {@link module:engine/model/selection~Selection model selection} to
 * a {@link module:engine/view/documentselection~DocumentSelection view selection}. The converter consumes appropriate
 * value from the `consumable` object, maps the model selection position to the view position and breaks
 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} at the selection position.
 *
 * ```ts
 * modelDispatcher.on( 'selection', convertCollapsedSelection() );
 * ```
 *
 * An example of the view state before and after converting the collapsed selection:
 *
 * ```
 *    <p><strong>f^oo<strong>bar</p>
 * -> <p><strong>f</strong>^<strong>oo</strong>bar</p>
 * ```
 *
 * By breaking attribute elements like `<strong>`, the selection is in a correct element. Then, when the selection attribute is
 * converted, broken attributes might be merged again, or the position where the selection is may be wrapped
 * with different, appropriate attribute elements.
 *
 * See also {@link module:engine/conversion/downcasthelpers~clearAttributes} which does a clean-up
 * by merging attributes.
 *
 * @returns Selection converter.
 */
export function convertCollapsedSelection() {
	return (
		evt: EventInfo,
		data: { selection: ModelSelection | ModelDocumentSelection },
		conversionApi: DowncastConversionApi
	): void => {
		const selection = data.selection;

		if ( !selection.isCollapsed ) {
			return;
		}

		if ( !conversionApi.consumable.consume( selection, 'selection' ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const modelPosition = selection.getFirstPosition()!;
		const viewPosition = conversionApi.mapper.toViewPosition( modelPosition );
		const brokenPosition = viewWriter.breakAttributes( viewPosition );

		viewWriter.setSelection( brokenPosition );
	};
}

/**
 * Function factory that creates a converter which clears artifacts after the previous
 * {@link module:engine/model/selection~Selection model selection} conversion. It removes all empty
 * {@link module:engine/view/attributeelement~AttributeElement view attribute elements} and merges sibling attributes at all start and end
 * positions of all ranges.
 *
 * ```
 *    <p><strong>^</strong></p>
 * -> <p>^</p>
 *
 *    <p><strong>foo</strong>^<strong>bar</strong>bar</p>
 * -> <p><strong>foo^bar<strong>bar</p>
 *
 *    <p><strong>foo</strong><em>^</em><strong>bar</strong>bar</p>
 * -> <p><strong>foo^bar<strong>bar</p>
 * ```
 *
 * This listener should be assigned before any converter for the new selection:
 *
 * ```ts
 * modelDispatcher.on( 'selection', clearAttributes() );
 * ```
 *
 * See {@link module:engine/conversion/downcasthelpers~convertCollapsedSelection}
 * which does the opposite by breaking attributes in the selection position.
 *
 * @returns Selection converter.
 */
export function clearAttributes() {
	return (
		evt: EventInfo,
		data: unknown,
		conversionApi: DowncastConversionApi
	): void => {
		const viewWriter = conversionApi.writer;
		const viewSelection = viewWriter.document.selection;

		for ( const range of viewSelection.getRanges() ) {
			// Not collapsed selection should not have artifacts.
			if ( range.isCollapsed ) {
				// Position might be in the node removed by the view writer.
				if ( ( range.end.parent as ViewNode ).isAttached() ) {
					conversionApi.writer.mergeAttributes( range.start );
				}
			}
		}
		viewWriter.setSelection( null );
	};
}

/**
 * Function factory that creates a converter which converts the set/change/remove attribute changes from the model to the view.
 * It can also be used to convert selection attributes. In that case, an empty attribute element will be created and the
 * selection will be put inside it.
 *
 * Attributes from the model are converted to a view element that will be wrapping these view nodes that are bound to
 * model elements having the given attribute. This is useful for attributes like `bold` that may be set on text nodes in the model
 * but are represented as an element in the view:
 *
 * ```
 * [paragraph]              MODEL ====> VIEW        <p>
 * 	|- a {bold: true}                             |- <b>
 * 	|- b {bold: true}                             |   |- ab
 * 	|- c                                          |- c
 * 	```
 *
 * Passed `Function` will be provided with the attribute value and then all the parameters of the
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute` event}.
 * It is expected that the function returns an {@link module:engine/view/element~Element}.
 * The result of the function will be the wrapping element.
 * When the provided `Function` does not return any element, no conversion will take place.
 *
 * The converter automatically consumes the corresponding value from the consumables list and stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}).
 *
 * ```ts
 * modelDispatcher.on( 'attribute:bold', wrap( ( modelAttributeValue, { writer } ) => {
 * 	return writer.createAttributeElement( 'strong' );
 * } );
 * ```
 *
 * @internal
 * @param elementCreator Function returning a view element that will be used for wrapping.
 * @returns Set/change attribute converter.
 */
export function wrap( elementCreator: AttributeElementCreatorFunction ) {
	return (
		evt: EventInfo,
		data: {
			item: ModelItem | ModelSelection | ModelDocumentSelection;
			range: ModelRange;
			attributeKey: string;
			attributeOldValue: unknown;
			attributeNewValue: unknown;
		},
		conversionApi: DowncastConversionApi
	): void => {
		if ( !conversionApi.consumable.test( data.item, evt.name ) ) {
			return;
		}

		// Recreate current wrapping node. It will be used to unwrap view range if the attribute value has changed
		// or the attribute was removed.
		const oldViewElement = elementCreator( data.attributeOldValue, conversionApi, data );

		// Create node to wrap with.
		const newViewElement = elementCreator( data.attributeNewValue, conversionApi, data );

		if ( !oldViewElement && !newViewElement ) {
			return;
		}

		conversionApi.consumable.consume( data.item, evt.name );

		const viewWriter = conversionApi.writer;
		const viewSelection = viewWriter.document.selection;

		if ( data.item instanceof ModelSelection || data.item instanceof ModelDocumentSelection ) {
			// Selection attribute conversion.
			viewWriter.wrap( viewSelection.getFirstRange()!, newViewElement! );
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
 * Function factory that creates a converter which converts node insertion changes from the model to the view.
 * The function passed will be provided with all the parameters of the dispatcher's
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert` event}.
 * It is expected that the function returns an {@link module:engine/view/element~Element}.
 * The result of the function will be inserted into the view.
 *
 * The converter automatically consumes the corresponding value from the consumables list and binds the model and view elements.
 *
 * ```ts
 * downcastDispatcher.on(
 * 	'insert:myElem',
 * 	insertElement( ( modelItem, { writer } ) => {
 * 		const text = writer.createText( 'myText' );
 * 		const myElem = writer.createElement( 'myElem', { myAttr: 'my-' + modelItem.getAttribute( 'myAttr' ) }, text );
 *
 * 		// Do something fancy with `myElem` using `modelItem` or other parameters.
 *
 * 		return myElem;
 * 	}
 * ) );
 * ```
 *
 * @internal
 * @param  elementCreator Function returning a view element, which will be inserted.
 * @param consumer Function defining element consumption process.
 * By default this function just consume passed item insertion.
 * @returns Insert element event converter.
 */
export function insertElement( elementCreator: ElementCreatorFunction, consumer: ConsumerFunction = defaultConsumer ) {
	return (
		evt: unknown,
		data: { item: ModelElement; range: ModelRange; reconversion?: boolean },
		conversionApi: DowncastConversionApi
	): void => {
		if ( !consumer( data.item, conversionApi.consumable, { preflight: true } ) ) {
			return;
		}

		const viewElement = elementCreator( data.item, conversionApi, data );

		if ( !viewElement ) {
			return;
		}

		// Consume an element insertion and all present attributes that are specified as a reconversion triggers.
		consumer( data.item, conversionApi.consumable );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( data.item, viewElement );
		conversionApi.writer.insert( viewPosition, viewElement );

		// Convert attributes before converting children.
		conversionApi.convertAttributes( data.item );

		// Convert children or reinsert previous view elements.
		reinsertOrConvertNodes( viewElement, data.item.getChildren(), conversionApi, { reconversion: data.reconversion } );
	};
}

/**
 * Function factory that creates a converter which converts a single model node insertion to a view structure.
 *
 * It is expected that the passed element creator function returns an {@link module:engine/view/element~Element} with attached slots
 * created with `writer.createSlot()` to indicate where child nodes should be converted.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
 *
 * @internal
 * @param elementCreator Function returning a view structure, which will be inserted.
 * @param consumer A callback that is expected to consume all the consumables
 * that were used by the element creator.
 * @returns Insert element event converter.
*/
export function insertStructure( elementCreator: StructureCreatorFunction, consumer: ConsumerFunction ) {
	return (
		evt: unknown,
		data: { item: ModelElement; range: ModelRange; reconversion?: boolean },
		conversionApi: DowncastConversionApi
	): void => {
		if ( !consumer( data.item, conversionApi.consumable, { preflight: true } ) ) {
			return;
		}

		const slotsMap = new Map<ViewElement, Array<ModelNode>>();

		conversionApi.writer._registerSlotFactory( createSlotFactory( data.item, slotsMap, conversionApi ) );

		// View creation.
		const viewElement = elementCreator( data.item, conversionApi, data );

		conversionApi.writer._clearSlotFactory();

		if ( !viewElement ) {
			return;
		}

		// Check if all children are covered by slots and there is no child that landed in multiple slots.
		validateSlotsChildren( data.item, slotsMap, conversionApi );

		// Consume an element insertion and all present attributes that are specified as a reconversion triggers.
		consumer( data.item, conversionApi.consumable );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( data.item, viewElement );
		conversionApi.writer.insert( viewPosition, viewElement );

		// Convert attributes before converting children.
		conversionApi.convertAttributes( data.item );

		// Fill view slots with previous view elements or create new ones.
		fillSlots( viewElement, slotsMap, conversionApi, { reconversion: data.reconversion } );
	};
}

/**
 * Function factory that creates a converter which converts marker adding change to the
 * {@link module:engine/view/uielement~UIElement view UI element}.
 *
 * The view UI element that will be added to the view depends on the passed parameter. See {@link ~insertElement}.
 * In case of a non-collapsed range, the UI element will not wrap nodes but separate elements will be placed at the beginning
 * and at the end of the range.
 *
 * This converter binds created UI elements with the marker name using {@link module:engine/conversion/mapper~Mapper#bindElementToMarker}.
 *
 * @internal
 * @param elementCreator A view UI element or a function returning the view element that will be inserted.
 * @returns Insert element event converter.
 */
export function insertUIElement( elementCreator: MarkerElementCreatorFunction ) {
	return (
		evt: EventInfo,
		data: {
			markerRange: ModelRange;
			markerName: string;
			isOpening?: boolean;
		},
		conversionApi: DowncastConversionApi
	): void => {
		// Create two view elements. One will be inserted at the beginning of marker, one at the end.
		// If marker is collapsed, only "opening" element will be inserted.
		data.isOpening = true;
		const viewStartElement = elementCreator( data, conversionApi );

		data.isOpening = false;
		const viewEndElement = elementCreator( data, conversionApi );

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
		conversionApi.mapper.bindElementToMarker( viewStartElement, data.markerName );

		// Add "closing" element only if range is not collapsed.
		if ( !markerRange.isCollapsed ) {
			viewWriter.insert( mapper.toViewPosition( markerRange.end ), viewEndElement );
			conversionApi.mapper.bindElementToMarker( viewEndElement, data.markerName );
		}

		evt.stop();
	};
}

/**
 * Function factory that returns a default downcast converter for removing a {@link module:engine/view/uielement~UIElement UI element}
 * based on marker remove change.
 *
 * This converter unbinds elements from the marker name.
 *
 * @returns Removed UI element converter.
 */
function removeUIElement() {
	return (
		evt: EventInfo,
		data: { markerName: string },
		conversionApi: DowncastConversionApi
	): void => {
		const elements = conversionApi.mapper.markerNameToElements( data.markerName );

		if ( !elements ) {
			return;
		}

		for ( const element of elements ) {
			conversionApi.mapper.unbindElementFromMarkerName( element, data.markerName );
			conversionApi.writer.clear( conversionApi.writer.createRangeOn( element ), element );
		}

		conversionApi.writer.clearClonedElementsGroup( data.markerName );

		evt.stop();
	};
}

/**
 * Function factory that creates a default converter for model markers.
 *
 * See {@link DowncastHelpers#markerToData} for more information what type of view is generated.
 *
 * This converter binds created UI elements and affected view elements with the marker name
 * using {@link module:engine/conversion/mapper~Mapper#bindElementToMarker}.
 *
 * @returns Add marker converter.
 */
function insertMarkerData( viewCreator: MarkerDataCreatorFunction ) {
	return (
		evt: EventInfo,
		data: {
			markerName: string;
			markerRange: ModelRange;
		},
		conversionApi: DowncastConversionApi
	): void => {
		const viewMarkerData = viewCreator( data.markerName, conversionApi );

		if ( !viewMarkerData ) {
			return;
		}

		const markerRange = data.markerRange;

		if ( !conversionApi.consumable.consume( markerRange, evt.name ) ) {
			return;
		}

		// Adding closing data first to keep the proper order in the view.
		handleMarkerBoundary( markerRange, false, conversionApi, data, viewMarkerData );
		handleMarkerBoundary( markerRange, true, conversionApi, data, viewMarkerData );

		evt.stop();
	};
}

/**
 * Helper function for `insertMarkerData()` that marks a marker boundary at the beginning or end of given `range`.
 */
function handleMarkerBoundary(
	range: ModelRange,
	isStart: boolean,
	conversionApi: DowncastConversionApi,
	data: { markerName: string },
	viewMarkerData: { name: string; group: string }
): void {
	const modelPosition = isStart ? range.start : range.end;
	const elementAfter = modelPosition.nodeAfter && modelPosition.nodeAfter.is( 'element' ) ? modelPosition.nodeAfter : null;
	const elementBefore = modelPosition.nodeBefore && modelPosition.nodeBefore.is( 'element' ) ? modelPosition.nodeBefore : null;

	if ( elementAfter || elementBefore ) {
		let modelElement;
		let isBefore;

		// If possible, we want to add `data-group-start-before` and `data-group-end-after` attributes.
		if ( isStart && elementAfter || !isStart && !elementBefore ) {
			// [<elementAfter>...</elementAfter> -> <elementAfter data-group-start-before="...">...</elementAfter>
			// <parent>]<elementAfter> -> <parent><elementAfter data-group-end-before="...">
			modelElement = elementAfter;
			isBefore = true;
		} else {
			// <elementBefore>...</elementBefore>] -> <elementBefore data-group-end-after="...">...</elementBefore>
			// </elementBefore>[</parent> -> </elementBefore data-group-start-after="..."></parent>
			modelElement = elementBefore;
			isBefore = false;
		}

		const viewElement = conversionApi.mapper.toViewElement( modelElement! );

		// In rare circumstances, the model element may be not mapped to any view element and that would cause an error.
		// One of those situations is a soft break inside code block.
		if ( viewElement ) {
			insertMarkerAsAttribute( viewElement, isStart, isBefore, conversionApi, data, viewMarkerData );

			return;
		}
	}

	const viewPosition = conversionApi.mapper.toViewPosition( modelPosition );

	insertMarkerAsElement( viewPosition, isStart, conversionApi, data, viewMarkerData );
}

/**
 * Helper function for `insertMarkerData()` that marks a marker boundary in the view as an attribute on a view element.
 */
function insertMarkerAsAttribute(
	viewElement: ViewElement,
	isStart: boolean,
	isBefore: boolean,
	conversionApi: DowncastConversionApi,
	data: { markerName: string },
	viewMarkerData: { name: string; group: string }
) {
	const attributeName = `data-${ viewMarkerData.group }-${ isStart ? 'start' : 'end' }-${ isBefore ? 'before' : 'after' }`;

	const markerNames = viewElement.hasAttribute( attributeName ) ? viewElement.getAttribute( attributeName )!.split( ',' ) : [];

	// Adding marker name at the beginning to have the same order in the attribute as there is with marker elements.
	markerNames.unshift( viewMarkerData.name );

	conversionApi.writer.setAttribute( attributeName, markerNames.join( ',' ), viewElement );
	conversionApi.mapper.bindElementToMarker( viewElement, data.markerName );
}

/**
 * Helper function for `insertMarkerData()` that marks a marker boundary in the view as a separate view ui element.
 */
function insertMarkerAsElement(
	position: ViewPosition,
	isStart: boolean,
	conversionApi: DowncastConversionApi,
	data: { markerName: string },
	viewMarkerData: { name: string; group: string }
) {
	const viewElementName = `${ viewMarkerData.group }-${ isStart ? 'start' : 'end' }`;

	const attrs = viewMarkerData.name ? { 'name': viewMarkerData.name } : null;
	const viewElement = conversionApi.writer.createUIElement( viewElementName, attrs );

	conversionApi.writer.insert( position, viewElement );
	conversionApi.mapper.bindElementToMarker( viewElement, data.markerName );
}

/**
 * Function factory that creates a converter for removing a model marker data added by the {@link #insertMarkerData} converter.
 *
 * @returns Remove marker converter.
 */
function removeMarkerData( viewCreator: MarkerDataCreatorFunction ) {
	return (
		evt: EventInfo,
		data: { markerName: string },
		conversionApi: DowncastConversionApi
	): void => {
		const viewData = viewCreator( data.markerName, conversionApi );

		if ( !viewData ) {
			return;
		}

		const elements = conversionApi.mapper.markerNameToElements( data.markerName );

		if ( !elements ) {
			return;
		}

		for ( const element of elements ) {
			conversionApi.mapper.unbindElementFromMarkerName( element, data.markerName );

			if ( element.is( 'containerElement' ) ) {
				removeMarkerFromAttribute( `data-${ viewData.group }-start-before`, element );
				removeMarkerFromAttribute( `data-${ viewData.group }-start-after`, element );
				removeMarkerFromAttribute( `data-${ viewData.group }-end-before`, element );
				removeMarkerFromAttribute( `data-${ viewData.group }-end-after`, element );
			} else {
				conversionApi.writer.clear( conversionApi.writer.createRangeOn( element ), element );
			}
		}

		conversionApi.writer.clearClonedElementsGroup( data.markerName );

		evt.stop();

		function removeMarkerFromAttribute( attributeName: string, element: ViewElement ): void {
			if ( element.hasAttribute( attributeName ) ) {
				const markerNames = new Set( element.getAttribute( attributeName )!.split( ',' ) );

				markerNames.delete( viewData!.name );

				if ( markerNames.size == 0 ) {
					conversionApi.writer.removeAttribute( attributeName, element );
				} else {
					conversionApi.writer.setAttribute( attributeName, Array.from( markerNames ).join( ',' ), element );
				}
			}
		}
	};
}

/**
 * Function factory that creates a converter which converts the set/change/remove attribute changes from the model to the view.
 *
 * Attributes from the model are converted to the view element attributes in the view. You may provide a custom function to generate
 * a key-value attribute pair to add/change/remove. If not provided, model attributes will be converted to view element
 * attributes on a one-to-one basis.
 *
 * *Note:** The provided attribute creator should always return the same `key` for a given attribute from the model.
 *
 * The converter automatically consumes the corresponding value from the consumables list and stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}).
 *
 * ```ts
 * modelDispatcher.on( 'attribute:customAttr:myElem', changeAttribute( ( value, data ) => {
 * 	// Change attribute key from `customAttr` to `class` in the view.
 * 	const key = 'class';
 * 	let value = data.attributeNewValue;
 *
 * 	// Force attribute value to 'empty' if the model element is empty.
 * 	if ( data.item.childCount === 0 ) {
 * 		value = 'empty';
 * 	}
 *
 * 	// Return the key-value pair.
 * 	return { key, value };
 * } ) );
 * ```
 *
 * @param attributeCreator Function returning an object with two properties: `key` and `value`, which
 * represent the attribute key and attribute value to be set on a {@link module:engine/view/element~Element view element}.
 * The function is passed the model attribute value as the first parameter and additional data about the change as the second parameter.
 * @returns Set/change attribute converter.
 */
function changeAttribute( attributeCreator: AttributeCreatorFunction ) {
	return (
		evt: EventInfo,
		data: {
			item: ModelElement;
			range: ModelRange;
			attributeKey: string;
			attributeOldValue: unknown;
			attributeNewValue: unknown;
		},
		conversionApi: DowncastConversionApi
	): void => {
		if ( !conversionApi.consumable.test( data.item, evt.name ) ) {
			return;
		}

		const oldAttribute = attributeCreator( data.attributeOldValue, conversionApi, data );
		const newAttribute = attributeCreator( data.attributeNewValue, conversionApi, data );

		if ( !oldAttribute && !newAttribute ) {
			return;
		}

		conversionApi.consumable.consume( data.item, evt.name );

		const viewElement = conversionApi.mapper.toViewElement( data.item );
		const viewWriter = conversionApi.writer;

		// If model item cannot be mapped to a view element, it means item is not an `Element` instance but a `TextProxy` node.
		// Only elements can have attributes in a view so do not proceed for anything else (#1587).
		if ( !viewElement ) {
			/**
			 * This error occurs when a {@link module:engine/model/textproxy~TextProxy text node's} attribute is to be downcasted
			 * by an {@link module:engine/conversion/conversion~Conversion#attributeToAttribute `Attribute to Attribute converter`}.
			 * In most cases it is caused by converters misconfiguration when only "generic" converter is defined:
			 *
			 * ```ts
			 * editor.conversion.for( 'downcast' ).attributeToAttribute( {
			 * 	model: 'attribute-name',
			 * 	view: 'attribute-name'
			 * } ) );
			 * ```
			 *
			 * and given attribute is used on text node, for example:
			 *
			 * ```ts
			 * model.change( writer => {
			 * 	writer.insertText( 'Foo', { 'attribute-name': 'bar' }, parent, 0 );
			 * } );
			 * ```
			 *
			 * In such cases, to convert the same attribute for both {@link module:engine/model/element~Element}
			 * and {@link module:engine/model/textproxy~TextProxy `Text`} nodes, text specific
			 * {@link module:engine/conversion/conversion~Conversion#attributeToElement `Attribute to Element converter`}
			 * with higher {@link module:utils/priorities~PriorityString priority} must also be defined:
			 *
			 * ```ts
			 * editor.conversion.for( 'downcast' ).attributeToElement( {
			 * 	model: {
			 * 		key: 'attribute-name',
			 * 		name: '$text'
			 * 	},
			 * 	view: ( value, { writer } ) => {
			 * 		return writer.createAttributeElement( 'span', { 'attribute-name': value } );
			 * 	},
			 * 	converterPriority: 'high'
			 * } ) );
			 * ```
			 *
			 * @error conversion-attribute-to-attribute-on-text
			 */
			throw new CKEditorError( 'conversion-attribute-to-attribute-on-text', conversionApi.dispatcher, data );
		}

		// First remove the old attribute if there was one.
		if ( data.attributeOldValue !== null && oldAttribute ) {
			if ( oldAttribute.key == 'class' ) {
				const classes = toArray( oldAttribute.value );

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

		// Then set the new attribute.
		if ( data.attributeNewValue !== null && newAttribute ) {
			if ( newAttribute.key == 'class' ) {
				const classes = toArray( newAttribute.value );

				for ( const className of classes ) {
					viewWriter.addClass( className, viewElement );
				}
			} else if ( newAttribute.key == 'style' ) {
				const keys = Object.keys( newAttribute.value );

				for ( const key of keys ) {
					viewWriter.setStyle( key, ( newAttribute.value as Record<string, string> )[ key ], viewElement );
				}
			} else {
				viewWriter.setAttribute( newAttribute.key, newAttribute.value as string, viewElement );
			}
		}
	};
}

/**
 * Function factory that creates a converter which converts the text inside marker's range. The converter wraps the text with
 * {@link module:engine/view/attributeelement~AttributeElement} created from the provided descriptor.
 * See {link module:engine/conversion/downcasthelpers~createViewElementFromHighlightDescriptor}.
 *
 * It can also be used to convert the selection that is inside a marker. In that case, an empty attribute element will be
 * created and the selection will be put inside it.
 *
 * If the highlight descriptor does not provide the `priority` property, `10` will be used.
 *
 * If the highlight descriptor does not provide the `id` property, the name of the marker will be used.
 *
 * This converter binds the created {@link module:engine/view/attributeelement~AttributeElement attribute elemens} with the marker name
 * using the {@link module:engine/conversion/mapper~Mapper#bindElementToMarker} method.
 */
function highlightText( highlightDescriptor: HighlightDescriptor | HighlightDescriptorCreatorFunction ) {
	return (
		evt: EventInfo,
		data: {
			item?: ModelItem | ModelSelection | ModelDocumentSelection;
			range?: ModelRange;
			markerRange: ModelRange;
			markerName: string;
		},
		conversionApi: DowncastConversionApi
	): void => {
		if ( !data.item ) {
			return;
		}

		if ( !( data.item instanceof ModelSelection || data.item instanceof ModelDocumentSelection ) && !data.item.is( '$textProxy' ) ) {
			return;
		}

		const descriptor = prepareDescriptor( highlightDescriptor, data, conversionApi );

		if ( !descriptor ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const viewElement = createViewElementFromHighlightDescriptor( viewWriter, descriptor );
		const viewSelection = viewWriter.document.selection;

		if ( data.item instanceof ModelSelection || data.item instanceof ModelDocumentSelection ) {
			viewWriter.wrap( viewSelection.getFirstRange()!, viewElement );
		} else {
			const viewRange = conversionApi.mapper.toViewRange( data.range! );
			const rangeAfterWrap = viewWriter.wrap( viewRange, viewElement );

			for ( const element of rangeAfterWrap.getItems() ) {
				if ( element.is( 'attributeElement' ) && element.isSimilar( viewElement ) ) {
					conversionApi.mapper.bindElementToMarker( element, data.markerName );

					// One attribute element is enough, because all of them are bound together by the view writer.
					// Mapper uses this binding to get all the elements no matter how many of them are registered in the mapper.
					break;
				}
			}
		}
	};
}

/**
 * Converter function factory. It creates a function which applies the marker's highlight to an element inside the marker's range.
 *
 * The converter checks if an element has the `addHighlight` function stored as a
 * {@link module:engine/view/element~Element#_setCustomProperty custom property} and, if so, uses it to apply the highlight.
 * In such case the converter will consume all element's children, assuming that they were handled by the element itself.
 *
 * When the `addHighlight` custom property is not present, the element is not converted in any special way.
 * This means that converters will proceed to convert the element's child nodes.
 *
 * If the highlight descriptor does not provide the `priority` property, `10` will be used.
 *
 * If the highlight descriptor does not provide the `id` property, the name of the marker will be used.
 *
 * This converter binds altered {@link module:engine/view/containerelement~ContainerElement container elements} with the marker name using
 * the {@link module:engine/conversion/mapper~Mapper#bindElementToMarker} method.
 */
function highlightElement( highlightDescriptor: HighlightDescriptor | HighlightDescriptorCreatorFunction ) {
	return (
		evt: EventInfo,
		data: {
			item?: ModelItem | ModelSelection | ModelDocumentSelection;
			markerName: string;
			markerRange: ModelRange;
		},
		conversionApi: DowncastConversionApi
	): void => {
		if ( !data.item ) {
			return;
		}

		if ( !( data.item instanceof ModelElement ) ) {
			return;
		}

		const descriptor = prepareDescriptor( highlightDescriptor, data, conversionApi );

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
			for ( const value of ModelRange._createIn( data.item ) ) {
				conversionApi.consumable.consume( value.item, evt.name );
			}

			const addHighlightCallback = viewElement.getCustomProperty( 'addHighlight' ) as AddHighlightCallback;

			addHighlightCallback( viewElement, descriptor, conversionApi.writer );

			conversionApi.mapper.bindElementToMarker( viewElement, data.markerName );
		}
	};
}

/**
 * Function factory that creates a converter which converts the removing model marker to the view.
 *
 * Both text nodes and elements are handled by this converter but they are handled a bit differently.
 *
 * Text nodes are unwrapped using the {@link module:engine/view/attributeelement~AttributeElement attribute element} created from the
 * provided highlight descriptor. See {link module:engine/conversion/downcasthelpers~HighlightDescriptor}.
 *
 * For elements, the converter checks if an element has the `removeHighlight` function stored as a
 * {@link module:engine/view/element~Element#_setCustomProperty custom property}. If so, it uses it to remove the highlight.
 * In such case, the children of that element will not be converted.
 *
 * When `removeHighlight` is not present, the element is not converted in any special way.
 * The converter will proceed to convert the element's child nodes instead.
 *
 * If the highlight descriptor does not provide the `priority` property, `10` will be used.
 *
 * If the highlight descriptor does not provide the `id` property, the name of the marker will be used.
 *
 * This converter unbinds elements from the marker name.
 */
function removeHighlight( highlightDescriptor: HighlightDescriptor | HighlightDescriptorCreatorFunction ) {
	return (
		evt: EventInfo,
		data: {
			markerName: string;
			markerRange: ModelRange;
		},
		conversionApi: DowncastConversionApi
	): void => {
		// This conversion makes sense only for non-collapsed range.
		if ( data.markerRange.isCollapsed ) {
			return;
		}

		const descriptor = prepareDescriptor( highlightDescriptor, data, conversionApi );

		if ( !descriptor ) {
			return;
		}

		// View element that will be used to unwrap `AttributeElement`s.
		const viewHighlightElement = createViewElementFromHighlightDescriptor( conversionApi.writer, descriptor );

		// Get all elements bound with given marker name.
		const elements = conversionApi.mapper.markerNameToElements( data.markerName );

		if ( !elements ) {
			return;
		}

		for ( const element of elements ) {
			conversionApi.mapper.unbindElementFromMarkerName( element, data.markerName );

			if ( element.is( 'attributeElement' ) ) {
				conversionApi.writer.unwrap( conversionApi.writer.createRangeOn( element ), viewHighlightElement );
			} else {
				// if element.is( 'containerElement' ).
				const removeHighlightCallback = element.getCustomProperty( 'removeHighlight' ) as RemoveHighlightCallback;

				removeHighlightCallback( element, descriptor.id!, conversionApi.writer );
			}
		}

		conversionApi.writer.clearClonedElementsGroup( data.markerName );

		evt.stop();
	};
}

/**
 * Model element to view element conversion helper.
 *
 * See {@link ~DowncastHelpers#elementToElement `.elementToElement()` downcast helper} for examples and config params description.
 *
 * @param config Conversion configuration.
 * @param config.model The description or a name of the model element to convert.
 * @param config.model.attributes List of attributes triggering element reconversion.
 * @param config.model.children Should reconvert element if the list of model child nodes changed.
 * @returns Conversion helper.
 */
function downcastElementToElement( config: {
	model: string | {
		name: string;
		attributes?: string | Array<string>;
		children?: boolean;
	};
	view: ElementDefinition | ElementCreatorFunction;
	converterPriority?: PriorityString;
} ) {
	const model = normalizeModelElementConfig( config.model );
	const view = normalizeToElementConfig( config.view, 'container' );

	// Trigger reconversion on children list change if element is a subject to any reconversion.
	// This is required to be able to trigger Differ#refreshItem() on a direct child of the reconverted element.
	if ( model.attributes.length ) {
		model.children = true;
	}

	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on<DowncastInsertEvent<ModelElement>>(
			`insert:${ model.name }`,
			insertElement( view, createConsumer( model ) ),
			{ priority: config.converterPriority || 'normal' }
		);

		if ( model.children || model.attributes.length ) {
			dispatcher.on<DowncastReduceChangesEvent>( 'reduceChanges', createChangeReducer( model ), { priority: 'low' } );
		}
	};
}

/**
 * Model element to view structure conversion helper.
 *
 * See {@link ~DowncastHelpers#elementToStructure `.elementToStructure()` downcast helper} for examples and config params description.
 *
 * @param config Conversion configuration.
 * @returns Conversion helper.
 */
function downcastElementToStructure(
	config: {
		model: string | {
			name: string;
			attributes?: string | Array<string>;
		};
		view: StructureCreatorFunction;
		converterPriority?: PriorityString;
	}
) {
	const model = normalizeModelElementConfig( config.model );
	const view = normalizeToElementConfig( config.view, 'container' );

	// Trigger reconversion on children list change because it always needs to use slots to put children in proper places.
	// This is required to be able to trigger Differ#refreshItem() on a direct child of the reconverted element.
	model.children = true;

	return ( dispatcher: DowncastDispatcher ) => {
		if ( dispatcher._conversionApi.schema.checkChild( model.name, '$text' ) ) {
			/**
			 * This error occurs when a {@link module:engine/model/element~Element model element} is downcasted
			 * via {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure} helper but the element was
			 * allowed to host `$text` by the {@link module:engine/model/schema~Schema model schema}.
			 *
			 * For instance, this may be the result of `myElement` allowing the content of
			 * {@glink framework/deep-dive/schema#generic-items `$block`} in its schema definition:
			 *
			 * ```ts
			 * // Element definition in schema.
			 * schema.register( 'myElement', {
			 * 	allowContentOf: '$block',
			 *
			 * 	// ...
			 * } );
			 *
			 * // ...
			 *
			 * // Conversion of myElement with the use of elementToStructure().
			 * editor.conversion.for( 'downcast' ).elementToStructure( {
			 * 	model: 'myElement',
			 * 	view: ( modelElement, { writer } ) => {
			 * 		// ...
			 * 	}
			 * } );
			 * ```
			 *
			 * In such case, {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`} helper
			 * can be used instead to get around this problem:
			 *
			 * ```ts
			 * editor.conversion.for( 'downcast' ).elementToElement( {
			 * 	model: 'myElement',
			 * 	view: ( modelElement, { writer } ) => {
			 * 		// ...
			 * 	}
			 * } );
			 * ```
			 *
			 * @error conversion-element-to-structure-disallowed-text
			 * @param {String} elementName The name of the element the structure is to be created for.
			 */
			throw new CKEditorError( 'conversion-element-to-structure-disallowed-text', dispatcher, { elementName: model.name } );
		}

		dispatcher.on<DowncastInsertEvent<ModelElement>>(
			`insert:${ model.name }`,
			insertStructure( view, createConsumer( model ) ),
			{ priority: config.converterPriority || 'normal' }
		);

		dispatcher.on<DowncastReduceChangesEvent>( 'reduceChanges', createChangeReducer( model ), { priority: 'low' } );
	};
}

/**
 * Model attribute to view element conversion helper.
 *
 * See {@link ~DowncastHelpers#attributeToElement `.attributeToElement()` downcast helper} for examples.
 *
 * @param config Conversion configuration.
 * @param config.model The key of the attribute to convert from or a `{ key, values }` object. `values` is an array
 * of `String`s with possible values if the model attribute is an enumerable.
 * @param config.view A view element definition or a function that takes the model attribute value and
 * {@link module:engine/view/downcastwriter~DowncastWriter view downcast writer} as parameters and returns a view attribute element.
 * If `config.model.values` is given, `config.view` should be an object assigning values from `config.model.values` to view element
 * definitions or functions.
 * @param config.converterPriority Converter priority.
 * @returns Conversion helper.
 */
function downcastAttributeToElement( config: {
	model: string | {
		key: string;
		name?: string;
		values?: Array<string>;
	};
	view: ElementDefinition | AttributeElementCreatorFunction | Record<string, ElementDefinition | AttributeElementCreatorFunction>;
	converterPriority?: PriorityString;
} ) {
	config = cloneDeep( config );

	let model = config.model;

	if ( typeof model == 'string' ) {
		model = { key: model };
	}

	let eventName = `attribute:${ model.key }` as const;

	if ( model.name ) {
		eventName += ':' + model.name;
	}

	if ( model.values ) {
		for ( const modelValue of model.values ) {
			( config.view as any )[ modelValue ] = normalizeToElementConfig( ( config.view as any )[ modelValue ], 'attribute' );
		}
	} else {
		config.view = normalizeToElementConfig( config.view as any, 'attribute' );
	}

	const elementCreator = getFromAttributeCreator<AttributeElementCreatorFunction>( config );

	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on<DowncastAttributeEvent>(
			eventName,
			wrap( elementCreator ),
			{ priority: config.converterPriority || 'normal' }
		);
	};
}

/**
 * Model attribute to view attribute conversion helper.
 *
 * See {@link ~DowncastHelpers#attributeToAttribute `.attributeToAttribute()` downcast helper} for examples.
 *
 * @param config Conversion configuration.
 * @param config.model The key of the attribute to convert from or a `{ key, values, [ name ] }` object describing
 * the attribute key, possible values and, optionally, an element name to convert from.
 * @param config.view A view attribute key, or a `{ key, value }` object or a function that takes the model attribute value and returns
 * a `{ key, value }` object.
 * If `key` is `'class'`, `value` can be a `String` or an array of `String`s. If `key` is `'style'`, `value` is an object with
 * key-value pairs. In other cases, `value` is a `String`.
 * If `config.model.values` is set, `config.view` should be an object assigning values from `config.model.values` to
 * `{ key, value }` objects or a functions.
 * @param config.converterPriority Converter priority.
 * @returns Conversion helper.
 */
function downcastAttributeToAttribute( config: {
	model: string | {
		key: string;
		name?: string;
		values?: Array<string>;
	};
	view: string | AttributeDescriptor | AttributeCreatorFunction | Record<string, AttributeDescriptor | AttributeCreatorFunction>;
	converterPriority?: PriorityString;
} ) {
	config = cloneDeep( config );

	let model = config.model;

	if ( typeof model == 'string' ) {
		model = { key: model };
	}

	let eventName = `attribute:${ model.key }` as const;

	if ( model.name ) {
		eventName += ':' + model.name;
	}

	if ( model.values ) {
		for ( const modelValue of model.values ) {
			( config.view as any )[ modelValue ] = normalizeToAttributeConfig( ( config.view as any )[ modelValue ] );
		}
	} else {
		config.view = normalizeToAttributeConfig( config.view );
	}

	const elementCreator = getFromAttributeCreator<AttributeCreatorFunction>( config );

	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on<DowncastAttributeEvent<ModelElement>>(
			eventName,
			changeAttribute( elementCreator ),
			{ priority: config.converterPriority || 'normal' }
		);
	};
}

/**
 * Model marker to view element conversion helper.
 *
 * See {@link ~DowncastHelpers#markerToElement `.markerToElement()` downcast helper} for examples.
 *
 * @param config Conversion configuration.
 * @param config.model The name of the model marker (or model marker group) to convert.
 * @param config.view A view element definition or a function that takes the model marker data as a parameter and returns a view UI element.
 * @param config.converterPriority Converter priority.
 * @returns Conversion helper.
 */
function downcastMarkerToElement( config: {
	model: string;
	view: ElementDefinition | MarkerElementCreatorFunction;
	converterPriority?: PriorityString;
} ) {
	const view = normalizeToElementConfig( config.view, 'ui' );

	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on<DowncastAddMarkerEvent>(
			`addMarker:${ config.model }`,
			insertUIElement( view ),
			{ priority: config.converterPriority || 'normal' }
		);
		dispatcher.on<DowncastRemoveMarkerEvent>(
			`removeMarker:${ config.model }`,
			removeUIElement(),
			{ priority: config.converterPriority || 'normal' }
		);
	};
}

/**
 * Model marker to view data conversion helper.
 *
 * See {@link ~DowncastHelpers#markerToData `markerToData()` downcast helper} to learn more.
 *
 * @returns Conversion helper.
 */
function downcastMarkerToData( config: {
	model: string;
	view?: MarkerDataCreatorFunction;
	converterPriority?: PriorityString;
} ) {
	config = cloneDeep( config );

	const group = config.model;
	let view = config.view;

	// Default conversion.
	if ( !view ) {
		view = markerName => ( {
			group,
			name: markerName.substr( config.model.length + 1 )
		} );
	}

	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on<DowncastAddMarkerEvent>(
			`addMarker:${ group }`,
			insertMarkerData( view! ),
			{ priority: config.converterPriority || 'normal' }
		);
		dispatcher.on<DowncastRemoveMarkerEvent>(
			`removeMarker:${ group }`,
			removeMarkerData( view! ),
			{ priority: config.converterPriority || 'normal' }
		);
	};
}

/**
 * Model marker to highlight conversion helper.
 *
 * See {@link ~DowncastHelpers#markerToElement `.markerToElement()` downcast helper} for examples.
 *
 * @param config Conversion configuration.
 * @param config.model The name of the model marker (or model marker group) to convert.
 * @param config.view A highlight descriptor that will be used for highlighting or a function that takes
 * the model marker data as a parameter and returns a highlight descriptor.
 * @param config.converterPriority Converter priority.
 * @returns Conversion helper.
 */
function downcastMarkerToHighlight( config: {
	model: string;
	view: HighlightDescriptor | HighlightDescriptorCreatorFunction;
	converterPriority?: PriorityString;
} ) {
	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on<DowncastAddMarkerEvent>(
			`addMarker:${ config.model }`,
			highlightText( config.view ),
			{ priority: config.converterPriority || 'normal' }
		);
		dispatcher.on<DowncastAddMarkerEvent>(
			`addMarker:${ config.model }`,
			highlightElement( config.view ),
			{ priority: config.converterPriority || 'normal' }
		);
		dispatcher.on<DowncastRemoveMarkerEvent>(
			`removeMarker:${ config.model }`,
			removeHighlight( config.view ),
			{ priority: config.converterPriority || 'normal' }
		);
	};
}

/**
 * Takes `config.model`, and converts it to an object with normalized structure.
 *
 * @param model Model configuration or element name.
 */
function normalizeModelElementConfig( model: string | {
	name: string;
	attributes?: string | Array<string>;
	children?: boolean;
} ): NormalizedModelElementConfig {
	if ( typeof model == 'string' ) {
		model = { name: model };
	}

	// List of attributes that should trigger reconversion.
	if ( !model.attributes ) {
		model.attributes = [];
	} else if ( !Array.isArray( model.attributes ) ) {
		model.attributes = [ model.attributes ];
	}

	// Whether a children insertion/deletion should trigger reconversion.
	model.children = !!model.children;

	return model as any;
}

interface NormalizedModelElementConfig {
	name: string;
	attributes: Array<string>;
	children: boolean;
}

/**
 * Takes `config.view`, and if it is an {@link module:engine/view/elementdefinition~ElementDefinition}, converts it
 * to a function (because lower level converters accept only element creator functions).
 *
 * @param view View configuration.
 * @param viewElementType View element type to create.
 * @returns Element creator function to use in lower level converters.
 */
function normalizeToElementConfig<T extends Function>(
	view: ElementDefinition | T,
	viewElementType: 'container' | 'attribute' | 'ui'
): T {
	if ( typeof view == 'function' ) {
		// If `view` is already a function, don't do anything.
		return view as any;
	}

	return ( ( modelData: unknown, conversionApi: DowncastConversionApi ) =>
		createViewElementFromDefinition( view, conversionApi, viewElementType ) ) as any;
}

/**
 * Creates a view element instance from the provided {@link module:engine/view/elementdefinition~ElementDefinition} and class.
 */
function createViewElementFromDefinition(
	viewElementDefinition: ElementDefinition,
	conversionApi: DowncastConversionApi,
	viewElementType: 'container' | 'attribute' | 'ui'
): ViewElement {
	if ( typeof viewElementDefinition == 'string' ) {
		// If `viewElementDefinition` is given as a `String`, normalize it to an object with `name` property.
		viewElementDefinition = { name: viewElementDefinition };
	}

	let element: ViewElement;
	const viewWriter = conversionApi.writer;
	const attributes = Object.assign( {}, viewElementDefinition.attributes );

	if ( viewElementType == 'container' ) {
		element = viewWriter.createContainerElement( viewElementDefinition.name, attributes );
	} else if ( viewElementType == 'attribute' ) {
		const options = {
			priority: viewElementDefinition.priority || ViewAttributeElement.DEFAULT_PRIORITY
		};

		element = viewWriter.createAttributeElement( viewElementDefinition.name, attributes, options );
	} else {
		// 'ui'.
		element = viewWriter.createUIElement( viewElementDefinition.name, attributes );
	}

	if ( viewElementDefinition.styles ) {
		const keys = Object.keys( viewElementDefinition.styles );

		for ( const key of keys ) {
			viewWriter.setStyle( key, viewElementDefinition.styles[ key ], element );
		}
	}

	if ( viewElementDefinition.classes ) {
		const classes = viewElementDefinition.classes;

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

function getFromAttributeCreator<T extends AttributeElementCreatorFunction | AttributeCreatorFunction>( config: any ): T {
	if ( config.model.values ) {
		return ( ( modelAttributeValue: any, conversionApi: DowncastConversionApi, data: any ) => {
			const view = config.view[ modelAttributeValue ];

			if ( view ) {
				return view( modelAttributeValue, conversionApi, data );
			}

			return null;
		} ) as any;
	} else {
		return config.view;
	}
}

/**
 * Takes the configuration, adds default parameters if they do not exist and normalizes other parameters to be used in downcast converters
 * for generating a view attribute.
 *
 * @param view View configuration.
 */
function normalizeToAttributeConfig( view: any ): AttributeCreatorFunction {
	if ( typeof view == 'string' ) {
		return modelAttributeValue => ( { key: view, value: modelAttributeValue as string } );
	} else if ( typeof view == 'object' ) {
		// { key, value, ... }
		if ( view.value ) {
			return () => view;
		}
		// { key, ... }
		else {
			return modelAttributeValue => ( { key: view.key, value: modelAttributeValue as string } );
		}
	} else {
		// function.
		return view;
	}
}

/**
 * Helper function for `highlight`. Prepares the actual descriptor object using value passed to the converter.
 */
function prepareDescriptor(
	highlightDescriptor: HighlightDescriptor | HighlightDescriptorCreatorFunction,
	data: {
		markerName: string;
		markerRange: ModelRange;
	},
	conversionApi: DowncastConversionApi
): HighlightDescriptor | null {
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
 * Creates a function that checks a single differ diff item whether it should trigger reconversion.
 *
 * @param model A normalized `config.model` converter configuration.
 * @param model.name The name of element.
 * @param model.attributes The list of attribute names that should trigger reconversion.
 * @param model.children Whether the child list change should trigger reconversion.
 */
function createChangeReducerCallback( model: NormalizedModelElementConfig ) {
	return ( node: ModelNode, change: DiffItem | DiffItemReinsert ): boolean => {
		if ( !node.is( 'element', model.name ) ) {
			return false;
		}

		if ( change.type == 'attribute' ) {
			if ( model.attributes.includes( change.attributeKey ) ) {
				return true;
			}
		} else {
			/* istanbul ignore else: This is always true because otherwise it would not register a reducer callback. */
			if ( model.children ) {
				return true;
			}
		}

		return false;
	};
}

/**
 * Creates a `reduceChanges` event handler for reconversion.
 *
 * @param model A normalized `config.model` converter configuration.
 * @param model.name The name of element.
 * @param model.attributes The list of attribute names that should trigger reconversion.
 * @param model.children Whether the child list change should trigger reconversion.
 */
function createChangeReducer( model: NormalizedModelElementConfig ) {
	const shouldReplace = createChangeReducerCallback( model );

	return (
		evt: unknown,
		data: { changes: Iterable<DiffItem | DiffItemReinsert>; reconvertedElements?: Set<ModelNode> }
	) => {
		const reducedChanges: Array<DiffItem | DiffItemReinsert> = [];

		if ( !data.reconvertedElements ) {
			data.reconvertedElements = new Set();
		}

		for ( const change of data.changes ) {
			// For attribute use node affected by the change.
			// For insert or remove use parent element because we need to check if it's added/removed child.
			const node = change.type == 'attribute' ? change.range.start.nodeAfter : change.position.parent as ModelNode;

			if ( !node || !shouldReplace( node, change ) ) {
				reducedChanges.push( change );

				continue;
			}

			// If it's already marked for reconversion, so skip this change, otherwise add the diff items.
			if ( !data.reconvertedElements.has( node ) ) {
				data.reconvertedElements.add( node );

				const position = ModelPosition._createBefore( node );
				let changeIndex = reducedChanges.length;

				// We need to insert remove+reinsert before any other change on and inside the re-converted element.
				// This is important because otherwise we would remove element that had already been modified by the previous change.
				// Note that there could be some element removed before the re-converted element, so we must not break this behavior.
				for ( let i = reducedChanges.length - 1; i >= 0; i-- ) {
					const change = reducedChanges[ i ];
					const changePosition = change.type == 'attribute' ? change.range.start : change.position;
					const positionRelation = changePosition.compareWith( position );

					if ( positionRelation == 'before' || change.type == 'remove' && positionRelation == 'same' ) {
						break;
					}

					changeIndex = i;
				}

				reducedChanges.splice( changeIndex, 0, {
					type: 'remove',
					name: ( node as ModelElement ).name,
					position,
					length: 1
				} as any, {
					type: 'reinsert',
					name: ( node as ModelElement ).name,
					position,
					length: 1
				} );
			}
		}

		data.changes = reducedChanges;
	};
}

/**
 * Creates a function that checks if an element and its watched attributes can be consumed and consumes them.
 *
 * @param model A normalized `config.model` converter configuration.
 * @param model.name The name of element.
 * @param model.attributes The list of attribute names that should trigger reconversion.
 * @param model.children Whether the child list change should trigger reconversion.
 */
function createConsumer( model: NormalizedModelElementConfig ): ConsumerFunction {
	return ( node, consumable, options = {} ) => {
		const events = [ 'insert' ];

		// Collect all set attributes that are triggering conversion.
		for ( const attributeName of model.attributes ) {
			if ( node.hasAttribute( attributeName ) ) {
				events.push( `attribute:${ attributeName }` );
			}
		}

		if ( !events.every( event => consumable.test( node, event ) ) ) {
			return false;
		}

		if ( !options.preflight ) {
			events.forEach( event => consumable.consume( node, event ) );
		}

		return true;
	};
}

/**
 * Creates a function that create view slots.
 *
 * @returns Function exposed by writer as createSlot().
 */
function createSlotFactory( element: ModelElement, slotsMap: Map<ViewElement, Array<ModelNode>>, conversionApi: DowncastConversionApi ) {
	return ( writer: DowncastWriter, modeOrFilter: string | SlotFilter ) => {
		const slot = writer.createContainerElement( '$slot' );

		let children: Array<ModelNode> | null = null;

		if ( modeOrFilter === 'children' ) {
			children = Array.from( element.getChildren() );
		} else if ( typeof modeOrFilter == 'function' ) {
			children = Array.from( element.getChildren() ).filter( element => modeOrFilter( element ) );
		} else {
			/**
			 * Unknown slot mode was provided to `writer.createSlot()` in downcast converter.
			 *
			 * @error conversion-slot-mode-unknown
			 */
			throw new CKEditorError( 'conversion-slot-mode-unknown', conversionApi.dispatcher, { modeOrFilter } );
		}

		slotsMap.set( slot, children );

		return slot;
	};
}

/**
 * Checks if all children are covered by slots and there is no child that landed in multiple slots.
 */
function validateSlotsChildren(
	element: ModelElement,
	slotsMap: Map<ViewElement, Array<ModelNode>>,
	conversionApi: DowncastConversionApi
) {
	const childrenInSlots = Array.from( slotsMap.values() ).flat();
	const uniqueChildrenInSlots = new Set( childrenInSlots );

	if ( uniqueChildrenInSlots.size != childrenInSlots.length ) {
		/**
		 * Filters provided to `writer.createSlot()` overlap (at least two filters accept the same child element).
		 *
		 * @error conversion-slot-filter-overlap
		 * @param {module:engine/model/element~Element} element The element of which children would not be properly
		 * allocated to multiple slots.
		 */
		throw new CKEditorError( 'conversion-slot-filter-overlap', conversionApi.dispatcher, { element } );
	}

	if ( uniqueChildrenInSlots.size != element.childCount ) {
		/**
		 * Filters provided to `writer.createSlot()` are incomplete and exclude at least one children element (one of
		 * the children elements would not be assigned to any of the slots).
		 *
		 * @error conversion-slot-filter-incomplete
		 * @param {module:engine/model/element~Element} element The element of which children would not be properly
		 * allocated to multiple slots.
		 */
		throw new CKEditorError( 'conversion-slot-filter-incomplete', conversionApi.dispatcher, { element } );
	}
}

/**
 * Fill slots with appropriate view elements.
 */
function fillSlots(
	viewElement: ViewElement,
	slotsMap: Map<ViewElement, Array<ModelNode>>,
	conversionApi: DowncastConversionApi,
	options: { reconversion?: boolean }
): void {
	// Set temporary position mapping to redirect child view elements into a proper slots.
	conversionApi.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', toViewPositionMapping, { priority: 'highest' } );

	let currentSlot: ViewElement | null = null;
	let currentSlotNodes: Array<ModelNode> | null = null;

	// Fill slots with nested view nodes.
	for ( [ currentSlot, currentSlotNodes ] of slotsMap ) {
		reinsertOrConvertNodes( viewElement, currentSlotNodes, conversionApi, options );

		conversionApi.writer.move(
			conversionApi.writer.createRangeIn( currentSlot ),
			conversionApi.writer.createPositionBefore( currentSlot )
		);
		conversionApi.writer.remove( currentSlot );
	}

	conversionApi.mapper.off( 'modelToViewPosition', toViewPositionMapping );

	function toViewPositionMapping( evt: unknown, data: {
		mapper: Mapper;
		modelPosition: ModelPosition;
		viewPosition?: ViewPosition;
		isPhantom?: boolean;
	} ) {
		const element = data.modelPosition.nodeAfter!;

		// Find the proper offset within the slot.
		const index = currentSlotNodes!.indexOf( element );

		if ( index < 0 ) {
			return;
		}

		data.viewPosition = data.mapper.findPositionIn( currentSlot!, index );
	}
}

/**
 * Inserts view representation of `nodes` into the `viewElement` either by bringing back just removed view nodes
 * or by triggering conversion for them.
 */
function reinsertOrConvertNodes(
	viewElement: ViewElement,
	modelNodes: Iterable<ModelNode>,
	conversionApi: DowncastConversionApi,
	options: { reconversion?: boolean }
) {
	// Fill with nested view nodes.
	for ( const modelChildNode of modelNodes ) {
		// Try reinserting the view node for the specified model node...
		if ( !reinsertNode( viewElement.root, modelChildNode, conversionApi, options ) ) {
			// ...or else convert the model element to the view.
			conversionApi.convertItem( modelChildNode );
		}
	}
}

/**
 * Checks if the view for the given model element could be reused and reinserts it to the view.
 *
 * @returns `false` if view element can't be reused.
 */
function reinsertNode(
	viewRoot: ViewElement | ViewDocumentFragment,
	modelNode: ModelNode,
	conversionApi: DowncastConversionApi,
	options: { reconversion?: boolean }
): boolean {
	const { writer, mapper } = conversionApi;

	// Don't reinsert if this is not a reconversion...
	if ( !options.reconversion ) {
		return false;
	}

	const viewChildNode = mapper.toViewElement( modelNode as ModelElement );

	// ...or there is no view to reinsert or it was already inserted to the view structure...
	if ( !viewChildNode || viewChildNode.root == viewRoot ) {
		return false;
	}

	// ...or it was strictly marked as not to be reused.
	if ( !conversionApi.canReuseView( viewChildNode ) ) {
		return false;
	}

	// Otherwise reinsert the view node.
	writer.move(
		writer.createRangeOn( viewChildNode ),
		mapper.toViewPosition( ModelPosition._createBefore( modelNode ) )
	);

	return true;
}

/**
 * The default consumer for insert events.
 *
 * @param item Model item.
 * @param consumable The model consumable.
 * @param options.preflight Whether should consume or just check if can be consumed.
 */
function defaultConsumer(
	item: ModelItem,
	consumable: ModelConsumable,
	{ preflight }: { preflight?: boolean } = {}
): boolean | null {
	if ( preflight ) {
		return consumable.test( item, 'insert' );
	} else {
		return consumable.consume( item, 'insert' );
	}
}

/**
 * An object describing how the marker highlight should be represented in the view.
 *
 * Each text node contained in a highlighted range will be wrapped in a `<span>`
 * {@link module:engine/view/attributeelement~AttributeElement view attribute element} with CSS class(es), attributes and a priority
 * described by this object.
 *
 * Additionally, each {@link module:engine/view/containerelement~ContainerElement container element} can handle displaying the highlight
 * separately by providing the `addHighlight` and `removeHighlight` custom properties. In this case:
 *
 *  * The `HighlightDescriptor` object is passed to the `addHighlight` function upon conversion and should be used to apply the highlight to
 *  the element.
 *  * The descriptor `id` is passed to the `removeHighlight` function upon conversion and should be used to remove the highlight with the
 *  given ID from the element.
 */
export interface HighlightDescriptor {

	/**
	 * A CSS class or an array of classes to set. If the descriptor is used to
	 * create an {@link module:engine/view/attributeelement~AttributeElement attribute element} over text nodes, these classes will be set
	 * on that attribute element. If the descriptor is applied to an element, usually these classes will be set on that element, however,
	 * this depends on how the element converts the descriptor.
	 */
	classes: string | Array<string>;

	/**
	 * Descriptor identifier. If not provided, it defaults to the converted marker's name.
	 */
	id?: string;

	/**
	 * Descriptor priority. If not provided, it defaults to `10`. If the descriptor is used to create
	 * an {@link module:engine/view/attributeelement~AttributeElement attribute element}, it will be that element's
	 * {@link module:engine/view/attributeelement~AttributeElement#priority priority}. If the descriptor is applied to an element,
	 * the priority will be used to determine which descriptor is more important.
	 */
	priority?: number;

	/**
	 * Attributes to set. If the descriptor is used to create
	 * an {@link module:engine/view/attributeelement~AttributeElement attribute element} over text nodes, these attributes will be set
	 * on that attribute element. If the descriptor is applied to an element, usually these attributes will be set on that element, however,
	 * this depends on how the element converts the descriptor.
	 */
	attributes?: Record<string, string>;
}

/**
 * A filtering function used to choose model child nodes to be downcasted into the specific view
 * {@link module:engine/view/downcastwriter~DowncastWriter#createSlot "slot"} while executing the
 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure `elementToStructure()`} converter.
 *
 * @callback module:engine/conversion/downcasthelpers~SlotFilter
 *
 * @param node A model node.
 * @returns Whether the provided model node should be downcasted into this slot.
 *
 * @see module:engine/view/downcastwriter~DowncastWriter#createSlot
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
 * @see module:engine/conversion/downcasthelpers~insertStructure
 */
export type SlotFilter = ( node: ModelNode ) => boolean;

/**
 * A view element creator function that takes the model element and {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi
 * downcast conversion API} as parameters and returns a view container element.
 *
 * @callback module:engine/conversion/downcasthelpers~ElementCreatorFunction
 *
 * @param element The model element to be converted to the view structure.
 * @param conversionApi The conversion interface.
 * @param data Additional information about the change (same as for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert`} event).
 * @param data.item Inserted item.
 * @param data.range Range spanning over inserted item.
 * @returns The view element.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement
 * @see module:engine/conversion/downcasthelpers~insertElement
 */
export type ElementCreatorFunction = (
	element: ModelElement,
	conversionApi: DowncastConversionApi,
	data: {
		item: ModelItem;
		range: ModelRange;
	}
) => ViewElement | null;

/**
 * A function that takes the model element and {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast
 * conversion API} as parameters and returns a view container element with slots for model child nodes to be converted into.
 *
 * @callback module:engine/conversion/downcasthelpers~StructureCreatorFunction
 *
 * @param element The model element to be converted to the view structure.
 * @param conversionApi The conversion interface.
 * @param data Additional information about the change (same as for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert`} event).
 * @param data.item Inserted item.
 * @param data.range Range spanning over inserted item.
 * @returns The view structure with slots for model child nodes.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
 * @see module:engine/conversion/downcasthelpers~insertStructure
 */
export type StructureCreatorFunction = ElementCreatorFunction;

/**
 * A view element creator function that takes the model attribute value and
 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as parameters and returns a view
 * attribute element.
 *
 * @callback module:engine/conversion/downcasthelpers~AttributeElementCreatorFunction
 *
 * @param attributeValue The model attribute value to be converted to the view attribute element.
 * @param conversionApi The conversion interface.
 * @param data Additional information about the change (same as for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`} event).
 * @param data.item Changed item or converted selection.
 * @param data.range Range spanning over changed item or selection range.
 * @param data.attributeKey Attribute key.
 * @param data.attributeOldValue Attribute value before the change. This is `null` when selection attribute is converted.
 * @param data.attributeNewValue New attribute value.
 * @returns The view attribute element.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement
 * @see module:engine/conversion/downcasthelpers~wrap
 */
export type AttributeElementCreatorFunction = (
	attributeValue: any,
	conversionApi: DowncastConversionApi,
	data: {
		item: ModelItem | ModelSelection | ModelDocumentSelection;
		range: ModelRange;
		attributeKey: string;
		attributeOldValue: unknown;
		attributeNewValue: unknown;
	}
) => ViewAttributeElement | null;

/**
 * A function that takes the model attribute value and
 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
 * as parameters.
 *
 * @callback module:engine/conversion/downcasthelpers~AttributeCreatorFunction
 *
 * @param attributeValue The model attribute value to be converted to the view attribute element.
 * @param conversionApi The conversion interface.
 * @param data Additional information about the change (same as for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`} event).
 * @param data.item Changed item or converted selection.
 * @param data.range Range spanning over changed item or selection range.
 * @param data.attributeKey Attribute key.
 * @param data.attributeOldValue Attribute value before the change. This is `null` when selection attribute is converted.
 * @param data.attributeNewValue New attribute value.
 * @returns A `{ key, value }` object. If `key` is `'class'`, `value` can be a `String` or an
 * array of `String`s. If `key` is `'style'`, `value` is an object with key-value pairs. In other cases, `value` is a `String`.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToAttribute
 */
export type AttributeCreatorFunction = (
	attributeValue: unknown,
	conversionApi: DowncastConversionApi,
	data: {
		item: ModelItem;
		range: ModelRange;
		attributeKey: string;
		attributeOldValue: unknown;
		attributeNewValue: unknown;
	}
) => AttributeDescriptor | null;

export type AttributeDescriptor = {
	key: 'class';
	value: string | Array<string>;
} | {
	key: 'style';
	value: Record<string, string>;
} | {
	key: Exclude<string, 'class' | 'style'>;
	value: string;
};

export type MarkerElementCreatorFunction = (
	data: {
		markerRange: ModelRange;
		markerName: string;
		isOpening?: boolean;
	},
	conversionApi: DowncastConversionApi
) => UIElement | null;

export type HighlightDescriptorCreatorFunction = (
	data: {
		markerRange: ModelRange;
		markerName: string;
	},
	conversionApi: DowncastConversionApi
) => HighlightDescriptor | null;

export type AddHighlightCallback = (
	viewElement: ViewElement,
	descriptor: HighlightDescriptor,
	writer: DowncastWriter
) => void;

export type RemoveHighlightCallback = (
	viewElement: ViewElement,
	id: string,
	writer: DowncastWriter
) => void;

export type MarkerDataCreatorFunction = (
	markerName: string,
	conversionApi: DowncastConversionApi
) => { name: string; group: string } | null;

/**
 * A function that is expected to consume all the consumables that were used by the element creator.
 *
 * @callback module:engine/conversion/downcasthelpers~ConsumerFunction
 *
 * @param element The model element to be converted to the view structure.
 * @param consumable The `ModelConsumable` same as in
 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi#consumable `DowncastConversionApi.consumable`}.
 * @param options.preflight Whether should consume or just check if can be consumed.
 * @returns `true` if all consumable values were available and were consumed, `false` otherwise.
 *
 * @see module:engine/conversion/downcasthelpers~insertStructure
 */
export type ConsumerFunction = (
	element: ModelElement,
	consumable: ModelConsumable,
	options?: { preflight?: boolean }
) => boolean | null;
