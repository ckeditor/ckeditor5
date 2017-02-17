/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Heading from '../src/heading';
import HeadingEngine from '../src/headingengine';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

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

		describe( 'localization', () => {
			let command;

			beforeEach( () => {
				const editorElement = document.createElement( 'div' );
				const spy = testUtils.sinon.stub( Locale.prototype, '_t' ).returns( 'foo' );

				spy.withArgs( 'Paragraph' ).returns( 'Akapit' );
				spy.withArgs( 'Heading 1' ).returns( 'Nagłówek 1' );
				spy.withArgs( 'Heading 2' ).returns( 'Nagłówek 2' );

				return ClassicTestEditor.create( editorElement, {
					plugins: [ Heading ],
					toolbar: [ 'heading' ],
					heading: {
						formats: [
							{ id: 'paragraph', element: 'p', label: 'Paragraph' },
							{ id: 'heading1', element: 'h2', label: 'Heading 1' },
							{ id: 'heading2', element: 'h3', label: 'Not automatically localized' }
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					dropdown = editor.ui.componentFactory.create( 'headings' );
					command = editor.commands.get( 'heading' );
				} );
			} );

			it( 'does not alter the original config', () => {
				expect( editor.config.get( 'heading.formats' ) ).to.deep.equal( [
					{ id: 'paragraph', element: 'p', label: 'Paragraph' },
					{ id: 'heading1', element: 'h2', label: 'Heading 1' },
					{ id: 'heading2', element: 'h3', label: 'Not automatically localized' }
				] );
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).to.equal( 'Akapit' );
				command.value = command.formats[ 1 ];
				expect( buttonView.label ).to.equal( 'Nagłówek 1' );
			} );

			it( 'works for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( listView.items.map( item => item.label ) ).to.deep.equal( [
					'Akapit',
					'Nagłówek 1',
					'Not automatically localized'
				] );
			} );
		} );
	} );
} );
