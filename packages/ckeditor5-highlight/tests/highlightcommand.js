/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HighlightCommand } from './../src/highlightcommand.js';
import { Command } from '@ckeditor/ckeditor5-core';
import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

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
		expect( HighlightCommand.prototype ).toBeInstanceOf( Command );
		expect( command ).toBeInstanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to highlight attribute value when selection is in text with highlight attribute', () => {
			_setModelData( model, '<p><$text highlight="yellowMarker">fo[o]</$text></p>' );

			expect( command ).toHaveProperty( 'value', 'yellowMarker' );
		} );

		it( 'is undefined when selection is not in text with highlight attribute', () => {
			_setModelData( model, '<p>fo[]o</p>' );

			expect( command ).toHaveProperty( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		beforeEach( () => {
			model.schema.register( 'x', { inheritAllFrom: '$block' } );
		} );

		it( 'is true when selection is on text which can have highlight added', () => {
			_setModelData( model, '<p>fo[]o</p>' );

			expect( command ).toHaveProperty( 'isEnabled', true );
		} );

		it( 'is false when selection is on text which cannot have highlight added', () => {
			_setModelData( model, '<x>fo[]o</x>' );
			expect( command.isEnabled ).toBe( false );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'with option.value set', () => {
			describe( 'on collapsed range', () => {
				it( 'should change entire highlight when inside highlighted text', () => {
					_setModelData( model, '<p>abc<$text highlight="yellowMarker">foo[]bar</$text>xyz</p>' );

					expect( command.value ).toEqual( 'yellowMarker' );

					command.execute( { value: 'greenMarker' } );

					expect( _getModelData( model ) ).toEqual( '<p>abc<$text highlight="greenMarker">foo[]bar</$text>xyz</p>' );

					expect( command.value ).toEqual( 'greenMarker' );
				} );

				it( 'should remove entire highlight when inside highlighted text of the same value', () => {
					_setModelData( model, '<p>abc<$text highlight="yellowMarker">foo[]bar</$text>xyz</p>' );

					expect( command.value ).toEqual( 'yellowMarker' );

					command.execute( { value: 'yellowMarker' } );

					expect( _getModelData( model ) ).toEqual( '<p>abcfoo[]barxyz</p>' );

					expect( command.value ).toBeUndefined();
				} );

				it( 'should change selection attribute in non-empty parent', () => {
					_setModelData( model, '<p>a[]bc<$text highlight="yellowMarker">foobar</$text>xyz</p>' );
					expect( command.value ).toBeUndefined();

					command.execute( { value: 'foo' } );
					expect( command.value ).toEqual( 'foo' );

					expect( doc.selection.hasAttribute( 'highlight' ) ).toBe( true );

					command.execute();

					expect( command.value ).toBeUndefined();
					expect( doc.selection.hasAttribute( 'highlight' ) ).toBe( false );

					// Execute remove highlight on selection without 'highlight' attribute should do nothing.
					command.execute();

					expect( command.value ).toBeUndefined();
					expect( doc.selection.hasAttribute( 'highlight' ) ).toBe( false );
				} );

				it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
					_setModelData( model, '<p>a[]bc<$text highlight="yellowMarker">foobar</$text>xyz</p>' );

					command.execute( { value: 'foo' } );

					// It should not save that bold was executed at position ( root, [ 0, 1 ] ).

					model.change( writer => {
						// Simulate clicking right arrow key by changing selection ranges.
						writer.setSelection( root.getNodeByPath( [ 0 ] ), 2 );

						// Get back to previous selection.
						writer.setSelection( root.getNodeByPath( [ 0 ] ), 1 );
					} );

					expect( command.value ).toBeUndefined();
				} );

				it( 'should change selection attribute and store it if selection is collapsed in empty parent', () => {
					_setModelData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>xyz</p><p>[]</p>' );

					expect( command.value ).toBeUndefined();

					command.execute( { value: 'foo' } );

					expect( command.value ).toEqual( 'foo' );
					expect( doc.selection.hasAttribute( 'highlight' ) ).toBe( true );

					// Attribute should be stored.
					// Simulate clicking somewhere else in the editor.
					model.change( writer => {
						writer.setSelection( root.getNodeByPath( [ 0 ] ), 2 );
					} );

					expect( command.value ).toBeUndefined();

					// Go back to where attribute was stored.
					model.change( writer => {
						writer.setSelection( root.getNodeByPath( [ 1 ] ), 0 );
					} );

					// Attribute should be restored.
					expect( command.value ).toEqual( 'foo' );

					command.execute();

					expect( command.value ).toBeUndefined();
					expect( doc.selection.hasAttribute( 'highlight' ) ).toBe( false );
				} );

				// https://github.com/ckeditor/ckeditor5-highlight/issues/8
				it( 'should change selection attribute on consecutive calls', () => {
					_setModelData( model, '<p>abcfoobar[] foobar</p>' );

					expect( command.value ).toBeUndefined();

					command.execute( { value: 'greenMarker' } );

					expect( command.value ).toEqual( 'greenMarker' );
					expect( doc.selection.getAttribute( 'highlight' ) ).toEqual( 'greenMarker' );

					command.execute( { value: 'pinkMarker' } );

					expect( command.value ).toEqual( 'pinkMarker' );
					expect( doc.selection.getAttribute( 'highlight' ) ).toEqual( 'pinkMarker' );
				} );

				it( 'should not change entire highlight when at the end of highlighted text', () => {
					_setModelData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).toEqual( 'yellowMarker' );

					command.execute( { value: 'greenMarker' } );

					expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
						'<p>abc<$text highlight="yellowMarker">foobar</$text>xyz</p>'
					);

					expect( command.value ).toEqual( 'greenMarker' );
				} );

				it( 'should not remove entire highlight when at the end of highlighted text of the same value', () => {
					_setModelData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).toEqual( 'yellowMarker' );

					command.execute( { value: 'yellowMarker' } );

					expect( _getModelData( model ) ).toEqual( '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).toBeUndefined();
				} );

				it( 'should change selection attribute when at the end of highlighted text', () => {
					_setModelData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					command.execute( { value: 'greenMarker' } );

					expect( doc.selection.getAttribute( 'highlight' ) ).toEqual( 'greenMarker' );
				} );
			} );

			describe( 'on not collapsed range', () => {
				// https://github.com/ckeditor/ckeditor5/issues/18430
				it(
					'when applying highlight to range that includes empty paragraph, empty paragraph should get selection:highlight',
					() => {
						_setModelData( model, '[<p>foo</p><p></p><p>foo</p>]' );

						command.execute( { value: 'yellowMarker' } );

						model.change( writer => {
							writer.setSelection( root.getNodeByPath( [ 1 ] ), 0 );
						} );

						expect( _getModelData( model ) ).toContain( 'selection:highlight="yellowMarker"' );
						expect( command.value ).toEqual( 'yellowMarker' );
					}
				);

				it( 'should set highlight attribute on selected node when passed as parameter', () => {
					_setModelData( model, '<p>a[bc<$text highlight="yellowMarker">fo]obar</$text>xyz</p>' );

					expect( command.value ).toBeUndefined();

					command.execute( { value: 'yellowMarker' } );

					expect( command.value ).toEqual( 'yellowMarker' );

					expect( _getModelData( model ) ).toEqual( '<p>a[<$text highlight="yellowMarker">bcfo]obar</$text>xyz</p>' );
				} );

				it( 'should set highlight attribute on selected node when passed as parameter (multiple nodes)', () => {
					_setModelData(
						model,
						'<p>abcabc[abc</p>' +
						'<p>foofoofoo</p>' +
						'<p>barbar]bar</p>'
					);

					command.execute( { value: 'yellowMarker' } );

					expect( command.value ).toEqual( 'yellowMarker' );

					expect( _getModelData( model ) ).toEqual(
						'<p>abcabc[<$text highlight="yellowMarker">abc</$text></p>' +
						'<p><$text highlight="yellowMarker">foofoofoo</$text></p>' +
						'<p><$text highlight="yellowMarker">barbar</$text>]bar</p>'
					);
				} );

				it( 'should set highlight attribute on selected nodes when passed as parameter only on selected characters', () => {
					_setModelData( model, '<p>abc[<$text highlight="yellowMarker">foo]bar</$text>xyz</p>' );

					expect( command.value ).toEqual( 'yellowMarker' );

					command.execute( { value: 'foo' } );

					expect( _getModelData( model ) ).toEqual(
						'<p>abc[<$text highlight="foo">foo</$text>]<$text highlight="yellowMarker">bar</$text>xyz</p>'
					);

					expect( command.value ).toEqual( 'foo' );
				} );
			} );
		} );

		describe( 'with undefined option.value', () => {
			describe( 'on collapsed range', () => {
				it( 'should remove entire highlight when inside highlighted text', () => {
					_setModelData( model, '<p>abc<$text highlight="yellowMarker">foo[]bar</$text>xyz</p>' );

					expect( command.value ).toEqual( 'yellowMarker' );

					command.execute();

					expect( _getModelData( model ) ).toEqual( '<p>abcfoo[]barxyz</p>' );

					expect( command.value ).toBeUndefined();
				} );

				it( 'should not remove entire highlight when at the end of highlighted text', () => {
					_setModelData( model, '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).toEqual( 'yellowMarker' );

					command.execute();

					expect( _getModelData( model ) ).toEqual( '<p>abc<$text highlight="yellowMarker">foobar</$text>[]xyz</p>' );

					expect( command.value ).toBeUndefined();
				} );
			} );

			describe( 'on not collapsed range', () => {
				it( 'should remove highlight attribute on selected node when undefined passed as parameter', () => {
					_setModelData( model, '<p>abc[<$text highlight="yellowMarker">foo]bar</$text>xyz</p>' );

					expect( command.value ).toEqual( 'yellowMarker' );

					command.execute();

					expect( _getModelData( model ) ).toEqual( '<p>abc[foo]<$text highlight="yellowMarker">bar</$text>xyz</p>' );

					expect( command.value ).toBeUndefined();
				} );
			} );
		} );
	} );
} );
