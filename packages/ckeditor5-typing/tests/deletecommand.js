/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import DeleteCommand from '../src/deletecommand';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'DeleteCommand', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;

				const command = new DeleteCommand( editor, 'backward' );
				editor.commands.add( 'delete', command );

				model.schema.registerItem( 'paragraph', '$block' );
				model.schema.registerItem( 'heading1', '$block' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'has direction', () => {
		const command = new DeleteCommand( editor, 'forward' );

		expect( command ).to.have.property( 'direction', 'forward' );
	} );

	describe( 'execute()', () => {
		it( 'uses enqueueChange', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			model.enqueueChange( () => {
				editor.execute( 'delete' );

				// We expect that command is executed in enqueue changes block. Since we are already in
				// an enqueued block, the command execution will be postponed. Hence, no changes.
				expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			// After all enqueued changes are done, the command execution is reflected.
			expect( getData( model ) ).to.equal( '<paragraph>fo[]bar</paragraph>' );
		} );

		it( 'locks buffer when executing', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			const buffer = editor.commands.get( 'delete' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			editor.execute( 'delete' );

			expect( lockSpy.calledOnce ).to.be.true;
			expect( unlockSpy.calledOnce ).to.be.true;
		} );

		it( 'deletes previous character when selection is collapsed', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>fo[]bar</paragraph>' );
		} );

		it( 'deletes selection contents', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );
		} );

		it( 'merges elements', () => {
			setData( model, '<paragraph>foo</paragraph><paragraph>[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'does not try to delete when selection is at the boundary', () => {
			const spy = sinon.spy();

			editor.data.on( 'deleteContent', spy );
			setData( model, '<paragraph>[]foo</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>[]foo</paragraph>' );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'passes options to modifySelection', () => {
			const spy = sinon.spy();

			editor.data.on( 'modifySelection', spy );
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.commands.get( 'delete' ).direction = 'forward';

			editor.execute( 'delete', { unit: 'word' } );

			expect( spy.callCount ).to.equal( 1 );

			const modifyOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( modifyOpts ).to.have.property( 'direction', 'forward' );
			expect( modifyOpts ).to.have.property( 'unit', 'word' );
		} );

		it( 'passes options to deleteContent #1', () => {
			const spy = sinon.spy();

			editor.data.on( 'deleteContent', spy );
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( spy.callCount ).to.equal( 1 );

			const deleteOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( deleteOpts ).to.have.property( 'doNotResetEntireContent', true );
		} );

		it( 'passes options to deleteContent #2', () => {
			const spy = sinon.spy();

			editor.data.on( 'deleteContent', spy );
			setData( model, '<paragraph>[foobar]</paragraph>' );

			editor.execute( 'delete' );

			expect( spy.callCount ).to.equal( 1 );

			const deleteOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( deleteOpts ).to.have.property( 'doNotResetEntireContent', false );
		} );

		it( 'leaves an empty paragraph after removing the whole content from editor', () => {
			setData( model, '<heading1>[Header 1</heading1><paragraph>Some text.]</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'leaves an empty paragraph after removing the whole content inside limit element', () => {
			model.schema.registerItem( 'section', '$root' );
			model.schema.limits.add( 'section' );
			model.schema.allow( { name: 'section', inside: '$root' } );

			setData( model,
				'<heading1>Foo</heading1>' +
					'<section>' +
						'<heading1>[Header 1</heading1>' +
						'<paragraph>Some text.]</paragraph>' +
					'</section>' +
				'<paragraph>Bar.</paragraph>'
			);

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal(
				'<heading1>Foo</heading1>' +
				'<section>' +
					'<paragraph>[]</paragraph>' +
				'</section>' +
				'<paragraph>Bar.</paragraph>'
			);
		} );

		it( 'leaves an empty paragraph after removing another paragraph from block element', () => {
			model.schema.registerItem( 'section', '$block' );
			model.schema.registerItem( 'blockQuote', '$block' );
			model.schema.limits.add( 'section' );
			model.schema.allow( { name: 'section', inside: '$root' } );
			model.schema.allow( { name: 'paragraph', inside: 'section' } );
			model.schema.allow( { name: 'blockQuote', inside: 'section' } );
			model.schema.allow( { name: 'paragraph', inside: 'blockQuote' } );

			setData( model, '<section><blockQuote><paragraph>[]</paragraph></blockQuote></section>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<section><paragraph>[]</paragraph></section>' );
		} );

		it( 'leaves an empty paragraph after removing the whole content when root element was not added as Schema.limits', () => {
			model.schema.limits.delete( '$root' );

			setData( model, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'replaces an empty element with paragraph', () => {
			setData( model, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'does not replace an element when Backspace or Delete key is held', () => {
			setData( model, '<heading1>Bar[]</heading1>' );

			for ( let sequence = 1; sequence < 10; ++sequence ) {
				editor.execute( 'delete', { sequence } );
			}

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
		} );

		it( 'does not replace with paragraph in another paragraph already occurs in limit element', () => {
			setData( model, '<paragraph>[]</paragraph>' );

			const element = doc.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'delete' );

			expect( element ).is.equal( doc.getRoot().getNodeByPath( [ 0 ] ) );
		} );

		it( 'does not replace an element if a paragraph is not allowed in current position', () => {
			model.schema.disallow( { name: 'paragraph', inside: '$root' } );

			setData( model, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
		} );
	} );
} );
