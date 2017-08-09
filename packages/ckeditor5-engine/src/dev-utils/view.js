/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/dev-utils/view
 */

/**
 * Collection of methods for manipulating {@link module:engine/view/view view} for testing purposes.
 */

import Document from '../view/document';
import ViewDocumentFragment from '../view/documentfragment';
import XmlDataProcessor from '../dataprocessor/xmldataprocessor';
import ViewElement from '../view/element';
import Selection from '../view/selection';
import Range from '../view/range';
import Position from '../view/position';
import AttributeElement from '../view/attributeelement';
import ContainerElement from '../view/containerelement';
import EmptyElement from '../view/emptyelement';
import UIElement from '../view/uielement';

const ELEMENT_RANGE_START_TOKEN = '[';
const ELEMENT_RANGE_END_TOKEN = ']';
const TEXT_RANGE_START_TOKEN = '{';
const TEXT_RANGE_END_TOKEN = '}';
const allowedTypes = {
	'container': ContainerElement,
	'attribute': AttributeElement,
	'empty': EmptyElement,
	'ui': UIElement
};

/**
 * Writes the contents of the {@link module:engine/view/document~Document Document} to an HTML-like string.
 *
 * @param {module:engine/view/document~Document} document
 * @param {Object} [options]
 * @param {Boolean} [options.withoutSelection=false] Whether to write the selection. When set to `true` selection will
 * be not included in returned string.
 * @param {Boolean} [options.rootName='main'] Name of the root from which data should be stringified. If not provided
 * default `main` name will be used.
 * @param {Boolean} [options.showType=false] When set to `true` type of elements will be printed (`<container:p>`
 * instead of `<p>`, `<attribute:b>` instead of `<b>` and `<empty:img>` instead of `<img>`).
 * @param {Boolean} [options.showPriority=false] When set to `true` AttributeElement's priority will be printed
 * (`<span view-priority="12">`, `<b view-priority="10">`).
 * @returns {String} The stringified data.
 */
export function getData( document, options = {} ) {
	if ( !( document instanceof Document ) ) {
		throw new TypeError( 'Document needs to be an instance of module:engine/view/document~Document.' );
	}

	const withoutSelection = !!options.withoutSelection;
	const rootName = options.rootName || 'main';
	const root = document.getRoot( rootName );
	const stringifyOptions = {
		showType: options.showType,
		showPriority: options.showPriority,
		ignoreRoot: true
	};

	return withoutSelection ?
		getData._stringify( root, null, stringifyOptions ) :
		getData._stringify( root, document.selection, stringifyOptions );
}

// Set stringify as getData private method - needed for testing/spying.
getData._stringify = stringify;

/**
 * Sets the contents of the {@link module:engine/view/document~Document Document} provided as HTML-like string.
 *
 * @param {module:engine/view/document~Document} document
 * @param {String} data HTML-like string to write into Document.
 * @param {Object} options
 * @param {String} [options.rootName='main'] Root name where parsed data will be stored. If not provided,
 * default `main` name will be used.
 */
export function setData( document, data, options = {} ) {
	if ( !( document instanceof Document ) ) {
		throw new TypeError( 'Document needs to be an instance of module:engine/view/document~Document.' );
	}

	const rootName = options.rootName || 'main';
	const root = document.getRoot( rootName );
	const result = setData._parse( data, { rootElement: root } );

	if ( result.view && result.selection ) {
		document.selection.setTo( result.selection );
	}
}

// Set parse as setData private method - needed for testing/spying.
setData._parse = parse;

/**
 * Converts view elements to HTML-like string representation.
 * Root element can be provided as {@link module:engine/view/text~Text Text}:
 *
 *		const text = new Text( 'foobar' );
 *		stringify( text ); // 'foobar'
 *
 * or as {@link module:engine/view/element~Element Element}:
 *
 *		const element = new Element( 'p', null, new Text( 'foobar' ) );
 *		stringify( element ); // '<p>foobar</p>'
 *
 * or as {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment}:
 *
 *		const text = new Text( 'foobar' );
 *		const b = new Element( 'b', { name: 'test' }, text );
 *		const p = new Element( 'p', { style: 'color:red;' } );
 *		const fragment = new DocumentFragment( [ p, b ] );
 *
 *		stringify( fragment ); // '<p style="color:red;"></p><b name="test">foobar</b>'
 *
 * Additionally {@link module:engine/view/selection~Selection Selection} instance can be provided, then ranges from that selection
 * will be included in output data.
 * If range position is placed inside element node, it will be represented with `[` and `]`:
 *
 *		const text = new Text( 'foobar' );
 *		const b = new Element( 'b', null, text );
 *		const p = new Element( 'p', null, b );
 *		const selection = new Selection();
 *		selection.addRange( Range.createFromParentsAndOffsets( p, 0, p, 1 ) );
 *
 *		stringify( p, selection ); // '<p>[<b>foobar</b>]</p>'
 *
 * If range is placed inside text node, it will be represented with `{` and `}`:
 *
 *		const text = new Text( 'foobar' );
 *		const b = new Element( 'b', null, text );
 *		const p = new Element( 'p', null, b );
 *		const selection = new Selection();
 *		selection.addRange( Range.createFromParentsAndOffsets( text, 1, text, 5 ) );
 *
 *		stringify( p, selection ); // '<p><b>f{ooba}r</b></p>'
 *
 * ** Note: **
 * It is possible to unify selection markers to `[` and `]` for both (inside and outside text)
 * by setting `sameSelectionCharacters=true` option. It is mainly used when view stringify option is used by model utils.
 *
 * Multiple ranges are supported:
 *
 *		const text = new Text( 'foobar' );
 *		const selection = new Selection();
 *		selection.addRange( Range.createFromParentsAndOffsets( text, 0, text, 1 ) );
 *		selection.addRange( Range.createFromParentsAndOffsets( text, 3, text, 5 ) );
 *
 *		stringify( text, selection ); // '{f}oo{ba}r'
 *
 * Instead of {@link module:engine/view/selection~Selection Selection} instance {@link module:engine/view/range~Range Range} or
 * {@link module:engine/view/position~Position Position} instance can be provided. If Range instance is provided - it will be
 * converted to selection containing this range. If Position instance is provided - it will be converted to selection
 * containing one range collapsed at this position.
 *
 *		const text = new Text( 'foobar' );
 *		const range = Range.createFromParentsAndOffsets( text, 0, text, 1 );
 *		const position = new Position( text, 3 );
 *
 *		stringify( text, range ); // '{f}oobar'
 *		stringify( text, position ); // 'foo{}bar'
 *
 * Additional options object can be provided.
 * If `options.showType` is set to `true`, element's types will be
 * presented for {@link module:engine/view/attributeelement~AttributeElement AttributeElements},
 * {@link module:engine/view/containerelement~ContainerElement ContainerElements}
 * {@link module:engine/view/emptyelement~EmptyElement EmptyElements}
 * and {@link module:engine/view/uielement~UIElement UIElements}:
 *
 *		const attribute = new AttributeElement( 'b' );
 *		const container = new ContainerElement( 'p' );
 *		const empty = new EmptyElement( 'img' );
 *		const ui = new UIElement( 'span' );
 *		getData( attribute, null, { showType: true } ); // '<attribute:b></attribute:b>'
 *		getData( container, null, { showType: true } ); // '<container:p></container:p>'
 *		getData( empty, null, { showType: true } ); // '<empty:img></empty:img>'
 *		getData( ui, null, { showType: true } ); // '<ui:span></ui:span>'
 *
 * If `options.showPriority` is set to `true`, priority will be displayed for all
 * {@link module:engine/view/attributeelement~AttributeElement AttributeElements}.
 *
 *		const attribute = new AttributeElement( 'b' );
 *		attribute.priority = 20;
 *		getData( attribute, null, { showPriority: true } ); // <b view-priority="20"></b>
 *
 * @param {module:engine/view/text~Text|module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment}
 * node Node to stringify.
 * @param {module:engine/view/selection~Selection|module:engine/view/position~Position|module:engine/view/range~Range}
 * [selectionOrPositionOrRange = null ]
 * Selection instance which ranges will be included in returned string data. If Range instance is provided - it will be
 * converted to selection containing this range. If Position instance is provided - it will be converted to selection
 * containing one range collapsed at this position.
 * @param {Object} [options] Object with additional options.
 * @param {Boolean} [options.showType=false] When set to `true` type of elements will be printed (`<container:p>`
 * instead of `<p>`, `<attribute:b>` instead of `<b>` and `<empty:img>` instead of `<img>`).
 * @param {Boolean} [options.showPriority=false] When set to `true` AttributeElement's priority will be printed
 * (`<span view-priority="12">`, `<b view-priority="10">`).
 * @param {Boolean} [options.ignoreRoot=false] When set to `true` root's element opening and closing will not be printed.
 * Mainly used by `getData` function to ignore {@link module:engine/view/document~Document Document's} root element.
 * @param {Boolean} [options.sameSelectionCharacters=false] When set to `true` then selection inside text will be marked as `{` and `}`
 * and selection outside text as `[` and `]`. When set to `false` then both will be marked as `[` and `]` only.
 * @returns {String} HTML-like string representing the view.
 */
export function stringify( node, selectionOrPositionOrRange = null, options = {} ) {
	let selection;

	if ( selectionOrPositionOrRange instanceof Position ) {
		selection = new Selection();
		selection.addRange( new Range( selectionOrPositionOrRange, selectionOrPositionOrRange ) );
	} else if ( selectionOrPositionOrRange instanceof Range ) {
		selection = new Selection();
		selection.addRange( selectionOrPositionOrRange );
	} else {
		selection = selectionOrPositionOrRange;
	}

	const viewStringify = new ViewStringify( node, selection, options );

	return viewStringify.stringify();
}

/**
 * Parses HTML-like string and returns view tree nodes.
 * Simple string will be converted to {@link module:engine/view/text~Text Text} node:
 *
 *		parse( 'foobar' ); // Returns instance of Text.
 *
 * {@link module:engine/view/element~Element Elements} will be parsed with attributes an children:
 *
 *		parse( '<b name="baz">foobar</b>' ); // Returns instance of Element with `baz` attribute and text child node.
 *
 * Multiple nodes provided on root level will be converted to
 * {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment}:
 *
 *		parse( '<b>foo</b><i>bar</i>' ); // Returns DocumentFragment with two child elements.
 *
 * Method can parse multiple {@link module:engine/view/range~Range ranges} provided in string data and return
 * {@link module:engine/view/selection~Selection Selection} instance containing these ranges. Ranges placed inside
 * {@link module:engine/view/text~Text Text} nodes should be marked using `{` and `}` brackets:
 *
 *		const { text, selection } = parse( 'f{ooba}r' );
 *
 * Ranges placed outside text nodes should be marked using `[` and `]` brackets:
 *
 *		const { root, selection } = parse( '<p>[<b>foobar</b>]</p>' );
 *
 * ** Note: **
 * It is possible to unify selection markers to `[` and `]` for both (inside and outside text)
 * by setting `sameSelectionCharacters=true` option. It is mainly used when view parse option is used by model utils.
 *
 * Sometimes there is a need for defining order of ranges inside created selection. This can be achieved by providing
 * ranges order array as additional parameter:
 *
 *		const { root, selection } = parse( '{fo}ob{ar}{ba}z', { order: [ 2, 3, 1 ] } );
 *
 * In above example first range (`{fo}`) will be added to selection as second one, second range (`{ar}`) will be added
 * as third and third range (`{ba}`) will be added as first one.
 *
 * If selection's last range should be added as backward one (so the {@link module:engine/view/selection~Selection#anchor selection
 * anchor} is represented by `end` position and {@link module:engine/view/selection~Selection#focus selection focus} is
 * represented by `start` position) use `lastRangeBackward` flag:
 *
 *		const { root, selection } = parse( `{foo}bar{baz}`, { lastRangeBackward: true } );
 *
 * Other examples and edge cases:
 *
 *		// Returns empty DocumentFragment.
 *		parse( '' );
 *
 *		// Returns empty DocumentFragment and collapsed selection.
 *		const { root, selection } = parse( '[]' );
 *
 *		// Returns Element and selection that is placed inside of DocumentFragment containing that element.
 *		const { root, selection } = parse( '[<a></a>]' );
 *
 * @param {String} data HTML-like string to be parsed.
 * @param {Object} options
 * @param {Array.<Number>} [options.order] Array with order of parsed ranges added to returned
 * {@link module:engine/view/selection~Selection Selection} instance. Each element should represent desired position of each range in
 * selection instance. For example: `[2, 3, 1]` means that first range will be placed as second, second as third and third as first.
 * @param {Boolean} [options.lastRangeBackward=false] If set to true last range will be added as backward to the returned
 * {@link module:engine/view/selection~Selection Selection} instance.
 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment}
 * [options.rootElement=null] Default root to use when parsing elements.
 * When set to `null` root element will be created automatically. If set to
 * {@link module:engine/view/element~Element Element} or {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment}
 * - this node will be used as root for all parsed nodes.
 * @param {Boolean} [options.sameSelectionCharacters=false] When set to `false` then selection inside text should be marked using
 * `{` and `}` and selection outside text using `[` and `]`. When set to `true` then both should be marked with `[` and `]` only.
 * @returns {module:engine/view/text~Text|module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|Object}
 * Returns parsed view node or object with two fields `view` and `selection` when selection ranges were included in data to parse.
 */
export function parse( data, options = {} ) {
	options.order = options.order || [];
	const rangeParser = new RangeParser( {
		sameSelectionCharacters: options.sameSelectionCharacters
	} );
	const processor = new XmlDataProcessor( {
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
		const nodes = view.removeChildren( 0, view.childCount );

		root.removeChildren( 0, root.childCount );
		root.appendChildren( nodes );

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
		const selection = new Selection();
		selection.setRanges( ranges, !!options.lastRangeBackward );

		return {
			view,
			selection
		};
	}

	// If single element is returned without selection - remove it from parent and return detached element.
	if ( view.parent ) {
		view.remove();
	}

	return view;
}

/**
 * Private helper class used for converting ranges represented as text inside view {@link module:engine/view/text~Text Text nodes}.
 *
 * @private
 */
class RangeParser {
	/**
	 * Create RangeParser instance.
	 *
	 * @param {Object} options RangeParser configuration.
	 * @param {Boolean} [options.sameSelectionCharacters=false] When set to `true` it means that selection inside text is marked as
	 * `{` and `}` and selection outside text as `[` and `]`. When set to `false` then both are marked as `[` and `]`.
	 */
	constructor( options ) {
		this.sameSelectionCharacters = !!options.sameSelectionCharacters;
	}

	/**
	 * Parses the view, and returns ranges represented inside {@link module:engine/view/text~Text Text nodes}.
	 * Method will remove all occurrences of `{`, `}`, `[` and `]` from found text nodes. If text node is empty after
	 * the process - it will be removed too.
	 *
	 * @param {module:engine/view/node~Node} node Starting node.
	 * @param {Array.<Number>} order Ranges order. Each element should represent desired position of the range after
	 * sorting. For example: `[2, 3, 1]` means that first range will be placed as second, second as third and third as first.
	 * @returns {Array.<module:engine/view/range~Range>} Array with ranges found.
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
	 * Gathers positions of brackets inside view tree starting from provided node. Method will remove all occurrences of
	 * `{`, `}`, `[` and `]` from found text nodes. If text node is empty after the process - it will be removed
	 * too.
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

		if ( node.is( 'text' ) ) {
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
			node.data = text;
			const index = node.index;
			const parent = node.parent;

			// Remove empty text nodes.
			if ( !text ) {
				node.remove();
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
	 * Sort ranges in given order. Ranges order should be an array, each element should represent desired position
	 * of the range after sorting.
	 * For example: `[2, 3, 1]` means that first range will be placed as second, second as third and third as first.
	 *
	 * @private
	 * @param {Array.<module:engine/view/range~Range>} ranges Ranges to sort.
	 * @param {Array.<Number>} rangesOrder Array with new ranges order.
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
 * Private helper class used for converting view tree to string.
 *
 * @private
 */
class ViewStringify {
	/**
	 * Creates ViewStringify instance.
	 *
	 * @param root
	 * @param {module:engine/view/selection~Selection} selection Selection which ranges should be also converted to string.
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.showType=false] When set to `true` type of elements will be printed (`<container:p>`
	 * instead of `<p>`, `<attribute:b>` instead of `<b>` and `<empty:img>` instead of `<img>`).
	 * @param {Boolean} [options.showPriority=false] When set to `true` AttributeElement's priority will be printed.
	 * @param {Boolean} [options.ignoreRoot=false] When set to `true` root's element opening and closing tag will not
	 * be outputted.
	 * @param {Boolean} [options.sameSelectionCharacters=false] When set to `true` it means that selection inside text is marked as
	 * `{` and `}` and selection outside text as `[` and `]`. When set to `false` then both are marked as `[` and `]`.
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
		this.ignoreRoot = !!options.ignoreRoot;
		this.sameSelectionCharacters = !!options.sameSelectionCharacters;
	}

	/**
	 * Converts view to string.
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
	 * Executes simple walker that iterates over all elements in the view tree starting from root element.
	 * Calls `callback` with parsed chunks of string data.
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

			let offset = 0;
			callback( this._stringifyElementRanges( root, offset ) );

			for ( const child of root.getChildren() ) {
				this._walkView( child, callback );
				offset++;
				callback( this._stringifyElementRanges( root, offset ) );
			}

			if ( root.is( 'element' ) && !ignore ) {
				callback( this._stringifyElementClose( root ) );
			}
		}

		if ( root.is( 'text' ) ) {
			callback( this._stringifyTextRanges( root ) );
		}
	}

	/**
	 * Checks if given {@link module:engine/view/element~Element Element} has {@link module:engine/view/range~Range#start range start} or
	 * {@link module:engine/view/range~Range#start range end} placed at given offset and returns its string representation.
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
	 * Checks if given {@link module:engine/view/element~Element Text node} has {@link module:engine/view/range~Range#start range start} or
	 * {@link module:engine/view/range~Range#start range end} placed somewhere inside. Returns string representation of text
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
	 * Converts passed {@link module:engine/view/element~Element Element} to opening tag.
	 * Depending on current configuration opening tag can be simple (`<a>`), contain type prefix (`<container:p>`,
	 * `<attribute:a>` or `<empty:img>`), contain priority information ( `<attribute:a view-priority="20">` ).
	 * Element's attributes also will be included (`<a href="http://ckeditor.com" name="foobar">`).
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @returns {String}
	 */
	_stringifyElementOpen( element ) {
		const priority = this._stringifyElementPriority( element );

		const type = this._stringifyElementType( element );
		const name = [ type, element.name ].filter( i => i !== '' ).join( ':' );
		const attributes = this._stringifyElementAttributes( element );
		const parts = [ name, priority, attributes ];

		return `<${ parts.filter( i => i !== '' ).join( ' ' ) }>`;
	}

	/**
	 * Converts passed {@link module:engine/view/element~Element Element} to closing tag.
	 * Depending on current configuration closing tag can be simple (`</a>`) or contain type prefix (`</container:p>`,
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
	 * Converts passed {@link module:engine/view/element~Element Element's} type to its string representation
	 *
	 * Returns:
	 * * 'attribute' for {@link module:engine/view/attributeelement~AttributeElement AttributeElements},
	 * * 'container' for {@link module:engine/view/containerelement~ContainerElement ContainerElements},
	 * * 'empty' for {@link module:engine/view/emptyelement~EmptyElement EmptyElements}.
	 * * 'ui' for {@link module:engine/view/uielement~UIElement UIElements}.
	 * * empty string when current configuration is preventing showing elements' types.
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
	 * Converts passed {@link module:engine/view/element~Element Element} to its priority representation.
	 * Priority string representation will be returned when passed element is an instance of
	 * {@link module:engine/view/attributeelement~AttributeElement AttributeElement} and current configuration allow to show priority.
	 * Otherwise returns empty string.
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
	 * Converts passed {@link module:engine/view/element~Element Element} attributes to their string representation.
	 * If element has no attributes - empty string is returned.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} element
	 * @returns {String}
	 */
	_stringifyElementAttributes( element ) {
		const attributes = [];
		const keys = [ ...element.getAttributeKeys() ].sort();

		for ( const attribute of keys ) {
			attributes.push( `${ attribute }="${ element.getAttribute( attribute ) }"` );
		}

		return attributes.join( ' ' );
	}
}

// Converts {@link module:engine/view/element~Element Elements} to
// {@link module:engine/view/attributeelement~AttributeElement AttributeElements},
// {@link module:engine/view/containerelement~ContainerElement ContainerElements},
// {@link module:engine/view/emptyelement~EmptyElement EmptyElements} or
// {@link module:engine/view/uielement~UIElement UIElements}.
// It converts whole tree starting from the `rootNode`. Conversion is based on element names.
// See `_convertElement` method for more details.
//
// @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|module:engine/view/text~Text}
//  rootNode Root node to convert.
// @returns {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|
// module:engine/view/text~Text} Root node of converted elements.
function _convertViewElements( rootNode ) {
	if ( rootNode.is( 'element' ) || rootNode.is( 'documentFragment' ) ) {
		// Convert element or leave document fragment.
		const convertedElement = rootNode.is( 'documentFragment' ) ? new ViewDocumentFragment() : _convertElement( rootNode );

		// Convert all child nodes.
		for ( const child of rootNode.getChildren() ) {
			if ( convertedElement.is( 'emptyElement' ) ) {
				throw new Error( 'Parse error - cannot parse inside EmptyElement.' );
			}

			if ( convertedElement.is( 'uiElement' ) ) {
				throw new Error( 'Parse error - cannot parse inside UIElement.' );
			}

			convertedElement.appendChildren( _convertViewElements( child ) );
		}

		return convertedElement;
	}

	return rootNode;
}

// Converts {@link module:engine/view/element~Element Element} to
// {@link module:engine/view/attributeelement~AttributeElement AttributeElement},
// {@link module:engine/view/containerelement~ContainerElement ContainerElement},
// {@link module:engine/view/emptyelement~EmptyElement EmptyElement} or
// {@link module:engine/view/uielement~UIElement UIElement}.
// If element's name is in format `attribute:b` with `view-priority="11"` attribute it will be converted to
// {@link module:engine/view/attributeelement~AttributeElement AttributeElement} with priority 11.
// If element's name is in format `container:p` - it will be converted to
// {@link module:engine/view/containerelement~ContainerElement ContainerElement}.
// If element's name is in format `empty:img` - it will be converted to
// {@link module:engine/view/emptyelement~EmptyElement EmptyElement}.
// If element's name is in format `ui:span` - it will be converted to
// {@link module:engine/view/uielement~UIElement UIElement}.
// If element's name will not contain any additional information - {@link module:engine/view/element~Element view Element} will be
// returned.
//
// @param {module:engine/view/element~Element} viewElement View element to convert.
// @returns {module:engine/view/element~Element|module:engine/view/attributeelement~AttributeElement|
// module:engine/view/emptyelement~EmptyElement|module:engine/view/uielement~UIElement|
// module:engine/view/containerelement~ContainerElement} Tree view
// element converted according to it's name.
function _convertElement( viewElement ) {
	const info = _convertElementNameAndPriority( viewElement );
	const ElementConstructor = allowedTypes[ info.type ];
	const newElement = ElementConstructor ? new ElementConstructor( info.name ) : new ViewElement( info.name );

	if ( newElement.is( 'attributeElement' ) ) {
		if ( info.priority !== null ) {
			newElement.priority = info.priority;
		}
	}

	// Move attributes.
	for ( const attributeKey of viewElement.getAttributeKeys() ) {
		newElement.setAttribute( attributeKey, viewElement.getAttribute( attributeKey ) );
	}

	return newElement;
}

// Converts `view-priority` attribute and {@link module:engine/view/element~Element#name Element's name} information needed for creating
// {@link module:engine/view/attributeelement~AttributeElement AttributeElement},
// {@link module:engine/view/containerelement~ContainerElement ContainerElement},
// {@link module:engine/view/emptyelement~EmptyElement EmptyElement} or,
// {@link module:engine/view/uielement~UIElement UIElement}.
// Name can be provided in two formats: as a simple element's name (`div`), or as a type and name (`container:div`,
// `attribute:span`, `empty:img`, `ui:span`);
//
// @param {module:engine/view/element~Element} element Element which name should be converted.
// @returns {Object} info Object with parsed information.
// @returns {String} info.name Parsed name of the element.
// @returns {String|null} info.type Parsed type of the element, can be `attribute`, `container` or `empty`.
// returns {Number|null} info.priority Parsed priority of the element.
function _convertElementNameAndPriority( viewElement ) {
	const parts = viewElement.name.split( ':' );
	const priority = _convertPriority( viewElement.getAttribute( 'view-priority' ) );
	viewElement.removeAttribute( 'view-priority' );

	if ( parts.length == 1 ) {
		return {
			name: parts[ 0 ],
			type: priority !== null ? 'attribute' : null,
			priority
		};
	}

	// Check if type and name: container:div.
	const type = _convertType( parts[ 0 ] );

	if ( type ) {
		return {
			name: parts[ 1 ],
			type,
			priority
		};
	}

	throw new Error( `Parse error - cannot parse element's name: ${ viewElement.name }.` );
}

// Checks if element's type is allowed. Returns `attribute`, `container`, `empty` or `null`.
//
// @param {String} type
// @returns {String|null}
function _convertType( type ) {
	return allowedTypes[ type ] ? type : null;
}

// Checks if given priority is allowed. Returns null if priority cannot be converted.
//
// @param {String} priorityString
// returns {Number|Null}
function _convertPriority( priorityString ) {
	const priority = parseInt( priorityString, 10 );

	if ( !isNaN( priority ) ) {
		return priority;
	}

	return null;
}
