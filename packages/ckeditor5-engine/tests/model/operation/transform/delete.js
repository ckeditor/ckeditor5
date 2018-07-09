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

	describe( 'delete', () => {
		describe( 'by delete', () => {
			it( 'text from two elements', () => {
				john.setData( '<paragraph>F[oo</paragraph><paragraph>B]ar</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );

				john.delete();
				kate.delete();

				syncClients();

				expect( '<paragraph>Fr</paragraph>' );
			} );

			it( 'text from three elements', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>Ba[r</paragraph><paragraph>A]bc</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph><paragraph>Abc</paragraph>' );

				john.delete();
				kate.delete();

				syncClients();

				expect( '<paragraph>Fobc</paragraph>' );
			} );
		} );
	} );
} );
