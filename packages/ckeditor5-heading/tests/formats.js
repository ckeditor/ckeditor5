/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ClassicTestEditor from '/tests/ckeditor5/_utils/classictesteditor.js';
import Formats from '/ckeditor5/formats/formats.js';
import FormatsEngine from '/ckeditor5/formats/formatsengine.js';
import ListDropdown from '/ckeditor5/ui/dropdown/list/listdropdown.js';
import testUtils from '/tests/ckeditor5/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'Formats', () => {
	let editor;

	beforeEach( () => {
		return ClassicTestEditor.create( document.getElementById( 'editor' ), {
			features: [ Formats ],
			toolbar: [ 'formats' ]
		} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Formats ) ).to.be.instanceOf( Formats );
	} );

	it( 'should load FormatsEngine', () => {
		expect( editor.plugins.get( FormatsEngine ) ).to.be.instanceOf( FormatsEngine );
	} );

	it( 'should register formats feature component', () => {
		const controller = editor.ui.featureComponents.create( 'formats' );

		expect( controller ).to.be.instanceOf( ListDropdown );
	} );

	it( 'should execute format command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		const controller = editor.ui.featureComponents.create( 'formats' );
		const model = controller.model.content;

		model.fire( 'execute', { id: 'paragraph', label: 'Paragraph' } );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'format', 'paragraph' );
	} );
} );
