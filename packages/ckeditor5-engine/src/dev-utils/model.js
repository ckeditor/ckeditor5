/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/dev-utils/model
 */

/**
 * Collection of methods for manipulating {@link module:engine/model/model model} for testing purposes.
 */

import RootElement from '../model/rootelement';
import ModelDocument from '../model/document';
import ModelRange from '../model/range';
import ModelPosition from '../model/position';
import ModelConversionDispatcher from '../conversion/modelconversiondispatcher';
import ModelSelection from '../model/selection';
import ModelDocumentFragment from '../model/documentfragment';
import ModelElement from '../model/element';
import ModelText from '../model/text';
import modelWriter from '../model/writer';

import ViewConversionDispatcher from '../conversion/viewconversiondispatcher';
import ViewSelection from '../view/selection';
import ViewDocumentFragment from '../view/documentfragment';
import ViewContainerElement from '../view/containerelement';
import ViewAttributeElement from '../view/attributeelement';

import Mapper from '../conversion/mapper';
import { parse as viewParse, stringify as viewStringify } from '../../src/dev-utils/view';
import {
	convertRangeSelection,
	convertCollapsedSelection,
	convertSelectionAttribute
} from '../conversion/model-selection-to-view-converters';
import { insertText, insertElement, wrapItem } from '../conversion/model-to-view-converters';
import isPlainObject from '@ckeditor/ckeditor5-utils/src/lib/lodash/isPlainObject';

/**
 * Writes the contents of the {@link module:engine/model/document~Document Document} to an HTML-like string.
 *
 * **Note:** {@link module:engine/model/text~Text text} node contains attributes will be represented as:
 *
 *		<$text attribute="value">Text data</$text>
 *
 * @param {module:engine/model/document~Document} document
 * @param {Object} [options]
 * @param {Boolean} [options.withoutSelection=false] Whether to write the selection. When set to `true` selection will
 * be not included in returned string.
 * @param {Boolean} [options.rootName='main'] Name of the root from which data should be stringified. If not provided
 * default `main` name will be used.
 * @returns {String} The stringified data.
 */
export function getData( document, options = {} ) {
	if ( !( document instanceof ModelDocument ) ) {
		throw new TypeError( 'Document needs to be an instance of module:engine/model/document~Document.' );
	}

	const withoutSelection = !!options.withoutSelection;
	const rootName = options.rootName || 'main';
	const root = document.getRoot( rootName );

	return withoutSelection ? getData._stringify( root ) : getData._stringify( root, document.selection );
}

// Set stringify as getData private method - needed for testing/spying.
getData._stringify = stringify;

/**
 * Sets the contents of the {@link module:engine/model/document~Document Document} provided as HTML-like string.
 * It uses {@link module:engine/model/document~Document#enqueueChanges enqueueChanges} method.
 *
 * **Note:** Remember to register elements in {@link module:engine/model/document~Document#schema document's schema} before inserting them.
 *
 * **Note:** To create {@link module:engine/model/text~Text text} node witch containing attributes use:
 *
 *		<$text attribute="value">Text data</$text>
 *
 * @param {module:engine/model/document~Document} document
 * @param {String} data HTML-like string to write into Document.
 * @param {Object} options
 * @param {String} [options.rootName='main'] Root name where parsed data will be stored. If not provided, default `main`
 * name will be used.
 * @param {Array<Object>} [options.selectionAttributes] List of attributes which will be passed to the selection.
 * @param {Boolean} [options.lastRangeBackward=false] If set to true last range will be added as backward.
 * @param {String} [options.batchType='transparent'] Batch type used for inserting elements.
 * See {@link module:engine/model/batch~Batch#type}.
 */
export function setData( document, data, options = {} ) {
	if ( !( document instanceof ModelDocument ) ) {
		throw new TypeError( 'Document needs to be an instance of module:engine/model/document~Document.' );
	}

	let modelDocumentFragment, selection;
	const modelRoot = document.getRoot( options.rootName || 'main' );

	// Parse data string to model.
	const parsedResult = setData._parse( data, document.schema, {
		lastRangeBackward: options.lastRangeBackward,
		selectionAttributes: options.selectionAttributes,
		context: [ modelRoot.name ]
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

			for ( const range of selection.getRanges() ) {
				const start = new ModelPosition( modelRoot, range.start.path );
				const end = new ModelPosition( modelRoot, range.end.path );

				ranges.push( new ModelRange( start, end ) );
			}

			document.selection.setRanges( ranges, selection.isBackward );

			if ( options.selectionAttributes ) {
				document.selection.setAttributesTo( selection.getAttributes() );
			}
		}
	} );
}

// Set parse as setData private method - needed for testing/spying.
setData._parse = parse;

/**
 * Converts model nodes to HTML-like string representation.
 *
 * **Note:** {@link module:engine/model/text~Text text} node contains attributes will be represented as:
 *
 *		<$text attribute="value">Text data</$text>
 *
 * @param {module:engine/model/rootelement~RootElement|module:engine/model/element~Element|module:engine/model/text~Text|
 * module:engine/model/documentfragment~DocumentFragment} node Node to stringify.
 * @param {module:engine/model/selection~Selection|module:engine/model/position~Position|
 * module:engine/model/range~Range} [selectionOrPositionOrRange=null]
 * Selection instance which ranges will be included in returned string data. If Range instance is provided - it will be
 * converted to selection containing this range. If Position instance is provided - it will be converted to selection
 * containing one range collapsed at this position.
 * @returns {String} HTML-like string representing the model.
 */
export function stringify( node, selectionOrPositionOrRange = null ) {
	const modelDoc = new ModelDocument();
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
	const modelToView = new ModelConversionDispatcher( modelDoc, { mapper, viewSelection } );

	// Bind root elements.
	mapper.bindElements( node.root, viewDocumentFragment );

	modelToView.on( 'insert:$text', insertText() );
	modelToView.on( 'addAttribute', wrapItem( ( value, data ) => {
		if ( data.item.is( 'textProxy' ) ) {
			return new ViewAttributeElement( 'model-text-with-attributes', { [ data.attributeKey ]: stringifyAttributeValue( value ) } );
		}
	} ) );
	modelToView.on( 'insert', insertElement( data => {
		// Stringify object types values for properly display as an output string.
		const attributes = convertAttributes( data.item.getAttributes(), stringifyAttributeValue );

		return new ViewContainerElement( data.item.name, attributes );
	} ) );
	modelToView.on( 'selection', convertRangeSelection() );
	modelToView.on( 'selection', convertCollapsedSelection() );
	modelToView.on( 'selectionAttribute', convertSelectionAttribute( ( value, data ) => {
		return new ViewAttributeElement( 'model-text-with-attributes', { [ data.key ]: value } );
	} ) );

	// Convert model to view.
	modelToView.convertInsertion( range );

	// Convert model selection to view selection.
	if ( selection ) {
		modelToView.convertSelection( selection, [] );
	}

	// Parse view to data string.
	const data = viewStringify( viewDocumentFragment, viewSelection, { sameSelectionCharacters: true } );

	// Replace valid XML `model-text-with-attributes` element name to `$text`.
	return data.replace( new RegExp( 'model-text-with-attributes', 'g' ), '$text' );
}

/**
 * Parses HTML-like string and returns model {@link module:engine/model/rootelement~RootElement rootElement}.
 *
 * **Note:** To create {@link module:engine/model/text~Text text} node witch containing attributes use:
 *
 *		<$text attribute="value">Text data</$text>
 *
 * @param {String} data HTML-like string to be parsed.
 * @param {module:engine/model/schema~Schema} schema Schema instance uses by converters for element validation.
 * @param {Object} options Additional configuration.
 * @param {Array<Object>} [options.selectionAttributes] List of attributes which will be passed to the selection.
 * @param {Boolean} [options.lastRangeBackward=false] If set to true last range will be added as backward.
 * @param {module:engine/model/schema~SchemaPath} [options.context=[ '$root' ]] The conversion context.
 * If not provided default `[ '$root' ]` will be used.
 * @returns {module:engine/model/element~Element|module:engine/model/text~Text|
 * module:engine/model/documentfragment~DocumentFragment|Object} Returns parsed model node or
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
	let viewDocumentFragment, viewSelection, selection;

	if ( parsedResult.view && parsedResult.selection ) {
		viewDocumentFragment = parsedResult.view;
		viewSelection = parsedResult.selection;
	} else {
		viewDocumentFragment = parsedResult;
	}

	// Setup view to model converter.
	const viewToModel = new ViewConversionDispatcher( { schema, mapper } );

	viewToModel.on( 'documentFragment', convertToModelFragment() );
	viewToModel.on( 'element:model-text-with-attributes', convertToModelText( true ) );
	viewToModel.on( 'element', convertToModelElement() );
	viewToModel.on( 'text', convertToModelText() );

	// Convert view to model.
	let model = viewToModel.convert( viewDocumentFragment.root, { context: options.context || [ '$root' ] } );

	// If root DocumentFragment contains only one element - return that element.
	if ( model.is( 'documentFragment' ) && model.childCount == 1 ) {
		model = model.getChild( 0 );
	}

	// Convert view selection to model selection.

	if ( viewSelection ) {
		const ranges = [];

		// Convert ranges.
		for ( const viewRange of viewSelection.getRanges() ) {
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

// -- Converters view -> model -----------------------------------------------------

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
			attributes: Array.from( data.input.getAttributeKeys() ),
			inside: data.context
		};

		if ( !conversionApi.schema.check( schemaQuery ) ) {
			throw new Error( `Element '${ schemaQuery.name }' not allowed in context ${ JSON.stringify( data.context ) }.` );
		}

		// View attribute value is a string so we want to typecast it to the original type.
		// E.g. `bold="true"` - value will be parsed from string `"true"` to boolean `true`.
		const attributes = convertAttributes( data.input.getAttributes(), parseAttributeValue );

		data.output = new ModelElement( data.input.name, attributes );
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
			throw new Error( `Element '${ schemaQuery.name }' not allowed in context ${ JSON.stringify( data.context ) }.` );
		}

		let node;

		if ( withAttributes ) {
			// View attribute value is a string so we want to typecast it to the original type.
			// E.g. `bold="true"` - value will be parsed from string `"true"` to boolean `true`.
			const attributes = convertAttributes( data.input.getAttributes(), parseAttributeValue );

			node = new ModelText( data.input.getChild( 0 ).data, attributes );
		} else {
			node = new ModelText( data.input.data );
		}

		data.output = node;

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
function parseAttributeValue( attribute ) {
	try {
		return JSON.parse( attribute );
	} catch ( e ) {
		return attribute;
	}
}

// When value is an Object stringify it.
function stringifyAttributeValue( data ) {
	if ( isPlainObject( data ) ) {
		return JSON.stringify( data );
	}

	return data;
}

// Loop trough attributes map and converts each value by passed converter.
function* convertAttributes( attributes, converter ) {
	for ( const [ key, value ] of attributes ) {
		yield [ key, converter( value ) ];
	}
}
