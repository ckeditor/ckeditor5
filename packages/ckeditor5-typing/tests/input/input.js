/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Input from '../../src/input';
import InputCommand from '../../src/inputcommand';
import { fireBeforeInputDomEvent } from '../_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Input plugin', () => {
	let domElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );
	} );

	afterEach( () => {
		domElement.remove();
	} );

	it( 'should define #pluginName', () => {
		expect( Input.pluginName ).to.equal( 'Input' );
	} );

	describe( 'init()', () => {
		it( 'should register the input command', async () => {
			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input ]
			} );

			expect( editor.commands.get( 'input' ) ).to.be.instanceOf( InputCommand );

			await editor.destroy();
		} );

		it( 'should enable mutations-based input when the Input Events are not supported by the browser', async () => {
			// Force the browser to not use the beforeinput event.
			testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => false );

			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph ],
				initialData: '<p>foo</p>'
			} );

			const inputCommandSpy = testUtils.sinon.spy( editor.commands.get( 'input' ), 'execute' );

			// First, let's try if the mutations work.
			editor.editing.view.document.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foo',
					newText: 'abc',
					node: editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 )
				}
			] );

			sinon.assert.calledOnce( inputCommandSpy );
			sinon.assert.calledWith( inputCommandSpy.firstCall, sinon.match( { text: 'abc' } ) );

			const domRange = document.createRange();
			domRange.selectNodeContents( editor.ui.getEditableElement().firstChild );

			// Then, let's make sure beforeinput is not supported.
			fireBeforeInputDomEvent( editor.ui.getEditableElement(), {
				inputType: 'insertText',
				ranges: [ domRange ],
				data: 'bar'
			} );

			sinon.assert.calledOnce( inputCommandSpy );

			await editor.destroy();
		} );

		it( 'should enable beforeinput-based input when the Input Events are supported by the browser', async () => {
			// Force the browser to use the beforeinput event.
			testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph ],
				initialData: '<p>foo</p>'
			} );

			const inputCommandSpy = testUtils.sinon.spy( editor.commands.get( 'input' ), 'execute' );

			const domRange = document.createRange();
			domRange.selectNodeContents( editor.ui.getEditableElement().firstChild );

			// First, let's try if the beforeinput works.
			fireBeforeInputDomEvent( editor.ui.getEditableElement(), {
				inputType: 'insertText',
				ranges: [ domRange ],
				data: 'bar'
			} );

			sinon.assert.calledOnce( inputCommandSpy );
			sinon.assert.calledWith( inputCommandSpy.firstCall, sinon.match( { text: 'bar' } ) );

			// Then, let's make sure mutations are ignored.
			editor.editing.view.document.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'abc',
					node: editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 )
				}
			] );

			sinon.assert.calledOnce( inputCommandSpy );

			await editor.destroy();
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

		it( 'should return false for a batch not created using the "input" command', () => {
			const batch = model.createBatch();

			expect( inputPlugin.isInput( batch ) ).to.be.false;
		} );
	} );
} );
