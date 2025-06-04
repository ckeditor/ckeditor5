/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/dev-utils/model
 */

/**
 * Collection of methods for manipulating the {@link module:engine/model/model model} for testing purposes.
 */

import RootElement from '../model/rootelement.js';
import Model from '../model/model.js';
import ModelRange from '../model/range.js';
import ModelPosition from '../model/position.js';
import ModelSelection from '../model/selection.js';
import ModelDocumentFragment from '../model/documentfragment.js';
import DocumentSelection from '../model/documentselection.js';

import View from '../view/view.js';
import ViewContainerElement from '../view/containerelement.js';
import ViewRootEditableElement from '../view/rooteditableelement.js';

import { parse as viewParse, stringify as viewStringify } from '../../src/dev-utils/view.js';

import Mapper from '../conversion/mapper.js';
import {
	convertCollapsedSelection,
	convertRangeSelection,
	insertAttributesAndChildren,
	insertElement,
	insertText,
	insertUIElement,
	wrap
} from '../conversion/downcasthelpers.js';

import { StylesProcessor } from '../view/stylesmap.js';

import DowncastDispatcher, {
	type DowncastAddMarkerEvent,
	type DowncastAttributeEvent,
	type DowncastInsertEvent,
	type DowncastSelectionEvent
} from '../conversion/downcastdispatcher.js';
import UpcastDispatcher, {
	type UpcastDocumentFragmentEvent,
	type UpcastElementEvent,
	type UpcastTextEvent,
	type UpcastConversionApi,
	type UpcastConversionData
} from '../conversion/upcastdispatcher.js';
import type ViewDocumentSelection from '../view/documentselection.js';
import type { BatchType } from '../model/batch.js';
import type MarkerCollection from '../model/markercollection.js';
import type ModelText from '../model/text.js';
import type ModelTextProxy from '../model/textproxy.js';
import type DowncastWriter from '../view/downcastwriter.js';
import type { default as Schema, SchemaContextDefinition } from '../model/schema.js';
import type { ViewDocumentFragment, ViewElement } from '../index.js';
import type ViewNode from '../view/node.js';
import type ViewText from '../view/text.js';
import type Writer from '../model/writer.js';
import type ModelNode from '../model/node.js';
import type ModelElement from '../model/element.js';

import { toMap, type EventInfo } from '@ckeditor/ckeditor5-utils';

import { isPlainObject } from 'es-toolkit/compat';

/**
 * Writes the content of a model {@link module:engine/model/document~Document document} to an HTML-like string.
 *
 * ```ts
 * getData( editor.model ); // -> '<paragraph>Foo![]</paragraph>'
 * ```
 *
 * **Note:** A {@link module:engine/model/text~Text text} node that contains attributes will be represented as:
 *
 * ```xml
 * <$text attribute="value">Text data</$text>
 * ```
 *
 * **Note:** Using this tool in production-grade code is not recommended. It was designed for development, prototyping,
 * debugging and testing.
 *
 * @param options.withoutSelection Whether to write the selection. When set to `true`, the selection will
 * not be included in the returned string.
 * @param options.rootName The name of the root from which the data should be stringified. If not provided,
 * the default `main` name will be used.
 * @param options.convertMarkers Whether to include markers in the returned string.
 * @returns The stringified data.
 */
export function getData(
	model: Model,
	options: {
		withoutSelection?: boolean;
		rootName?: string;
		convertMarkers?: boolean;
	} = {}
): string {
	if ( !( model instanceof Model ) ) {
		throw new TypeError( 'Model needs to be an instance of module:engine/model/model~Model.' );
	}

	const rootName = options.rootName || 'main';
	const root = model.document.getRoot( rootName )!;

	return getData._stringify(
		root,
		options.withoutSelection ? null : model.document.selection,
		options.convertMarkers ? model.markers : null
	);
}

// Set stringify as getData private method - needed for testing/spying.
getData._stringify = stringify;

/**
 * Sets the content of a model {@link module:engine/model/document~Document document} provided as an HTML-like string.
 *
 * ```ts
 * setData( editor.model, '<paragraph>Foo![]</paragraph>' );
 * ```
 *
 * **Note:** Remember to register elements in the {@link module:engine/model/model~Model#schema model's schema} before
 * trying to use them.
 *
 * **Note:** To create a {@link module:engine/model/text~Text text} node that contains attributes use:
 *
 * ```xml
 * <$text attribute="value">Text data</$text>
 * ```
 *
 * **Note:** Using this tool in production-grade code is not recommended. It was designed for development, prototyping,
 * debugging and testing.
 *
 * @param data HTML-like string to write into the document.
 * @param options.rootName Root name where parsed data will be stored. If not provided, the default `main`
 * name will be used.
 * @param options.selectionAttributes A list of attributes which will be passed to the selection.
 * @param options.lastRangeBackward If set to `true`, the last range will be added as backward.
 * @param options.batchType Batch type used for inserting elements. See {@link module:engine/model/batch~Batch#constructor}.
 */
export function setData(
	model: Model,
	data: string,
	options: {
		rootName?: string;
		selectionAttributes?: Record<string, unknown>;
		lastRangeBackward?: boolean;
		batchType?: BatchType;
		inlineObjectElements?: Array<string>;
	} = {}
): void {
	if ( !( model instanceof Model ) ) {
		throw new TypeError( 'Model needs to be an instance of module:engine/model/model~Model.' );
	}

	let modelDocumentFragment: ModelNode | ModelDocumentFragment;
	let selection: ModelSelection | null = null;
	const modelRoot = model.document.getRoot( options.rootName || 'main' )!;

	// Parse data string to model.
	const parsedResult = setData._parse( data, model.schema, {
		lastRangeBackward: options.lastRangeBackward,
		selectionAttributes: options.selectionAttributes,
		context: [ modelRoot.name ],
		inlineObjectElements: options.inlineObjectElements
	} );

	// Retrieve DocumentFragment and Selection from parsed model.
	if ( 'model' in parsedResult ) {
		modelDocumentFragment = parsedResult.model;
		selection = parsedResult.selection;
	} else {
		modelDocumentFragment = parsedResult;
	}

	if ( options.batchType !== undefined ) {
		model.enqueueChange( options.batchType, writeToModel );
	} else {
		model.change( writeToModel );
	}

	function writeToModel( writer: Writer ) {
		// Replace existing model in document by new one.
		writer.remove( writer.createRangeIn( modelRoot ) );
		writer.insert( modelDocumentFragment, modelRoot );

		// Clean up previous document selection.
		writer.setSelection( null );
		writer.removeSelectionAttribute( model.document.selection.getAttributeKeys() );

		// Update document selection if specified.
		if ( selection ) {
			const ranges: Array<ModelRange> = [];

			for ( const range of selection.getRanges() ) {
				const start = new ModelPosition( modelRoot, range.start.path );
				const end = new ModelPosition( modelRoot, range.end.path );

				ranges.push( new ModelRange( start, end ) );
			}

			writer.setSelection( ranges, { backward: selection.isBackward } );

			if ( options.selectionAttributes ) {
				writer.setSelectionAttribute( selection.getAttributes() );
			}
		}
	}
}

// Set parse as setData private method - needed for testing/spying.
setData._parse = parse;

/**
 * Converts model nodes to HTML-like string representation.
 *
 * **Note:** A {@link module:engine/model/text~Text text} node that contains attributes will be represented as:
 *
 * ```xml
 * <$text attribute="value">Text data</$text>
 * ```
 *
 * @param node A node to stringify.
 * @param selectionOrPositionOrRange A selection instance whose ranges will be included in the returned string data.
 * If a range instance is provided, it will be converted to a selection containing this range. If a position instance
 * is provided, it will be converted to a selection containing one range collapsed at this position.
 * @param markers Markers to include.
 * @returns An HTML-like string representing the model.
 */
export function stringify(
	node: ModelNode | ModelDocumentFragment,
	selectionOrPositionOrRange: ModelSelection | DocumentSelection | ModelPosition | ModelRange | null = null,
	markers: MarkerCollection | null = null
): string {
	const model = new Model();
	const mapper = new Mapper();
	let selection: ModelSelection | DocumentSelection | null = null;
	let range: ModelRange;

	// Create a range witch wraps passed node.
	if ( node instanceof RootElement || node instanceof ModelDocumentFragment ) {
		range = model.createRangeIn( node );
	} else {
		// Node is detached - create new document fragment.
		if ( !node.parent ) {
			const fragment = new ModelDocumentFragment( node );
			range = model.createRangeIn( fragment );
		} else {
			range = new ModelRange(
				model.createPositionBefore( node ),
				model.createPositionAfter( node )
			);
		}
	}

	// Get selection from passed selection or position or range if at least one is specified.
	if ( selectionOrPositionOrRange instanceof ModelSelection ) {
		selection = selectionOrPositionOrRange;
	} else if ( selectionOrPositionOrRange instanceof DocumentSelection ) {
		selection = selectionOrPositionOrRange;
	} else if ( selectionOrPositionOrRange instanceof ModelRange ) {
		selection = new ModelSelection( selectionOrPositionOrRange );
	} else if ( selectionOrPositionOrRange instanceof ModelPosition ) {
		selection = new ModelSelection( selectionOrPositionOrRange );
	}

	// Set up conversion.
	// Create a temporary view controller.
	const stylesProcessor = new StylesProcessor();
	const view = new View( stylesProcessor );
	const viewDocument = view.document;
	const viewRoot = new ViewRootEditableElement( viewDocument, 'div' );

	// Create a temporary root element in view document.
	viewRoot.rootName = 'main';
	viewDocument.roots.add( viewRoot );

	// Create and setup downcast dispatcher.
	const downcastDispatcher = new DowncastDispatcher( { mapper, schema: model.schema } );

	// Bind root elements.
	mapper.bindElements( node.root as ModelElement | ModelDocumentFragment, viewRoot );

	downcastDispatcher.on<DowncastInsertEvent<ModelText | ModelTextProxy>>( 'insert:$text', insertText() );
	downcastDispatcher.on<DowncastInsertEvent<ModelElement>>( 'insert', insertAttributesAndChildren(), { priority: 'lowest' } );
	downcastDispatcher.on<DowncastAttributeEvent>( 'attribute', ( evt, data, conversionApi ) => {
		if ( data.item instanceof ModelSelection || data.item instanceof DocumentSelection || data.item.is( '$textProxy' ) ) {
			const converter = wrap( ( modelAttributeValue, { writer } ) => {
				return writer.createAttributeElement(
					'model-text-with-attributes',
					{ [ data.attributeKey ]: stringifyAttributeValue( modelAttributeValue ) }
				);
			} );

			converter( evt, data, conversionApi );
		}
	} );
	downcastDispatcher.on<DowncastInsertEvent<ModelElement>>( 'insert', insertElement( modelItem => {
		// Stringify object types values for properly display as an output string.
		const attributes = convertAttributes( modelItem.getAttributes(), stringifyAttributeValue );

		return new ViewContainerElement( viewDocument, modelItem.name, attributes );
	} ) );

	downcastDispatcher.on<DowncastSelectionEvent>( 'selection', convertRangeSelection() );
	downcastDispatcher.on<DowncastSelectionEvent>( 'selection', convertCollapsedSelection() );
	downcastDispatcher.on<DowncastAddMarkerEvent>( 'addMarker', insertUIElement( ( data, { writer } ) => {
		const name = data.markerName + ':' + ( data.isOpening ? 'start' : 'end' );

		return writer.createUIElement( name );
	} ) );

	const markersMap: Map<string, ModelRange> = new Map();

	if ( markers ) {
		// To provide stable results, sort markers by name.
		for ( const marker of Array.from( markers ).sort( ( a, b ) => a.name < b.name ? 1 : -1 ) ) {
			markersMap.set( marker.name, marker.getRange() );
		}
	}

	// Convert model to view.
	const writer: DowncastWriter = ( view as any )._writer;
	downcastDispatcher.convert( range, markersMap, writer );

	// Convert model selection to view selection.
	if ( selection ) {
		downcastDispatcher.convertSelection( selection, markers || model.markers, writer );
	}

	// Parse view to data string.
	let data = viewStringify( viewRoot, viewDocument.selection, { sameSelectionCharacters: true } );

	// Removing unnecessary <div> and </div> added because `viewRoot` was also stringified alongside input data.
	data = data.substr( 5, data.length - 11 );

	view.destroy();

	// Replace valid XML `model-text-with-attributes` element name to `$text`.
	return data.replace( new RegExp( 'model-text-with-attributes', 'g' ), '$text' );
}

/**
 * Parses an HTML-like string and returns the model {@link module:engine/model/rootelement~RootElement rootElement}.
 *
 * **Note:** To create a {@link module:engine/model/text~Text text} node that contains attributes use:
 *
 * ```xml
 * <$text attribute="value">Text data</$text>
 * ```
 *
 * @param data HTML-like string to be parsed.
 * @param schema A schema instance used by converters for element validation.
 * @param options Additional configuration.
 * @param options.selectionAttributes A list of attributes which will be passed to the selection.
 * @param options.lastRangeBackward If set to `true`, the last range will be added as backward.
 * @param options.context The conversion context. If not provided, the default `'$root'` will be used.
 * @returns Returns the parsed model node or an object with two fields: `model` and `selection`,
 * when selection ranges were included in the data to parse.
 */
export function parse(
	data: string,
	schema: Schema,
	options: {
		selectionAttributes?: Record<string, unknown> | Iterable<[ string, unknown ]>;
		lastRangeBackward?: boolean;
		context?: SchemaContextDefinition;
		inlineObjectElements?: Array<string>;
	} = {}
): ModelNode | ModelDocumentFragment | {
	model: ModelNode | ModelDocumentFragment;
	selection: ModelSelection;
} {
	const mapper = new Mapper();

	// Replace not accepted by XML `$text` tag name by valid one `model-text-with-attributes`.
	data = data.replace( new RegExp( '\\$text', 'g' ), 'model-text-with-attributes' );

	// Parse data to view using view utils.
	const parsedResult = viewParse( data, {
		sameSelectionCharacters: true,
		lastRangeBackward: !!options.lastRangeBackward,
		inlineObjectElements: options.inlineObjectElements
	} );

	// Retrieve DocumentFragment and Selection from parsed view.
	let viewDocumentFragment: ViewNode | ViewDocumentFragment;
	let viewSelection: ViewDocumentSelection | null = null;
	let selection: ModelSelection | null = null;

	if ( 'view' in parsedResult && 'selection' in parsedResult ) {
		viewDocumentFragment = parsedResult.view;
		viewSelection = parsedResult.selection;
	} else {
		viewDocumentFragment = parsedResult;
	}

	// Set up upcast dispatcher.
	const modelController = new Model();
	const upcastDispatcher = new UpcastDispatcher( { schema } );

	upcastDispatcher.on<UpcastDocumentFragmentEvent>( 'documentFragment', convertToModelFragment( mapper ) );
	upcastDispatcher.on<UpcastElementEvent>( 'element:model-text-with-attributes', convertToModelText() );
	upcastDispatcher.on<UpcastElementEvent>( 'element', convertToModelElement( mapper ) );
	upcastDispatcher.on<UpcastTextEvent>( 'text', convertToModelText() );

	// Convert view to model.
	let model: ModelDocumentFragment | ModelNode = modelController.change(
		writer => upcastDispatcher.convert( viewDocumentFragment.root, writer, options.context || '$root' )
	);

	mapper.bindElements( model, viewDocumentFragment.root );

	// If root DocumentFragment contains only one element - return that element.
	if ( model.childCount == 1 ) {
		model = model.getChild( 0 )!;
	}

	// Convert view selection to model selection.

	if ( viewSelection ) {
		const ranges: Array<ModelRange> = [];

		// Convert ranges.
		for ( const viewRange of viewSelection.getRanges() ) {
			ranges.push( mapper.toModelRange( viewRange ) );
		}

		// Create new selection.
		selection = new ModelSelection( ranges, { backward: viewSelection.isBackward } );

		// Set attributes to selection if specified.
		for ( const [ key, value ] of toMap( options.selectionAttributes || [] ) ) {
			selection.setAttribute( key, value );
		}
	}

	// Return model end selection when selection was specified.
	if ( selection ) {
		return { model, selection };
	}

	// Otherwise return model only.
	return model;
}

// -- Converters view -> model -----------------------------------------------------

function convertToModelFragment( mapper: Mapper ) {
	return (
		evt: EventInfo,
		data: UpcastConversionData<ViewDocumentFragment>,
		conversionApi: UpcastConversionApi
	) => {
		const childrenResult = conversionApi.convertChildren( data.viewItem, data.modelCursor );

		mapper.bindElements( data.modelCursor.parent, data.viewItem );

		data = Object.assign( data, childrenResult );

		evt.stop();
	};
}

function convertToModelElement( mapper: Mapper ) {
	return (
		evt: EventInfo,
		data: UpcastConversionData<ViewElement>,
		conversionApi: UpcastConversionApi
	) => {
		const elementName = data.viewItem.name;

		if ( !conversionApi.schema.checkChild( data.modelCursor, elementName ) ) {
			throw new Error( `Element '${ elementName }' was not allowed in given position.` );
		}

		// View attribute value is a string so we want to typecast it to the original type.
		// E.g. `bold="true"` - value will be parsed from string `"true"` to boolean `true`.
		const attributes = convertAttributes( data.viewItem.getAttributes(), parseAttributeValue );
		const element = conversionApi.writer.createElement( data.viewItem.name, attributes );

		conversionApi.writer.insert( element, data.modelCursor );

		mapper.bindElements( element, data.viewItem );

		conversionApi.convertChildren( data.viewItem, element );

		data.modelRange = ModelRange._createOn( element );
		data.modelCursor = data.modelRange.end;

		evt.stop();
	};
}

function convertToModelText() {
	return (
		evt: EventInfo,
		data: UpcastConversionData<ViewElement | ViewText>,
		conversionApi: UpcastConversionApi
	) => {
		if ( !conversionApi.schema.checkChild( data.modelCursor, '$text' ) ) {
			throw new Error( 'Text was not allowed in given position.' );
		}

		let node;

		if ( data.viewItem.is( 'element' ) ) {
			// View attribute value is a string so we want to typecast it to the original type.
			// E.g. `bold="true"` - value will be parsed from string `"true"` to boolean `true`.
			const attributes = convertAttributes( data.viewItem.getAttributes(), parseAttributeValue );
			const viewText = data.viewItem.getChild( 0 ) as ViewText;

			node = conversionApi.writer.createText( viewText.data, attributes );
		} else {
			node = conversionApi.writer.createText( data.viewItem.data );
		}

		conversionApi.writer.insert( node, data.modelCursor );

		data.modelRange = ModelRange._createFromPositionAndShift( data.modelCursor, node.offsetSize );
		data.modelCursor = data.modelRange.end;

		evt.stop();
	};
}

// Tries to get original type of attribute value using JSON parsing:
//
//		`'true'` => `true`
//		`'1'` => `1`
//		`'{"x":1,"y":2}'` => `{ x: 1, y: 2 }`
//
// Parse error means that value should be a string:
//
//		`'foobar'` => `'foobar'`
function parseAttributeValue( attribute: string ): any {
	try {
		return JSON.parse( attribute );
	} catch {
		return attribute;
	}
}

// When value is an Object stringify it.
function stringifyAttributeValue( data: any ): string {
	if ( isPlainObject( data ) ) {
		return JSON.stringify( data );
	}

	return data;
}

// Loop trough attributes map and converts each value by passed converter.
function* convertAttributes(
	attributes: IterableIterator<[ string, unknown ]>,
	converter: ( data: any ) => string
): IterableIterator<[ string, string ]> {
	for ( const [ key, value ] of attributes ) {
		yield [ key, converter( value ) ];
	}
}
