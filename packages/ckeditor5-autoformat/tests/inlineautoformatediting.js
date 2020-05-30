/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Autoformat from '../src/autoformat';
import inlineAutoformatEditing from '../src/inlineautoformatediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'inlineAutoformatEditing', () => {
	let editor, model, doc, plugin, formatSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		formatSpy = testUtils.sinon.spy().named( 'formatCallback' );

		return VirtualTestEditor
			.create( {
				plugins: [ Enter, Paragraph, Autoformat ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				plugin = editor.plugins.get( 'Autoformat' );

				model.schema.extend( '$text', { allowAttributes: 'testAttribute' } );
			} );
	} );

	describe( 'regExp', () => {
		it( 'should not call formatCallback if there are less than 3 capture groups', () => {
			inlineAutoformatEditing( editor, plugin, /(\*)(.+?)\*/g, formatSpy );

			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should call formatCallback when the pattern is matched', () => {
			inlineAutoformatEditing( editor, plugin, /(\*)(.+?)(\*)/g, formatSpy );

			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			sinon.assert.calledOnce( formatSpy );
		} );

		it( 'should not call formatCallback if selection is not collapsed', () => {
			inlineAutoformatEditing( editor, plugin, /(\*)(.+?)\*/g, formatSpy );

			setData( model, '<paragraph>*foob[ar]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( formatSpy );
		} );
	} );

	describe( 'callback', () => {
		it( 'should stop when there are no format ranges returned from testCallback', () => {
			const testStub = testUtils.sinon.stub().returns( {
				format: [ [] ],
				remove: []
			} );

			inlineAutoformatEditing( editor, plugin, testStub, formatSpy );

			setData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should stop when there are no remove ranges returned from testCallback', () => {
			const testStub = testUtils.sinon.stub().returns( {
				format: [],
				remove: [ [] ]
			} );

			inlineAutoformatEditing( editor, plugin, testStub, formatSpy );

			setData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should stop early when there is no text', () => {
			const testStub = testUtils.sinon.stub().returns( {
				format: [],
				remove: [ [] ]
			} );

			inlineAutoformatEditing( editor, plugin, testStub, formatSpy );

			setData( model, '<paragraph>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should not run formatCallback when the pattern is matched and plugin is disabled', () => {
			inlineAutoformatEditing( editor, plugin, /(\*)(.+?)(\*)/g, formatSpy );

			plugin.isEnabled = false;

			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should not autoformat if callback returned false', () => {
			setData( model, '<paragraph>Foobar[]</paragraph>' );

			const p = model.document.getRoot().getChild( 0 );

			const testCallback = () => ( {
				format: [ model.createRange( model.createPositionAt( p, 0 ), model.createPositionAt( p, 3 ) ) ],
				remove: [ model.createRange( model.createPositionAt( p, 0 ), model.createPositionAt( p, 3 ) ) ]
			} );

			const formatCallback = () => false;

			inlineAutoformatEditing( editor, plugin, testCallback, formatCallback );

			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>Foobar []</paragraph>' );
		} );
	} );

	it( 'should ignore transparent batches', () => {
		inlineAutoformatEditing( editor, plugin, /(\*)(.+?)(\*)/g, formatSpy );

		setData( model, '<paragraph>*foobar[]</paragraph>' );
		model.enqueueChange( 'transparent', writer => {
			writer.insertText( '*', doc.selection.getFirstPosition() );
		} );

		sinon.assert.notCalled( formatSpy );
		expect( getData( model ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
	} );
} );
