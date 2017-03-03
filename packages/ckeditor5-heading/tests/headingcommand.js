/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import HeadingCommand from '../src/headingcommand';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

const options = [
	{ id: 'paragraph', element: 'p', label: 'P' },
	{ id: 'heading1', element: 'h2', label: 'H2' },
	{ id: 'heading2', element: 'h3', label: 'H3' },
	{ id: 'heading3', element: 'h4', label: 'H4' }
];

describe( 'HeadingCommand', () => {
	let editor, document, commands, root, schema;

	beforeEach( () => {
		return ModelTestEditor.create().then( newEditor => {
			editor = newEditor;
			document = editor.document;
			commands = {};
			schema = document.schema;

			for ( let option of options ) {
				commands[ option.id ] = new HeadingCommand( editor, option );
				schema.registerItem( option.id, '$block' );
			}

			root = document.getRoot();
		} );
	} );

	afterEach( () => {
		for ( let id in commands ) {
			commands[ id ].destroy();
		}
	} );

	describe( 'basic properties', () => {
		for ( let option of options ) {
			test( option );
		}

		function test( { id, element, label } ) {
			it( `are set for option.id = ${ id }`, () => {
				expect( commands[ id ].id ).to.equal( id );
				expect( commands[ id ].element ).to.equal( element );
				expect( commands[ id ].label ).to.equal( label );
			} );
		}
	} );

	describe( 'value', () => {
		for ( let option of options ) {
			test( option );
		}

		function test( { id } ) {
			it( `equals ${ id } when collapsed selection is placed inside ${ id } element`, () => {
				setData( document, `<${ id }>foobar</${ id }>` );
				const element = root.getChild( 0 );
				document.selection.addRange( Range.createFromParentsAndOffsets( element, 3, element, 3 ) );

				expect( commands[ id ].value ).to.be.true;
			} );
		}
	} );

	describe( '_doExecute', () => {
		it( 'should update value after execution', () => {
			const command = commands.heading1;

			setData( document, '<paragraph>[]</paragraph>' );
			command._doExecute();

			expect( getData( document ) ).to.equal( '<heading1>[]</heading1>' );
			expect( command.value ).to.be.true;
		} );

		describe( 'custom options', () => {
			it( 'should use provided batch', () => {
				const batch = editor.document.batch();
				const command = commands.heading1;

				setData( document, '<paragraph>foo[]bar</paragraph>' );

				expect( batch.deltas.length ).to.equal( 0 );

				command._doExecute( { batch } );

				expect( batch.deltas.length ).to.be.above( 0 );
			} );
		} );

		describe( 'collapsed selection', () => {
			let convertTo = options[ options.length - 1 ];

			for ( let option of options ) {
				test( option, convertTo );
				convertTo = option;
			}

			it( 'uses paragraph as default value', () => {
				setData( document, '<heading1>foo[]bar</heading1>' );
				commands.paragraph._doExecute();

				expect( getData( document ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			// it( 'converts to default option when executed with already applied option', () => {
			// 	const command = commands.paragraph;

			// 	setData( document, '<heading1>foo[]bar</heading1>' );
			// 	command._doExecute( { id: 'heading1' } );

			// 	expect( getData( document ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			// } );

			it( 'converts topmost blocks', () => {
				schema.registerItem( 'inlineImage', '$inline' );
				schema.allow( { name: '$text', inside: 'inlineImage' } );

				setData( document, '<heading1><inlineImage>foo[]</inlineImage>bar</heading1>' );
				commands.paragraph._doExecute();

				expect( getData( document ) ).to.equal( '<paragraph><inlineImage>foo[]</inlineImage>bar</paragraph>' );
			} );

			function test( from, to ) {
				it( `converts ${ from.id } to ${ to.id } on collapsed selection`, () => {
					setData( document, `<${ from.id }>foo[]bar</${ from.id }>` );
					commands[ to.id ]._doExecute();

					expect( getData( document ) ).to.equal( `<${ to.id }>foo[]bar</${ to.id }>` );
				} );
			}
		} );

		describe( 'non-collapsed selection', () => {
			let convertTo = options[ options.length - 1 ];

			for ( let option of options ) {
				test( option, convertTo );
				convertTo = option;
			}

			it( 'converts all elements where selection is applied', () => {
				setData( document, '<heading1>foo[</heading1><heading2>bar</heading2><heading2>]baz</heading2>' );
				commands.paragraph._doExecute();

				expect( getData( document ) ).to.equal(
					'<paragraph>foo[</paragraph><paragraph>bar</paragraph><paragraph>]baz</paragraph>'
				);
			} );

			// it( 'resets to default value all elements with same option', () => {
			// 	setData( document, '<heading1>foo[</heading1><heading1>bar</heading1><heading2>baz</heading2>]' );
			// 	commands.heading1._doExecute();

			// 	expect( getData( document ) ).to.equal(
			// 		'<paragraph>foo[</paragraph><paragraph>bar</paragraph><heading2>baz</heading2>]'
			// 	);
			// } );

			function test( from, to ) {
				it( `converts ${ from.id } to ${ to.id } on non-collapsed selection`, () => {
					setData( document, `<${ from.id }>foo[bar</${ from.id }><${ from.id }>baz]qux</${ from.id }>` );
					commands[ to.id ]._doExecute();

					expect( getData( document ) ).to.equal( `<${ to.id }>foo[bar</${ to.id }><${ to.id }>baz]qux</${ to.id }>` );
				} );
			}
		} );
	} );
} );
