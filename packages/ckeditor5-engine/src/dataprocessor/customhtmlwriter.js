/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/dataprocessor/customhtmlwriter
 */

/* globals document, Node */

const SELF_CLOSING_TAGS = new Set( [
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
] );

/**
 * Custom HTML writer. It creates HTML by traversing DOM nodes.
 *
 * It differs to BasicHtmlWriter in the way it encodes entities in element attributes.
 *
 * @see module:engine/dataprocessor/basichtmlwriter~BasicHtmlWriter
 * @implements module:engine/dataprocessor/htmlwriter~HtmlWriter
 */
export default class CustomHtmlWriter {
	/**
	 * Returns an HTML string created from the document fragment.
	 *
	 * @param {DocumentFragment} fragment
	 * @returns {String}
	 */
	getHtml( fragment ) {
		const builder = new HtmlBuilder();

		builder.appendNode( fragment );

		return builder.build();
	}
}

class HtmlBuilder {
	constructor() {
		this.chunks = [];
	}

	build() {
		return this.chunks.join( '' );
	}

	appendNode( node ) {
		if ( node.nodeType == Node.TEXT_NODE ) {
			this._appendText( node );
		} else if ( node.nodeType == Node.ELEMENT_NODE ) {
			this._appendElement( node );
		} else if ( node.nodeType == Node.DOCUMENT_FRAGMENT_NODE ) {
			this._appendChildren( node );
		}
	}

	_appendElement( node ) {
		const nodeName = node.nodeName.toLowerCase();

		this._append( '<' );
		this._append( nodeName );
		this._appendAttributes( node );
		this._append( '>' );
		if ( !SELF_CLOSING_TAGS.has( nodeName ) ) {
			this._appendChildren( node );
			this._append( '</' );
			this._append( nodeName );
			this._append( '>' );
		}
	}

	_appendChildren( node ) {
		for ( const child of node.childNodes ) {
			this.appendNode( child );
		}
	}

	_appendAttributes( node ) {
		for ( const attr of node.attributes ) {
			this._append( ' ' );
			this._append( attr.name );
			this._append( '="' );
			this._append( this._escapeAttribute( attr.value ) );
			this._append( '"' );
		}
	}

	_appendText( node ) {
		// Text node doesn't have innerHTML property and textContent doesn't encode
		// entities. That's why the text is repacked into another node and extracted using
		// innerHTML

		const doc = document.implementation.createHTMLDocument( '' );
		const container = doc.createElement( 'p' );
		container.textContent = node.textContent;

		this._append( container.innerHTML );
	}

	_append( str ) {
		this.chunks.push( str );
	}

	_escapeAttribute( text ) {
		return text
			.replace( /&/g, '&amp;' )
			.replace( /'/g, '&apos;' )
			.replace( /"/g, '&quot;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /\r\n/g, '&#13;' )
			.replace( /[\r\n]/g, '&#13;' );
	}
}
