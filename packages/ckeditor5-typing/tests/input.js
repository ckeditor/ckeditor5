/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Input from '../src/input';
import InsertTextCommand from '../src/inserttextcommand';

describe( 'Input', () => {
	describe( 'Input plugin', () => {
		let domElement, editor, view, viewDocument, insertTextCommandSpy;

		testUtils.createSinonSandbox();

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
			it( 'should register the input command (deprecated)', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input ]
				} );

				expect( editor.commands.get( 'input' ) ).to.be.instanceOf( InsertTextCommand );

				await editor.destroy();
			} );

			it( 'should register the insert text command', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input ]
				} );

				expect( editor.commands.get( 'insertText' ) ).to.be.instanceOf( InsertTextCommand );

				await editor.destroy();
			} );

			it( 'should always preventDefault() the original beforeinput event', () => {
				const spy = sinon.spy();

				viewDocument.fire( 'insertText', {
					preventDefault: spy,
					selection: viewDocument.selection,
					text: 'bar'
				} );

				sinon.assert.calledOnce( spy );
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
		} );
	} );
} );
