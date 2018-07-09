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

	describe( 'remove', () => {
		describe( 'by remove', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph><paragraph>B</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>F[oo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo B[ar]</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients(
					'<paragraph>F B</paragraph>'
				);
			} );

			it( 'text in other user\'s selection #1', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients(
					'<paragraph></paragraph>'
				);
			} );

			it( 'text in other user\'s selection #2', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>[Foo Bar]</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients(
					'<paragraph></paragraph>'
				);
			} );

			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				kate.remove();

				syncClients();

				expectClients(
					'<paragraph></paragraph>'
				);
			} );

			it( 'text in other user\'s selection, then undo', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>Fo[o B]ar</paragraph>' );

				john.remove();
				kate.remove();

				syncClients();

				john.undo();
				kate.undo();

				syncClients();

				expectClients(
					'<paragraph>Foo Bar</paragraph>'
				);
			} );
		} );

		describe( 'by wrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>[Foo]</paragraph>' );
				kate.setData( '[<paragraph>Foo</paragraph>]' );

				john.remove();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients(
					'<blockQuote><paragraph></paragraph></blockQuote>'
				);
			} );

			it( 'element while removing', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				kate.wrap( 'blockQuote' );

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );
			} );

			it( 'element while removing, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );

				john.remove();
				kate.wrap( 'blockQuote' );

				syncClients();

				john.undo();

				syncClients();

				// Actual content:
				// <paragraph>Foo</paragraph><paragraph>Bar</paragraph><blockQuote></blockQuote>
				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<blockQuote>' +
						'<paragraph>Bar</paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'by unwrap', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>[Foo]</paragraph><blockQuote><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<blockQuote><paragraph>[Foo]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[<paragraph>Foo</paragraph>]</blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph></paragraph>'
				);
			} );

			it( 'element while removing', () => {
				john.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();

				expectClients(
					'<paragraph>Foo</paragraph>'
				);
			} );

			it.skip( 'element while removing, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph><blockQuote>[<paragraph>Bar</paragraph>]</blockQuote>' );
				kate.setData( '<paragraph>Foo</paragraph><blockQuote>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.remove();
				kate.unwrap();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph>' );

				john.undo();

				syncClients();

				// Actual result:
				// <paragraph>Foo</paragraph><blockQuote></blockQuote>
				expectClients(
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );
		} );

		describe( 'by split', () => {
			it( 'text in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>B</paragraph>' +
					'<paragraph>ar</paragraph>'
				);
			} );

			it( 'text in same path', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>Foo []Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph> </paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'text in other user\'s selection #1', () => {
				john.setData( '<paragraph>[Foo] Bar</paragraph>' );
				kate.setData( '<paragraph>F[]oo Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph> Bar</paragraph>'
				);
			} );

			it( 'text in other user\'s selection #2', () => {
				john.setData( '<paragraph>[Foo Bar]</paragraph>' );
				kate.setData( '<paragraph>F[]oo Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				expectClients(
					'<paragraph></paragraph>' +
					'<paragraph></paragraph>'
				);
			} );

			it( 'text, then remove and undo', () => {
				john.setData( '<paragraph>[Foo ]Bar</paragraph>' );
				kate.setData( '<paragraph>Foo []Bar</paragraph>' );

				john.remove();
				kate.split();

				syncClients();

				john.setSelection( [ 1, 0 ], [ 1, 3] );

				john.remove();
				kate.undo();

				syncClients();

				expectClients(
					'<paragraph></paragraph>'
				);
			} );
		} );

		describe( 'by remove attribute', () => {
			it( 'from element in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph bold="true">Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[<paragraph bold="true">Bar</paragraph>]' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'from text in different path', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph><$text bold="true">Bar</$text></paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph><$text bold="true">[Bar]</$text></paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>F</paragraph>' +
					'<paragraph>Bar</paragraph>'
				);
			} );

			it( 'from text in same path', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true">[o]</$text></paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>o</paragraph>'
				);
			} );

			it( 'from element in same path', () => {
				john.setData( '<paragraph bold="true">[Fo]o</paragraph>' );
				kate.setData( '[<paragraph bold="true">Foo</paragraph>]' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph>o</paragraph>'
				);
			} );

			it( 'from text with 2 attributes in same path', () => {
				john.setData( '<paragraph>[Fo]<$text bold="true" italic="true">o</$text></paragraph>' );
				kate.setData( '<paragraph>Fo<$text bold="true" italic="true">[o]</$text></paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph><$text italic="true">o</$text></paragraph>'
				);
			} );

			it( 'from text in other user\'s selection', () => {
				john.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );
				kate.setData( '<paragraph><$text bold="true">[Foo]</$text></paragraph>' );

				john.remove();
				kate.removeAttribute( 'bold' );

				syncClients();

				expectClients(
					'<paragraph></paragraph>'
				);
			} );
		} );

		describe( 'by merge', () => {
			it( 'element into paragraph #1', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>FBar</paragraph>'
				);
			} );

			it( 'element into paragraph #2', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>B[ar]</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients(
					'<paragraph>FooB</paragraph>'
				);
			} );

			it.skip( 'element into paragraph, then undo', () => {
				john.setData( '<paragraph>F[oo]</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients( '<paragraph>FBar</paragraph>' );

				john.undo();

				syncClients();

				// Actual result:
				// <paragraph>F<paragraph></paragraph>oBar</paragraph>
				expectClients( '<paragraph>FooBar</paragraph>' );
			} );

			it( 'wrapped element into wrapped paragraph #1', () => {
				john.setData( '<blockQuote><paragraph>F[oo]</paragraph><paragraph>Bar</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients(
					'<blockQuote><paragraph>FBar</paragraph></blockQuote>'
				);
			} );

			it( 'wrapped element into wrapped paragraph #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph><paragraph>B[ar]</paragraph></blockQuote>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph></blockQuote>' );

				john.remove();
				kate.merge();

				syncClients();

				expectClients(
					'<blockQuote><paragraph>FooB</paragraph></blockQuote>'
				);
			} );

			it( 'removed element, then undo', () => {
				john.setData( '<paragraph>Foo</paragraph>[<paragraph>Bar</paragraph>]' );
				kate.setData( '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>' );

				john.remove();
				kate.merge();

				syncClients();
				expectClients( '<paragraph>Foo</paragraph>' );

				john.undo();

				syncClients();

				expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
			} );
		} );

		describe( 'by rename', () => {
			it( 'element in different path', () => {
				john.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );
				kate.setData( '<paragraph>F[]oo</paragraph><paragraph>Bar</paragraph>' );

				john.remove();
				kate.rename( 'heading1' );

				syncClients();

				expectClients(
					'<heading1>Foo</heading1>' +
					'<paragraph></paragraph>'
				);
			} );

			it( 'element in same path', () => {
				john.setData( '<paragraph>F[o]o</paragraph>' );
				kate.setData( '<paragraph>[]Foo</paragraph>' );

				john.remove();
				kate.rename( 'heading1' );

				syncClients();

				expectClients( '<heading1>Fo</heading1>' );
			} );

			it( 'element in other user\'s selection', () => {
				kate.setData( '<paragraph>[Foo]</paragraph>' );
				john.setData( '<paragraph>[Foo]</paragraph>' );

				kate.remove();
				john.rename( 'heading1' );

				syncClients();

				expectClients(
					'<heading1></heading1>'
				);
			} );
		} );
	} );
} );
