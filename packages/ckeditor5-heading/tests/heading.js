/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '/tests/core/_utils/classictesteditor.js';
import Heading from '/ckeditor5/heading/heading.js';
import HeadingEngine from '/ckeditor5/heading/headingengine.js';
import ListDropdown from '/ckeditor5/ui/dropdown/list/listdropdown.js';
import testUtils from '/tests/core/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'Heading', () => {
	let editor, controller;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			features: [ Heading ],
			toolbar: [ 'heading' ]
		} )
		.then( newEditor => {
			editor = newEditor;
			controller = editor.ui.featureComponents.create( 'headings' );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Heading ) ).to.be.instanceOf( Heading );
	} );

	it( 'should load FormatsEngine', () => {
		expect( editor.plugins.get( HeadingEngine ) ).to.be.instanceOf( HeadingEngine );
	} );

	it( 'should register formats feature component', () => {
		const controller = editor.ui.featureComponents.create( 'headings' );

		expect( controller ).to.be.instanceOf( ListDropdown );
	} );

	it( 'should execute format command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		const controller = editor.ui.featureComponents.create( 'headings' );
		const model = controller.model;

		model.id = 'foo';
		model.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'heading', 'foo' );
	} );

	it( 'should focus view after command execution', () => {
		const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		const controller = editor.ui.featureComponents.create( 'headings' );
		const model = controller.model;

		model.fire( 'execute' );

		sinon.assert.calledOnce( focusSpy );
	} );

	describe( 'model to command binding', () => {
		let model, command;

		beforeEach( () => {
			model = controller.model;
			command = editor.commands.get( 'heading' );
		} );

		it( 'isEnabled', () => {
			expect( model.isEnabled ).to.be.true;
			command.isEnabled = false;
			expect( model.isEnabled ).to.be.false;
		} );

		it( 'label', () => {
			expect( model.label ).to.equal( 'Paragraph' );
			command.value = command.formats[ 1 ];
			expect( model.label ).to.equal( 'Heading 1' );
		} );
	} );
} );
