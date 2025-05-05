/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HighlightCommand from './../src/highlightcommand.js';

import Command from '@ckeditor/ckeditor5-core/src/command.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'HighlightCommand', () => {
	let editor, model, doc, root, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot();

				command = new HighlightCommand( newEditor );
				editor.commands.add( 'highlight', command );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					// Allow 'highlight' on p>$text.
					if ( ctx.endsWith( 'p $text' ) && attributeName == 'highlight' ) {
						return true;
					}
				} );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a command', () => {
		expect( HighlightCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to highlight attribute value when selection is in text with highlight attribute', () => {
			setData( model, '<p><$text highlight="yellowMarker">fo[o]</$text></p>' );

			expect( command ).to.have.property( 'value', 'yellowMarker' );
		} );

		it( 'is undefined when selection is not in text with highlight attribute', () => {
			setData( model, '<p>fo[]o</p>' );

			expect( command ).to.have.property( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		beforeEach( () => {
			model.schema.register( 'x', { inheritAllFrom: '$block' } );
		} );

		it( 'is true when selection is on text which can have highlight added', () => {
			setData( model, '<p>fo[]o</p>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when selection is on text which cannot have highlight added', () => {
			setData( model, '<x>fo[]o</x>' );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		describe( 'with option.value set', () => {
			describe( 'on collapsed range', () => {
				it( 'should change entire highlight when inside highlighted text', () => {
					setData( model, '<p>abc<$text highlight="yellowMarker">foo[]bar</$text>xyz</p>' );

					expect( command.value ).to.equal( 'yellowMarker' );

					command.execute( { value: 'greenMarker' } );

					expect( getData( model ) ).to.equal( '<p>abc<$text highlight="greenMarker">foo[]bar</$text>xyz</p>' );

					expect( command.value ).to.equal( 'greenMarker' );
				} );

				it( 'should remove entire highlight when inside highlighted text of the same value', () => {
					setData( model, '<p>abc<$text highlight="yellowMarker">foo[]bar</$text>xyz</p>' );

					expect( command.value ).to.equal( 'yellowMarker' );

					command.execute( { value: 'yellowMarker' } );

					expect( getData( model ) ).to.equal( '<p>abcfoo[]barxyz</p>' );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should change selection attribute in non-empty parent', () => {
					setData( model, '<p>a[]bc<$text highlight="yellowMarker">foobar</$text>xyz</p>' );
					expect( command.value ).to.be.undefined;

					command.execute( { value: 'foo' } );
					expect( command.value ).to.equal( 'foo' );

					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.true;

					command.execute();

					expect( command.value ).to.be.undefined;
					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.false;

					// Execute remove highlight on selection without 'highlight' attribute should do nothing.
					command.execute();

					expect( command.value ).to.be.undefined;
					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.false;
				} );

				it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
					setData( model, '<p>a[]bc<$text highlight="yellowMarker">foobar</$text>xyz</p>' );

					command.execute( { value: 'foo' } );

					// It should not save that bold was executed at position ( root, [ 0, 1 ] ).

					model.change( writer => {
						// Simulate clicking right arrow key by changing selection ranges.
						writer.setSelection( root.getNodeByPath( [ 0 ] ), 2 );

						// Get back to previous selection.
						writer.setSelection( root.getNodeByPath( [ 0 ] ), 1 );
					} );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should change selection attribute and store it if selection is collapsed in empty parent', () => {
					setData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>xyz</p><p>[]</p>' );

					expect( command.value ).to.be.undefined;

					command.execute( { value: 'foo' } );

					expect( command.value ).to.equal( 'foo' );
					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.true;

					// Attribute should be stored.
					// Simulate clicking somewhere else in the editor.
					model.change( writer => {
						writer.setSelection( root.getNodeByPath( [ 0 ] ), 2 );
					} );

					expect( command.value ).to.be.undefined;

					// Go back to where attribute was stored.
					model.change( writer => {
						writer.setSelection( root.getNodeByPath( [ 1 ] ), 0 );
					} );

					// Attribute should be restored.
					expect( command.value ).to.equal( 'foo' );

					command.execute();

					expect( command.value ).to.be.undefined;
					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.false;
				} );

				// https://github.com/ckeditor/ckeditor5-highlight/issues/8
				it( 'should change selection attribute on consecutive calls', () => {
					setData( model, '<p>abcfoobar[] foobar</p>' );

					expect( command.value ).to.be.undefined;

					command.execute( { value: 'greenMarker' } );

					expect( command.value ).to.equal( 'greenMarker' );
					expect( doc.selection.getAttribute( 'highlight' ) ).to.equal( 'greenMarker' );

					command.execute( { value: 'pinkMarker' } );

					expect( command.value ).to.equal( 'pinkMarker' );
					expect( doc.selection.getAttribute( 'highlight' ) ).to.equal( 'pinkMarker' );
				} );

				it( 'should not change entire highlight when at the end of highlighted text', () => {
					setData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).to.equal( 'yellowMarker' );

					command.execute( { value: 'greenMarker' } );

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<p>abc<$text highlight="yellowMarker">foobar</$text>xyz</p>'
					);

					expect( command.value ).to.equal( 'greenMarker' );
				} );

				it( 'should not remove entire highlight when at the end of highlighted text of the same value', () => {
					setData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).to.equal( 'yellowMarker' );

					command.execute( { value: 'yellowMarker' } );

					expect( getData( model ) ).to.equal( '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should change selection attribute when at the end of highlighted text', () => {
					setData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					command.execute( { value: 'greenMarker' } );

					expect( doc.selection.getAttribute( 'highlight' ) ).to.equal( 'greenMarker' );
				} );
			} );

			describe( 'on not collapsed range', () => {
				it( 'should set highlight attribute on selected node when passed as parameter', () => {
					setData( model, '<p>a[bc<$text highlight="yellowMarker">fo]obar</$text>xyz</p>' );

					expect( command.value ).to.be.undefined;

					command.execute( { value: 'yellowMarker' } );

					expect( command.value ).to.equal( 'yellowMarker' );

					expect( getData( model ) ).to.equal( '<p>a[<$text highlight="yellowMarker">bcfo]obar</$text>xyz</p>' );
				} );

				it( 'should set highlight attribute on selected node when passed as parameter (multiple nodes)', () => {
					setData(
						model,
						'<p>abcabc[abc</p>' +
						'<p>foofoofoo</p>' +
						'<p>barbar]bar</p>'
					);

					command.execute( { value: 'yellowMarker' } );

					expect( command.value ).to.equal( 'yellowMarker' );

					expect( getData( model ) ).to.equal(
						'<p>abcabc[<$text highlight="yellowMarker">abc</$text></p>' +
						'<p><$text highlight="yellowMarker">foofoofoo</$text></p>' +
						'<p><$text highlight="yellowMarker">barbar</$text>]bar</p>'
					);
				} );

				it( 'should set highlight attribute on selected nodes when passed as parameter only on selected characters', () => {
					setData( model, '<p>abc[<$text highlight="yellowMarker">foo]bar</$text>xyz</p>' );

					expect( command.value ).to.equal( 'yellowMarker' );

					command.execute( { value: 'foo' } );

					expect( getData( model ) ).to.equal(
						'<p>abc[<$text highlight="foo">foo</$text>]<$text highlight="yellowMarker">bar</$text>xyz</p>'
					);

					expect( command.value ).to.equal( 'foo' );
				} );
			} );
		} );

		describe( 'with undefined option.value', () => {
			describe( 'on collapsed range', () => {
				it( 'should remove entire highlight when inside highlighted text', () => {
					setData( model, '<p>abc<$text highlight="yellowMarker">foo[]bar</$text>xyz</p>' );

					expect( command.value ).to.equal( 'yellowMarker' );

					command.execute();

					expect( getData( model ) ).to.equal( '<p>abcfoo[]barxyz</p>' );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should not remove entire highlight when at the end of highlighted text', () => {
					setData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).to.equal( 'yellowMarker' );

					command.execute();

					expect( getData( model ) ).to.equal( '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).to.be.undefined;
				} );
			} );

			describe( 'on not collapsed range', () => {
				it( 'should remove highlight attribute on selected node when undefined passed as parameter', () => {
					setData( model, '<p>abc[<$text highlight="yellowMarker">foo]bar</$text>xyz</p>' );

					expect( command.value ).to.equal( 'yellowMarker' );

					command.execute();

					expect( getData( model ) ).to.equal( '<p>abc[foo]<$text highlight="yellowMarker">bar</$text>xyz</p>' );

					expect( command.value ).to.be.undefined;
				} );
			} );
		} );
	} );
} );
