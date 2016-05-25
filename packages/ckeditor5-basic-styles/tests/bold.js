/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Bold from '/ckeditor5/basic-styles/bold.js';
import BoldEngine from '/ckeditor5/basic-styles/boldengine.js';
import ClassicCreator from '/ckeditor5/creator-classic/classiccreator.js';
import ButtonController from '/ckeditor5/ui/button/button.js';
import testUtils from '/tests/ckeditor5/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'Bold', () => {
	let editor;

	beforeEach( () => {
		editor = new Editor( { 'editor': document.getElementById( 'editor' ) }, {
			creator: ClassicCreator,
			features: [ Bold ],
			toolbar: [ 'bold' ]
		} );

		return editor.init();
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Bold ) ).to.be.instanceOf( Bold );
	} );

	it( 'should load BoldEngine', () => {
		expect( editor.plugins.get( BoldEngine ) ).to.be.instanceOf( BoldEngine );
	} );

	it( 'should register bold feature component', () => {
		const controller = editor.ui.featureComponents.create( 'bold' );

		expect( controller ).to.be.instanceOf( ButtonController );
	} );

	it( 'should execute bold command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		const controller = editor.ui.featureComponents.create( 'bold' );
		const model = controller.model;

		model.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'bold' );
	} );

	it( 'should bind model to bold command', () => {
		const controller = editor.ui.featureComponents.create( 'bold' );
		const model = controller.model;
		const command = editor.commands.get( 'bold' );

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
