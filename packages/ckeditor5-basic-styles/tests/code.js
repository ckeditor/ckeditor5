/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Code from '../src/code';
import CodeEngine from '../src/codeengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

testUtils.createSinonSandbox();

describe( 'Code', () => {
	let editor, codeView;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Code ]
			} )
			.then( newEditor => {
				editor = newEditor;

				codeView = editor.ui.componentFactory.create( 'code' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Code ) ).to.be.instanceOf( Code );
	} );

	it( 'should load CodeEngine', () => {
		expect( editor.plugins.get( CodeEngine ) ).to.be.instanceOf( CodeEngine );
	} );

	it( 'should register code feature component', () => {
		expect( codeView ).to.be.instanceOf( ButtonView );
		expect( codeView.isOn ).to.be.false;
		expect( codeView.label ).to.equal( 'Code' );
		expect( codeView.icon ).to.match( /<svg / );
	} );

	it( 'should execute code command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		codeView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'code' );
	} );

	it( 'should bind model to code command', () => {
		const command = editor.commands.get( 'code' );

		expect( codeView.isOn ).to.be.false;
		expect( codeView.isEnabled ).to.be.true;

		command.value = true;
		expect( codeView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( codeView.isEnabled ).to.be.false;
	} );
} );
