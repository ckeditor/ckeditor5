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

			it( 'intersecting wrap #3', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]<paragraph>Abc</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );

				john.wrap( 'blockQuote' );
				kate.wrap( 'div' );

				syncClients();
				expectClients(
					'<blockQuote>' +
						'<paragraph>Foo</paragraph>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>' +
					'<paragraph>Abc</paragraph>'
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

			it( 'intersecting wrap #3, then undo', () => {
				john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]<paragraph>Abc</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph><paragraph>Abc</paragraph>' );

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
				kate.setData( '<paragraph>Foo</paragraph><blockQuote><paragraph>[]Bar</paragraph></blockQuote>' );

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
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );

				john.wrap( 'div' );
				kate.unwrap();

				syncClients();

				expectClients( '<div><paragraph>Foo</paragraph></div>' );
			} );

			it.skip( 'the same element, then undo', () => {
				// This is interesting scenario actually. Normally in wrap x wrap situation the stronger wrap just wins
				// so we won't get incorrect model. But John was actually to make a wrap like this then he had
				// <bq><div><p> structure for a while. So it should be possible to revert to it.
				john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );

				john.wrap( 'div' );
				kate.unwrap();

				syncClients();
				expectClients( '<div><paragraph>Foo</paragraph></div>' );

				kate.undo();

				syncClients();
				expectClients( '<blockQuote><div><paragraph>Foo</paragraph></div></blockQuote>' );
			} );

			it( 'the same text', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.wrap( 'div' );
				kate.unwrap();

				syncClients();

				expectClients( '<blockQuote><div>Foo</div></blockQuote>' );
			} );

			it.skip( 'the same text, then undo', () => {
				// This is interesting scenario actually. Normally in wrap x wrap situation the stronger wrap just wins
				// so we won't get incorrect model. But John was actually to make a wrap like this then he had
				// <bq><p><div> structure for a while. So it should be possible to revert to it.
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>[]Foo</paragraph></blockQuote>' );

				john.wrap( 'div' );
				kate.unwrap();

				syncClients();
				expectClients( '<blockQuote><div>Foo</div></blockQuote>' );

				kate.undo();

				syncClients();

				expectClients( '<blockQuote><paragraph><div>Foo</div></paragraph></blockQuote>' );
			} );
		} );

		describe( 'by delete', () => {
			it( 'text in two elements #1', () => {
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

			it( 'text in two elements #2', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );

				john.wrap( 'div' );
				kate.delete();

				syncClients();

				expectClients( '<paragraph><div>Fo</div>r</paragraph>' );
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
