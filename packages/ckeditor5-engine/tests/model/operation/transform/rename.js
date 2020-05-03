/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Client, syncClients, expectClients, clearBuffer } from './utils.js';

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

	describe( 'rename', () => {
		describe( 'by rename', () => {
			it( 'elements in different paths #1', () => {
				john.setData( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[]Bar</paragraph>' );

				john.rename( 'heading1' );
				kate.rename( 'heading2' );

				syncClients();

				expectClients( '<heading1>Foo</heading1><heading2>Bar</heading2>' );
			} );

			it( 'elements in different paths #2', () => {
				john.setData( '<blockQuote>[]<paragraph>Foo Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo Bar</paragraph></blockQuote>' );

				john.rename( 'blockQuote2' );
				kate.rename( 'heading2' );

				syncClients();

				expectClients( '<blockQuote2><heading2>Foo Bar</heading2></blockQuote2>' );
			} );

			it( 'the same element', () => {
				john.setData( '<blockQuote><paragraph>[]Foo Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo Bar</paragraph></blockQuote>' );

				john.rename( 'heading1' );
				kate.rename( 'heading2' );

				syncClients();

				expectClients( '<blockQuote><heading1>Foo Bar</heading1></blockQuote>' );
			} );
		} );

		describe( 'by split', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.rename( 'heading1' );
				kate.split();

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>[]Foo Bar</paragraph>' );
				kate.setData( '<paragraph>Foo []Bar</paragraph>' );

				john.rename( 'heading1' );
				kate.split();

				syncClients();

				expectClients( '<heading1>Foo </heading1><heading1>Bar</heading1>' );
			} );

			it( 'element in same path, then undo', () => {
				john.setData( '<paragraph>[]Foo Bar</paragraph>' );
				kate.setData( '<paragraph>Foo []Bar</paragraph>' );

				john.rename( 'heading1' );
				john.undo();

				kate.split();

				syncClients();

				expectClients( '<paragraph>Foo </paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'element in other user\'s selection', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph>' );

				john.rename( 'heading1' );
				kate.split();

				syncClients();

				expectClients(
					'<heading1>F</heading1>' +
					'<heading1>oo</heading1>'
				);
			} );
		} );

		describe( 'by wrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.rename( 'heading1' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>[]Foo</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.rename( 'heading1' );
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients( '<blockQuote><heading1>Foo</heading1></blockQuote>' );
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>F[]oo</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.rename( 'heading1' );
				kate.unwrap();

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>F[]oo</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[]Bar</paragraph></blockQuote>' );

				john.rename( 'heading1' );
				kate.unwrap();

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<blockQuote>Bar</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<blockQuote><paragraph>F[]oo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.rename( 'heading1' );
				kate.unwrap();

				syncClients();

				expectClients( '<heading1>Foo</heading1>' );
			} );

			it( 'text in same path', () => {
				john.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.rename( 'heading1' );
				kate.unwrap();

				syncClients();

				expectClients( '<blockQuote>Foo</blockQuote>' );
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.rename( 'heading1' );
				kate.merge();

				syncClients();

				expectClients( '<heading1>FooBar</heading1>' );
			} );

			it( 'element into paragraph #2', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.rename( 'heading1' );
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'wrapped element into wrapped paragraph #1', () => {
				john.setData( '<blockQuote><paragraph>F[]oo</paragraph><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.rename( 'heading1' );
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><heading1>FooBar</heading1></blockQuote>' );
			} );

			it( 'wrapped element into wrapped paragraph #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph><paragraph>B[]ar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.rename( 'heading1' );
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><paragraph>FooBar</paragraph></blockQuote>' );
			} );
		} );
	} );
} );
