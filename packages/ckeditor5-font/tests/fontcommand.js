/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { FontCommand } from '../src/fontcommand.js';

import { Command } from '@ckeditor/ckeditor5-core';
import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

describe( 'FontCommand', () => {
	let editor, model, doc, root, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot();

				command = new FontCommand( editor, 'font' );
				editor.commands.add( 'font', command );

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'img', {
					allowWhere: [ '$block', '$text' ],
					isObject: true
				} );

				model.schema.extend( '$text', { allowAttributes: 'font' } );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a command', () => {
		expect( FontCommand.prototype ).toBeInstanceOf( Command );
		expect( command ).toBeInstanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to font value when selection is in text with font attribute', () => {
			_setModelData( model, '<paragraph><$text font="foo">fo[]o</$text></paragraph>' );

			expect( command ).toHaveProperty( 'value', 'foo' );
		} );

		it( 'is undefined when selection is not in text with font attribute', () => {
			_setModelData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).toHaveProperty( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have font added', () => {
			_setModelData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).toHaveProperty( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should do nothing if the command is disabled', () => {
			_setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.isEnabled = false;

			command.execute( { value: 'foo' } );

			expect( _getModelData( model ) ).toEqual( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should add font attribute on selected text', () => {
			_setModelData( model, '<paragraph>a[bc<$text font="foo">fo]obar</$text>xyz</paragraph>' );

			expect( command.value ).toBeUndefined();

			command.execute( { value: 'foo' } );

			expect( command.value ).toEqual( 'foo' );

			expect( _getModelData( model ) ).toEqual( '<paragraph>a[<$text font="foo">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should add font attribute on selected nodes (multiple nodes)', () => {
			_setModelData(
				model,
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);

			command.execute( { value: 'foo' } );

			expect( command.value ).toEqual( 'foo' );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>abcabc[<$text font="foo">abc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">barbar</$text>]bar</paragraph>'
			);
		} );

		it( 'should change font attribute on selected nodes', () => {
			_setModelData(
				model,
				'<paragraph>abc[abc<$text font="text-small">abc</$text></paragraph>' +
				'<paragraph><$text font="text-small">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="text-small">bar]bar</$text>bar</paragraph>'
			);

			command.execute( { value: 'foo' } );

			expect( command.value ).toEqual( 'foo' );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>abc[<$text font="foo">abcabc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">bar</$text>]<$text font="text-small">bar</$text>bar</paragraph>'
			);
		} );

		it( 'should remove font attribute on selected nodes when passing undefined value', () => {
			_setModelData(
				model,
				'<paragraph>abcabc[<$text font="foo">abc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">barbar</$text>]bar</paragraph>'
			);
			expect( command.value ).toEqual( 'foo' );

			command.execute();

			expect( command.value ).toBeUndefined();

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);
		} );

		it( 'should change selection attribute if selection is collapsed in non-empty parent', () => {
			_setModelData( model, '<paragraph>a[]bc<$text font="foo">foobar</$text>xyz</paragraph><paragraph></paragraph>' );

			expect( command.value ).toBeUndefined();

			command.execute( { value: 'foo' } );

			expect( command.value ).toEqual( 'foo' );
			expect( doc.selection.hasAttribute( 'font' ) ).toBe( true );

			command.execute();

			expect( command.value ).toBeUndefined();
			expect( doc.selection.hasAttribute( 'font' ) ).toBe( false );
		} );

		it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
			_setModelData( model, '<paragraph>a[]bc<$text font="foo">foobar</$text>xyz</paragraph>' );

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
			_setModelData( model, '<paragraph>abc<$text font="foo">foobar</$text>xyz</paragraph><paragraph>[]</paragraph>' );

			expect( command.value ).toBeUndefined();

			command.execute( { value: 'foo' } );

			expect( command.value ).toEqual( 'foo' );
			expect( doc.selection.hasAttribute( 'font' ) ).toBe( true );

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
			expect( doc.selection.hasAttribute( 'font' ) ).toBe( false );
		} );

		it( 'should not apply attribute change where it would invalid schema', () => {
			model.schema.register( 'imageBlock', { inheritAllFrom: '$block' } );
			_setModelData( model, '<paragraph>ab[c<img></img><$text font="foo">foobar</$text>xy<img></img>]z</paragraph>' );

			expect( command.isEnabled ).toBe( true );

			command.execute( { value: 'foo' } );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>ab[<$text font="foo">c</$text><img></img><$text font="foo">foobarxy</$text><img></img>]z</paragraph>'
			);
		} );

		it( 'should use parent batch for storing undo steps', () => {
			_setModelData( model, '<paragraph>a[bc<$text font="foo">fo]obar</$text>xyz</paragraph>' );

			model.change( writer => {
				expect( writer.batch.operations.length ).toEqual( 0 );
				command.execute( { value: 'foo' } );
				expect( writer.batch.operations.length ).toEqual( 1 );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph>a[<$text font="foo">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should use provided batch', () => {
			_setModelData( model, '<paragraph>a[bc<$text font="foo">fo]obar</$text>xyz</paragraph>' );
			const batch = model.createBatch();
			const spy = vi.spyOn( model, 'enqueueChange' );

			command.execute( { value: '#f00', batch } );
			expect( spy ).toHaveBeenCalledWith( batch, expect.anything() );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/18430
		it( 'when applying font to range that includes empty paragraph, empty paragraph should get selection:font', () => {
			_setModelData( model, '[<paragraph>foo</paragraph><paragraph></paragraph><paragraph>foo</paragraph>]' );

			command.execute( { value: 'foo' } );

			model.change( writer => {
				writer.setSelection( root.getNodeByPath( [ 1 ] ), 0 );
			} );

			expect( _getModelData( model ) ).toContain( 'selection:font="foo"' );
			expect( command.value ).toEqual( 'foo' );
		} );

		describe( 'should cause firing model change event', () => {
			let spy;

			beforeEach( () => {
				spy = vi.fn();
			} );

			it( 'collapsed selection in non-empty parent', () => {
				_setModelData( model, '<paragraph>x[]y</paragraph>' );

				model.document.on( 'change', spy );

				command.execute( { value: 'foo' } );

				expect( spy ).toHaveBeenCalled();
			} );

			it( 'non-collapsed selection', () => {
				_setModelData( model, '<paragraph>[xy]</paragraph>' );

				model.document.on( 'change', spy );

				command.execute( { value: 'foo' } );

				expect( spy ).toHaveBeenCalled();
			} );

			it( 'in empty parent', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				model.document.on( 'change', spy );

				command.execute( { value: 'foo' } );

				expect( spy ).toHaveBeenCalled();
			} );
		} );
	} );
} );
