/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ViewDomConverter } from '../../src/view/domconverter.js';
import { ViewDocument } from '../../src/view/document.js';
import { ViewDowncastWriter } from '../../src/view/downcastwriter.js';
import { EditingView } from '../../src/view/view.js';
import { HtmlDataProcessor } from '../../src/dataprocessor/htmldataprocessor.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { createViewRoot } from './_utils/createroot.js';

import { _clearTrustedTypesCache, global, trustedHtml } from '@ckeditor/ckeditor5-utils';

// The browser enforces Trusted Types only through the CSP of a document, and the tests share one document, so the tests
// render into an iframe that enforces them. The editor looks the document up through `global`.
describe( 'when the application enforces Trusted Types', () => {
	let iframe, viewDocument, writer;

	beforeEach( async () => {
		iframe = document.createElement( 'iframe' );
		iframe.srcdoc = '<meta http-equiv="Content-Security-Policy" ' +
			'content="require-trusted-types-for \'script\'; trusted-types ckeditor5">';

		await new Promise( resolve => {
			iframe.addEventListener( 'load', resolve, { once: true } );
			document.body.appendChild( iframe );
		} );

		vi.spyOn( global, 'window', 'get' ).mockReturnValue( iframe.contentWindow );
		vi.spyOn( global, 'document', 'get' ).mockReturnValue( iframe.contentDocument );

		_clearTrustedTypesCache();

		viewDocument = new ViewDocument( new StylesProcessor() );
		writer = new ViewDowncastWriter( viewDocument );
	} );

	afterEach( () => {
		iframe.remove();
		_clearTrustedTypesCache();
	} );

	describe( 'ViewDomConverter', () => {
		describe( 'in the data pipeline', () => {
			describe( 'HtmlDataProcessor', () => {
				let dataProcessor;

				beforeEach( () => {
					dataProcessor = new HtmlDataProcessor( viewDocument );
				} );

				it( 'should keep an event handler attribute', () => {
					expectRoundTrip( '<p onclick="console.log(1)">Click me</p>' );
				} );

				it( 'should keep an external script', () => {
					expectRoundTrip( '<p>a</p><script src="/a.js"></script>' );
				} );

				it( 'should keep the srcdoc attribute of an iframe', () => {
					expectRoundTrip(
						'<p>a</p><iframe srcdoc="<p>x</p>"></iframe>',
						'<p>a</p><iframe srcdoc="&lt;p&gt;x&lt;/p&gt;"></iframe>'
					);
				} );

				function expectRoundTrip( data, expected = data ) {
					expect( dataProcessor.toData( dataProcessor.toView( data ) ) ).toEqual( expected );
				}
			} );

			// `href` is checked on a script of the SVG namespace only, so this also checks that the namespace is taken into account.
			it( 'should render the href attribute of an SVG script', () => {
				const converter = new ViewDomConverter( viewDocument, { renderingMode: 'data' } );
				const viewScript = writer.createContainerElement( 'script', { xmlns: 'http://www.w3.org/2000/svg', href: '/a.js' } );

				expect( converter.viewToDom( viewScript ).getAttribute( 'href' ) ).toEqual( '/a.js' );
			} );
		} );

		describe( 'in the editing view', () => {
			let converter;

			beforeEach( () => {
				converter = new ViewDomConverter( viewDocument, { renderingMode: 'editing' } );
			} );

			it( 'should render an event handler attribute allowed with renderUnsafeAttributes', () => {
				const viewElement = writer.createContainerElement( 'p', { onclick: 'foo()' }, { renderUnsafeAttributes: [ 'onclick' ] } );

				expect( converter.viewToDom( viewElement, { withChildren: false } ).outerHTML ).toEqual( '<p onclick="foo()"></p>' );
			} );

			it( 'should replace an external script in the content set with setContentOf()', () => {
				// The document that the parser creates enforces Trusted Types only when the parser comes from a window that does.
				vi.stubGlobal( 'DOMParser', iframe.contentWindow.DOMParser );
				// Replacing the script warns about it.
				vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				const domElement = iframe.contentDocument.createElement( 'div' );

				converter.setContentOf( domElement, '<video>x<script async="" src="/x.js"></script></video>' );

				expect( domElement.innerHTML )
					.toEqual( '<video>x<span data-ck-unsafe-element="script" async="" src="/x.js"></span></video>' );
			} );
		} );
	} );

	describe( 'ViewUIElement', () => {
		it( 'should render an event handler attribute', () => {
			const uiElement = writer.createUIElement( 'span', { onclick: 'foo()' } );

			expect( uiElement.toDomElement( iframe.contentDocument ).outerHTML ).toEqual( '<span onclick="foo()"></span>' );
		} );
	} );

	describe( 'EditingView', () => {
		it( 'should restore an event handler attribute of the DOM root when detaching it', () => {
			const view = new EditingView( new StylesProcessor() );
			const container = iframe.contentDocument.createElement( 'div' );

			// The attribute can only come from the parser under Trusted Types, like from the markup of the page.
			container.innerHTML = trustedHtml( '<div onclick="foo()"></div>' );

			const domRoot = container.firstChild;

			createViewRoot( view.document, 'div', 'main' );
			view.attachDomRoot( domRoot );
			view.detachDomRoot( 'main' );

			expect( domRoot.getAttribute( 'onclick' ) ).toEqual( 'foo()' );

			view.destroy();
		} );
	} );
} );
