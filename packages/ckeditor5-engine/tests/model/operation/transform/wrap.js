import { Client, syncClients, expectClients } from './utils.js';

describe( 'transform', () => {
	let john, kate;

	beforeEach( () => {
		return Promise.all( [
			Client.get( 'john' ).then( client => ( john = client ) ),
			Client.get( 'kate' ).then( client => ( kate = client ) )
		] );
	} );

	afterEach( () => {
		return Promise.all( [ john.destroy(), kate.destroy() ] );
	} );

	describe( 'wrap', () => {
		describe( 'by wrap', () => {
			it( 'element in different path', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.wrap( 'blockQuote' );
				kate.wrap( 'blockQuote2' );

				syncClients();

				expectClients(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote2><paragraph>Bar</paragraph></blockQuote2>'
				);
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

				john.wrap( 'div' );
				kate.wrap( 'div2' );

				syncClients();

				expectClients(
					'<paragraph><div>Foo</div></paragraph>' +
					'<paragraph><div2>Bar</div2></paragraph>'
				);
			} );

			it( 'the same element', () => {
				john.setData( '[<paragraph>Foo</paragraph>]' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.wrap( 'blockQuote' );
				kate.wrap( 'blockQuote2' );

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
			} );

			it( 'intersecting wrap #1', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]<paragraph>Abc</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph><paragraph>Abc</paragraph>]' );

				john.wrap( 'blockQuote' );
				kate.wrap( 'div' );

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>' +
					'<div>' +
						'<paragraph>Abc</paragraph>' +
					'</div>'
				);
			} );

			it.skip( 'intersecting wrap #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>F[o]o</paragraph>' );

				john.wrap( 'div' );
				kate.wrap( 'div' );

				syncClients();

				expectClients( '<paragraph><div>Foo</div></pragraph>' );
			} );

			it.skip( 'intersecting wrap, then undo #1', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]<paragraph>Abc</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph><paragraph>Abc</paragraph>]' );

				john.wrap( 'blockQuote' );
				kate.wrap( 'div' );

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>' +
					'<paragraph>Abc</paragraph>'
				);
			} );

			it.skip( 'intersecting wrap, then undo #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '<paragraph>F[o]o</paragraph>' );

				john.wrap( 'div' );
				kate.wrap( 'div' );

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients( '<paragraph><div>Foo</div></pragraph>' );
			} );

			it( 'element and text', () => {
				john.setData( '[<paragraph>Foo</paragraph>]' );
				kate.setData( '<paragraph>[Foo]</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.wrap( 'div' );

				syncClients();

				expectClients( '<blockQuote><paragraph><div>Foo</div></paragraph></blockQuote>' );
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in different path', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.wrap( 'blockQuote' );
				kate.unwrap();

				syncClients();

				expectClients(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[Bar]</paragraph></blockQuote>' );

				john.wrap( 'div' );
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph><div>Foo</div></paragraph>' +
					'<blockQuote>Bar</blockQuote>'
				);
			} );

			it( 'the same element', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.wrap( 'blockQuote2' );
				kate.unwrap();

				syncClients();

				expectClients( '<blockQuote2><paragraph>Foo</paragraph></blockQuote2>' );
			} );

			it( 'the same element, then undo', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.wrap( 'blockQuote2' );
				kate.unwrap();

				syncClients();

				kate.undo();

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
			} );

			it( 'the same text', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );

				john.wrap( 'div' );
				kate.unwrap();

				syncClients();

				expectClients( '<blockQuote><div>Foo</div></blockQuote>' );
			} );
		} );

		describe( 'by delete', () => {
			it( 'text in two elements', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.delete();

				syncClients();

				expectClients(
					'<blockQuote>' +
						'<paragraph>For</paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><paragraph>FooBar</paragraph></blockQuote>' );
			} );

			it( 'element into paragraph #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.wrap( 'div' );
				kate.merge();

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it.skip( 'element into paragraph, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.merge();

				syncClients();

				expectClients( '<blockQuote><paragraph>FooBar</paragraph></blockQuote>' );

				john.undo();
				kate.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );
		} );
	} );
} );
