/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import IframeView from '../../src/iframe/iframeview';

describe( 'IframeView', () => {
	let view;

	describe( 'constructor()', () => {
		it( 'creates view element from the template', () => {
			view = new IframeView();
			view.render();
			document.body.appendChild( view.element );

			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-reset_all' ) ).to.be.true;
			expect( view.element.attributes.getNamedItem( 'sandbox' ).value ).to.equal( 'allow-same-origin allow-scripts' );

			view.element.remove();
		} );
	} );

	describe( 'render', () => {
		it( 'returns a promise', () => {
			view = new IframeView();

			expect( view.render() ).to.be.an.instanceof( Promise );
		} );

		it( 'returns promise which is resolved when iframe finished loading', () => {
			view = new IframeView();

			const promise = view.render()
				.then( () => {
					expect( view.element.contentDocument.readyState ).to.equal( 'complete' );

					view.element.remove();
				} );

			// Moving iframe into DOM trigger creation of a document inside iframe.
			document.body.appendChild( view.element );

			return promise;
		} );
	} );

	describe( 'loaded event', () => {
		it( 'is fired when frame finished loading', done => {
			view = new IframeView();

			view.on( 'loaded', () => {
				view.element.remove();

				done();
			} );

			view.render();

			// Moving iframe into DOM trigger creation of a document inside iframe.
			document.body.appendChild( view.element );
		} );
	} );
} );
