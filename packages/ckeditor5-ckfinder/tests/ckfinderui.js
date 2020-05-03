/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import CKFinder from '../src/ckfinder';
import browseFilesIcon from '../theme/icons/browse-files.svg';

describe( 'CKFinderUI', () => {
	let editorElement, editor, button;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ CKFinder ]

			} )
			.then( newEditor => {
				editor = newEditor;
				button = editor.ui.componentFactory.create( 'ckfinder' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should add the "ckfinder" component to the factory', () => {
		expect( button ).to.be.instanceOf( ButtonView );
	} );

	describe( 'button', () => {
		it( 'should bind #isEnabled to the command', () => {
			const command = editor.commands.get( 'ckfinder' );

			command.isEnabled = true;
			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should set a #label of the #buttonView', () => {
			expect( button.label ).to.equal( 'Insert image or file' );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).to.equal( browseFilesIcon );
		} );

		it( 'should enable tooltips for the #buttonView', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should execute bold command on model execute event', () => {
			window.CKFinder = {
				modal: () => {}
			};

			const executeStub = testUtils.sinon.spy( editor, 'execute' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( executeStub );
		} );
	} );
} );
