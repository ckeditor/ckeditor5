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
	 * @param root
	 * @param {Function} callback
	 */
	_walkView( root, callback ) {
		const isElement = root instanceof Element;

		if ( isElement || root instanceof DocumentFragment ) {
			if ( isElement ) {
				callback( this._stringifyElementOpen( root ) );
			}

			let offset = 0;
			this._checkElementRanges( root, offset, callback );

			for ( let child of root.getChildren() ) {
				this._walkView( child, callback );
				offset++;
				this._checkElementRanges( root, offset, callback );
			}

			if ( isElement ) {
				callback( this._stringifyElementClose( root ) );
			}
		}

		if ( root instanceof Text ) {
			callback( this._checkTextRanges( root ) );
		}
	}

	/**
	 * Checks if given {@link engine.treeView.Element Element} has {@link engine.treeView.Range#start range start} or
	 * {@link engine.treeView.Range#start range end} placed at given offset. Calls `callback` function each time range
	 * start or end is found.
	 *
	 * @private
	 * @param {engine.treeView.Element} element
	 * @param {Number} offset
	 * @param {Function} callback
	 */
	_checkElementRanges( element, offset, callback ) {
		for ( let range of this.ranges ) {
			if ( range.start.parent == element && range.start.offset === offset ) {
				callback( ELEMENT_RANGE_START_TOKEN );
			}

			if ( range.end.parent === element && range.end.offset === offset ) {
				callback( ELEMENT_RANGE_END_TOKEN );
			}
		}
	}

	/**
	 * Checks if given {@link engine.treeView.Element Text node} has {@link engine.treeView.Range#start range start} or
	 * {@link engine.treeView.Range#start range end} placed somewhere inside. Returns string representation of text
	 * with range delimiters placed inside.
	 *
	 * @private
	 * @param {engine.treeView.Text} textNode
	 */
	_checkTextRanges( textNode ) {
		let result = textNode.data;
		let textOffset = 0;

		for ( let range of this.ranges ) {
			if ( range.start.parent == textNode ) {
				result = ViewStringify._insertToString( result, range.start.offset + textOffset, TEXT_RANGE_START_TOKEN );
				textOffset++;
			}

			if ( range.end.parent == textNode && !range.isCollapsed ) {
				result = ViewStringify._insertToString( result, range.end.offset + textOffset, TEXT_RANGE_END_TOKEN );
				textOffset++;
			}
		}

		return result;
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

	/**
	 * Inserts given text at specified index in input text.
	 * If index is outside input text boundaries - returns same, unmodified string.
	 *
	 * @private
	 * @param {String} input Input string.
	 * @param {Number} index Index where to insert inside input string.
	 * @param {String} insert Text to insert.
	 * @returns {string}
	 */
	static _insertToString( input, index, insert ) {
		if ( index < 0 || index > input.length ) {
			return input;
		}

		return input.substr( 0, index ) + insert + input.substr( index );
	}
}