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

	describe( 'delete', () => {
		describe( 'by delete', () => {
			it( 'text from two elements', () => {
				john.setData( '<paragraph>F[oo</paragraph><paragraph>B]ar</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );

				john.delete();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>Fr</paragraph>' );
			} );

			it( 'text from three elements', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>Ba[r</paragraph><paragraph>A]bc</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph><paragraph>Abc</paragraph>' );

				john.delete();
				kate.delete();

				syncClients();

				expectClients( '<paragraph>Fobc</paragraph>' );
			} );

			// https://github.com/ckeditor/ckeditor5-engine/issues/1492
			it( 'delete same content from a few elements', () => {
				john.setData( '<paragraph>F[oo</paragraph><paragraph>Bar</paragraph><paragraph>Ab]c</paragraph>' );
				kate.setData( '<paragraph>F[oo</paragraph><paragraph>Bar</paragraph><paragraph>Ab]c</paragraph>' );

				john.delete();
				kate.delete();

				syncClients();
				expectClients( '<paragraph>Fc</paragraph>' );

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );
			} );
		} );
	} );
} );
