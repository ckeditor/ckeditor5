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

			dropdown.commandName = 'paragraph';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'paragraph' );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'headings' );

			dropdown.commandName = 'paragraph';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		describe( 'model to command binding', () => {
			let commands;

			beforeEach( () => {
				commands = {};

				editor.config.get( 'heading.options' ).forEach( ( { modelElement } ) => {
					commands[ modelElement ] = editor.commands.get( modelElement );
				} );
			} );

			it( 'isEnabled', () => {
				for ( let name in commands ) {
					commands[ name ].isEnabled = false;
				}

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				commands.heading2.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );

			it( 'label', () => {
				for ( let name in commands ) {
					commands[ name ].value = false;
				}

				expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );

				commands.heading2.value = true;
				expect( dropdown.buttonView.label ).to.equal( 'Heading 2' );
			} );
		} );

		describe( 'localization', () => {
			let commands;

			beforeEach( () => {
				return localizedEditor( [
					{ modelElement: 'paragraph', title: 'Paragraph' },
					{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1' },
					{ modelElement: 'heading2', viewElement: 'h3', title: 'Heading 2' }
				] );
			} );

			it( 'does not alter the original config', () => {
				expect( editor.config.get( 'heading.options' ) ).to.deep.equal( [
					{ modelElement: 'paragraph', title: 'Paragraph' },
					{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1' },
					{ modelElement: 'heading2', viewElement: 'h3', title: 'Heading 2' }
				] );
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).to.equal( 'Akapit' );
				commands.heading1.value = true;
				expect( buttonView.label ).to.equal( 'Nagłówek 1' );
			} );

			it( 'works for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( listView.items.map( item => item.label ) ).to.deep.equal( [
					'Akapit',
					'Nagłówek 1',
					'Nagłówek 2'
				] );
			} );

			it( 'allows custom titles', () => {
				return localizedEditor( [
					{ modelElement: 'paragraph', title: 'Custom paragraph title' },
					{ modelElement: 'heading1', title: 'Custom heading1 title' }
				] ).then( () => {
					const listView = dropdown.listView;

					expect( listView.items.map( item => item.label ) ).to.deep.equal( [
						'Custom paragraph title',
						'Custom heading1 title',
					] );
				} );
			} );

			it( 'translates default using the the locale', () => {
				return localizedEditor( [
					{ modelElement: 'paragraph', title: 'Paragraph' }
				] ).then( () => {
					const listView = dropdown.listView;

					expect( listView.items.map( item => item.label ) ).to.deep.equal( [
						'Akapit'
					] );
				} );
			} );

			function localizedEditor( options ) {
				const editorElement = document.createElement( 'div' );

				return ClassicTestEditor.create( editorElement, {
					plugins: [ Heading ],
					toolbar: [ 'heading' ],
					lang: 'pl',
					heading: {
						options: options
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					dropdown = editor.ui.componentFactory.create( 'headings' );
					commands = {};
					editor.config.get( 'heading.options' ).forEach( ( { modelElement } ) => {
						commands[ modelElement ] = editor.commands.get( modelElement );
					} );
				} );
			}
		} );
	} );
} );
