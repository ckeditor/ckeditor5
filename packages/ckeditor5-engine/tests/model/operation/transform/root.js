/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Client, syncClients, clearBuffer } from './utils.js';

describe( 'transform', () => {
	let john, kate;

	beforeEach( () => {
		return Promise.all( [
			Client.get( 'john' ).then( client => ( john = client ) ),
			Client.get( 'kate' ).then( client => ( kate = client ) )
		] );
	} );

	afterEach( () => {
		clearBuffer();

		return Promise.all( [ john.destroy(), kate.destroy() ] );
	} );

	describe( 'add root', () => {
		describe( 'by add root', () => {
			it( 'with a different name', () => {
				john.addRoot( 'foo' );
				kate.addRoot( 'bar' );

				syncClients();

				expect( john.document.getRoot( 'foo' ) ).not.to.be.null;
				expect( john.document.getRoot( 'bar' ) ).not.to.be.null;
				expect( kate.document.getRoot( 'foo' ) ).not.to.be.null;
				expect( kate.document.getRoot( 'bar' ) ).not.to.be.null;
			} );

			it( 'with the same name', () => {
				john.addRoot( 'new' );
				kate.addRoot( 'new' );

				syncClients();

				expect( john.document.getRoot( 'new' ) ).not.to.be.null;
				expect( kate.document.getRoot( 'new' ) ).not.to.be.null;
			} );
		} );
	} );

	describe( 'detach root', () => {
		describe( 'by detach root', () => {
			it( 'with a different name', () => {
				john.addRoot( 'foo' );
				kate.addRoot( 'bar' );

				syncClients();

				john.detachRoot( 'bar' );
				kate.detachRoot( 'foo' );

				syncClients();

				expect( john.document.getRoot( 'foo' ).isAttached() ).to.be.false;
				expect( john.document.getRoot( 'bar' ).isAttached() ).to.be.false;
				expect( kate.document.getRoot( 'foo' ).isAttached() ).to.be.false;
				expect( kate.document.getRoot( 'bar' ).isAttached() ).to.be.false;
			} );

			it( 'with the same name', () => {
				john.addRoot( 'new' );
				kate.addRoot( 'new' );

				syncClients();

				john.detachRoot( 'new' );
				kate.detachRoot( 'new' );

				syncClients();

				expect( john.document.getRoot( 'new' ).isAttached() ).to.be.false;
				expect( kate.document.getRoot( 'new' ).isAttached() ).to.be.false;
			} );

			it( 'with the same name, then undo one', () => {
				john.addRoot( 'new' );
				kate.addRoot( 'new' );

				syncClients();

				john.detachRoot( 'new' );

				kate.detachRoot( 'new' );
				kate.undo();

				syncClients();

				expect( john.document.getRoot( 'new' ).isAttached() ).to.be.true;
				expect( kate.document.getRoot( 'new' ).isAttached() ).to.be.true;
			} );

			it( 'with the same name, then undo both', () => {
				john.addRoot( 'new' );
				kate.addRoot( 'new' );

				syncClients();

				john.detachRoot( 'new' );
				john.undo();

				kate.detachRoot( 'new' );
				kate.undo();

				syncClients();

				expect( john.document.getRoot( 'new' ).isAttached() ).to.be.true;
				expect( kate.document.getRoot( 'new' ).isAttached() ).to.be.true;
			} );

			it( 'with the same name, then undo both, then redo one', () => {
				john.addRoot( 'new' );
				kate.addRoot( 'new' );

				syncClients();

				john.detachRoot( 'new' );
				john.undo();
				john.redo();

				kate.detachRoot( 'new' );
				kate.undo();

				syncClients();

				expect( john.document.getRoot( 'new' ).isAttached() ).to.be.false;
				expect( kate.document.getRoot( 'new' ).isAttached() ).to.be.false;
			} );

			it( 'with the same name, then undo both, then redo both', () => {
				john.addRoot( 'new' );
				kate.addRoot( 'new' );

				syncClients();

				john.detachRoot( 'new' );
				john.undo();
				john.redo();

				kate.detachRoot( 'new' );
				kate.undo();
				john.redo();

				syncClients();

				expect( john.document.getRoot( 'new' ).isAttached() ).to.be.false;
				expect( kate.document.getRoot( 'new' ).isAttached() ).to.be.false;
			} );
		} );
	} );
} );
