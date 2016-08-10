/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Mapper from '/ckeditor5/engine/conversion/mapper.js';
import { parse as viewParse, stringify as viewStringify } from '/tests/engine/_utils/view.js';
import {
	convertRangeSelection,
	convertCollapsedSelection,
	convertSelectionAttribute
} from '/ckeditor5/engine/conversion/model-selection-to-view-converters.js';
import { insertText, insertElement, wrap } from '/ckeditor5/engine/conversion/model-to-view-converters.js';

import RootElement from '/ckeditor5/engine/model/rootelement.js';
import ModelDocument from '/ckeditor5/engine/model/document.js';
import ModelRange from '/ckeditor5/engine/model/range.js';
import ModelPosition from '/ckeditor5/engine/model/position.js';
import ModelConversionDispatcher from '/ckeditor5/engine/conversion/modelconversiondispatcher.js';
import ModelSelection from '/ckeditor5/engine/model/selection.js';
import ModelDocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ModelText from '/ckeditor5/engine/model/text.js';
import ModelTextProxy from '/ckeditor5/engine/model/textproxy.js';
import modelWriter from '/ckeditor5/engine/model/writer.js';

import ViewConversionDispatcher from '/ckeditor5/engine/conversion/viewconversiondispatcher.js';
import ViewSelection from '/ckeditor5/engine/view/selection.js';
import ViewDocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import ViewElement from '/ckeditor5/engine/view/containerelement.js';
import ViewAttributeElement from '/ckeditor5/engine/view/attributeelement.js';

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
	if ( !( document instanceof ModelDocument ) ) {
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
 * @param {Array<Object>} [options.selectionAttributes] List of attributes which will be passed to the selection.
 * @param {Boolean} [options.lastRangeBackward=false] If set to true last range will be added as backward.
 * @param {String} [options.batchType='transparent'] Batch type used for inserting elements. See {@link engine.model.Batch#type}.
 */
export function setData( document, data, options = {} ) {
	if ( !( document instanceof ModelDocument ) ) {
		throw new TypeError( 'Document needs to be an instance of engine.model.Document.' );
	}

	let modelDocumentFragment, selection;
	const modelRoot = document.getRoot( options.rootName || 'main' );

	// Parse data string to model.
	const parsedResult = setData._parse( data, document.schema, {
		lastRangeBackward: options.lastRangeBackward,
		selectionAttributes: options.selectionAttributes
	} );

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
			.remove( ModelRange.createIn( modelRoot ) )
			.insert( ModelPosition.createAt( modelRoot, 0 ), modelDocumentFragment );

		// Clean up previous document selection.
		document.selection.clearAttributes();
		document.selection.removeAllRanges();

		// Update document selection if specified.
		if ( selection ) {
			const ranges = [];

			for ( let range of selection.getRanges() ) {
				let start, end;

				// Each range returned from `parse()` method has its root placed in DocumentFragment.
				// Here we convert each range to have its root re-calculated properly and be placed inside
				// model document root.
				if ( range.start.parent instanceof ModelDocumentFragment ) {
					start = ModelPosition.createFromParentAndOffset( modelRoot, range.start.offset );
				} else {
					start = ModelPosition.createFromParentAndOffset( range.start.parent, range.start.offset );
				}

				if ( range.end.parent instanceof ModelDocumentFragment ) {
					end = ModelPosition.createFromParentAndOffset( modelRoot, range.end.offset );
				} else {
					end = ModelPosition.createFromParentAndOffset( range.end.parent, range.end.offset );
				}

				ranges.push( new ModelRange( start, end ) );
			}

			document.selection.setRanges( ranges, selection.isBackward );
			document.selection.setAttributesTo( selection.getAttributes() );
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

	// Create a range witch wraps passed node.
	if ( node instanceof RootElement || node instanceof ModelDocumentFragment ) {
		range = ModelRange.createIn( node );
	} else {
		// Node is detached - create new document fragment.
		if ( !node.parent ) {
			const fragment = new ModelDocumentFragment( node );
			range = ModelRange.createIn( fragment );
		} else {
			range = new ModelRange(
				ModelPosition.createBefore( node ),
				ModelPosition.createAfter( node )
			);
		}
	}

	// Get selection from passed selection or position or range if at least one is specified.
	if ( selectionOrPositionOrRange instanceof ModelSelection ) {
		selection = selectionOrPositionOrRange;
	} else if ( selectionOrPositionOrRange instanceof ModelRange ) {
		selection = new ModelSelection();
		selection.addRange( selectionOrPositionOrRange );
	} else if ( selectionOrPositionOrRange instanceof ModelPosition ) {
		selection = new ModelSelection();
		selection.addRange( new ModelRange( selectionOrPositionOrRange, selectionOrPositionOrRange ) );
	}

	// Setup model to view converter.
	const viewDocumentFragment = new ViewDocumentFragment();
	const viewSelection = new ViewSelection();
	const modelToView = new ModelConversionDispatcher( { mapper, viewSelection } );

	// Bind root elements.
	mapper.bindElements( node.root, viewDocumentFragment );

	modelToView.on( 'insert:$text', insertText() );
	modelToView.on( 'addAttribute', wrap( ( value, data ) => {
		if ( data.item instanceof ModelTextProxy ) {
			return new ViewAttributeElement( 'model-text-with-attributes', { [ data.attributeKey ]: value } );
		}
	} ) );
	modelToView.on( 'insert', insertElement( data => new ViewElement( data.item.name, data.item.getAttributes() )  ) );
	modelToView.on( 'selection', convertRangeSelection() );
	modelToView.on( 'selection', convertCollapsedSelection() );
	modelToView.on( 'selectionAttribute', convertSelectionAttribute( ( value, data ) => {
		return new ViewAttributeElement( 'model-text-with-attributes', { [ data.key ]: value } );
	} ) );

	// Convert model to view.
	modelToView.convertInsertion( range );

	// Convert model selection to view selection.
	if ( selection ) {
		modelToView.convertSelection( selection );
	}

	// Parse view to data string.
	let data = viewStringify( viewDocumentFragment, viewSelection, { sameSelectionCharacters: true } );

	// Replace valid XML `model-text-with-attributes` element name to `$text`.
	return data.replace( new RegExp( 'model-text-with-attributes', 'g' ), '$text' );
}

/**
 * Parses HTML-like string and returns model {@link engine.model.RootElement rootElement}.
 *
 * ** Note: ** To create {@link engine.model.Text text} node witch containing attributes use:
 *        <$text attribute="value">Text data</$text>
 *
 * @param {String} data HTML-like string to be parsed.
 * @param {engine.model.schema} schema Schema instance uses by converters for element validation.
 * @param {Object} options Additional configuration.
 * @param {Array<Object>} [options.selectionAttributes] List of attributes which will be passed to the selection.
 * @param {Boolean} [options.lastRangeBackward=false] If set to true last range will be added as backward.
 * @returns {engine.model.Element|engine.model.Text|engine.model.DocumentFragment|Object} Returns parsed model node or
 * object with two fields `model` and `selection` when selection ranges were included in data to parse.
 */
export function parse( data, schema, options = {} ) {
	const mapper = new Mapper();

	// Replace not accepted by XML `$text` tag name by valid one `model-text-with-attributes`.
	data = data.replace( new RegExp( '\\$text', 'g' ), 'model-text-with-attributes' );

	// Parse data to view using view utils.
	const parsedResult = viewParse( data, {
		sameSelectionCharacters: true,
		lastRangeBackward: !!options.lastRangeBackward
	} );

	// Retrieve DocumentFragment and Selection from parsed view.
	let viewDocumentFragment, viewSelection;

	if ( parsedResult.view && parsedResult.selection ) {
		viewDocumentFragment = parsedResult.view;
		viewSelection = parsedResult.selection;
	} else {
		viewDocumentFragment = parsedResult;
	}

	// Setup view to model converter.
	const viewToModel = new ViewConversionDispatcher( { schema, mapper } );

	viewToModel.on( 'documentFragment', convertToModelFragment() );
	viewToModel.on( `element:model-text-with-attributes`, convertToModelText( true ) );
	viewToModel.on( 'element', convertToModelElement() );
	viewToModel.on( 'text', convertToModelText() );

	// Convert view to model.
	let model = viewToModel.convert( viewDocumentFragment.root, { context: [ '$root' ] } );

	// If root DocumentFragment contains only one element - return that element.
	if ( model instanceof ModelDocumentFragment && model.childCount == 1 ) {
		model = model.getChild( 0 );
	}

	// Convert view selection to model selection.
	let selection;

	if ( viewSelection ) {
		const ranges = [];

		// Convert ranges.
		for ( let viewRange of viewSelection.getRanges() ) {
			ranges.push( ( mapper.toModelRange( viewRange ) ) );
		}

		// Create new selection.
		selection = new ModelSelection();
		selection.setRanges( ranges, viewSelection.isBackward );

		// Set attributes to selection if specified.
		if ( options.selectionAttributes ) {
			selection.setAttributesTo( options.selectionAttributes );
		}
	}

	// Return model end selection when selection was specified.
	if ( selection ) {
		return { model, selection };
	}

	// Otherwise return model only.
	return model;
}

// -- converters view -> model -----------------------------------------------------

function convertToModelFragment() {
	return ( evt, data, consumable, conversionApi ) => {
		const convertedChildren = conversionApi.convertChildren( data.input, consumable, data );

		data.output = new ModelDocumentFragment( modelWriter.normalizeNodes( convertedChildren ) );
		conversionApi.mapper.bindElements( data.output, data.input );

		evt.stop();
	};
}

function convertToModelElement() {
	return ( evt, data, consumable, conversionApi ) => {
		const schemaQuery = {
			name: data.input.name,
			inside: data.context
		};

		if ( !conversionApi.schema.check( schemaQuery ) ) {
			throw new Error( `Element '${ schemaQuery.name }' not allowed in context.` );
		}

		data.output = new ModelElement( data.input.name, data.input.getAttributes() );
		conversionApi.mapper.bindElements( data.output, data.input );

		data.context.push( data.output );
		data.output.appendChildren( conversionApi.convertChildren( data.input, consumable, data ) );
		data.context.pop();

		evt.stop();
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

		let node;

		if ( withAttributes ) {
			node = new ModelText( data.input.getChild( 0 ).data, data.input.getAttributes() );
		} else {
			node = new ModelText( data.input.data );
		}

		data.output = node;

		evt.stop();
	};
}
