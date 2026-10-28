/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getViewportTopOffsetConfig } from '@snippets/index.js';
import {
	ClassicEditor,
	Essentials,
	Paragraph,
	Bold,
	Italic,
	CodeBlock,
	SourceEditing,
	GeneralHtmlSupport,
	DataFilter,
	Plugin,
	priorities
} from 'ckeditor5';

import './general-html-support-debugger.css';

const DEVTOOLS_ID = 'general-html-support-debugger-devtools';
const CLEAR_BUTTON_ID = 'general-html-support-debugger-clear';

const INITIAL_DATA = `
	<pre class="foo" style="background: violet;"><code class="language-html" data-foo="foo">Allowed properties only.</code></pre>
	<pre style="background: yellow;"><code class="language-css" style="color: red;" data-foo="bar">Disallowed properties.</code></pre>
	<pre class="bar" data-bar="baz"><code title="Not allowed">Properties without an allow rule.</code></pre>
	<p>Inline <code style="color: blue; background: yellow;">code</code> with a disallowed background.</p>
	<p>A paragraph with <span class="x">a span</span> and a disallowed <kbd>Ctrl</kbd> key.</p>
`;

// The same rules as in the table in the guide.
const HTML_SUPPORT_CONFIG = {
	allow: [
		{
			name: /^(pre|code)$/,
			attributes: { 'data-foo': true },
			classes: [ 'foo' ],
			styles: { color: true, background: true }
		}
	],
	disallow: [
		{
			name: /^(pre|code)$/,
			attributes: { 'data-foo': 'bar' },
			styles: { background: 'yellow' }
		},
		{ name: 'kbd' }
	]
};

// The same plugin as in the guide. Keep both copies of `HtmlSupportDebugger` and its helpers in sync.
class HtmlSupportDebugger extends Plugin {
	static get pluginName() {
		return 'HtmlSupportDebugger';
	}

	static get requires() {
		return [ DataFilter ];
	}

	init() {
		const editor = this.editor;
		const dataFilter = editor.plugins.get( DataFilter );

		// Logs the items of the element that no converter has consumed (yet).
		const logUnconsumed = ( reason, element, consumable, items ) => {
			const unconsumedItems = items.filter( ( { descriptor } ) => consumable.test( element, descriptor ) );
			const coveredStyles = unconsumedItems
				.filter( ( { kind } ) => kind == 'style' )
				.flatMap( ( { name } ) => getLonghandStyles( element, name ) );

			for ( const { kind, name, value } of unconsumedItems ) {
				// Log only `margin` instead of `margin`, `margin-top`, `margin-left`, and so on.
				if ( kind != 'style' || !coveredStyles.includes( name ) ) {
					this.log( { reason, kind, name, value, path: getPath( element ) } );
				}
			}
		};

		// GHS removes disallowed attributes by consuming them, so catch them right before that happens.
		dataFilter.decorate( 'processViewAttributes' );

		this.listenTo( dataFilter, 'processViewAttributes', ( evt, [ element, { consumable } ] ) => {
			const disallowedIds = getDisallowedIds( dataFilter, element );
			const disallowedItems = getItems( element ).filter( ( { kind, name } ) => disallowedIds.has( `${ kind }:${ name }` ) );

			logUnconsumed( 'disallowedAttribute', element, consumable, disallowedItems );
		}, { priority: 'high' } );

		// Whatever is still not consumed after all converters ran gets dropped. Run right before
		// the default converter (`lowest` priority) that unwraps unknown elements.
		this.listenTo( editor.data.upcastDispatcher, 'element', ( evt, { viewItem: element }, { consumable } ) => {
			// Skip internal elements, like `$comment`.
			if ( element.name.startsWith( '$' ) ) {
				return;
			}

			const reason = dataFilter._disallowedElements.has( element.name ) ? 'disallowedElement' : 'notAllowed';
			const elementItem = { kind: 'element', name: element.name, descriptor: { name: true } };

			// Some features do not consume wrapper elements, like `<ul>`, but rebuild them in the output.
			const items = isRebuiltByFeature( editor, element ) ? getItems( element ) : [ elementItem, ...getItems( element ) ];

			logUnconsumed( reason, element, consumable, items );
		}, { priority: priorities.lowest + 1 } );
	}

	log( rejection ) {
		console.warn( 'HtmlSupportDebugger:', rejection );
	}
}

function getItems( element ) {
	const attributes = [ ...element.getAttributeKeys() ]
		.filter( name => name != 'class' && name != 'style' )
		.map( name => ( {
			kind: 'attribute',
			name,
			value: element.getAttribute( name ),
			descriptor: { attributes: [ name ] }
		} ) );

	const classes = [ ...element.getClassNames() ].map( name => ( {
		kind: 'class',
		name,
		descriptor: { classes: [ name ] }
	} ) );

	// Include longhand styles, like `margin-left` for `margin`, because the rules may use either form.
	const styles = element.getStyleNames( true )
		.filter( name => element.getStyle( name ) !== undefined )
		.map( name => ( {
			kind: 'style',
			name,
			value: element.getStyle( name ),
			descriptor: { styles: [ name ] }
		} ) );

	return [ ...attributes, ...classes, ...styles ];
}

function getDisallowedIds( dataFilter, element ) {
	const matches = dataFilter._disallowedAttributes.matchAll( element ) || [];

	const ids = matches
		.flatMap( ( { match } ) => match.attributes || [] )
		.flatMap( ( [ key, token ] ) => {
			if ( key == 'style' ) {
				// GHS also removes the longhands of a disallowed shorthand, like `margin-left` for `margin`.
				return [ token, ...getLonghandStyles( element, token ) ].map( name => `style:${ name }` );
			}

			return key == 'class' ? `class:${ token }` : `attribute:${ key }`;
		} );

	return new Set( ids );
}

function isRebuiltByFeature( editor, element ) {
	const { plugins, config } = editor;
	const hasChild = name => [ ...element.getChildren() ].some( child => child.is( 'element', name ) );

	switch ( element.name ) {
		case 'ul':
		case 'ol':
			return plugins.has( 'ListEditing' ) && hasChild( 'li' );
		case 'thead':
		case 'tbody':
			return plugins.has( 'TableEditing' ) && hasChild( 'tr' );
		case 'tfoot':
			return plugins.has( 'TableEditing' ) && hasChild( 'tr' ) && !!config.get( 'table.enableFooters' );
		case 'pre':
			return plugins.has( 'CodeBlockEditing' ) && hasChild( 'code' );
		default:
			return false;
	}
}

function getLonghandStyles( element, styleName ) {
	return element.document.stylesProcessor.getRelatedStyles( styleName )
		.filter( name => name.split( '-' ).length > styleName.split( '-' ).length );
}

function getPath( element ) {
	return [ ...element.getAncestors(), element ]
		.filter( node => node.is( 'element' ) )
		.map( node => node.name )
		.join( ' > ' );
}

class InterceptHtmlSupportDebuggerLogs extends Plugin {
	static get requires() {
		return [ HtmlSupportDebugger ];
	}

	init() {
		const { fakeDevtools } = document.getElementById( DEVTOOLS_ID );

		const debuggerPlugin = this.editor.plugins.get( HtmlSupportDebugger );
		const originalLog = debuggerPlugin.log.bind( debuggerPlugin );

		// Whether the console shows only the "Logs cleared." message, which the next warning replaces.
		let isClearedMessageShown = false;

		debuggerPlugin.log = rejection => {
			originalLog( rejection );

			if ( isClearedMessageShown ) {
				fakeDevtools.clear();
				isClearedMessageShown = false;
			}

			fakeDevtools.loggers.warning( ...withBadge( rejection.reason, '#E65100' ), formatRejection( rejection ) );
		};

		document.getElementById( CLEAR_BUTTON_ID ).addEventListener( 'click', () => {
			fakeDevtools.clear();
			fakeDevtools.loggers.info( ...withBadge( 'Logs cleared.', '#4169E1' ) );
			isClearedMessageShown = true;
		} );
	}
}

function withBadge( message, background ) {
	return [
		`%cHtmlSupportDebugger%c ${ message }`,
		`background: ${ background }; color: white; padding: 2px 4px;`,
		''
	];
}

function formatRejection( { kind, name, value, path } ) {
	const valueText = value === undefined ? '' : ` with value "${ value }"`;

	return `${ kind } "${ name }"${ valueText }\nPath: ${ path }`;
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#snippet-general-html-support-debugger' ),
		root: {
			initialData: INITIAL_DATA
		},
		plugins: [
			Essentials, Paragraph, Bold, Italic, CodeBlock, SourceEditing,
			GeneralHtmlSupport, HtmlSupportDebugger, InterceptHtmlSupportDebuggerLogs
		],
		toolbar: [ 'undo', 'redo', '|', 'sourceEditing', '|', 'codeBlock', '|', 'bold', 'italic' ],
		htmlSupport: HTML_SUPPORT_CONFIG,
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
