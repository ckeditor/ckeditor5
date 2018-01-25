/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HighlightCommand from './../src/highlightcommand';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Position from '../../ckeditor5-engine/src/model/position';
import Range from '../../ckeditor5-engine/src/model/range';

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

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.extend( '$text', { allowAttributes: 'highlight' } );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( HighlightCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to highlight attribute value when selection is in text with highlight attribute', () => {
			setData( model, '<paragraph><$text highlight="marker">fo[o]</$text></paragraph>' );

			expect( command ).to.have.property( 'value', 'marker' );
		} );

		it( 'is undefined when selection is not in text with highlight attribute', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have highlight added', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'with option.value set', () => {
			describe( 'on collapsed range', () => {
				it( 'should change entire highlight when inside highlighted text', () => {
					setData( model, '<paragraph>abc<$text highlight="marker">foo[]bar</$text>xyz</paragraph>' );

					expect( command.value ).to.equal( 'marker' );

					command.execute( { value: 'greenMarker' } );

					expect( getData( model ) ).to.equal( '<paragraph>abc[<$text highlight="greenMarker">foobar</$text>]xyz</paragraph>' );

					expect( command.value ).to.equal( 'greenMarker' );
				} );

				it( 'should remove entire highlight when inside highlighted text of the same value', () => {
					setData( model, '<paragraph>abc<$text highlight="marker">foo[]bar</$text>xyz</paragraph>' );

					expect( command.value ).to.equal( 'marker' );

					command.execute( { value: 'marker' } );

					expect( getData( model ) ).to.equal( '<paragraph>abcfoo[]barxyz</paragraph>' );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should change selection attribute in non-empty parent', () => {
					setData( model, '<paragraph>a[]bc<$text highlight="marker">foobar</$text>xyz</paragraph>' );
					expect( command.value ).to.be.undefined;

					command.execute( { value: 'foo' } );
					expect( command.value ).to.equal( 'foo' );

					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.true;

					command.execute();

					expect( command.value ).to.be.undefined;
					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.false;
				} );

				it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
					setData( model, '<paragraph>a[]bc<$text highlight="marker">foobar</$text>xyz</paragraph>' );

					command.execute( { value: 'foo' } );

					// It should not save that bold was executed at position ( root, [ 0, 1 ] ).

					model.change( () => {
						// Simulate clicking right arrow key by changing selection ranges.
						doc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 2 ] ) ) ] );

						// Get back to previous selection.
						doc.selection.setRanges( [ new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 1 ] ) ) ] );
					} );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should change selection attribute and store it if selection is collapsed in empty parent', () => {
					setData( model, '<paragraph>abc<$text highlight="marker">foobar</$text>xyz</paragraph><paragraph>[]</paragraph>' );

					expect( command.value ).to.be.undefined;

					command.execute( { value: 'foo' } );

					expect( command.value ).to.equal( 'foo' );
					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.true;

					// Attribute should be stored.
					// Simulate clicking somewhere else in the editor.
					model.change( () => {
						doc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 2 ] ) ) ] );
					} );

					expect( command.value ).to.be.undefined;

					// Go back to where attribute was stored.
					model.change( () => {
						doc.selection.setRanges( [ new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 0 ] ) ) ] );
					} );

					// Attribute should be restored.
					expect( command.value ).to.equal( 'foo' );

					command.execute();

					expect( command.value ).to.be.undefined;
					expect( doc.selection.hasAttribute( 'highlight' ) ).to.be.false;
				} );

				it( 'should change entire highlight when inside highlighted text', () => {
					setData( model, '<paragraph>abc<$text highlight="marker">foo[]bar</$text>xyz</paragraph>' );

					expect( command.value ).to.equal( 'marker' );

					command.execute( { value: 'greenMarker' } );

					expect( getData( model ) ).to.equal( '<paragraph>abc[<$text highlight="greenMarker">foobar</$text>]xyz</paragraph>' );

					expect( command.value ).to.equal( 'greenMarker' );
				} );
			} );

			describe( 'on not collapsed range', () => {
				it( 'should set highlight attribute on selected node when passed as parameter', () => {
					setData( model, '<paragraph>a[bc<$text highlight="marker">fo]obar</$text>xyz</paragraph>' );

					expect( command.value ).to.be.undefined;

					command.execute( { value: 'marker' } );

					expect( command.value ).to.equal( 'marker' );

					expect( getData( model ) ).to.equal( '<paragraph>a[<$text highlight="marker">bcfo]obar</$text>xyz</paragraph>' );
				} );

				it( 'should set highlight attribute on selected node when passed as parameter (multiple nodes)', () => {
					setData(
						model,
						'<paragraph>abcabc[abc</paragraph>' +
						'<paragraph>foofoofoo</paragraph>' +
						'<paragraph>barbar]bar</paragraph>'
					);

					command.execute( { value: 'marker' } );

					expect( command.value ).to.equal( 'marker' );

					expect( getData( model ) ).to.equal(
						'<paragraph>abcabc[<$text highlight="marker">abc</$text></paragraph>' +
						'<paragraph><$text highlight="marker">foofoofoo</$text></paragraph>' +
						'<paragraph><$text highlight="marker">barbar</$text>]bar</paragraph>'
					);
				} );

				it( 'should set highlight attribute on selected nodes when passed as parameter only on selected characters', () => {
					setData( model, '<paragraph>abc[<$text highlight="marker">foo]bar</$text>xyz</paragraph>' );

					expect( command.value ).to.equal( 'marker' );

					command.execute( { value: 'foo' } );

					expect( getData( model ) ).to.equal(
						'<paragraph>abc[<$text highlight="foo">foo</$text>]<$text highlight="marker">bar</$text>xyz</paragraph>'
					);

					expect( command.value ).to.equal( 'foo' );
				} );
			} );
		} );

		describe( 'with undefined option.value', () => {
			describe( 'on collapsed range', () => {
				it( 'should remove entire highlight when inside highlighted text', () => {
					setData( model, '<paragraph>abc<$text highlight="marker">foo[]bar</$text>xyz</paragraph>' );

					expect( command.value ).to.equal( 'marker' );

					command.execute();

					expect( getData( model ) ).to.equal( '<paragraph>abcfoo[]barxyz</paragraph>' );

					expect( command.value ).to.be.undefined;
				} );
			} );

			describe( 'on not collapsed range', () => {
				it( 'should remove highlight attribute on selected node when undefined passed as parameter', () => {
					setData( model, '<paragraph>abc[<$text highlight="marker">foo]bar</$text>xyz</paragraph>' );

					expect( command.value ).to.equal( 'marker' );

					command.execute();

					expect( getData( model ) ).to.equal( '<paragraph>abc[foo]<$text highlight="marker">bar</$text>xyz</paragraph>' );

					expect( command.value ).to.be.undefined;
				} );
			} );
		} );
	} );
} );
