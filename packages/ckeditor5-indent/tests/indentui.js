/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import IndentEditing from '../src/indentediting';
import IndentUI from '../src/indentui';

import indentIcon from '../theme/icons/indent.svg';
import outdentIcon from '../theme/icons/outdent.svg';

describe( 'IndentUI', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ IndentUI, IndentEditing ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( IndentUI.pluginName ).to.equal( 'IndentUI' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( IndentUI ) ).to.be.instanceOf( IndentUI );
	} );

	it( 'should set up button for indent', () => {
		const indentButton = editor.ui.componentFactory.create( 'indent' );

		expect( indentButton ).to.be.instanceOf( ButtonView );
		expect( indentButton.label ).to.equal( 'Increase indent' );
	} );

	it( 'should set up button for outdent', () => {
		const outdentButton = editor.ui.componentFactory.create( 'outdent' );

		expect( outdentButton ).to.be.instanceOf( ButtonView );
		expect( outdentButton.label ).to.equal( 'Decrease indent' );
	} );

	describe( 'icons', () => {
		describe( 'left–to–right UI', () => {
			it( 'should display the right icon for indent', () => {
				const indentButton = editor.ui.componentFactory.create( 'indent' );

				expect( indentButton.icon ).to.equal( indentIcon );
			} );

			it( 'should display the right icon for outdent', () => {
				const outdentButton = editor.ui.componentFactory.create( 'outdent' );

				expect( outdentButton.icon ).to.equal( outdentIcon );
			} );
		} );

		describe( 'right–to–left UI', () => {
			it( 'should display the right icon for indent', () => {
				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				return ClassicTestEditor
					.create( element, {
						plugins: [ IndentUI, IndentEditing ],
						language: 'ar'
					} )
					.then( newEditor => {
						const indentButton = newEditor.ui.componentFactory.create( 'indent' );

						expect( indentButton.icon ).to.equal( outdentIcon );

						return newEditor.destroy();
					} )
					.then( () => {
						element.remove();
					} );
			} );

			it( 'should display the right icon for outdent', () => {
				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				return ClassicTestEditor
					.create( element, {
						plugins: [ IndentUI, IndentEditing ],
						language: 'ar'
					} )
					.then( newEditor => {
						const outdentButton = newEditor.ui.componentFactory.create( 'outdent' );

						expect( outdentButton.icon ).to.equal( indentIcon );

						return newEditor.destroy();
					} )
					.then( () => {
						element.remove();
					} );
			} );
		} );
	} );

	it( 'should execute indent command on button execute', () => {
		const button = editor.ui.componentFactory.create( 'indent' );
		const spy = sinon.spy( editor, 'execute' );

		button.fire( 'execute' );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWithExactly( spy, 'indent' );
	} );

	it( 'should execute outdent command on button execute', () => {
		const button = editor.ui.componentFactory.create( 'outdent' );
		const spy = sinon.spy( editor, 'execute' );

		button.fire( 'execute' );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWithExactly( spy, 'outdent' );
	} );
} );
