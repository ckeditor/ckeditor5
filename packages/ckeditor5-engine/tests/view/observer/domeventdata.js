/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ViewDocumentDomEventData } from '../../../src/view/observer/domeventdata.js';
import { EditingView } from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'ViewDocumentDomEventData', () => {
	let view, viewDocument, viewBody, domRoot;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;

		domRoot = document.createElement( 'div' );
		domRoot.innerHTML = '<div contenteditable="true" id="main"></div><div contenteditable="true" id="additional"></div>';
		document.body.appendChild( domRoot );

		viewBody = view.domConverter.domToView( document.body, { bind: true } );
	} );

	afterEach( () => {
		domRoot.parentElement.removeChild( domRoot );
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets properties', () => {
			const domEvt = { target: document.body };
			const data = new ViewDocumentDomEventData( view, domEvt, { foo: 1, bar: true } );

			expect( data ).toHaveProperty( 'view', view );
			expect( data ).toHaveProperty( 'document', viewDocument );
			expect( data ).toHaveProperty( 'domEvent', domEvt );
			expect( data ).toHaveProperty( 'domTarget', document.body );

			expect( data ).toHaveProperty( 'foo', 1 );
			expect( data ).toHaveProperty( 'bar', true );
		} );
	} );

	describe( 'target', () => {
		it( 'returns bound element', () => {
			const domEvt = { target: document.body };
			const data = new ViewDocumentDomEventData( view, domEvt );

			expect( data ).toHaveProperty( 'target', viewBody );
		} );
	} );

	describe( 'preventDefault', () => {
		it( 'executes native preventDefault()', () => {
			const domEvt = { target: document.body, preventDefault: vi.fn() };
			const data = new ViewDocumentDomEventData( viewDocument, domEvt );

			data.preventDefault();

			expect( domEvt.preventDefault ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'stopPropagation', () => {
		it( 'executes native stopPropagation()', () => {
			const domEvt = { target: document.body, stopPropagation: vi.fn() };
			const data = new ViewDocumentDomEventData( viewDocument, domEvt );

			data.stopPropagation();

			expect( domEvt.stopPropagation ).toHaveBeenCalledOnce();
		} );
	} );
} );
