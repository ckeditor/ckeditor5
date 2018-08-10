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

	describe( 'unwrap', () => {
		describe( 'by unwrap', () => {
			it( 'element in different path', () => {
				john.setData(
					'<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' +
					'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
				);

				kate.setData(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>'
				);

				john.unwrap();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in different path', () => {
				john.setData(
					'<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' +
					'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
				);

				kate.setData(
					'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
					'<blockQuote><paragraph>[]Bar</paragraph></blockQuote>'
				);

				john.unwrap();
				kate.unwrap();

				syncClients();

				expectClients(
					'<blockQuote>Foo</blockQuote>' +
					'<blockQuote>Bar</blockQuote>'
				);
			} );

			it( 'the same element', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.unwrap();
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'the same element, then undo', () => {
				john.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );

				john.unwrap();
				kate.unwrap();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph>' );

				john.undo();

				syncClients();
				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
			} );

			it( 'the same text', () => {
				john.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.unwrap();
				kate.unwrap();

				syncClients();

				expectClients( '<blockQuote>Foo</blockQuote>' );
			} );

			it( 'the same text, then undo', () => {
				john.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.unwrap();
				kate.unwrap();

				syncClients();

				john.undo();

				syncClients();

				expectClients( '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
			} );
		} );

		describe( 'by delete', () => {
			it( 'text from two elements #1', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote><paragraph>Bar</paragraph>' );
				kate.setData( '<blockQuote><paragraph>Fo[o</paragraph></blockQuote><paragraph>Ba]r</paragraph>' );

				john.unwrap();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>For</paragraph>' );
			} );

			it( 'text in same path', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote><paragraph>F[oo]</paragraph></blockQuote>' );

				john.unwrap();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>F</paragraph>' );
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.unwrap();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'element into paragraph #2', () => {
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.unwrap();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'unwrapped element', () => {
				john.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );

				john.unwrap();
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'unwrap merge target element', () => {
				john.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph></blockQuote>[]<blockQuote><paragraph>Bar</paragraph></blockQuote>' );

				john.unwrap();
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );
		} );
	} );
} );
