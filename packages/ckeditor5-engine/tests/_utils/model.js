/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Mapper from '/ckeditor5/engine/conversion/mapper.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import RootElement from '/ckeditor5/engine/model/rootelement.js';
import Selection from '/ckeditor5/engine/model/selection.js';
import Document from '/ckeditor5/engine/model/document.js';
import ViewConversionDispatcher from '/ckeditor5/engine/conversion/viewconversiondispatcher.js';
import ModelConversionDispatcher from '/ckeditor5/engine/conversion/modelconversiondispatcher.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ModelText from '/ckeditor5/engine/model/text.js';
import ModelDocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import ViewDocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import { parse as viewParse, stringify as viewStringify  } from '/tests/engine/_utils/view.js';
import { normalizeNodes } from '/ckeditor5/engine/model/writer.js';
import ViewElement from '/ckeditor5/engine/view/containerelement.js';
import ViewText from '/ckeditor5/engine/view/text.js';
import viewWriter from '/ckeditor5/engine/view/writer.js';

let mapper;

/**
 * Writes the contents of the {@link engine.model.Document Document} to an HTML-like string.
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
 * NOTE:
 * Remember to register elements in {@link engine.model.Document#schema document's schema} before inserting them.
 *
 * @param {engine.model.Document} document
 * @param {String} data HTML-like string to write into Document.
 * @param {Object} options
 * @param {Array<Object>} [options.selectionAttributes] List of attributes which will be passed to selection.
 * @param {String} [options.rootName='main'] Root name where parsed data will be stored. If not provided, default `main`
 * name will be used.
 * @param {String} [options.batchType='transparent'] Batch type used for inserting elements. See {@link engine.model.Batch#type}.
 */
export function setData( document, data, options = {} ) {
	if ( !( document instanceof Document ) ) {
		throw new TypeError( 'Document needs to be an instance of engine.model.Document.' );
	}

	let model, selection;
	const result = setData._parse( data, { schema: document.schema } );

	if ( result.model && result.selection ) {
		model = result.model;
		selection = result.selection;
	} else {
		model = result;
	}

	// Save to model.
	const modelRoot = document.getRoot( options.rootName || 'main' );

	document.enqueueChanges( () => {
		document.batch( options.batchType || 'transparent' )
			.remove( Range.createIn( modelRoot ) )
			.insert( Position.createAt( modelRoot, 0 ), model );

		if ( selection ) {
			const ranges = [];

			for ( let viewRange of selection.getRanges() ) {
				let start, end;

				const range = mapper.toModelRange( viewRange );

				// Each range returned from `parse()` method has its root placed in DocumentFragment.
				// Here we convert each range to have its root re-calculated properly and be placed inside
				// model document root.
				if ( range.start.parent instanceof ModelDocumentFragment ) {
					start = Position.createFromParentAndOffset( modelRoot, range.start.offset );
				} else {
					start = Position.createFromParentAndOffset( range.start.parent, range.start.offset );
				}

				if ( range.end.parent instanceof ModelDocumentFragment ) {
					end = Position.createFromParentAndOffset( modelRoot, range.end.offset );
				} else {
					end = Position.createFromParentAndOffset( range.end.parent, range.end.offset );
				}

				ranges.push( new Range( start, end ) );
			}

			document.selection.setRanges( ranges, selection.isBackward );

			if ( options.selectionAttribtes ) {
				document.selection.setAttributesTo( options.selectionAttribtes );
			}
		}
	} );
}

// Set parse as setData private method - needed for testing/spying.
setData._parse = parse;

/**
 * Converts model nodes to HTML-like string representation.
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
	mapper = new Mapper();

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

	if ( selectionOrPositionOrRange instanceof Selection ) {
		selection = selectionOrPositionOrRange;
	} else if ( selectionOrPositionOrRange instanceof Range ) {
		selection = new Selection();
		selection.addRange( selectionOrPositionOrRange );
	} else if ( selectionOrPositionOrRange instanceof Position ) {
		selection = new Selection();
		selection.addRange( new Range( selectionOrPositionOrRange, selectionOrPositionOrRange ) );
	}

	// Setup model -> view converter.
	const viewDocumentFragment = new ViewDocumentFragment();
	const modelToView = new ModelConversionDispatcher( {
		mapper: mapper
	} );

	modelToView.on( 'insert:$text', insertText() );
	modelToView.on( 'insert', insertElement() );

	mapper.bindElements( node, viewDocumentFragment );

	// Convert view to model.
	modelToView.convertInsert( range );
	mapper.clearBindings();

	// Return parsed to data model.
	return viewStringify( viewDocumentFragment, selection );
}

/**
 * Parses HTML-like string and returns model {@link engine.model.RootElement rootElement}.
 *
 * @param {String} data HTML-like string to be parsed.
 * @param {Object} options
 * @param {engine.model.Schema} [options.schema] Document schema.
 * @returns {engine.model.Element|engine.model.Text|engine.model.DocumentFragment|Object} Returns parsed model node or
 * object with two fields `model` and `selection` when selection ranges were included in data to parse.
 */
export function parse( data, options ) {
	mapper = new Mapper();

	// Parse data to view using view utils.
	const view = viewParse( data );

	// Retrieve DocumentFragment and Selection from parsed view.
	let viewDocumentFragment, selection;

	if ( view.view && view.selection ) {
		viewDocumentFragment = view.view;
		selection = view.selection;
	} else {
		viewDocumentFragment = view;
	}

	viewDocumentFragment = viewDocumentFragment.parent ? viewDocumentFragment.parent : viewDocumentFragment;

	// Setup view -> model converter.
	const viewToModel = new ViewConversionDispatcher( {
		schema: options.schema
	} );

	viewToModel.on( 'text', convertToModelText() );
	viewToModel.on( 'element:model-text', convertToModelTextWithAttributes(), null, 9999 );
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

			data.output = new ModelDocumentFragment( normalizeNodes( convertedChildren ) );

			mapper.bindElements( data.output, data.input );
		}
	};
}

function convertToModelElement() {
	return ( evt, data, consumable, conversionApi ) => {
		if ( consumable.consume( data.input, { name: true } ) ) {
			data.output = new ModelElement( data.input.name, data.input.getAttributes() );

			mapper.bindElements( data.output, data.input );

			data.context.push( data.output );
			data.output.appendChildren( conversionApi.convertChildren( data.input, consumable, data ) );
			data.context.pop();
		}
	};
}

function convertToModelText() {
	return ( evt, data ) => {
		data.output = new ModelText( data.input.data );
	};
}

function convertToModelTextWithAttributes() {
	return ( evt, data, consumable ) => {
		if ( consumable.consume( data.input, { name: true } ) ) {
			data.output = new ModelText( data.input.getChild( 0 ).data, data.input.getAttributes() );
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

		evt.stop();
	};
}

function insertText() {
	return ( evt, data, consumable, conversionApi ) => {
		consumable.consume( data.item, 'insert' );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		const viewText = new ViewText( data.item.data );

		viewWriter.insert( viewPosition, viewText );

		evt.stop();
	};
}
