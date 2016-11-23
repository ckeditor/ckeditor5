/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from 'tests/core/_utils/classictesteditor.js';
import Heading from 'ckeditor5/heading/heading.js';
import HeadingEngine from 'ckeditor5/heading/headingengine.js';
import DropdownView from 'ckeditor5/ui/dropdown/dropdownview.js';
import testUtils from 'tests/core/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'Heading', () => {
	let editor, dropdown;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Heading ],
			toolbar: [ 'heading' ]
		} )
		.then( newEditor => {
			editor = newEditor;
			dropdown = editor.ui.componentFactory.create( 'headings' );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Heading ) ).to.be.instanceOf( Heading );
	} );

	it( 'should load HeadingEngine', () => {
		expect( editor.plugins.get( HeadingEngine ) ).to.be.instanceOf( HeadingEngine );
	} );

	describe( 'init()', () => {
		it( 'should register formats feature component', () => {
			const dropdown = editor.ui.componentFactory.create( 'headings' );

			expect( dropdown ).to.be.instanceOf( DropdownView );
			expect( dropdown.buttonView.isEnabled ).to.be.true;
			expect( dropdown.buttonView.isOn ).to.be.undefined;
			expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );
		} );

		it( 'should execute format command on model execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'headings' );

			dropdown.formatId = 'foo';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'heading', { formatId: 'foo' } );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'headings' );

			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		describe( 'model to command binding', () => {
			let command;

			beforeEach( () => {
				command = editor.commands.get( 'heading' );
			} );

			it( 'isEnabled', () => {
				expect( dropdown.buttonView.isEnabled ).to.be.true;
				command.isEnabled = false;
				expect( dropdown.buttonView.isEnabled ).to.be.false;
			} );

			it( 'label', () => {
				expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );
				command.value = command.formats[ 1 ];
				expect( dropdown.buttonView.label ).to.equal( 'Heading 1' );
			} );
		} );
	} );
} );
