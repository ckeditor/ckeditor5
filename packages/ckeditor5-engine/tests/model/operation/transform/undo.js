import { Client, expectClients, clearBuffer } from './utils.js';

describe( 'transform', () => {
	let john;

	beforeEach( () => {
		return Client.get( 'john' ).then( client => ( john = client ) );
	} );

	afterEach( () => {
		clearBuffer();

		return john.destroy();
	} );

	it( 'split, remove', () => {
		john.setData( '<paragraph>Foo[]Bar</paragraph>' );

		john.split();
		john.setSelection( [ 1 ], [ 2 ] );
		john.remove();
		john.undo();
		john.undo();

		expectClients( '<paragraph>FooBar</paragraph>' );
	} );

	it( 'move, merge', () => {
		john.setData( '[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph>' );

		john.move( [ 2 ] );
		john.setSelection( [ 1 ] );
		john.merge();
		john.undo();
		john.undo();

		expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
	} );

	it.skip( 'move multiple, merge', () => {
		john.setData( '[<paragraph>Foo</paragraph><paragraph>Bar</paragraph>]<paragraph>Xyz</paragraph>' );

		john.move( [ 3 ] );

		expectClients( '<paragraph>Xyz</paragraph><paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

		john.setSelection( [ 1 ] );
		john.merge();

		expectClients( '<paragraph>XyzFoo</paragraph><paragraph>Bar</paragraph>' );

		john.undo();

		expectClients( '<paragraph>Xyz</paragraph><paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

		john.undo();

		// Wrong move is done.
		expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph><paragraph>Xyz</paragraph>' );
	} );

	it( 'move inside unwrapped content', () => {
		john.setData( '<blockQuote>[<paragraph>Foo</paragraph>]<paragraph>Bar</paragraph></blockQuote>' );

		john.move( [ 0, 2 ] );
		john.setSelection( [ 0, 0 ] );
		john.unwrap();
		john.undo();
		john.undo();

		expectClients(
			'<blockQuote>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Bar</paragraph>' +
			'</blockQuote>'
		);
	} );

	it( 'remove node, merge', () => {
		john.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

		john.remove();
		john.setSelection( [ 1 ] );
		john.merge();
		john.undo();
		john.undo();

		expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
	} );

	it( 'merge, merge #1', () => {
		john.setData(
			'<blockQuote>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Bar</paragraph>' +
			'</blockQuote>' +
			'[]' +
			'<blockQuote>' +
				'<paragraph>Xyz</paragraph>' +
			'</blockQuote>'
		);

		john.merge();
		john.setSelection( [ 0, 2 ] );
		john.merge();

		expectClients(
			'<blockQuote>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>BarXyz</paragraph>' +
			'</blockQuote>'
		);

		john.undo();
		john.undo();

		expectClients(
			'<blockQuote>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Bar</paragraph>' +
			'</blockQuote>' +
			'<blockQuote>' +
				'<paragraph>Xyz</paragraph>' +
			'</blockQuote>'
		);
	} );

	it( 'merge, merge #2', () => {
		john.setData(
			'<blockQuote>' +
				'<paragraph>Foo</paragraph>' +
			'</blockQuote>' +
			'[]' +
			'<blockQuote>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph>Xyz</paragraph>' +
			'</blockQuote>'
		);

		john.merge();
		john.setSelection( [ 0, 1 ] );
		john.merge();

		expectClients(
			'<blockQuote>' +
				'<paragraph>FooBar</paragraph>' +
				'<paragraph>Xyz</paragraph>' +
			'</blockQuote>'
		);

		john.undo();
		john.undo();

		expectClients(
			'<blockQuote>' +
				'<paragraph>Foo</paragraph>' +
			'</blockQuote>' +
			'<blockQuote>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph>Xyz</paragraph>' +
			'</blockQuote>'
		);
	} );

	it( 'merge, unwrap', () => {
		john.setData( '<paragraph></paragraph>[]<paragraph>Foo</paragraph>' );

		john.merge();
		john.setSelection( [ 0, 0 ] );
		john.unwrap();

		john.undo();
		john.undo();

		expectClients( '<paragraph></paragraph><paragraph>Foo</paragraph>' );
	} );

	it( 'remove node at the split position #1', () => {
		john.setData( '<paragraph>Ab</paragraph>[]<paragraph>Xy</paragraph>' );

		john.merge();
		john.setSelection( [ 0, 1 ], [ 0, 2 ] );
		john.remove();

		john.undo();
		john.undo();

		expectClients( '<paragraph>Ab</paragraph><paragraph>Xy</paragraph>' );
	} );

	it( 'remove node at the split position #2', () => {
		john.setData( '<paragraph>Ab</paragraph>[]<paragraph>Xy</paragraph>' );

		john.merge();
		john.setSelection( [ 0, 2 ], [ 0, 3 ] );
		john.remove();

		john.undo();
		john.undo();

		expectClients( '<paragraph>Ab</paragraph><paragraph>Xy</paragraph>' );
	} );

	it( 'undoing split after the element created by split has been removed', () => {
		// This example is ported here from ckeditor5-undo to keep 100% CC in ckeditor5-engine alone.
		john.setData( '<paragraph>Foo[]bar</paragraph>' );

		john.split();
		john.setSelection( [ 0, 3 ], [ 1, 3 ] );
		john.delete();

		expectClients( '<paragraph>Foo</paragraph>' );

		john.undo();

		expectClients( '<paragraph>Foo</paragraph><paragraph>bar</paragraph>' );

		john.undo();

		expectClients( '<paragraph>Foobar</paragraph>' );
	} );

	it( 'remove text from paragraph and merge it', () => {
		john.setData( '<paragraph>Foo</paragraph><paragraph>[Bar]</paragraph>' );

		john.remove();
		john.setSelection( [ 1 ] );
		john.merge();

		expectClients( '<paragraph>Foo</paragraph>' );

		john.undo();

		expectClients( '<paragraph>Foo</paragraph><paragraph></paragraph>' );

		john.undo();

		expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
	} );

	it.skip( 'delete split paragraphs', () => {
		john.setData( '<paragraph>Foo</paragraph><paragraph>B[]ar</paragraph>' );

		john.split();
		john.setSelection( [ 2, 1 ] );
		john.split();
		john.setSelection( [ 1, 0 ], [ 3, 1 ] );
		john.delete();
		john.setSelection( [ 1 ] );
		john.merge();

		expectClients( '<paragraph>Foo</paragraph>' );

		john.undo();
		expectClients( '<paragraph>Foo</paragraph><paragraph></paragraph>' );

		john.undo();
		expectClients( '<paragraph>Foo</paragraph><paragraph>B</paragraph><paragraph>a</paragraph><paragraph>r</paragraph>' );

		john.undo();
		expectClients( '<paragraph>Foo</paragraph><paragraph>B</paragraph><paragraph>ar</paragraph>' );

		john.undo();
		expectClients( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

		john.redo();
		expectClients( '<paragraph>Foo</paragraph><paragraph>B</paragraph><paragraph>ar</paragraph>' );

		john.redo();
		expectClients( '<paragraph>Foo</paragraph><paragraph>B</paragraph><paragraph>a</paragraph><paragraph>r</paragraph>' );

		john.redo();
		expectClients( '<paragraph>Foo</paragraph><paragraph></paragraph>' );

		john.redo();
		expectClients( '<paragraph>Foo</paragraph>' );
	} );
} );
