/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Heading from '../src/heading';
import HeadingEngine from '../src/headingengine';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import { add } from '@ckeditor/ckeditor5-utils/src/translation-service';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

add( 'pl', {
	'Paragraph': 'Akapit',
	'Heading 1': 'Nagłówek 1',
	'Heading 2': 'Nagłówek 2',
} );

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
		it( 'should register options feature component', () => {
			const dropdown = editor.ui.componentFactory.create( 'headings' );

			expect( dropdown ).to.be.instanceOf( DropdownView );
			expect( dropdown.buttonView.isEnabled ).to.be.true;
			expect( dropdown.buttonView.isOn ).to.be.undefined;
			expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );
		} );

		it( 'should execute format command on model execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'headings' );

			dropdown.modelElement = 'paragraph';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'paragraph' );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'headings' );

			dropdown.modelElement = 'paragraph';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		describe( 'model to command binding', () => {
			let commands;

			beforeEach( () => {
				commands = editor.plugins.get( HeadingEngine ).commands;
			} );

			it( 'isEnabled', () => {
				for ( let command of commands ) {
					command.isEnabled = false;
				}

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				commands.get( 'heading2' ).isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );

			it( 'label', () => {
				for ( let command of commands ) {
					command.value = false;
				}

				expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );

				commands.get( 'heading2' ).value = true;
				expect( dropdown.buttonView.label ).to.equal( 'Heading 2' );
			} );
		} );

		describe( 'localization', () => {
			let commands;

			beforeEach( () => {
				const editorElement = document.createElement( 'div' );

				return ClassicTestEditor.create( editorElement, {
					plugins: [ Heading ],
					toolbar: [ 'heading' ],
					lang: 'pl',
					heading: {
						options: [
							{ modelElement: 'paragraph', viewElement: 'p', title: 'Paragraph' },
							{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1' },
							{ modelElement: 'heading2', viewElement: 'h3', title: 'Not automatically localized' }
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					dropdown = editor.ui.componentFactory.create( 'headings' );
					commands = editor.plugins.get( HeadingEngine ).commands;
				} );
			} );

			it( 'does not alter the original config', () => {
				expect( editor.config.get( 'heading.options' ) ).to.deep.equal( [
					{ modelElement: 'paragraph', viewElement: 'p', title: 'Paragraph' },
					{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1' },
					{ modelElement: 'heading2', viewElement: 'h3', title: 'Not automatically localized' }
				] );
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).to.equal( 'Akapit' );
				commands.get( 'heading1' ).value = true;
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
