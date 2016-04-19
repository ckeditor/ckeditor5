/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* jshint latedef:false */

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

class ViewStringify {
	constructor( root, selection, options = {} ) {
		this.root = root;
		this.selection = null;
		this.ranges = [];

		if ( selection ) {
			this.selection = selection;
			this.ranges = [ ...selection.getRanges() ];
		}

		this.showTypes = !!options.showTypes;
		this.showPriorities = !!options.showPriorities;
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

	_walkView( root, cb ) {
		if ( root instanceof Element ) {
			cb( this._stringifyElementOpen( root ) );

			let offset = 0;
			this._checkElementRanges( root, offset, cb );

			for ( let child of root.getChildren() ) {
				this._walkView( child, cb );
				offset++;
				this._checkElementRanges( root, offset, cb );
			}

			cb( this._stringifyElementClose( root ) );
		}

		if ( root instanceof Text ) {
			cb( this._checkTextRanges( root ) );
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

	_stringifyElementOpen( element ) {
		let attributes = [];
		const namespace = this._stringifyElementType( element );

		// TODO: Maybe attributes should be put in alphabetical order, it might be easier to write expected string.
		for ( let attribute of element.getAttributeKeys() ) {
			attributes.push( `${ attribute }="${ element.getAttribute( attribute ) }"` );
		}

		return `<${ namespace + element.name }${ attributes.length > 0 ? ' ' + attributes.join( ' ' ) : '' }>`;
	}

	_stringifyElementClose( element ) {
		const namespace = this._stringifyElementType( element );

		return `</${ namespace + element.name }>`;
	}

	_stringifyElementType( element ) {
		if ( this.showTypes ) {
			if ( element instanceof AttributeElement ) {
				return 'attribute:';
			}

			if ( element instanceof ContainerElement ) {
				return 'container:';
			}
		}

		return '';
	}

	static _insertToString( source, index, insert ) {
		return source.substr( 0, index ) + insert + source.substr( index );
	}
}