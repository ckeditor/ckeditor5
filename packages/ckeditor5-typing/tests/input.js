/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Input from '../src/input';
import InsertTextCommand from '../src/inserttextcommand';
import env from '@ckeditor/ckeditor5-utils/src/env';

describe( 'Input', () => {
	testUtils.createSinonSandbox();

	describe( 'Input plugin', () => {
		let domElement, editor, view, viewDocument, insertTextCommandSpy;

		beforeEach( async () => {
			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph ],
				initialData: '<p>foo</p>'
			} );

			view = editor.editing.view;
			viewDocument = view.document;
			insertTextCommandSpy = testUtils.sinon.stub( editor.commands.get( 'insertText' ), 'execute' );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should define #pluginName', () => {
			expect( Input.pluginName ).to.equal( 'Input' );
		} );

		describe( 'init()', () => {
			it( 'should register the insert text command', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input ]
				} );

				expect( editor.commands.get( 'insertText' ) ).to.be.instanceOf( InsertTextCommand );

				await editor.destroy();
			} );

			it( 'should register the input command (deprecated) with the same command instance', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input ]
				} );

				const insertTextCommand = editor.commands.get( 'insertText' );

				expect( editor.commands.get( 'input' ) ).to.equal( insertTextCommand );

				await editor.destroy();
			} );

			it( 'should preventDefault() the original beforeinput event if not composing', () => {
				const spy = sinon.spy();

				viewDocument.fire( 'insertText', {
					preventDefault: spy,
					selection: viewDocument.selection,
					text: 'bar'
				} );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should not preventDefault() the original beforeinput event if composing', () => {
				const spy = sinon.spy();

				viewDocument.isComposing = true;

				viewDocument.fire( 'insertText', {
					preventDefault: spy,
					selection: viewDocument.selection,
					text: 'bar'
				} );

				sinon.assert.notCalled( spy );
			} );

			it( 'should have the text property passed correctly to the insert text command', async () => {
				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: viewDocument.selection,
					preventDefault: () => {}
				} );

				const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

				sinon.assert.calledOnce( insertTextCommandSpy );
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.resultRange ).to.be.undefined;
			} );

			it( 'should have the selection property passed correctly to the insert text command', async () => {
				const expectedSelection = editor.model.createSelection(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 1 )
				);

				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: view.createSelection(
						view.createPositionAt( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 1 )
					),
					preventDefault: sinon.spy()
				} );

				const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

				sinon.assert.calledOnce( insertTextCommandSpy );
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( expectedSelection ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;
			} );

			it( 'should have result range passed correctly to the insert text command', async () => {
				const expectedSelection = editor.model.createSelection(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 1 )
				);

				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 2 ),
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 3 )
				);

				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: view.createSelection(
						view.createPositionAt( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 1 )
					),
					resultRange: view.createRange(
						view.createPositionAt( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 2 ),
						view.createPositionAt( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 3 )
					),
					preventDefault: sinon.spy()
				} );

				const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

				sinon.assert.calledOnce( insertTextCommandSpy );
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( expectedSelection ) ).to.be.true;
				expect( firstCallArgs.resultRange.isEqual( expectedRange ) ).to.be.true;
			} );

			it( 'should delete selected content on composition start', () => {
				const spy = sinon.spy( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

				viewDocument.fire( 'compositionstart' );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, editor.model.document.selection );
			} );

			it( 'should not call model.deleteContent() on composition start for collapsed model selection', () => {
				const spy = sinon.spy( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				viewDocument.fire( 'compositionstart' );

				sinon.assert.notCalled( spy );
			} );

			it( 'should not call model.deleteContent() on composition start if insertText command is disabled', () => {
				const spy = sinon.spy( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.commands.get( 'insertText' ).forceDisabled( 'commentsOnly' );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

				viewDocument.fire( 'compositionstart' );

				sinon.assert.notCalled( spy );
			} );
		} );
	} );

	describe( 'in Android environment', () => {
		let domElement, editor, view, viewDocument, insertTextCommandSpy;

		beforeEach( async () => {
			testUtils.sinon.stub( env, 'isAndroid' ).value( true );

			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph ],
				initialData: '<p>foo</p>'
			} );

			view = editor.editing.view;
			viewDocument = view.document;
			insertTextCommandSpy = testUtils.sinon.stub( editor.commands.get( 'insertText' ), 'execute' );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should adjust text and range to minimize model change (adding text)', () => {
			const viewParagraph = viewDocument.getRoot().getChild( 0 );
			const modelParagraph = editor.model.document.getRoot().getChild( 0 );

			viewDocument.fire( 'insertText', {
				text: 'foobar',
				selection: view.createSelection( view.createRange(
					view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
					view.createPositionAt( viewParagraph.getChild( 0 ), 'end' )
				) ),
				preventDefault: sinon.spy()
			} );

			const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

			sinon.assert.calledOnce( insertTextCommandSpy );
			expect( firstCallArgs.text ).to.equal( 'bar' );
			expect( firstCallArgs.selection.isEqual( editor.model.createSelection( modelParagraph, 'end' ) ) ).to.be.true;
			expect( firstCallArgs.resultRange ).to.be.undefined;
		} );

		it( 'should adjust text and range to minimize model change (adding text, text and inline object selected)', () => {
			const viewParagraph = viewDocument.getRoot().getChild( 0 );
			const modelParagraph = editor.model.document.getRoot().getChild( 0 );

			editor.model.schema.register( 'inline', { inheritAllFrom: '$inlineObject' } );
			editor.conversion.elementToElement( { model: 'inline', view: 'span' } );

			editor.model.change( writer => {
				writer.insertElement( 'inline', modelParagraph, 2 );
			} );

			viewDocument.fire( 'insertText', {
				text: 'foobar',
				selection: view.createSelection( view.createRange(
					view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
					view.createPositionAt( viewParagraph.getChild( 2 ), 'end' )
				) ),
				preventDefault: sinon.spy()
			} );

			const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

			sinon.assert.calledOnce( insertTextCommandSpy );
			expect( firstCallArgs.text ).to.equal( 'bar' );
			expect( firstCallArgs.selection.isEqual( editor.model.createSelection( editor.model.createRange(
				editor.model.createPositionAt( modelParagraph, 3 ),
				editor.model.createPositionAt( modelParagraph, 4 )
			) ) ) ).to.be.true;
			expect( firstCallArgs.resultRange ).to.be.undefined;
		} );

		it( 'should adjust text and range to minimize model change (removing text)', () => {
			const viewParagraph = viewDocument.getRoot().getChild( 0 );
			const modelParagraph = editor.model.document.getRoot().getChild( 0 );

			viewDocument.fire( 'insertText', {
				text: 'fo',
				selection: view.createSelection( view.createRange(
					view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
					view.createPositionAt( viewParagraph.getChild( 0 ), 'end' )
				) ),
				preventDefault: sinon.spy()
			} );

			const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

			sinon.assert.calledOnce( insertTextCommandSpy );
			expect( firstCallArgs.text ).to.equal( '' );
			expect( firstCallArgs.selection.isEqual( editor.model.createSelection( editor.model.createRange(
				editor.model.createPositionAt( modelParagraph, 2 ),
				editor.model.createPositionAt( modelParagraph, 3 )
			) ) ) ).to.be.true;
			expect( firstCallArgs.resultRange ).to.be.undefined;
		} );

		it( 'should not adjust text and range if the whole selected text is replaced', () => {
			const viewParagraph = viewDocument.getRoot().getChild( 0 );
			const modelParagraph = editor.model.document.getRoot().getChild( 0 );

			viewDocument.fire( 'insertText', {
				text: 'barfoo',
				selection: view.createSelection( view.createRange(
					view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
					view.createPositionAt( viewParagraph.getChild( 0 ), 'end' )
				) ),
				preventDefault: sinon.spy()
			} );

			const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

			sinon.assert.calledOnce( insertTextCommandSpy );
			expect( firstCallArgs.text ).to.equal( 'barfoo' );
			expect( firstCallArgs.selection.isEqual( editor.model.createSelection( modelParagraph, 'in' ) ) ).to.be.true;
			expect( firstCallArgs.resultRange ).to.be.undefined;
		} );

		it( 'should not adjust text and range if the whole selected text is replaced with shorter text', () => {
			const viewParagraph = viewDocument.getRoot().getChild( 0 );
			const modelParagraph = editor.model.document.getRoot().getChild( 0 );

			viewDocument.fire( 'insertText', {
				text: 'ba',
				selection: view.createSelection( view.createRange(
					view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
					view.createPositionAt( viewParagraph.getChild( 0 ), 'end' )
				) ),
				preventDefault: sinon.spy()
			} );

			const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

			sinon.assert.calledOnce( insertTextCommandSpy );
			expect( firstCallArgs.text ).to.equal( 'ba' );
			expect( firstCallArgs.selection.isEqual( editor.model.createSelection( modelParagraph, 'in' ) ) ).to.be.true;
			expect( firstCallArgs.resultRange ).to.be.undefined;
		} );

		it( 'should not adjust text and range if the selection is collapsed', () => {
			const viewParagraph = viewDocument.getRoot().getChild( 0 );
			const modelParagraph = editor.model.document.getRoot().getChild( 0 );

			viewDocument.fire( 'insertText', {
				text: 'bar',
				selection: view.createSelection( viewParagraph.getChild( 0 ), 'end' ),
				preventDefault: sinon.spy()
			} );

			const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

			sinon.assert.calledOnce( insertTextCommandSpy );
			expect( firstCallArgs.text ).to.equal( 'bar' );
			expect( firstCallArgs.selection.isEqual( editor.model.createSelection( modelParagraph, 'end' ) ) ).to.be.true;
			expect( firstCallArgs.resultRange ).to.be.undefined;
		} );

		it( 'should delete selected content on 229 keydown while composing', () => {
			const spy = sinon.spy( editor.model, 'deleteContent' );
			const root = editor.model.document.getRoot();

			editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

			viewDocument.isComposing = true;
			viewDocument.fire( 'keydown', {
				keyCode: 229,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, editor.model.document.selection );
		} );

		it( 'should not call model.deleteContent() on 229 keydown for collapsed model selection', () => {
			const spy = sinon.spy( editor.model, 'deleteContent' );
			const root = editor.model.document.getRoot();

			editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

			viewDocument.fire( 'keydown', {
				keyCode: 229,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should not call model.deleteContent() on 229 keydown if not composing', () => {
			const spy = sinon.spy( editor.model, 'deleteContent' );
			const root = editor.model.document.getRoot();

			editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

			viewDocument.fire( 'keydown', {
				keyCode: 229,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should not call model.deleteContent() on 229 keydown if insertText command is disabled', () => {
			const spy = sinon.spy( editor.model, 'deleteContent' );
			const root = editor.model.document.getRoot();

			editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

			editor.commands.get( 'insertText' ).forceDisabled( 'commentsOnly' );

			viewDocument.isComposing = true;
			viewDocument.fire( 'keydown', {
				keyCode: 229,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.notCalled( spy );
		} );
	} );
} );
