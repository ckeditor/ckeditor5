/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FontCommand from '../src/fontcommand.js';

import Command from '@ckeditor/ckeditor5-core/src/command.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

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
		expect( FontCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to font value when selection is in text with font attribute', () => {
			setData( model, '<paragraph><$text font="foo">fo[]o</$text></paragraph>' );

			expect( command ).to.have.property( 'value', 'foo' );
		} );

		it( 'is undefined when selection is not in text with font attribute', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have font added', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should do nothing if the command is disabled', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.isEnabled = false;

			command.execute( { value: 'foo' } );

			expect( getData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should add font attribute on selected text', () => {
			setData( model, '<paragraph>a[bc<$text font="foo">fo]obar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.undefined;

			command.execute( { value: 'foo' } );

			expect( command.value ).to.equal( 'foo' );

			expect( getData( model ) ).to.equal( '<paragraph>a[<$text font="foo">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should add font attribute on selected nodes (multiple nodes)', () => {
			setData(
				model,
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);

			command.execute( { value: 'foo' } );

			expect( command.value ).to.equal( 'foo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>abcabc[<$text font="foo">abc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">barbar</$text>]bar</paragraph>'
			);
		} );

		it( 'should change font attribute on selected nodes', () => {
			setData(
				model,
				'<paragraph>abc[abc<$text font="text-small">abc</$text></paragraph>' +
				'<paragraph><$text font="text-small">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="text-small">bar]bar</$text>bar</paragraph>'
			);

			command.execute( { value: 'foo' } );

			expect( command.value ).to.equal( 'foo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>abc[<$text font="foo">abcabc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">bar</$text>]<$text font="text-small">bar</$text>bar</paragraph>'
			);
		} );

		it( 'should remove font attribute on selected nodes when passing undefined value', () => {
			setData(
				model,
				'<paragraph>abcabc[<$text font="foo">abc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">barbar</$text>]bar</paragraph>'
			);
			expect( command.value ).to.equal( 'foo' );

			command.execute();

			expect( command.value ).to.be.undefined;

			expect( getData( model ) ).to.equal(
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);
		} );

		it( 'should change selection attribute if selection is collapsed in non-empty parent', () => {
			setData( model, '<paragraph>a[]bc<$text font="foo">foobar</$text>xyz</paragraph><paragraph></paragraph>' );

			expect( command.value ).to.be.undefined;

			command.execute( { value: 'foo' } );

			expect( command.value ).to.equal( 'foo' );
			expect( doc.selection.hasAttribute( 'font' ) ).to.be.true;

			command.execute();

			expect( command.value ).to.be.undefined;
			expect( doc.selection.hasAttribute( 'font' ) ).to.be.false;
		} );

		it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
			setData( model, '<paragraph>a[]bc<$text font="foo">foobar</$text>xyz</paragraph>' );

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
			setData( model, '<paragraph>abc<$text font="foo">foobar</$text>xyz</paragraph><paragraph>[]</paragraph>' );

			expect( command.value ).to.be.undefined;

			command.execute( { value: 'foo' } );

			expect( command.value ).to.equal( 'foo' );
			expect( doc.selection.hasAttribute( 'font' ) ).to.be.true;

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
			expect( doc.selection.hasAttribute( 'font' ) ).to.be.false;
		} );

		it( 'should not apply attribute change where it would invalid schema', () => {
			model.schema.register( 'imageBlock', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>ab[c<img></img><$text font="foo">foobar</$text>xy<img></img>]z</paragraph>' );

			expect( command.isEnabled ).to.be.true;

			command.execute( { value: 'foo' } );

			expect( getData( model ) ).to.equal(
				'<paragraph>ab[<$text font="foo">c</$text><img></img><$text font="foo">foobarxy</$text><img></img>]z</paragraph>'
			);
		} );

		it( 'should use parent batch for storing undo steps', () => {
			setData( model, '<paragraph>a[bc<$text font="foo">fo]obar</$text>xyz</paragraph>' );

			model.change( writer => {
				expect( writer.batch.operations.length ).to.equal( 0 );
				command.execute( { value: 'foo' } );
				expect( writer.batch.operations.length ).to.equal( 1 );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>a[<$text font="foo">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should use provided batch', () => {
			setData( model, '<paragraph>a[bc<$text font="foo">fo]obar</$text>xyz</paragraph>' );
			const batch = model.createBatch();
			const spy = sinon.spy( model, 'enqueueChange' );

			command.execute( { value: '#f00', batch } );
			sinon.assert.calledWith( spy, batch );
		} );

		describe( 'should cause firing model change event', () => {
			let spy;

			beforeEach( () => {
				spy = sinon.spy();
			} );

			it( 'collapsed selection in non-empty parent', () => {
				setData( model, '<paragraph>x[]y</paragraph>' );

				model.document.on( 'change', spy );

				command.execute( { value: 'foo' } );

				expect( spy.called ).to.be.true;
			} );

			it( 'non-collapsed selection', () => {
				setData( model, '<paragraph>[xy]</paragraph>' );

				model.document.on( 'change', spy );

				command.execute( { value: 'foo' } );

				expect( spy.called ).to.be.true;
			} );

			it( 'in empty parent', () => {
				setData( model, '<paragraph>[]</paragraph>' );

				model.document.on( 'change', spy );

				command.execute( { value: 'foo' } );

				expect( spy.called ).to.be.true;
			} );
		} );
	} );
} );
