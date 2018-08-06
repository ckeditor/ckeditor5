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

			it( 'intersecting wrap #2', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Abc</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]<paragraph>Abc</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.wrap( 'div' );

				syncClients();
				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
						'<paragraph>Bar</paragraph>' +
						'<paragraph>Abc</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'intersecting wrap, then undo #1', () => {
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

				john.undo();
				kate.undo();

				syncClients();
				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>' +
					'<paragraph>Abc</paragraph>'
				);
			} );

			it( 'intersecting wrap, then undo #2', () => {
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

				john.undo();
				kate.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );
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

			it( 'delete all wrapped content', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Abc</paragraph>]' );
				kate.setData( '<paragraph>[Foo</paragraph><paragraph>Bar</paragraph><paragraph>Ab]c</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.delete();

				syncClients();
				expectClients( '<blockQuote><paragraph>c</paragraph></blockQuote>' );
			} );

			it.skip( 'delete all wrapped content and undo', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Abc</paragraph>]' );
				kate.setData( '<paragraph>[Foo</paragraph><paragraph>Bar</paragraph><paragraph>Ab]c</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.delete();

				syncClients();
				expectClients( '<blockQuote><paragraph>c</paragraph></blockQuote>' );

				john.undo();

				// There is a bug in undo for Kate.
				// Kate's content is: '<blockQuote><paragraph>c</paragraph></blockQuote>'.
				// Then goes undo and it returns "Foo" paragraph into block quote, but "Bar" goes after it.
				// There is a move (reinsert) x wrap transformation and the move is not included inside the wrap.
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );
			} );
		} );

		describe( 'by remove', () => {
			it( 'remove the only wrapped element', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>Bar</paragraph>' );
			} );

			it( 'remove one of two wrapped elements', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.remove();

				syncClients();

				expectClients( '<blockQuote><paragraph>Bar</paragraph></blockQuote>' );
			} );

			it( 'remove all wrapped elements', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]<paragraph>Xyz</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph><paragraph>Xyz</paragraph>' );

				john.wrap( 'blockQuote' );

				kate.remove();
				kate.setSelection( [ 0 ], [ 1 ] );
				kate.remove();

				syncClients();

				expectClients( '<paragraph>Xyz</paragraph>' );
			} );

			it( 'remove the only wrapped element with undo', () => {
				john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.remove();

				syncClients();
				expectClients( '<paragraph>Bar</paragraph>' );

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'remove one of two wrapped elements with undo', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.remove();

				syncClients();
				expectClients( '<blockQuote><paragraph>Bar</paragraph></blockQuote>' );

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );

			it( 'remove all wrapped elements with undo', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]<paragraph>Xyz</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph><paragraph>Xyz</paragraph>' );

				john.wrap( 'blockQuote' );

				kate.remove();
				kate.setSelection( [ 0 ], [ 1 ] );
				kate.remove();

				syncClients();
				expectClients( '<paragraph>Xyz</paragraph>' );

				john.undo();
				kate.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Xyz</paragraph>' );
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

			it( 'element into paragraph, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.merge();

				syncClients();
				expectClients( '<paragraph>FooBar</paragraph>' );

				john.undo();
				kate.undo();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );
		} );
	} );
} );
