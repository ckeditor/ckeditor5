/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Italic from '/ckeditor5/basic-styles/italic.js';
import ItalicEngine from '/ckeditor5/basic-styles/italicengine.js';
import ClassicCreator from '/ckeditor5/creator-classic/classiccreator.js';
import ButtonController from '/ckeditor5/ui/button/button.js';
import testUtils from '/tests/ckeditor5/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'Italic', () => {
	let editor;

	beforeEach( () => {
		editor = new Editor( { 'editor': document.getElementById( 'editor' ) }, {
			creator: ClassicCreator,
			features: [ Italic ],
			toolbar: [ 'italic' ]
		} );

		return editor.init();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Italic ) ).to.be.instanceOf( Italic );
	} );

	it( 'should load BoldEngine', () => {
		expect( editor.plugins.get( ItalicEngine ) ).to.be.instanceOf( ItalicEngine );
	} );

	it( 'should register bold feature component', () => {
		const controller = editor.ui.featureComponents.create( 'italic' );

		expect( controller ).to.be.instanceOf( ButtonController );
	} );

	it( 'should execute bold command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		const controller = editor.ui.featureComponents.create( 'italic' );
		const model = controller.model;

		model.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'italic' );
	} );

	it( 'should bind model to bold command', () => {
		const controller = editor.ui.featureComponents.create( 'italic' );
		const model = controller.model;
		const command = editor.commands.get( 'italic' );

		expect( model.isOn ).to.be.false;
		expect( command.value ).to.be.false;

		expect( model.isEnabled ).to.be.true;
		expect( command.isEnabled ).to.be.true;

		command.value = true;
		expect( model.isOn ).to.equal( true );

		command.isEnabled = false;
		expect( model.isEnabled ).to.equal( false );
	} );
} );
