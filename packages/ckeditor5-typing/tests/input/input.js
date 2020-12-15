/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Input from '../../src/input';
import InputCommand from '../../src/inputcommand';
import InsertTextCommand from '../../src/inserttextcommand';
import { fireBeforeInputDomEvent } from '../_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import env from '@ckeditor/ckeditor5-utils/src/env';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Input', () => {
	describe( 'Input plugin', () => {
		let domElement;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			testUtils.sinon.stub( global.window.console, 'warn' );
		} );

		afterEach( () => {
			domElement.remove();
		} );

		it( 'should define #pluginName', () => {
			expect( Input.pluginName ).to.equal( 'Input' );
		} );

		describe( 'init()', () => {
			it( 'should register the input command (deprecated)', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input ]
				} );

				expect( editor.commands.get( 'input' ) ).to.be.instanceOf( InputCommand );

				await editor.destroy();
			} );

			it( 'should register the insert text command', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input ]
				} );

				expect( editor.commands.get( 'insertText' ) ).to.be.instanceOf( InsertTextCommand );

				await editor.destroy();
			} );

			it( 'should enable mutations-based input when the Input Events are not supported by the browser', async () => {
				// Force the browser to not use the beforeinput event.
				testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => false );

				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input, Paragraph ],
					initialData: '<p>foo</p>'
				} );

				const insertTextCommandSpy = testUtils.sinon.spy( editor.commands.get( 'insertText' ), 'execute' );

				// First, let's try if the mutations work.
				editor.editing.view.document.fire( 'mutations', [
					{
						type: 'text',
						oldText: 'foo',
						newText: 'abc',
						node: editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 )
					}
				] );

				const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];
				const expectedSelection = editor.model.createSelection(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 3 )
				);

				sinon.assert.calledOnce( insertTextCommandSpy );
				expect( firstCallArgs.text ).to.equal( 'abc' );
				expect( firstCallArgs.selection.isEqual( expectedSelection ) ).to.be.true;

				const domRange = document.createRange();
				domRange.selectNodeContents( editor.ui.getEditableElement().firstChild );

				// Then, let's make sure beforeinput is not supported.
				fireBeforeInputDomEvent( editor.ui.getEditableElement(), {
					inputType: 'insertText',
					ranges: [ domRange ],
					data: 'bar'
				} );

				sinon.assert.calledOnce( insertTextCommandSpy );

				await editor.destroy();
			} );

			it( 'should enable beforeinput-based input when the Input Events are supported by the browser', async () => {
				// Force the browser to use the beforeinput event.
				testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input, Paragraph ],
					initialData: '<p>foo</p>'
				} );

				const insertTextCommandSpy = testUtils.sinon.spy( editor.commands.get( 'insertText' ), 'execute' );

				const domRange = document.createRange();
				domRange.selectNodeContents( editor.ui.getEditableElement().firstChild );

				// First, let's try if the beforeinput works.
				fireBeforeInputDomEvent( editor.ui.getEditableElement(), {
					inputType: 'insertText',
					ranges: [ domRange ],
					data: 'bar'
				} );

				const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];
				const expectedSelection = editor.model.createSelection(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 3 )
				);

				sinon.assert.calledOnce( insertTextCommandSpy );
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( expectedSelection ) ).to.be.true;

				// Then, let's make sure mutations are ignored.
				editor.editing.view.document.fire( 'mutations', [
					{
						type: 'text',
						oldText: 'foobar',
						newText: 'abc',
						node: editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 )
					}
				] );

				sinon.assert.calledOnce( insertTextCommandSpy );

				await editor.destroy();
			} );

			describe( 'insertText view document event handling', () => {
				let editor, view, viewDocument, insertTextCommandSpy;

				beforeEach( async () => {
					editor = await ClassicTestEditor.create( domElement, {
						plugins: [ Input, Paragraph ],
						initialData: '<p>foo</p>'
					} );

					view = editor.editing.view;
					viewDocument = view.document;
					insertTextCommandSpy = testUtils.sinon.stub( editor.commands.get( 'insertText' ), 'execute' );
				} );

				afterEach( async () => {
					await editor.destroy();
				} );

				it( 'should have the text property passed correctly to the insert text command', async () => {
					viewDocument.fire( 'insertText', {
						text: 'bar'
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
						)
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
						)
					} );

					const firstCallArgs = insertTextCommandSpy.firstCall.args[ 0 ];

					sinon.assert.calledOnce( insertTextCommandSpy );
					expect( firstCallArgs.text ).to.equal( 'bar' );
					expect( firstCallArgs.selection.isEqual( expectedSelection ) ).to.be.true;
					expect( firstCallArgs.resultRange.isEqual( expectedRange ) ).to.be.true;
				} );
			} );
		} );

		describe( 'isInput()', () => {
			let editor, inputPlugin, model;

			beforeEach( async () => {
				editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input, Paragraph ],
					initialData: '<p>foo</p>'
				} );

				inputPlugin = editor.plugins.get( 'Input' );
				model = editor.model;
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should return true for a batch created using the "input" command', done => {
				model.document.once( 'change:data', ( evt, batch ) => {
					expect( inputPlugin.isInput( batch ) ).to.be.true;
					done();
				} );

				editor.execute( 'input', { text: 'foo' } );
			} );

			it( 'should return true for a batch created using the "insertText" command', done => {
				model.document.once( 'change:data', ( evt, batch ) => {
					expect( inputPlugin.isInput( batch ) ).to.be.true;
					done();
				} );

				editor.execute( 'insertText', { text: 'foo' } );
			} );

			it( 'should return false for a batch not created using the "input" or "inputText" commands', () => {
				const batch = model.createBatch();

				expect( inputPlugin.isInput( batch ) ).to.be.false;
			} );
		} );
	} );
} );
