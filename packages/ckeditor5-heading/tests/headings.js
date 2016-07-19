/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '/tests/ckeditor5/_utils/classictesteditor.js';
import Headings from '/ckeditor5/headings/headings.js';
import HeadingsEngine from '/ckeditor5/headings/headingsengine.js';
import ListDropdown from '/ckeditor5/ui/dropdown/list/listdropdown.js';
import testUtils from '/tests/ckeditor5/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'Headings', () => {
	let editor, controller;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			features: [ Headings ],
			toolbar: [ 'headings' ]
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
		expect( editor.plugins.get( Headings ) ).to.be.instanceOf( Headings );
	} );

	it( 'should load FormatsEngine', () => {
		expect( editor.plugins.get( HeadingsEngine ) ).to.be.instanceOf( HeadingsEngine );
	} );

	it( 'should register formats feature component', () => {
		const controller = editor.ui.featureComponents.create( 'headings' );

		expect( controller ).to.be.instanceOf( ListDropdown );
	} );

	it( 'should execute format command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		const controller = editor.ui.featureComponents.create( 'headings' );
		const model = controller.model.content;

		model.fire( 'execute', { id: 'paragraph', label: 'Paragraph' } );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'headings', 'paragraph' );
	} );

	it( 'should focus view after command execution', () => {
		const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		const controller = editor.ui.featureComponents.create( 'headings' );
		const model = controller.model.content;

		model.fire( 'execute', { id: 'paragraph', label: 'Paragraph' } );

		sinon.assert.calledOnce( focusSpy );
	} );

	describe( 'model to command binding', () => {
		let model, command;

		beforeEach( () => {
			model = controller.model;
			command = editor.commands.get( 'headings' );
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
