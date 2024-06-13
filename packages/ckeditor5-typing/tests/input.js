/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';

import Input from '../src/input.js';
import InsertTextCommand from '../src/inserttextcommand.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';

describe( 'Input', () => {
	testUtils.createSinonSandbox();

	describe( 'common', () => {
		let domElement, editor, view, viewDocument, insertTextCommandSpy, scrollToTheSelectionSpy, rendererUpdateTextNodeSpy;

		beforeEach( async () => {
			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph, Bold ],
				initialData: '<p>foo</p>'
			} );

			view = editor.editing.view;
			viewDocument = view.document;
			scrollToTheSelectionSpy = testUtils.sinon.stub( view, 'scrollToTheSelection' );
			rendererUpdateTextNodeSpy = sinon.spy( view._renderer, '_updateTextNodeInternal' );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should define #pluginName', () => {
			expect( Input.pluginName ).to.equal( 'Input' );
		} );

		describe( 'basic typing', () => {
			beforeEach( () => {
				insertTextCommandSpy = testUtils.sinon.stub( editor.commands.get( 'insertText' ), 'execute' );
			} );

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

			it( 'should use model document selection if the selection property is not passed', async () => {
				const expectedSelection = editor.model.createSelection(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 1 )
				);

				editor.model.change( writer => {
					writer.setSelection( expectedSelection );
				} );

				viewDocument.fire( 'insertText', {
					text: 'bar',
					preventDefault: sinon.spy()
				} );

				const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

				sinon.assert.calledOnce( insertTextCommandSpy );
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( expectedSelection ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;
			} );

			it( 'should delete selected content on composition start', () => {
				const spy = sinon.spy( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

				viewDocument.fire( 'compositionstart' );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, editor.model.document.selection );
			} );

			it( 'should update model selection to the DOM selection on composition start and use it on compositionend', () => {
				const root = editor.model.document.getRoot();
				const modelSelection = editor.model.document.selection;

				const modelParagraph = root.getChild( 0 );
				const viewParagraph = viewDocument.getRoot().getChild( 0 );
				const domParagraph = view.domConverter.mapViewToDom( viewParagraph );

				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( modelParagraph, 1 ),
					editor.model.createPositionAt( modelParagraph, 3 )
				);

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 0 ) );

				window.getSelection().setBaseAndExtent( domParagraph.childNodes[ 0 ], 1, domParagraph.childNodes[ 0 ], 3 );

				viewDocument.fire( 'compositionstart' );

				expect( modelSelection.getFirstRange().isEqual( expectedRange ) ).to.be.true;

				viewDocument.fire( 'compositionend', new DomEventData( view, {
					preventDefault() {}
				}, {
					data: 'bar'
				} ) );

				const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

				sinon.assert.calledOnce( insertTextCommandSpy );
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.getFirstRange().isEqual( expectedRange ) ).to.be.true;
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

			it( 'should scroll to the selection after inserting text', async () => {
				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: viewDocument.selection,
					preventDefault: () => {}
				} );

				sinon.assert.calledOnce( insertTextCommandSpy );
				sinon.assert.calledOnce( scrollToTheSelectionSpy );
			} );
		} );

		describe( 'composition', () => {
			beforeEach( () => {
				insertTextCommandSpy = testUtils.sinon.spy( editor.commands.get( 'insertText' ), 'execute' );
			} );

			it( 'should render the DOM on composition end only when needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Make sure that model is not modified by DOM changes.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.calledOnce( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should render the DOM on composition end only once when needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				// Note that NBSP is in different order than expected by the DomConverter and Renderer.
				composition.update( '\u00A0 abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Make sure that model is not modified by DOM changes.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// Commit composition.
				composition.end( '  abc' );

				sinon.assert.calledOnce( insertTextCommandSpy );

				// DOM text node requires NBSP vs space fixing.
				sinon.assert.calledOnce( rendererUpdateTextNodeSpy );

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo  abc[]</paragraph>' );
				expect( editor.getData() ).to.equal( '<p>foo &nbsp;abc</p>' );
			} );
		} );
	} );

	describe( 'Android env', () => {
		let domElement, editor, view, viewDocument, insertTextCommandSpy, scrollToTheSelectionSpy, rendererUpdateTextNodeSpy;

		beforeEach( async () => {
			testUtils.sinon.stub( env, 'isAndroid' ).value( true );

			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph, Bold ],
				initialData: '<p>foo</p>'
			} );

			view = editor.editing.view;
			viewDocument = view.document;
			scrollToTheSelectionSpy = testUtils.sinon.stub( view, 'scrollToTheSelection' );
			rendererUpdateTextNodeSpy = sinon.spy( view._renderer, '_updateTextNodeInternal' );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		describe( 'basic typing', () => {
			beforeEach( () => {
				insertTextCommandSpy = testUtils.sinon.stub( editor.commands.get( 'insertText' ), 'execute' );
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

			it( 'should ignore insertText event if requires no model changes', () => {
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				viewDocument.fire( 'insertText', {
					text: 'foo',
					selection: view.createSelection( viewParagraph.getChild( 0 ), 'on' ),
					preventDefault: sinon.spy()
				} );

				sinon.assert.notCalled( insertTextCommandSpy );
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

			it( 'should scroll to the selection after inserting text', async () => {
				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: viewDocument.selection,
					preventDefault: () => {}
				} );

				sinon.assert.calledOnce( insertTextCommandSpy );
				sinon.assert.calledOnce( scrollToTheSelectionSpy );
			} );
		} );

		describe( 'composition', () => {
			beforeEach( () => {
				insertTextCommandSpy = testUtils.sinon.spy( editor.commands.get( 'insertText' ), 'execute' );
			} );

			it( 'should not modify DOM when not needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Type 'a'.
				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'a', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooa[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Type 'b'.
				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'b', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooab[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Type 'c'.
				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'c', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should render the DOM on composition end only when needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should render the DOM on composition end only once when needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				// Note that NBSP is in different order than expected by the DomConverter and Renderer.
				composition.update( '\u00A0 abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Make sure that model is not modified by DOM changes.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo  abc[]</paragraph>' );

				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Commit composition.
				composition.end( '  abc' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node requires NBSP vs space fixing.
				sinon.assert.calledOnce( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo  abc[]</paragraph>' );
				expect( editor.getData() ).to.equal( '<p>foo &nbsp;abc</p>' );
			} );

			it( 'should verify if composed elements are correct after composition', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				const reportedMutations = [];

				viewDocument.on( 'mutations', ( evt, { mutations } ) => {
					reportedMutations.push( ...mutations );
				} );

				// Commit composition.
				composition.end( 'abc' );

				expect( reportedMutations.length ).to.equal( 1 );
				expect( reportedMutations[ 0 ].type ).to.equal( 'children' );
				expect( reportedMutations[ 0 ].node ).to.equal( viewParagraph );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should not fire mutations for removed elements (after composition end)', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				editor.model.change( writer => {
					writer.remove( root.getChild( 0 ) );
					writer.insertElement( 'paragraph', root, 0 );
				} );

				const reportedMutations = [];

				viewDocument.on( 'mutations', ( evt, { mutations } ) => {
					reportedMutations.push( ...mutations );
				} );

				// Commit composition.
				composition.end( 'abc' );

				expect( reportedMutations.length ).to.equal( 0 );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );
			} );

			it( 'should apply changes to model after composed DOM node mutated', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// Simulate DOM changes triggered by IME.
				composition.modifyDom( 'abc', viewRange );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should apply changes to model after composed DOM node mutated inside an attribute element', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => {
					writer.setAttribute( 'bold', true, writer.createRangeIn( root.getChild( 0 ) ) );
					writer.setSelection( root.getChild( 0 ), 'end' );
				} );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ).getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// Simulate DOM changes triggered by IME.
				composition.modifyDom( 'abc', viewRange );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">fooabc[]</$text></paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">fooabc[]</$text></paragraph>' );
			} );

			it( 'should apply changes to model after composed DOM node mutated inside an attribute element (mutations on bold)', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => {
					writer.setAttribute( 'bold', true, writer.createRangeIn( root.getChild( 0 ) ) );
					writer.setSelection( root.getChild( 0 ), 'end' );
				} );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ).getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// Modify DOM element.
				const domText = view.domConverter.viewPositionToDom( viewRange.start ).parent;

				// Inject some element to trigger "children" mutations.
				domText.parentNode.appendChild( domElement.ownerDocument.createElement( 'span' ) );

				// Simulate DOM changes triggered by IME.
				composition.modifyDom( 'abc', viewRange );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">fooabc[]</$text></paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">fooabc[]</$text></paragraph>' );
			} );

			it( 'should apply changes to model after a timeout before DOM mutations', async () => {
				const clock = sinon.useFakeTimers();
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				await clock.tickAsync( 100 );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				sinon.assert.calledOnce( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should apply changes to the model in the position adjusted by other model changes', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				editor.model.change( writer => {
					writer.insertElement( 'paragraph', root, 0 );
				} );

				// Simulate DOM changes triggered by IME.
				composition.modifyDom( 'abc', viewRange );

				// Changes are immediately applied to the model.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph></paragraph><paragraph>fooabc[]</paragraph>' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.notCalled( insertTextCommandSpy );

				// DOM text node is already the proper one so no changes are required.
				sinon.assert.notCalled( rendererUpdateTextNodeSpy );
				rendererUpdateTextNodeSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph></paragraph><paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should commit composition into replaced element', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				editor.model.change( writer => {
					writer.remove( root.getChild( 0 ) );
					writer.insertElement( 'paragraph', root, 0 );
				} );

				// Commit composition.
				composition.end( 'abc' );

				sinon.assert.calledOnce( insertTextCommandSpy );
				insertTextCommandSpy.resetHistory();

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>abc[]</paragraph>' );
			} );

			it( 'should destroy composition queue on editor destroy', async () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				sinon.assert.notCalled( insertTextCommandSpy );

				const queue = editor.plugins.get( 'Input' )._compositionQueue;

				expect( queue.length ).to.equal( 1 );

				await editor.destroy();

				expect( queue.length ).to.equal( 0 );
			} );
		} );
	} );

	function compositionHelper( editor ) {
		const view = editor.editing.view;
		const viewDocument = view.document;
		const inputPlugin = editor.plugins.get( 'Input' );

		return {
			start() {
				viewDocument.fire( 'compositionstart' );
				expect( viewDocument.isComposing ).to.be.true;
			},

			update( data, range ) {
				expect( viewDocument.isComposing ).to.be.true;

				this.fireBeforeInputEvent( data, range );
				this.modifyDom( data, range );
			},

			fireBeforeInputEvent( data, range ) {
				viewDocument.fire( 'beforeinput', new DomEventData( view, {
					target: view.getDomRoot()
				}, {
					data: data.replace( /\u00A0/g, ' ' ),
					inputType: 'insertCompositionText',
					targetRanges: [ range ],
					preventDefault: sinon.spy()
				} ) );
			},

			modifyDom( data, range ) {
				const domRange = view.domConverter.viewRangeToDom( range );

				if ( !domRange.collapsed ) {
					domRange.deleteContents();
				}

				if ( domRange.startContainer.nodeType === 3 ) {
					domRange.startContainer.insertData( domRange.startOffset, data );
				} else {
					throw new Error( 'not supported' ); // TODO
				}

				// Make sure it is always no bigger than 1 entry to avoid problems with position mapping.
				expect( inputPlugin._compositionQueue.length ).to.equal( env.isAndroid ? 1 : 0 );

				window.getSelection().setBaseAndExtent(
					domRange.startContainer, domRange.startOffset + data.length,
					domRange.startContainer, domRange.startOffset + data.length
				);
				window.document.dispatchEvent( new window.Event( 'selectionchange' ) );
			},

			end( data ) {
				expect( viewDocument.isComposing ).to.be.true;

				viewDocument.fire(
					'compositionend',
					new DomEventData( view, {
						preventDefault: sinon.spy()
					}, {
						data
					} )
				);

				expect( viewDocument.isComposing ).to.be.false;
			}
		};
	}
} );
