/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Mapper from '/ckeditor5/engine/conversion/mapper.js';
import Document from '/ckeditor5/engine/model/document.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import RootElement from '/ckeditor5/engine/model/rootelement.js';

import ModelConversionDispatcher from '/ckeditor5/engine/conversion/modelconversiondispatcher.js';
import ModelSelection from '/ckeditor5/engine/model/selection.js';
import ModelDocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ModelText from '/ckeditor5/engine/model/text.js';
import modelWriter from '/ckeditor5/engine/model/writer.js';

import ViewConversionDispatcher from '/ckeditor5/engine/conversion/viewconversiondispatcher.js';
import ViewSelection from '/ckeditor5/engine/view/selection.js';
import ViewDocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import ViewElement from '/ckeditor5/engine/view/containerelement.js';
import ViewText from '/ckeditor5/engine/view/text.js';
import viewWriter from '/ckeditor5/engine/view/writer.js';

import count from '/ckeditor5/utils/count.js';
import { parse as viewParse, stringify as viewStringify } from '/tests/engine/_utils/view.js';
import { convertRangeSelection, convertCollapsedSelection } from '/ckeditor5/engine/conversion/model-selection-to-view-converters.js';

// Test utils uses `<$text foo="bar">Lorem ipsum</$text>` notation to create text with attributes, but `$text` is not
// valid XML element name, so needs to be parsed before conversion to view.
const VIEW_TEXT_WITH_ATTRIBUTES_ELEMENT = 'view-text-with-attributes';
const DATA_STRING_TEXT_WITH_ATTRIBUTES_ELEMENT = '$text';

/**
 * Writes the contents of the {@link engine.model.Document Document} to an HTML-like string.
 *
 * ** Note: ** {@link engine.model.Text text} node contains attributes will be represented as:
 *        <$text attribute="value">Text data</$text>
 *
 * @param {engine.model.Document} document
 * @param {Object} [options]
 * @param {Boolean} [options.withoutSelection=false] Whether to write the selection. When set to `true` selection will
 * be not included in returned string.
 * @param {Boolean} [options.rootName='main'] Name of the root from which data should be stringified. If not provided
 * default `main` name will be used.
 * @returns {String} The stringified data.
 */
export function getData( document, options = {} ) {
	if ( !( document instanceof Document ) ) {
		throw new TypeError( 'Document needs to be an instance of engine.model.Document.' );
	}

	const withoutSelection = !!options.withoutSelection;
	const rootName = options.rootName || 'main';
	const root = document.getRoot( rootName );

	return withoutSelection ? getData._stringify( root ) : getData._stringify( root, document.selection );
}

// Set stringify as getData private method - needed for testing/spying.
getData._stringify = stringify;

/**
 * Sets the contents of the {@link engine.model.Document Document} provided as HTML-like string.
 * It uses {@link engine.model.Document#enqueueChanges enqueueChanges} method.
 *
 * ** Note: ** Remember to register elements in {@link engine.model.Document#schema document's schema} before inserting them.
 *
 * ** Note: ** To create {@link engine.model.Text text} node witch containing attributes use:
 *        <$text attribute="value">Text data</$text>
 *
 * @param {engine.model.Document} document
 * @param {String} data HTML-like string to write into Document.
 * @param {Object} options
 * @param {String} [options.rootName='main'] Root name where parsed data will be stored. If not provided, default `main`
 * name will be used.
 * @param {Array<Object>} [options.selectionAttributes] List of attributes which will be passed to selection.
 * @param {String} [options.batchType='transparent'] Batch type used for inserting elements. See {@link engine.model.Batch#type}.
 */
export function setData( document, data, options = {} ) {
	if ( !( document instanceof Document ) ) {
		throw new TypeError( 'Document needs to be an instance of engine.model.Document.' );
	}

	let modelDocumentFragment, selection;
	const mapper = new Mapper();
	const modelRoot = document.getRoot( options.rootName || 'main' );

	// Parse data string to model.
	const parsedResult = setData._parse( data, document.schema, mapper );

	// Retrieve DocumentFragment and Selection from parsed model.
	if ( parsedResult.model ) {
		modelDocumentFragment = parsedResult.model;
		selection = parsedResult.selection;
	} else {
		modelDocumentFragment = parsedResult;
	}

	document.enqueueChanges( () => {
		// Replace existing model in document by new one.
		document.batch( options.batchType || 'transparent' )
			.remove( Range.createFromElement( modelRoot ) )
			.insert( Position.createAt( modelRoot, 0 ), modelDocumentFragment );

		// Clear selection
		document.selection.clearAttributes();
		document.selection.removeAllRanges();

		// Set attributes to selection if specified.
		if ( options.selectionAttributes ) {
			document.selection.setAttributesTo( options.selectionAttributes );
		}

		// Convert view selection to model if selection is defined.
		if ( selection ) {
			const ranges = [];

			for ( let viewRange of selection.getRanges() ) {
				ranges.push( ( mapper.toModelRange( viewRange ) ) );
			}

			document.selection.setRanges( ranges, selection.isBackward );
		}
	} );
}

// Set parse as setData private method - needed for testing/spying.
setData._parse = parse;

/**
 * Converts model nodes to HTML-like string representation.
 *
 * ** Note: ** {@link engine.model.Text text} node contains attributes will be represented as:
 *        <$text attribute="value">Text data</$text>
 *
 * @param {engine.model.RootElement|engine.model.Element|engine.model.Text|
 * engine.model.DocumentFragment} node Node to stringify.
 * @param {engine.model.Selection|engine.model.Position|engine.model.Range} [selectionOrPositionOrRange=null]
 * Selection instance which ranges will be included in returned string data. If Range instance is provided - it will be
 * converted to selection containing this range. If Position instance is provided - it will be converted to selection
 * containing one range collapsed at this position.
 * @returns {String} HTML-like string representing the model.
 */
export function stringify( node, selectionOrPositionOrRange = null ) {
	const mapper = new Mapper();
	let selection, range;

	// Create a range wrapping passed node.
	if ( node instanceof RootElement || node instanceof ModelDocumentFragment ) {
		range = Range.createFromElement( node );
	} else {
		// Node is detached - create new document fragment.
		if ( !node.parent ) {
			const fragment = new ModelDocumentFragment( node );
			range = Range.createFromElement( fragment );
		} else {
			range = new Range(
				Position.createBefore( node ),
				Position.createAfter( node )
			);
		}
	}

	// Get selection from passed selection or position or range if at least one is specified.
	if ( selectionOrPositionOrRange instanceof ModelSelection ) {
		selection = selectionOrPositionOrRange;
	} else if ( selectionOrPositionOrRange instanceof Range ) {
		selection = new ModelSelection();
		selection.addRange( selectionOrPositionOrRange );
	} else if ( selectionOrPositionOrRange instanceof Position ) {
		selection = new ModelSelection();
		selection.addRange( new Range( selectionOrPositionOrRange, selectionOrPositionOrRange ) );
	}

	// Setup model -> view converter.
	const viewDocumentFragment = new ViewDocumentFragment();
	const viewSelection = new ViewSelection();
	const modelToView = new ModelConversionDispatcher( { mapper, viewSelection } );

	modelToView.on( 'insert:$text', insertText() );
	modelToView.on( 'insert', insertElement() );
	modelToView.on( 'selection', convertRangeSelection() );
	modelToView.on( 'selection', convertCollapsedSelection() );

	mapper.bindElements( node, viewDocumentFragment );

	// Convert view to model.
	modelToView.convertInsert( range );

	if ( selection ) {
		modelToView.convertSelection( selection );
	}

	mapper.clearBindings();

	// Parse view to data string.
	let data = viewStringify( viewDocumentFragment, viewSelection, { sameSelectionCharacters: true } );

	// Replace valid XML text element name to `$text`.
	return data.replace( new RegExp( VIEW_TEXT_WITH_ATTRIBUTES_ELEMENT, 'g' ), DATA_STRING_TEXT_WITH_ATTRIBUTES_ELEMENT );
}

/**
 * Parses HTML-like string and returns model {@link engine.model.RootElement rootElement}.
 *
 * ** Note: ** To create {@link engine.model.Text text} node witch containing attributes use:
 *        <$text attribute="value">Text data</$text>
 *
 * @param {String} data HTML-like string to be parsed.
 * @param {engine.model.schema} schema Schema instance uses by converters for validation. Element not registered
 * in schema won't be created.
 * @param {engine.model.mapper} [mapper=new Mapper()] Mapper instance uses mainly by `setData` method to map position
 * between {@link engine.view.document Document} and {@link engine.model.document Document}.
 * @returns {engine.model.Element|engine.model.Text|engine.model.DocumentFragment|Object} Returns parsed model node or
 * object with two fields `model` and `selection` when selection ranges were included in data to parse.
 */
export function parse( data, schema, mapper = new Mapper() ) {
	// Replace not accepted by XML `$text` element by valid one.
	data = data.replace( new RegExp( '\\' + DATA_STRING_TEXT_WITH_ATTRIBUTES_ELEMENT, 'g' ), VIEW_TEXT_WITH_ATTRIBUTES_ELEMENT );

	// Parse data to view using view utils.
	const parsedResult = viewParse( data, { sameSelectionCharacters: true } );

	// Retrieve DocumentFragment and Selection from parsed view.
	let viewDocumentFragment, selection;

	if ( parsedResult.view && parsedResult.selection ) {
		viewDocumentFragment = parsedResult.view;
		selection = parsedResult.selection;
	} else {
		viewDocumentFragment = parsedResult;
	}

	viewDocumentFragment = viewDocumentFragment.parent ? viewDocumentFragment.parent : viewDocumentFragment;

	// Setup view -> model converter.
	const viewToModel = new ViewConversionDispatcher( { mapper, schema } );

	viewToModel.on( 'text', convertToModelText() );
	viewToModel.on( `element:${ VIEW_TEXT_WITH_ATTRIBUTES_ELEMENT }`, convertToModelText( true ), null, 9999 );
	viewToModel.on( 'element', convertToModelElement(), null, 9999 );
	viewToModel.on( 'documentFragment', convertToModelFragment(), null, 9999 );

	// Convert view to model.
	let root = viewToModel.convert( viewDocumentFragment, { context: [ '$root' ] } );

	// If root DocumentFragment contains only one element - return that element.
	if ( root instanceof DocumentFragment && root.childCount == 1 ) {
		root = root.getChild( 0 );
	}

	// Return model end selection when selection was specified.
	if ( selection ) {
		return {
			model: root,
			selection: selection
		};
	}

	// Otherwise return model only.
	return root;
}

// -- converters view -> model -----------------------------------------------------

function convertToModelFragment() {
	return ( evt, data, consumable, conversionApi ) => {
		// Second argument in `consumable.test` is discarded for ViewDocumentFragment but is needed for ViewElement.
		if ( !data.output && consumable.test( data.input, { name: true } ) ) {
			const convertedChildren = conversionApi.convertChildren( data.input, consumable, data );

			data.output = new ModelDocumentFragment( modelWriter.normalizeNodes( convertedChildren ) );
			conversionApi.mapper.bindElements( data.output, data.input );
		}
	};
}

function convertToModelElement() {
	return ( evt, data, consumable, conversionApi ) => {
		const schemaQuery = {
			name: data.input.name,
			inside: data.context
		};

		// `VIEW_TEXT_WITH_ATTRIBUTES_ELEMENT` is handled in specified way by `convertToModelTextWithAttributes`.
		if ( data.input.name !== VIEW_TEXT_WITH_ATTRIBUTES_ELEMENT ) {
			if ( !conversionApi.schema.check( schemaQuery ) ) {
				throw new Error( `Element '${ schemaQuery.name }' not allowed in context.` );
			}

			if ( consumable.consume( data.input, { name: true } ) ) {
				data.output = new ModelElement( data.input.name, data.input.getAttributes() );
				conversionApi.mapper.bindElements( data.output, data.input );

				data.context.push( data.output );
				data.output.appendChildren( conversionApi.convertChildren( data.input, consumable, data ) );
				data.context.pop();
			}
		}
	};
}

function convertToModelText( withAttributes = false ) {
	return ( evt, data, consumable, conversionApi ) => {
		const schemaQuery = {
			name: '$text',
			inside: data.context
		};

		if ( !conversionApi.schema.check( schemaQuery ) ) {
			throw new Error( `Element '${ schemaQuery.name }' not allowed in context.` );
		}

		if ( conversionApi.schema.check( schemaQuery ) ) {
			if ( consumable.consume( data.input, { name: true } ) ) {
				let node;

				if ( withAttributes ) {
					node = new ModelText( data.input.getChild( 0 ).data, data.input.getAttributes() );
				} else {
					node = new ModelText( data.input.data );
				}

				data.output = node;
			}
		}
	};
}

// -- converters model -> view -----------------------------------------------------

function insertElement() {
	return ( evt, data, consumable, conversionApi ) => {
		consumable.consume( data.item, 'insert' );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		const viewElement = new ViewElement( data.item.name, data.item.getAttributes() );

		conversionApi.mapper.bindElements( data.item, viewElement );
		viewWriter.insert( viewPosition, viewElement );
	};
}

function insertText() {
	return ( evt, data, consumable, conversionApi ) => {
		consumable.consume( data.item, 'insert' );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		const viewText = new ViewText( data.item.data );
		let node;

		if ( count( data.item.getAttributes() ) ) {
			node = new ViewElement( VIEW_TEXT_WITH_ATTRIBUTES_ELEMENT, data.item.getAttributes(), [ viewText ] );
		} else {
			node = viewText;
		}

		viewWriter.insert( viewPosition, node );

		evt.stop();
	};
}
