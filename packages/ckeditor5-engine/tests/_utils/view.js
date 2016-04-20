/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* jshint latedef:false */

import DocumentFragment from '/ckeditor5/engine/treeview/documentfragment.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import Text from '/ckeditor5/engine/treeview/text.js';

const ELEMENT_RANGE_START_TOKEN = '[';
const ELEMENT_RANGE_END_TOKEN = ']';
const TEXT_RANGE_START_TOKEN = '{';
const TEXT_RANGE_END_TOKEN = '}';

/**
 * Converts view elements to its string representation.
 * Root element can be provided as {@link engine.treeView.Element Element} or
 * {@link engine.treeView.DocumentFragment DocumentFragment}.
 *
 *		const text = new Text( 'foobar' );
 *		const b = new Element( 'b', { name: 'test' }, text );
 *		const p = new Element( 'p', { style: 'color:red;' }, b );
 *
 *		getData( p ); // <p style="color:red;"><b name="test">foobar</b></p>
 *
 * Additionally {@link engine.treeView.Selection Selection}
 * instance can be provided, then ranges from that selection will be converted too. If range position is placed inside
 * element node `[` and `]` will be used there.
 *
 *		const text = new Text( 'foobar' );
 *		const b = new Element( 'b', null, text );
 *		const p = new Element( 'p', null, b );
 *		const selection = new Selection();
 *		selection.addRange( Range.createFromParentsAndOffsets( p, 0, p, 1 ) );
 *
 *		getData( p, selection ); // <p>[<b>foobar</b>]</p>
 *
 * If range is placed inside text node `{` and `}` will be used there.
 *
 *		const text = new Text( 'foobar' );
 *		const b = new Element( 'b', null, text );
 *		const p = new Element( 'p', null, b );
 *		const selection = new Selection();
 *		selection.addRange( Range.createFromParentsAndOffsets( text, 1, text, 5 ) );
 *
 *		getData( p, selection ); // <p><b>f{ooba}r</b></p>
 *
 * Additional options object can be provided.
 * If `options.showType` property is set to `true` element types will be
 * presented for {@link engine.treeView.AttributeElement AttributeElements} and {@link engine.treeView.ContainerElement
 * ContainerElements}.
 *
 *		const attribute = new AttributeElement( 'b' );
 *		const container = new ContainerElement( 'p' );
 *		getData( attribute, null, { showType: true } ); // <attribute:b></attribute:b>
 *		getData( container, null, { showType: true } ); // <container:p></container:p>
 *
 * if `options.showPriority` property is set to `true`, priority will be displayed for all
 * {@link engine.treeView.AttributeElement AttributeElements}.
 *
 *		const attribute = new AttributeElement( 'b' );
 *		attribute.priority = 20;
 *		getData( attribute, null, { showPriority: true } ); // <b priority=20></b>
 *
 * @param {engine.treeView.Element|engine.treeView.DocumentFragment} root
 * @param {engine.treeView.Selection} [selection]
 * @param {Object} [options]
 * @param {Boolean} [options.showType=false] When set to `true` type of elements will be printed ( `<container:p>`
 * instead of `<p>` and `<attribute:b>` instead of `<b>`.
 * @param {Boolean} [options.showPriority=false] When set to `true` AttributeElement's priority will be printed.
 * @returns {String}
 */
export function getData( root, selection, options ) {
	const viewStringify = new ViewStringify( root, selection, options );

	return viewStringify.stringify();
}

/**
 * Private helper class used for converting view tree to string.
 *
 * @private
 */
class ViewStringify {
	/**
	 * Creates ViewStringify instance.
	 * @param root
	 * @param {engine.treeView.Selection} [selection=null] Selection which ranges should be also converted to string.
	 * @param {Object} [options] Options object.
	 * @param {Boolean} [options.showType=false] When set to `true` type of elements will be printed ( `<container:p>`
	 * instead of `<p>` and `<attribute:b>` instead of `<b>`.
	 * @param {Boolean} [options.showPriority=false] When set to `true` AttributeElement's priority will be printed.
	 */
	constructor( root, selection = null, options = {} ) {
		this.root = root;
		this.selection = selection;
		this.ranges = [];

		if ( this.selection ) {
			this.ranges = [ ...selection.getRanges() ];
		}

		this.showType = !!options.showType;
		this.showPriority = !!options.showPriority;
	}

	/**
	 * Converts view to string.
	 *
	 * @returns {string} String representation of the view elements.
	 */
	stringify() {
		let result = '';
		this._walkView( this.root, ( chunk ) => {
			result += chunk;
		} );

		return result;
	}

	/**
	 * Executes simple walker that iterates over all elements in the view tree starting from root element.
	 * Calls `callback` with parsed chunks of string data.
	 *
	 * @private
	 * @param {engine.treeView.DocumentFragment|engine.treeView.Element|engine.treeView.Text} root
	 * @param {Function} callback
	 */
	_walkView( root, callback ) {
		const isElement = root instanceof Element;

		if ( isElement || root instanceof DocumentFragment ) {
			if ( isElement ) {
				callback( this._stringifyElementOpen( root ) );
			}

			let offset = 0;
			callback( this._stringifyElementRanges( root, offset ) );

			for ( let child of root.getChildren() ) {
				this._walkView( child, callback );
				offset++;
				callback( this._stringifyElementRanges( root, offset ) );
			}

			if ( isElement ) {
				callback( this._stringifyElementClose( root ) );
			}
		}

		if ( root instanceof Text ) {
			callback( this._stringifyTextRanges( root ) );
		}
	}

	/**
	 * Checks if given {@link engine.treeView.Element Element} has {@link engine.treeView.Range#start range start} or
	 * {@link engine.treeView.Range#start range end} placed at given offset and returns its string representation.
	 *
	 * @private
	 * @param {engine.treeView.Element} element
	 * @param {Number} offset
	 */
	_stringifyElementRanges( element, offset ) {
		let start = '';
		let end = '';
		let collapsed = '';

		for ( let range of this.ranges ) {
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
	 * Checks if given {@link engine.treeView.Element Text node} has {@link engine.treeView.Range#start range start} or
	 * {@link engine.treeView.Range#start range end} placed somewhere inside. Returns string representation of text
	 * with range delimiters placed inside.
	 *
	 * @private
	 * @param {engine.treeView.Text} node
	 */
	_stringifyTextRanges( node ) {
		const length = node.data.length;
		let result = node.data.split( '' );

		// Add one more element for ranges ending after last character in text.
		result[ length ] = '';

		// Represent each letter as object with information about opening/closing ranges at each offset.
		result = result.map( ( letter ) => {
			return {
				letter: letter,
				start: '',
				end: '',
				collapsed: ''
			};
		}  );

		for ( let range of this.ranges ) {
			const start = range.start;
			const end = range.end;

			if ( start.parent == node && start.offset >= 0 && start.offset <= length ) {
				if ( range.isCollapsed ) {
					result[ end.offset ].collapsed += TEXT_RANGE_START_TOKEN + TEXT_RANGE_END_TOKEN;
				} else {
					result[ start.offset ].start += TEXT_RANGE_START_TOKEN;
				}
			}

			if ( end.parent == node && end.offset >= 0 && end.offset <= length && !range.isCollapsed  ) {
				result[ end.offset ].end += TEXT_RANGE_END_TOKEN;
			}
		}

		return result.map( item => item.end + item.collapsed + item.start + item.letter ).join( '' );
	}

	/**
	 * Converts passed {@link engine.treeView.Element Element} to opening tag.
	 * Depending on current configuration opening tag can be simple (`<a>`), contain type prefix (`<container:p>` or
	 * `<attribute:a>`), contain priority information ( `<attribute:a priority=20>` ). Element's attributes also
	 * will be included (`<a href="http://ckeditor.com" name="foobar">`).
	 *
	 * @private
	 * @param {engine.treeView.Element} element
	 * @returns {string}
	 */
	_stringifyElementOpen( element ) {
		const name = this._stringifyElementName( element );
		const priority = this._stringifyElementPriority( element );
		const attributes = this._stringifyElementAttributes( element );
		const parts = [ name, priority, attributes ];

		return `<${ parts.filter( i => i !== '' ).join( ' ' ) }>`;
	}

	/**
	 * Converts passed {@link engine.treeView.Element Element} to closing tag.
	 * Depending on current configuration opening tag can be simple (`</a>`) or contain type prefix (`</container:p>` or
	 * `</attribute:a>`).
	 *
	 * @private
	 * @param {engine.treeView.Element} element
	 * @returns {string}
	 */
	_stringifyElementClose( element ) {
		const name = this._stringifyElementName( element );

		return `</${ name }>`;
	}

	/**
	 * Converts passed {@link engine.treeView.Element Element} its name representation.
	 * Depending on current configuration name can be simple (`a`) or contain type prefix (`container:p` or
	 * `attribute:a`).
	 *
	 * @private
	 * @param {engine.treeView.Element} element
	 * @returns {string}
	 */
	_stringifyElementName( element ) {
		let name = element.name;

		if ( this.showType ) {
			if ( element instanceof AttributeElement ) {
				return 'attribute:' + name;
			}

			if ( element instanceof ContainerElement ) {
				return 'container:' + name;
			}
		}

		return name;
	}

	/**
	 * Converts passed {@link engine.treeView.Element Element} to its priority representation.
	 * Priority string representation will be returned when passed element is an instance of
	 * {@link engine.treeView.AttributeElement AttributeElement} and current configuration allow to show priority.
	 * Otherwise returns empty string.
	 *
	 * @private
	 * @param {engine.treeView.Element} element
	 * @returns {string}
	 */
	_stringifyElementPriority( element ) {
		if ( this.showPriority && element instanceof AttributeElement ) {
			return `priority=${ element.priority }`;
		}

		return '';
	}

	/**
	 * Converts passed {@link engine.treeView.Element Element} attributes to their string representation.
	 * If element has no attributes - empty string is returned.
	 *
	 * @private
	 * @param {engine.treeView.Element} element
	 * @returns {string}
	 */
	_stringifyElementAttributes( element ) {
		const attributes = [];

		// TODO: Maybe attributes should be put in alphabetical order, it might be easier to write expected string.
		for ( let attribute of element.getAttributeKeys() ) {
			attributes.push( `${ attribute }="${ element.getAttribute( attribute ) }"` );
		}

		return attributes.join( ' ' );
	}
}