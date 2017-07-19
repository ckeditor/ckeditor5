/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import DeleteCommand from '../src/deletecommand';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'DeleteCommand', () => {
	let editor, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				const command = new DeleteCommand( editor, 'backward' );
				editor.commands.add( 'delete', command );

				doc.schema.registerItem( 'paragraph', '$block' );
				doc.schema.registerItem( 'heading1', '$block' );
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
		it( 'uses enqueueChanges', () => {
			setData( doc, '<paragraph>foo[]bar</paragraph>' );

			const spy = testUtils.sinon.spy( doc, 'enqueueChanges' );

			editor.execute( 'delete' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'locks buffer when executing', () => {
			setData( doc, '<paragraph>foo[]bar</paragraph>' );

			const buffer = editor.commands.get( 'delete' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			editor.execute( 'delete' );

			expect( lockSpy.calledOnce ).to.be.true;
			expect( unlockSpy.calledOnce ).to.be.true;
		} );

		it( 'deletes previous character when selection is collapsed', () => {
			setData( doc, '<paragraph>foo[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<paragraph>fo[]bar</paragraph>' );
		} );

		it( 'deletes selection contents', () => {
			setData( doc, '<paragraph>fo[ob]ar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );
		} );

		it( 'merges elements', () => {
			setData( doc, '<paragraph>foo</paragraph><paragraph>[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'does not try to delete when selection is at the boundary', () => {
			const spy = sinon.spy();

			editor.data.on( 'deleteContent', spy );
			setData( doc, '<paragraph>[]foo</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<paragraph>[]foo</paragraph>' );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'passes options to modifySelection', () => {
			const spy = sinon.spy();

			editor.data.on( 'modifySelection', spy );
			setData( doc, '<paragraph>foo[]bar</paragraph>' );

			editor.commands.get( 'delete' ).direction = 'forward';

			editor.execute( 'delete', { unit: 'word' } );

			expect( spy.callCount ).to.equal( 1 );

			const modifyOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( modifyOpts ).to.have.property( 'direction', 'forward' );
			expect( modifyOpts ).to.have.property( 'unit', 'word' );
		} );

		it( 'leaves an empty paragraph after removing the whole content from editor', () => {
			setData( doc, '<heading1>[Header 1</heading1><paragraph>Some text.]</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'leaves an empty paragraph after removing the whole content inside limit element', () => {
			doc.schema.registerItem( 'section', '$root' );
			doc.schema.limits.add( 'section' );
			doc.schema.allow( { name: 'section', inside: '$root' } );

			setData( doc,
				'<heading1>Foo</heading1>' +
				'<section>' +
					'<heading1>[Header 1</heading1>' +
					'<paragraph>Some text.]</paragraph>' +
				'</section>' +
				'<paragraph>Bar.</paragraph>'
			);

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal(
				'<heading1>Foo</heading1>' +
				'<section>' +
					'<paragraph>[]</paragraph>' +
				'</section>' +
				'<paragraph>Bar.</paragraph>'
			);
		} );

		it( 'leaves an empty paragraph after removing the whole content when root element was not added as Schema.limits', () => {
			doc.schema.limits.delete( '$root' );

			setData( doc, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( doc ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'replaces an empty element with paragraph', () => {
			setData( doc, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'does not replace an element when Backspace or Delete key is held', () => {
			setData( doc, '<heading1>Bar[]</heading1>' );

			for ( let sequence = 1; sequence < 10; ++sequence ) {
				editor.execute( 'delete', { sequence } );
			}

			expect( getData( doc, { selection: true } ) ).to.equal( '<heading1>[]</heading1>' );
		} );

		it( 'does not replace an element if a paragraph is a common ancestor', () => {
			setData( doc, '<paragraph>[]</paragraph>' );

			const element = doc.selection.getFirstRange().getCommonAncestor();

			editor.execute( 'delete' );

			expect( element ).is.equal( doc.selection.getFirstRange().getCommonAncestor() );
		} );

		it( 'does not replace an element if a paragraph is not allowed in current position', () => {
			doc.schema.disallow( { name: 'paragraph', inside: '$root' } );

			setData( doc, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<heading1>[]</heading1>' );
		} );
	} );
} );
