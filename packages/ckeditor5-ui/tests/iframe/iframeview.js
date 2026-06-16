/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { IframeView } from '../../src/iframe/iframeview.js';

describe( 'IframeView', () => {
	let view;

	describe( 'constructor()', () => {
		it( 'creates view element from the template', () => {
			view = new IframeView();
			view.render();
			document.body.appendChild( view.element );

			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-reset_all' ) ).toBe( true );
			expect( view.element.attributes.getNamedItem( 'sandbox' ).value ).toBe( 'allow-same-origin allow-scripts' );

			view.element.remove();
		} );
	} );

	describe( 'render', () => {
		it( 'returns a promise', () => {
			view = new IframeView();

			expect( view.render() ).toBeInstanceOf( Promise );
		} );

		it( 'returns promise which is resolved when iframe finished loading', () => {
			view = new IframeView();

			const promise = view.render()
				.then( () => {
					expect( view.element.contentDocument.readyState ).toBe( 'complete' );

					view.element.remove();
				} );

			// Moving iframe into DOM trigger creation of a document inside iframe.
			document.body.appendChild( view.element );

			return promise;
		} );
	} );

	describe( 'loaded event', () => {
		it( 'is fired when frame finished loading', () => {
			return new Promise( resolve => {
				view = new IframeView();

				view.on( 'loaded', () => {
					view.element.remove();

					resolve();
				} );

				view.render();

				// Moving iframe into DOM trigger creation of a document inside iframe.
				document.body.appendChild( view.element );
			} );
		} );
	} );
} );
