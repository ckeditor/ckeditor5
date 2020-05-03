/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * Original marked.js library renderer with fixes:
 * - No formatting for output HTML string &mdash; all newlines between tags are removed to create clean output.
 * - Changed long string concatenations to ES5 template strings.
 * - Changed code style.
 *
 * @see {@link https://github.com/chjj/marked#renderer} Methods description.
 * @param options
 * @constructor
 */
function Renderer( options ) {
	this.options = options || {};
}

Renderer.prototype.code = function( code, lang, escaped ) {
	if ( this.options.highlight ) {
		const out = this.options.highlight( code, lang );

		if ( out !== null && out !== code ) {
			escaped = true;
			code = out;
		}
	}

	if ( !lang ) {
		return `<pre><code>${ escaped ? code : escape( code, true ) }</code></pre>`;
	}

	const cssClass = this.options.langPrefix + escape( lang, true );

	return `<pre><code class="${ cssClass }">${ escaped ? code : escape( code, true ) }</code></pre>`;
};

Renderer.prototype.blockquote = function( quote ) {
	return `<blockquote>${ quote }</blockquote>`;
};

Renderer.prototype.html = function( html ) {
	return html;
};

Renderer.prototype.heading = function( text, level, raw ) {
	return `<h${ level }>${ text }</h${ level }>`;
};

Renderer.prototype.hr = function() {
	return this.options.xhtml ? '<hr/>' : '<hr>';
};

Renderer.prototype.list = function( body, ordered ) {
	const type = ordered ? 'ol' : 'ul';

	return `<${ type }>${ body }</${ type }>`;
};

Renderer.prototype.listitem = function( text ) {
	return `<li>${ text }</li>`;
};

Renderer.prototype.paragraph = function( text ) {
	return `<p>${ text }</p>`;
};

Renderer.prototype.table = function( header, body ) {
	return `<table><thead>${ header }</thead><tbody>${ body }</tbody></table>`;
};

Renderer.prototype.tablerow = function( content ) {
	return '<tr>' + content + '</tr>';
};

Renderer.prototype.tablecell = function( content, flags ) {
	const type = flags.header ? 'th' : 'td';
	const tag = flags.align ? `<${ type } align="${ flags.align }">` : `<${ type }>`;

	return tag + content + `</${ type }>`;
};

// span level renderer
Renderer.prototype.strong = function( text ) {
	return `<strong>${ text }</strong>`;
};

Renderer.prototype.em = function( text ) {
	return `<em>${ text }</em>`;
};

Renderer.prototype.codespan = function( text ) {
	return `<code>${ text.trim() }</code>`;
};

Renderer.prototype.br = function() {
	return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function( text ) {
	return `<del>${ text }</del>`;
};

Renderer.prototype.link = function( href, title, text ) {
	if ( this.options.sanitize ) {
		let prot;

		try {
			prot = decodeURIComponent( unescape( href ) )
				.replace( /[^\w:]/g, '' )
				.toLowerCase();
		} catch ( e ) {
			return '';
		}

		if ( prot.indexOf( 'javascript:' ) === 0 || prot.indexOf( 'vbscript:' ) === 0 ) { // jshint ignore:line
			return '';
		}
	}

	let out = '<a href="' + href + '"';

	if ( title ) {
		out += ' title="' + title + '"';
	}
	out += '>' + text + '</a>';

	return out;
};

Renderer.prototype.image = function( href, title, text ) {
	let out = '<img src="' + href + '" alt="' + text + '"';

	if ( title ) {
		out += ' title="' + title + '"';
	}
	out += this.options.xhtml ? '/>' : '>';

	return out;
};

Renderer.prototype.text = function( text ) {
	return text;
};

export default Renderer;

function escape( html, encode ) {
	return html
		.replace( !encode ? /&(?!#?\w+;)/g : /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

function unescape( html ) {
	// explicitly match decimal, hex, and named HTML entities
	return html.replace( /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function( _, n ) {
		n = n.toLowerCase();

		if ( n === 'colon' ) {
			return ':';
		}

		if ( n.charAt( 0 ) === '#' ) {
			return n.charAt( 1 ) === 'x' ?
				String.fromCharCode( parseInt( n.substring( 2 ), 16 ) ) :
				String.fromCharCode( +n.substring( 1 ) ); // jscs:ignore
		}

		return '';
	} );
}
