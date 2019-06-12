/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import Indent from '../src/indent';
import MultiCommand from '../src/multicommand';

describe.only( 'indent', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Indent ] } )
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
		expect( Indent.pluginName ).to.equal( 'Indent' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Indent ) ).to.be.instanceOf( Indent );
	} );

	it( 'should register indent command', () => {
		const command = editor.commands.get( 'indent' );

		expect( command ).to.be.instanceof( MultiCommand );
	} );

	it( 'should register outdent command', () => {
		const command = editor.commands.get( 'outdent' );

		expect( command ).to.be.instanceof( MultiCommand );
	} );

	it( 'should set up button for indent', () => {
		const indentButton = editor.ui.componentFactory.create( 'indent' );

		expect( indentButton ).to.be.instanceOf( ButtonView );
	} );

	it( 'should set up button for indent', () => {
		const outdentButton = editor.ui.componentFactory.create( 'outdent' );

		expect( outdentButton ).to.be.instanceOf( ButtonView );
	} );
} );
