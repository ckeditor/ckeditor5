/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/dev-utils/view
 */

/* globals document */

/**
 * Collection of methods for manipulating the {@link module:engine/view/view view} for testing purposes.
 */

import View from '../view/view';
import ViewDocument from '../view/document';
import ViewDocumentFragment from '../view/documentfragment';
import XmlDataProcessor from '../dataprocessor/xmldataprocessor';
import ViewElement from '../view/element';
import DocumentSelection from '../view/documentselection';
import Range from '../view/range';
import Position from '../view/position';
import AttributeElement from '../view/attributeelement';
import ContainerElement from '../view/containerelement';
import EmptyElement from '../view/emptyelement';
import UIElement from '../view/uielement';
import RawElement from '../view/rawelement';
import { StylesProcessor } from '../view/stylesmap';

const ELEMENT_RANGE_START_TOKEN = '[';
const ELEMENT_RANGE_END_TOKEN = ']';
const TEXT_RANGE_START_TOKEN = '{';
const TEXT_RANGE_END_TOKEN = '}';
const allowedTypes = {
	'container': ContainerElement,
	'attribute': AttributeElement,
	'empty': EmptyElement,
	'ui': UIElement,
	'raw': RawElement
};
// Returns simplified implementation of {@link module:engine/view/domconverter~DomConverter#setContentOf DomConverter.setContentOf} method.
// Used to render UIElement and RawElement.
const domConverterStub = {
	setContentOf: ( node, html ) => {
		node.innerHTML = html;
	}
};

/**
 * Writes the content of the {@link module:engine/view/document~Document document} to an HTML-like string.
 *
 * @param {module:engine/view/view~View} view
 * @param {Object} [options]
 * @param {Boolean} [options.withoutSelection=false] Whether to write the selection. When set to `true`, the selection will
 * not be included in the returned string.
 * @param {Boolean} [options.rootName='main'] The name of the root from which the data should be stringified. If not provided,
 * the default `main` name will be used.
 * @param {Boolean} [options.showType=false] When set to `true`, the type of elements will be printed (`<container:p>`
 * instead of `<p>`, `<attribute:b>` instead of `<b>` and `<empty:img>` instead of `<img>`).
 * @param {Boolean} [options.showPriority=false] When set to `true`, the attribute element's priority will be printed
 * (`<span view-priority="12">`, `<b view-priority="10">`).
 * @param {Boolean} [options.showAttributeElementId=false] When set to `true`, the attribute element's ID will be printed
 * (`<span id="marker:foo">`).
 * @param {Boolean} [options.renderUIElements=false] When set to `true`, the inner content of each
 * {@link module:engine/view/uielement~UIElement} will be printed.
 * @param {Boolean} [options.renderRawElements=false] When set to `true`, the inner content of each
 * {@link module:engine/view/rawelement~RawElement} will be printed.
 * @param {Object} [options.domConverter=null] When set to an actual {@link module:engine/view/domconverter~DomConverter DomConverter}
 * instance, it lets the conversion go through exactly the same flow the editing view is going through,
 * i.e. with view data filtering. Otherwise the simple stub is used.
 * @returns {String} The stringified data.
 */
export function getData( view, options = {} ) {
	if ( !( view instanceof View ) ) {
		throw new TypeError( 'View needs to be an instance of module:engine/view/view~View.' );
	}

	const document = view.document;
	const withoutSelection = !!options.withoutSelection;
	const rootName = options.rootName || 'main';
	const root = document.getRoot( rootName );
	const stringifyOptions = {
		showType: options.showType,
		showPriority: options.showPriority,
		renderUIElements: options.renderUIElements,
		renderRawElements: options.renderRawElements,
		ignoreRoot: true,
		domConverter: options.domConverter
	};

	return withoutSelection ?
		getData._stringify( root, null, stringifyOptions ) :
		getData._stringify( root, document.selection, stringifyOptions );
}

// Set stringify as getData private method - needed for testing/spying.
getData._stringify = stringify;

/**
 * Sets the content of a view {@link module:engine/view/document~Document document} provided as an HTML-like string.
 *
 * @param {module:engine/view/view~View} view
 * @param {String} data An HTML-like string to write into the document.
 * @param {Object} options
 * @param {String} [options.rootName='main'] The root name where parsed data will be stored. If not provided,
 * the default `main` name will be used.
 */
export function setData( view, data, options = {} ) {
	if ( !( view instanceof View ) ) {
		throw new TypeError( 'View needs to be an instance of module:engine/view/view~View.' );
	}

	const document = view.document;
	const rootName = options.rootName || 'main';
	const root = document.getRoot( rootName );

	view.change( writer => {
		const result = setData._parse( data, { rootElement: root } );

		if ( result.view && result.selection ) {
			writer.setSelection( result.selection );
		}
	} );
}

// Set parse as setData private method - needed for testing/spying.
setData._parse = parse;

/**
 * Converts view elements to HTML-like string representation.
 *
 * A root element can be provided as {@link module:engine/view/text~Text text}:
 *
 *		const text = downcastWriter.createText( 'foobar' );
 *		stringify( text ); // 'foobar'
 *
 * or as an {@link module:engine/view/element~Element element}:
 *
 *		const element = downcastWriter.createElement( 'p', null, downcastWriter.createText( 'foobar' ) );
 *		stringify( element ); // '<p>foobar</p>'
 *
 * or as a {@link module:engine/view/documentfragment~DocumentFragment document fragment}:
 *
 *		const text = downcastWriter.createText( 'foobar' );
 *		const b = downcastWriter.createElement( 'b', { name: 'test' }, text );
 *		const p = downcastWriter.createElement( 'p', { style: 'color:red;' } );
 *		const fragment = downcastWriter.createDocumentFragment( [ p, b ] );
 *
 *		stringify( fragment ); // '<p style="color:red;"></p><b name="test">foobar</b>'
 *
 * Additionally, a {@link module:engine/view/documentselection~DocumentSelection selection} instance can be provided.
 * Ranges from the selection will then be included in the output data.
 * If a range position is placed inside the element node, it will be represented with `[` and `]`:
 *
 *		const text = downcastWriter.createText( 'foobar' );
 *		const b = downcastWriter.createElement( 'b', null, text );
 *		const p = downcastWriter.createElement( 'p', null, b );
 *		const selection = downcastWriter.createSelection(
 *			downcastWriter.createRangeIn( p )
 *		);
 *
 *		stringify( p, selection ); // '<p>[<b>foobar</b>]</p>'
 *
 * If a range is placed inside the text node, it will be represented with `{` and `}`:
 *
 *		const text = downcastWriter.createText( 'foobar' );
 *		const b = downcastWriter.createElement( 'b', null, text );
 *		const p = downcastWriter.createElement( 'p', null, b );
 *		const selection = downcastWriter.createSelection(
 *			downcastWriter.createRange( downcastWriter.createPositionAt( text, 1 ), downcastWriter.createPositionAt( text, 5 ) )
 *		);
 *
 *		stringify( p, selection ); // '<p><b>f{ooba}r</b></p>'
 *
 * ** Note: **
 * It is possible to unify selection markers to `[` and `]` for both (inside and outside text)
 * by setting the `sameSelectionCharacters=true` option. It is mainly used when the view stringify option is used by
 * model utilities.
 *
 * Multiple ranges are supported:
 *
 *		const text = downcastWriter.createText( 'foobar' );
 *		const selection = downcastWriter.createSelection( [
 *			downcastWriter.createRange( downcastWriter.createPositionAt( text, 0 ), downcastWriter.createPositionAt( text, 1 ) ),
 *			downcastWriter.createRange( downcastWriter.createPositionAt( text, 3 ), downcastWriter.createPositionAt( text, 5 ) )
 *		] );
 *
 *		stringify( text, selection ); // '{f}oo{ba}r'
 *
 * A {@link module:engine/view/range~Range range} or {@link module:engine/view/position~Position position} instance can be provided
 * instead of the {@link module:engine/view/documentselection~DocumentSelection selection} instance. If a range instance
 * is provided, it will be converted to a selection containing this range. If a position instance is provided, it will
 * be converted to a selection containing one range collapsed at this position.
 *
 *		const text = downcastWriter.createText( 'foobar' );
 *		const range = downcastWriter.createRange( downcastWriter.createPositionAt( text, 0 ), downcastWriter.createPositionAt( text, 1 ) );
 *		const position = downcastWriter.createPositionAt( text, 3 );
 *
 *		stringify( text, range ); // '{f}oobar'
 *		stringify( text, position ); // 'foo{}bar'
 *
 * An additional `options` object can be provided.
 * If `options.showType` is set to `true`, element's types will be
 * presented for {@link module:engine/view/attributeelement~AttributeElement attribute elements},
 * {@link module:engine/view/containerelement~ContainerElement container elements}
 * {@link module:engine/view/emptyelement~EmptyElement empty elements}
 * and {@link module:engine/view/uielement~UIElement UI elements}:
 *
 *		const attribute = downcastWriter.createAttributeElement( 'b' );
 *		const container = downcastWriter.createContainerElement( 'p' );
 *		const empty = downcastWriter.createEmptyElement( 'img' );
 *		const ui = downcastWriter.createUIElement( 'span' );
 *		getData( attribute, null, { showType: true } ); // '<attribute:b></attribute:b>'
 *		getData( container, null, { showType: true } ); // '<container:p></container:p>'
 *		getData( empty, null, { showType: true } ); // '<empty:img></empty:img>'
 *		getData( ui, null, { showType: true } ); // '<ui:span></ui:span>'
 *
 * If `options.showPriority` is set to `true`, a priority will be displayed for all
 * {@link module:engine/view/attributeelement~AttributeElement attribute elements}.
 *
 *		const attribute = downcastWriter.createAttributeElement( 'b' );
 *		attribute._priority = 20;
 *		getData( attribute, null, { showPriority: true } ); // <b view-priority="20"></b>
 *
 * If `options.showAttributeElementId` is set to `true`, the attribute element's id will be displayed for all
 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} that have it set.
 *
 *		const attribute = downcastWriter.createAttributeElement( 'span' );
 *		attribute._id = 'marker:foo';
 *		getData( attribute, null, { showAttributeElementId: true } ); // <span view-id="marker:foo"></span>
 *
 * @param {module:engine/view/text~Text|module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment}
 * node The node to stringify.
 * @param {module:engine/view/documentselection~DocumentSelection|module:engine/view/position~Position|module:engine/view/range~Range}
 * [selectionOrPositionOrRange = null ]
 * A selection instance whose ranges will be included in the returned string data. If a range instance is provided, it will be
 * converted to a selection containing this range. If a position instance is provided, it will be converted to a selection
 * containing one range collapsed at this position.
 * @param {Object} [options] An object with additional options.
 * @param {Boolean} [options.showType=false] When set to `true`, the type of elements will be printed (`<container:p>`
 * instead of `<p>`, `<attribute:b>` instead of `<b>` and `<empty:img>` instead of `<img>`).
 * @param {Boolean} [options.showPriority=false] When set to `true`,  the attribute element's priority will be printed
 * (`<span view-priority="12">`, `<b view-priority="10">`).
 * @param {Boolean} [options.showAttributeElementId=false] When set to `true`, attribute element's id will be printed
 * (`<span id="marker:foo">`).
 * @param {Boolean} [options.ignoreRoot=false] When set to `true`, the root's element opening and closing will not be printed.
 * Mainly used by the `getData` function to ignore the {@link module:engine/view/document~Document document's} root element.
 * @param {Boolean} [options.sameSelectionCharacters=false] When set to `true`, the selection inside the text will be marked as
 *  `{` and `}` and the selection outside the text as `[` and `]`. When set to `false`, both will be marked as `[` and `]` only.
 * @param {Boolean} [options.renderUIElements=false] When set to `true`, the inner content of each
 * {@link module:engine/view/uielement~UIElement} will be printed.
 * @param {Boolean} [options.renderRawElements=false] When set to `true`, the inner content of each
 * {@link module:engine/view/rawelement~RawElement} will be printed.
 * @param {Object} [options.domConverter={}] When set to an actual {@link module:engine/view/domconverter~DomConverter DomConverter}
 * instance, it lets the conversion go through exactly the same flow the editing view is going through,
 * i.e. with view data filtering. Otherwise the simple stub is used.
 * @returns {String} An HTML-like string representing the view.
 */
export function stringify( node, selectionOrPositionOrRange = null, options = {} ) {
	let selection;

	if (
		selectionOrPositionOrRange instanceof Position ||
		selectionOrPositionOrRange instanceof Range
	) {
		selection = new DocumentSelection( selectionOrPositionOrRange );
	} else {
		selection = selectionOrPositionOrRange;
	}

	const viewStringify = new ViewStringify( node, selection, options );

	return viewStringify.stringify();
}

/**
 * Parses an HTML-like string and returns a view tree.
 * A simple string will be converted to a {@link module:engine/view/text~Text text} node:
 *
 *		parse( 'foobar' ); // Returns an instance of text.
 *
 * {@link module:engine/view/element~Element Elements} will be parsed with attributes as children:
 *
 *		parse( '<b name="baz">foobar</b>' ); // Returns an instance of element with the `baz` attribute and a text child node.
 *
 * Multiple nodes provided on root level will be converted to a
 * {@link module:engine/view/documentfragment~DocumentFragment document fragment}:
 *
 *		parse( '<b>foo</b><i>bar</i>' ); // Returns a document fragment with two child elements.
 *
 * The method can parse multiple {@link module:engine/view/range~Range ranges} provided in string data and return a
 * {@link module:engine/view/documentselection~DocumentSelection selection} instance containing these ranges. Ranges placed inside
 * {@link module:engine/view/text~Text text} nodes should be marked using `{` and `}` brackets:
 *
 *		const { text, selection } = parse( 'f{ooba}r' );
 *
 * Ranges placed outside text nodes should be marked using `[` and `]` brackets:
 *
 *		const { root, selection } = parse( '<p>[<b>foobar</b>]</p>' );
 *
 * ** Note: **
 * It is possible to unify selection markers to `[` and `]` for both (inside and outside text)
 * by setting `sameSelectionCharacters=true` option. It is mainly used when the view parse option is used by model utilities.
 *
 * Sometimes there is a need for defining the order of ranges inside the created selection. This can be achieved by providing
 * the range order array as an additional parameter:
 *
 *		const { root, selection } = parse( '{fo}ob{ar}{ba}z', { order: [ 2, 3, 1 ] } );
 *
 * In the example above, the first range (`{fo}`) will be added to the selection as the second one, the second range (`{ar}`) will be
 * added as the third and the third range (`{ba}`) will be added as the first one.
 *
 * If the selection's last range should be added as a backward one
 * (so the {@link module:engine/view/documentselection~DocumentSelection#anchor selection anchor} is represented
 * by the `end` position and {@link module:engine/view/documentselection~DocumentSelection#focus selection focus} is
 * represented by the `start` position), use the `lastRangeBackward` flag:
 *
 *		const { root, selection } = parse( `{foo}bar{baz}`, { lastRangeBackward: true } );
 *
 * Some more examples and edge cases:
 *
 *		// Returns an empty document fragment.
 *		parse( '' );
 *
 *		// Returns an empty document fragment and a collapsed selection.
 *		const { root, selection } = parse( '[]' );
 *
 *		// Returns an element and a selection that is placed inside the document fragment containing that element.
 *		const { root, selection } = parse( '[<a></a>]' );
 *
 * @param {String} data An HTML-like string to be parsed.
 * @param {Object} options
 * @param {Array.<Number>} [options.order] An array with the order of parsed ranges added to the returned
 * {@link module:engine/view/documentselection~DocumentSelection Selection} instance. Each element should represent the
 * desired position of each range in the selection instance. For example: `[2, 3, 1]` means that the first range will be
 * placed as the second, the second as the third and the third as the first.
 * @param {Boolean} [options.lastRangeBackward=false] If set to `true`, the last range will be added as backward to the returned
 * {@link module:engine/view/documentselection~DocumentSelection selection} instance.
 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment}
 * [options.rootElement=null] The default root to use when parsing elements.
 * When set to `null`, the root element will be created automatically. If set to
 * {@link module:engine/view/element~Element Element} or {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment},
 * this node will be used as the root for all parsed nodes.
 * @param {Boolean} [options.sameSelectionCharacters=false] When set to `false`, the selection inside the text should be marked using
 * `{` and `}` and the selection outside the ext using `[` and `]`. When set to `true`, both should be marked with `[` and `]` only.
 * @param {module:engine/view/stylesmap~StylesProcessor} [options.stylesProcessor] Styles processor.
 * @returns {module:engine/view/text~Text|module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|Object}
 * Returns the parsed view node or an object with two fields: `view` and `selection` when selection ranges were included in the data
 * to parse.
 */
export function parse( data, options = {} ) {
	const viewDocument = new ViewDocument( new StylesProcessor() );

	options.order = options.order || [];
	const rangeParser = new RangeParser( {
		sameSelectionCharacters: options.sameSelectionCharacters
	} );
	const processor = new XmlDataProcessor( viewDocument, {
		namespaces: Object.keys( allowedTypes )
	} );

	// Convert data to view.
	let view = processor.toView( data );

	// At this point we have a view tree with Elements that could have names like `attribute:b:1`. In the next step
	// we need to parse Element's names and convert them to AttributeElements and ContainerElements.
	view = _convertViewElements( view );

	// If custom root is provided - move all nodes there.
	if ( options.rootElement ) {
		const root = options.rootElement;
		const nodes = view._removeChildren( 0, view.childCount );

		root._removeChildren( 0, root.childCount );
		root._appendChild( nodes );

		view = root;
	}

	// Parse ranges included in view text nodes.
	const ranges = rangeParser.parse( view, options.order );

	// If only one element is returned inside DocumentFragment - return that element.
	if ( view.is( 'documentFragment' ) && view.childCount === 1 ) {
		view = view.getChild( 0 );
	}

	// When ranges are present - return object containing view, and selection.
	if ( ranges.length ) {
		const selection = new DocumentSelection( ranges, { backward: !!options.lastRangeBackward } );

		return {
			view,
			selection
		};
	}

	// If single element is returned without selection - remove it from parent and return detached element.
	if ( view.parent ) {
		view._remove();
	}

	return view;
}

/**
 * Private helper class used for converting ranges represented as text inside view {@link module:engine/view/text~Text text nodes}.
 *
 * @private
 */
class RangeParser {
	/**
	 * Creates a range parser instance.
	 *
	 * @param {Object} options The range parser configuration.
	 * @param {Boolean} [options.sameSelectionCharacters=false] When set to `true`, the selection inside the text is marked as
	 * `{` and `}` and the selection outside the text as `[` and `]`. When set to `false`, both are marked as `[` and `]`.
	 */
	constructor( options ) {
		this.sameSelectionCharacters = !!options.sameSelectionCharacters;
	}

	/**
	 * Parses the view and returns ranges represented inside {@link module:engine/view/text~Text text nodes}.
	 * The method will remove all occurrences of `{`, `}`, `[` and `]` from found text nodes. If a text node is empty after
	 * the process, it will be removed, too.
	 *
	 * @param {module:engine/view/node~Node} node The starting node.
	 * @param {Array.<Number>} order The order of ranges. Each element should represent the desired position of the range after
	 * sorting. For example: `[2, 3, 1]` means that the first range will be placed as the second, the second as the third and the third
	 * as the first.
	 * @returns {Array.<module:engine/view/range~Range>} An array with ranges found.
	 */
	parse( node, order ) {
		this._positions = [];

		// Remove all range brackets from view nodes and save their positions.
		this._getPositions( node );

		// Create ranges using gathered positions.
		let ranges = this._createRanges();

		// Sort ranges if needed.
		if ( order.length ) {
			if ( order.length != ranges.length ) {
				throw new Error(
					`Parse error - there are ${ ranges.length } ranges found, but ranges order array contains ${ order.length } elements.`
				);
			}

			ranges = this._sortRanges( ranges, order );
		}

		return ranges;
	}

	/**
	 * Gathers positions of brackets inside the view tree starting from the provided node. The method will remove all occurrences of
	 * `{`, `}`, `[` and `]` from found text nodes. If a text node is empty after the process, it will be removed, too.
	 *
	 * @private
	 * @param {module:engine/view/node~Node} node Staring node.
	 */
	_getPositions( node ) {
		if ( node.is( 'documentFragment' ) || node.is( 'element' ) ) {
			// Copy elements into the array, when nodes will be removed from parent node this array will still have all the
			// items needed for iteration.
			const children = [ ...node.getChildren() ];

			for ( const child of children ) {
				this._getPositions( child );
			}
		}

		if ( node.is( '$text' ) ) {
			const regexp = new RegExp(
				`[${ TEXT_RANGE_START_TOKEN }${ TEXT_RANGE_END_TOKEN }\\${ ELEMENT_RANGE_END_TOKEN }\\${ ELEMENT_RANGE_START_TOKEN }]`,
				'g'
			);
			let text = node.data;
			let match;
			let offset = 0;
			const brackets = [];

			// Remove brackets from text and store info about offset inside text node.
			while ( ( match = regexp.exec( text ) ) ) {
				const index = match.index;
				const bracket = match[ 0 ];

				brackets.push( {
					bracket,
					textOffset: index - offset
				} );

				offset++;
			}

			text = text.replace( regexp, '' );
			node._data = text;
			const index = node.index;
			const parent = node.parent;

			// Remove empty text nodes.
			if ( !text ) {
				node._remove();
			}

			for ( const item of brackets ) {
				// Non-empty text node.
				if ( text ) {
					if (
						this.sameSelectionCharacters ||
						(
							!this.sameSelectionCharacters &&
							( item.bracket == TEXT_RANGE_START_TOKEN || item.bracket == TEXT_RANGE_END_TOKEN )
						)
					) {
						// Store information about text range delimiter.
						this._positions.push( {
							bracket: item.bracket,
							position: new Position( node, item.textOffset )
						} );
					} else {
						// Check if element range delimiter is not placed inside text node.
						if ( !this.sameSelectionCharacters && item.textOffset !== 0 && item.textOffset !== text.length ) {
							throw new Error( `Parse error - range delimiter '${ item.bracket }' is placed inside text node.` );
						}

						// If bracket is placed at the end of the text node - it should be positioned after it.
						const offset = ( item.textOffset === 0 ? index : index + 1 );

						// Store information about element range delimiter.
						this._positions.push( {
							bracket: item.bracket,
							position: new Position( parent, offset )
						} );
					}
				} else {
					if ( !this.sameSelectionCharacters &&
						item.bracket == TEXT_RANGE_START_TOKEN ||
						item.bracket == TEXT_RANGE_END_TOKEN
					) {
						throw new Error( `Parse error - text range delimiter '${ item.bracket }' is placed inside empty text node. ` );
					}

					// Store information about element range delimiter.
					this._positions.push( {
						bracket: item.bracket,
						position: new Position( parent, index )
					} );
				}
			}
		}
	}

	/**
	 * Sorts ranges in a given order. Range order should be an array and each element should represent the desired position
	 * of the range after sorting.
	 * For example: `[2, 3, 1]` means that the first range will be placed as the second, the second as the third and the third
	 * as the first.
	 *
	 * @private
	 * @param {Array.<module:engine/view/range~Range>} ranges Ranges to sort.
	 * @param {Array.<Number>} rangesOrder An array with new range order.
	 * @returns {Array} Sorted ranges array.
	 */
	_sortRanges( ranges, rangesOrder ) {
		const sortedRanges = [];
		let index = 0;

		for ( const newPosition of rangesOrder ) {
			if ( ranges[ newPosition - 1 ] === undefined ) {
				throw new Error( 'Parse error - provided ranges order is invalid.' );
			}

			sortedRanges[ newPosition - 1 ] = ranges[ index ];
			index++;
		}

		return sortedRanges;
	}

	/**
	 * Uses all found bracket positions to create ranges from them.
	 *
	 * @private
	 * @returns {Array.<module:engine/view/range~Range>}
	 */
	_createRanges() {
		const ranges = [];
		let range = null;

		for ( const item of this._positions ) {
			// When end of range is found without opening.
			if ( !range && ( item.bracket == ELEMENT_RANGE_END_TOKEN || item.bracket == TEXT_RANGE_END_TOKEN ) ) {
				throw new Error( `Parse error - end of range was found '${ item.bracket }' but range was not started before.` );
			}

			// When second start of range is found when one is already opened - selection does not allow intersecting
			// ranges.
			if ( range && ( item.bracket == ELEMENT_RANGE_START_TOKEN || item.bracket == TEXT_RANGE_START_TOKEN ) ) {
				throw new Error( `Parse error - start of range was found '${ item.bracket }' but one range is already started.` );
			}

			if ( item.bracket == ELEMENT_RANGE_START_TOKEN || item.bracket == TEXT_RANGE_START_TOKEN ) {
				range = new Range( item.position, item.position );
			} else {
				range.end = item.position;
				ranges.push( range );
				range = null;
			}
		}

		// Check if all ranges have proper ending.
		if ( range !== null ) {
			throw new Error( 'Parse error - range was started but no end delimiter was found.' );
		}

		return ranges;
	}
}

/**
 * Private helper class used for converting the view tree to a string.
 *
 * @private
 */
class ViewStringify {
	/**
	 * Creates a view stringify instance.
	 *
	 * @param root
	 * @param {module:engine/view/documentselection~DocumentSelection} selection A selection whose ranges
	 * should also be converted to a string.
	 * @param {Object} options An options object.
	 * @param {Boolean} [options.showType=false] When set to `true`, the type of elements will be printed (`<container:p>`
	 * instead of `<p>`, `<attribute:b>` instead of `<b>` and `<empty:img>` instead of `<img>`).
	 * @param {Boolean} [options.showPriority=false] When set to `true`, the attribute element's priority will be printed.
	 * @param {Boolean} [options.ignoreRoot=false] When set to `true`, the root's element opening and closing tag will not
	 * be outputted.
	 * @param {Boolean} [options.sameSelectionCharacters=false] When set to `true`, the selection inside the text is marked as
	 * `{` and `}` and the selection outside the text as `[` and `]`. When set to `false`, both are marked as `[` and `]`.
	 * @param {Boolean} [options.renderUIElements=false] When set to `true`, the inner content of each
	 * {@link module:engine/view/uielement~UIElement} will be printed.
	 * @param {Boolean} [options.renderRawElements=false] When set to `true`, the inner content of each
	 * @param {Object} [options.domConverter={}] When set to an actual {@link module:engine/view/domconverter~DomConverter DomConverter}
	 * instance, it lets the conversion go through exactly the same flow the editing view is going through,
	 * i.e. with view data filtering. Otherwise the simple stub is used.
	 * {@link module:engine/view/rawelement~RawElement} will be printed.
	 */
	constructor( root, selection, options ) {
		this.root = root;
		this.selection = selection;
		this.ranges = [];

		if ( this.selection ) {
			this.ranges = [ ...selection.getRanges() ];
		}

		this.showType = !!options.showType;
		this.showPriority = !!options.showPriority;
		this.showAttributeElementId = !!options.showAttributeElementId;
		this.ignoreRoot = !!options.ignoreRoot;
		this.sameSelectionCharacters = !!options.sameSelectionCharacters;
		this.renderUIElements = !!options.renderUIElements;
		this.renderRawElements = !!options.renderRawElements;
		this.domConverter = options.domConverter || domConverterStub;
	}

	/**
	 * Converts the view to a string.
	 *
	 * @returns {String} String representation of the view elements.
	 */
	stringify() {
		let result = '';
		this._walkView( this.root, chunk => {
			result += chunk;
		} );

		return result;
	}

	/**
	 * Executes a simple walker that iterates over all elements in the view tree starting from the root element.
	 * Calls the `callback` with parsed chunks of string data.
	 *
	 * @private
	 * @param {module:engine/view/documentfragment~DocumentFragment|module:engine/view/element~Element|module:engine/view/text~Text} root
	 * @param {Function} callback
	 */
	_walkView( root, callback ) {
		const ignore = this.ignoreRoot && this.root === root;

		if ( root.is( 'element' ) || root.is( 'documentFragment' ) ) {
			if ( root.is( 'element' ) && !ignore ) {
				callback( this._stringifyElementOpen( root ) );
			}

			if ( ( this.renderUIElements && root.is( 'uiElement' ) ) ) {
				callback( root.render( document, this.domConverter ).innerHTML );
			} else if ( this.renderRawElements && root.is( 'rawElement' ) ) {
				// There's no DOM element for "root" to pass to render(). Creating
				// a surrogate container to render the children instead.
				const rawContentContainer = document.createElement( 'div' );
				root.render( rawContentContainer, this.domConverter );

				callback( rawContentContainer.innerHTML );
			} else {
				let offset = 0;
				callback( this._stringifyElementRanges( root, offset ) );

				for ( const child of root.getChildren() ) {
					this._walkView( child, callback );
					offset++;
					callback( this._stringifyElementRanges( root, offset ) );
				}
			}

			if ( root.is( 'element' ) && !ignore ) {
				callback( this._stringifyElementClose( root ) );
			}
		}

		if ( root.is( '$text' ) ) {
			callback( this._stringifyTextRanges( root ) );
		}
	}

	/**
	 * Checks if a given {@link module:engine/view/element~Element element} has a {@link module:engine/view/range~Range#start range start}
	 * or a {@link module:engine/view/range~Range#start range end} placed at a given offset and returns its string representation.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @param {Number} offset
	 */
	_stringifyElementRanges( element, offset ) {
		let start = '';
		let end = '';
		let collapsed = '';

		for ( const range of this.ranges ) {
			if ( range.start.parent == element && range.start.offset === offset ) {
				if ( range.isCollapsed ) {
					collapsed += ELEMENT_RANGE_START_TOKEN + ELEMENT_RANGE_END_TOKEN;
				} else {
					start += ELEMENT_RANGE_START_TOKEN;
				}
			}

			if ( range.end.parent === element && range.end.offset === offset && !range.isCollapsed ) {
				end += ELEMENT_RANGE_END_TOKEN;
			}
		}

		return end + collapsed + start;
	}

	/**
	 * Checks if a given {@link module:engine/view/element~Element Text node} has a
	 * {@link module:engine/view/range~Range#start range start} or a
	 * {@link module:engine/view/range~Range#start range end} placed somewhere inside. Returns a string representation of text
	 * with range delimiters placed inside.
	 *
	 * @private
	 * @param {module:engine/view/text~Text} node
	 */
	_stringifyTextRanges( node ) {
		const length = node.data.length;
		let result = node.data.split( '' );
		let rangeStartToken, rangeEndToken;

		if ( this.sameSelectionCharacters ) {
			rangeStartToken = ELEMENT_RANGE_START_TOKEN;
			rangeEndToken = ELEMENT_RANGE_END_TOKEN;
		} else {
			rangeStartToken = TEXT_RANGE_START_TOKEN;
			rangeEndToken = TEXT_RANGE_END_TOKEN;
		}

		// Add one more element for ranges ending after last character in text.
		result[ length ] = '';

		// Represent each letter as object with information about opening/closing ranges at each offset.
		result = result.map( letter => {
			return {
				letter,
				start: '',
				end: '',
				collapsed: ''
			};
		} );

		for ( const range of this.ranges ) {
			const start = range.start;
			const end = range.end;

			if ( start.parent == node && start.offset >= 0 && start.offset <= length ) {
				if ( range.isCollapsed ) {
					result[ end.offset ].collapsed += rangeStartToken + rangeEndToken;
				} else {
					result[ start.offset ].start += rangeStartToken;
				}
			}

			if ( end.parent == node && end.offset >= 0 && end.offset <= length && !range.isCollapsed ) {
				result[ end.offset ].end += rangeEndToken;
			}
		}

		return result.map( item => item.end + item.collapsed + item.start + item.letter ).join( '' );
	}

	/**
	 * Converts the passed {@link module:engine/view/element~Element element} to an opening tag.
	 *
	 * Depending on the current configuration, the opening tag can be simple (`<a>`), contain a type prefix (`<container:p>`,
	 * `<attribute:a>` or `<empty:img>`), contain priority information ( `<attribute:a view-priority="20">` ),
	 * or contain element id ( `<attribute:span view-id="foo">` ). Element attributes will also be included
	 * (`<a href="https://ckeditor.com" name="foobar">`).
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @returns {String}
	 */
	_stringifyElementOpen( element ) {
		const priority = this._stringifyElementPriority( element );
		const id = this._stringifyElementId( element );

		const type = this._stringifyElementType( element );
		const name = [ type, element.name ].filter( i => i !== '' ).join( ':' );
		const attributes = this._stringifyElementAttributes( element );
		const parts = [ name, priority, id, attributes ];

		return `<${ parts.filter( i => i !== '' ).join( ' ' ) }>`;
	}

	/**
	 * Converts the passed {@link module:engine/view/element~Element element} to a closing tag.
	 * Depending on the current configuration, the closing tag can be simple (`</a>`) or contain a type prefix (`</container:p>`,
	 * `</attribute:a>` or `</empty:img>`).
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @returns {String}
	 */
	_stringifyElementClose( element ) {
		const type = this._stringifyElementType( element );
		const name = [ type, element.name ].filter( i => i !== '' ).join( ':' );

		return `</${ name }>`;
	}

	/**
	 * Converts the passed {@link module:engine/view/element~Element element's} type to its string representation
	 *
	 * Returns:
	 * * 'attribute' for {@link module:engine/view/attributeelement~AttributeElement attribute elements},
	 * * 'container' for {@link module:engine/view/containerelement~ContainerElement container elements},
	 * * 'empty' for {@link module:engine/view/emptyelement~EmptyElement empty elements},
	 * * 'ui' for {@link module:engine/view/uielement~UIElement UI elements},
	 * * 'raw' for {@link module:engine/view/rawelement~RawElement raw elements},
	 * * an empty string when the current configuration is preventing showing elements' types.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @returns {String}
	 */
	_stringifyElementType( element ) {
		if ( this.showType ) {
			for ( const type in allowedTypes ) {
				if ( element instanceof allowedTypes[ type ] ) {
					return type;
				}
			}
		}

		return '';
	}

	/**
	 * Converts the passed {@link module:engine/view/element~Element element} to its priority representation.
	 *
	 * The priority string representation will be returned when the passed element is an instance of
	 * {@link module:engine/view/attributeelement~AttributeElement attribute element} and the current configuration allows to show the
	 * priority. Otherwise returns an empty string.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @returns {String}
	 */
	_stringifyElementPriority( element ) {
		if ( this.showPriority && element.is( 'attributeElement' ) ) {
			return `view-priority="${ element.priority }"`;
		}

		return '';
	}

	/**
	 * Converts the passed {@link module:engine/view/element~Element element} to its id representation.
	 *
	 * The id string representation will be returned when the passed element is an instance of
	 * {@link module:engine/view/attributeelement~AttributeElement attribute element}, the element has an id
	 * and the current configuration allows to show the id. Otherwise returns an empty string.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @returns {String}
	 */
	_stringifyElementId( element ) {
		if ( this.showAttributeElementId && element.is( 'attributeElement' ) && element.id ) {
			return `view-id="${ element.id }"`;
		}

		return '';
	}

	/**
	 * Converts the passed {@link module:engine/view/element~Element element} attributes to their string representation.
	 * If an element has no attributes, an empty string is returned.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @returns {String}
	 */
	_stringifyElementAttributes( element ) {
		const attributes = [];
		const keys = [ ...element.getAttributeKeys() ].sort();

		for ( const attribute of keys ) {
			let attributeValue;

			if ( attribute === 'class' ) {
				attributeValue = [ ...element.getClassNames() ]
					.sort()
					.join( ' ' );
			} else if ( attribute === 'style' ) {
				attributeValue = [ ...element.getStyleNames() ]
					.sort()
					.map( style => `${ style }:${ element.getStyle( style ) }` )
					.join( ';' );
			} else {
				attributeValue = element.getAttribute( attribute );
			}

			attributes.push( `${ attribute }="${ attributeValue }"` );
		}

		return attributes.join( ' ' );
	}
}

// Converts {@link module:engine/view/element~Element elements} to
// {@link module:engine/view/attributeelement~AttributeElement attribute elements},
// {@link module:engine/view/containerelement~ContainerElement container elements},
// {@link module:engine/view/emptyelement~EmptyElement empty elements} or
// {@link module:engine/view/uielement~UIElement UI elements}.
// It converts the whole tree starting from the `rootNode`. The conversion is based on element names.
// See the `_convertElement` method for more details.
//
// @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|module:engine/view/text~Text}
//  rootNode The root node to convert.
// @returns {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|
// module:engine/view/text~Text} The root node of converted elements.
function _convertViewElements( rootNode ) {
	if ( rootNode.is( 'element' ) || rootNode.is( 'documentFragment' ) ) {
		// Convert element or leave document fragment.

		const convertedElement = rootNode.is( 'documentFragment' ) ?
			new ViewDocumentFragment( rootNode.document ) :
			_convertElement( rootNode.document, rootNode );

		// Convert all child nodes.
		// Cache the nodes in array. Otherwise, we would skip some nodes because during iteration we move nodes
		// from `rootNode` to `convertedElement`. This would interfere with iteration.
		for ( const child of [ ...rootNode.getChildren() ] ) {
			if ( convertedElement.is( 'emptyElement' ) ) {
				throw new Error( 'Parse error - cannot parse inside EmptyElement.' );
			} else if ( convertedElement.is( 'uiElement' ) ) {
				throw new Error( 'Parse error - cannot parse inside UIElement.' );
			} else if ( convertedElement.is( 'rawElement' ) ) {
				throw new Error( 'Parse error - cannot parse inside RawElement.' );
			}

			convertedElement._appendChild( _convertViewElements( child ) );
		}

		return convertedElement;
	}

	return rootNode;
}

// Converts an {@link module:engine/view/element~Element element} to
// {@link module:engine/view/attributeelement~AttributeElement attribute element},
// {@link module:engine/view/containerelement~ContainerElement container element},
// {@link module:engine/view/emptyelement~EmptyElement empty element} or
// {@link module:engine/view/uielement~UIElement UI element}.
// If the element's name is in the format of `attribute:b`, it will be converted to
// an {@link module:engine/view/attributeelement~AttributeElement attribute element} with a priority of 11.
// Additionally, attribute elements may have specified priority (for example `view-priority="11"`) and/or
// id (for example `view-id="foo"`).
// If the element's name is in the format of `container:p`, it will be converted to
// a {@link module:engine/view/containerelement~ContainerElement container element}.
// If the element's name is in the format of `empty:img`, it will be converted to
// an {@link module:engine/view/emptyelement~EmptyElement empty element}.
// If the element's name is in the format of `ui:span`, it will be converted to
// a {@link module:engine/view/uielement~UIElement UI element}.
// If the element's name does not contain any additional information, a {@link module:engine/view/element~Element view Element} will be
// returned.
//
// @param {module:engine/view/element~Element} viewElement A view element to convert.
// @returns {module:engine/view/element~Element|module:engine/view/attributeelement~AttributeElement|
// module:engine/view/emptyelement~EmptyElement|module:engine/view/uielement~UIElement|
// module:engine/view/containerelement~ContainerElement} A tree view
// element converted according to its name.
function _convertElement( viewDocument, viewElement ) {
	const info = _convertElementNameAndInfo( viewElement );
	const ElementConstructor = allowedTypes[ info.type ];
	const newElement = ElementConstructor ? new ElementConstructor( viewDocument, info.name ) : new ViewElement( viewDocument, info.name );

	if ( newElement.is( 'attributeElement' ) ) {
		if ( info.priority !== null ) {
			newElement._priority = info.priority;
		}

		if ( info.id !== null ) {
			newElement._id = info.id;
		}
	}

	// Move attributes.
	for ( const attributeKey of viewElement.getAttributeKeys() ) {
		newElement._setAttribute( attributeKey, viewElement.getAttribute( attributeKey ) );
	}

	return newElement;
}

// Converts the `view-priority` attribute and the {@link module:engine/view/element~Element#name element's name} information needed for
// creating {@link module:engine/view/attributeelement~AttributeElement attribute element},
// {@link module:engine/view/containerelement~ContainerElement container element},
// {@link module:engine/view/emptyelement~EmptyElement empty element} or
// {@link module:engine/view/uielement~UIElement UI element}.
// The name can be provided in two formats: as a simple element's name (`div`), or as a type and name (`container:div`,
// `attribute:span`, `empty:img`, `ui:span`);
//
// @param {module:engine/view/element~Element} element The element whose name should be converted.
// @returns {Object} info An object with parsed information.
// @returns {String} info.name The parsed name of the element.
// @returns {String|null} info.type The parsed type of the element. It can be `attribute`, `container` or `empty`.
// returns {Number|null} info.priority The parsed priority of the element.
function _convertElementNameAndInfo( viewElement ) {
	const parts = viewElement.name.split( ':' );

	const priority = _convertPriority( viewElement.getAttribute( 'view-priority' ) );
	const id = viewElement.hasAttribute( 'view-id' ) ? viewElement.getAttribute( 'view-id' ) : null;

	viewElement._removeAttribute( 'view-priority' );
	viewElement._removeAttribute( 'view-id' );

	if ( parts.length == 1 ) {
		return {
			name: parts[ 0 ],
			type: priority !== null ? 'attribute' : null,
			priority,
			id
		};
	}

	// Check if type and name: container:div.
	const type = _convertType( parts[ 0 ] );

	if ( type ) {
		return {
			name: parts[ 1 ],
			type,
			priority,
			id
		};
	}

	throw new Error( `Parse error - cannot parse element's name: ${ viewElement.name }.` );
}

// Checks if the element's type is allowed. Returns `attribute`, `container`, `empty` or `null`.
//
// @param {String} type
// @returns {String|null}
function _convertType( type ) {
	return allowedTypes[ type ] ? type : null;
}

// Checks if a given priority is allowed. Returns null if the priority cannot be converted.
//
// @param {String} priorityString
// returns {Number|null}
function _convertPriority( priorityString ) {
	const priority = parseInt( priorityString, 10 );

	if ( !isNaN( priority ) ) {
		return priority;
	}

	return null;
}
