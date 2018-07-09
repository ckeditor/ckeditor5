import { Client, syncClients, expectClients } from './utils.js';

describe( 'transform', () => {
	let john, kate;

	beforeEach( () => {
		return Promise.all( [
			Client.get( 'john' ).then( client => john = client ),
			Client.get( 'kate' ).then( client => kate = client )
		] );
	} );

	afterEach( () => {
		return Promise.all( [ john.destroy(), kate.destroy() ] );
	} );

	describe( 'merge', () => {
		describe( 'by merge', () => {
			it( 'elements into paragraph', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>[]<paragraph>Abc</paragraph>' );

				john.merge();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FooBarAbc</paragraph>' );
			} );
		} );

		describe( 'by delete', () => {
			it( 'text from two elements', () => {
				john.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );

				john.merge();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>For</paragraph>' );
			} );
		} );
	} );
} );
