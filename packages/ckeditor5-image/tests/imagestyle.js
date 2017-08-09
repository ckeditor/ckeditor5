/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageStyle from '../src/imagestyle';
import ImageStyleEngine from '../src/imagestyle/imagestyleengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'ImageStyle', () => {
	let editor;
	const styles = [
		{ name: 'style 1', title: 'Style 1 title', icon: 'style1-icon', value: null },
		{ name: 'style 2', title: 'Style 2 title', icon: 'style2-icon', value: 'style2', cssClass: 'style2-class' },
		{ name: 'style 3', title: 'Style 3 title', icon: 'style3-icon', value: 'style3', cssClass: 'style3-class' }
	];

	beforeEach( () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageStyle ],
				image: {
					styles
				}
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageStyle ) ).to.be.instanceOf( ImageStyle );
	} );

	it( 'should load ImageStyleEngine plugin', () => {
		expect( editor.plugins.get( ImageStyleEngine ) ).to.be.instanceOf( ImageStyleEngine );
	} );

	it( 'should register buttons for each style', () => {
		const spy = sinon.spy( editor, 'execute' );

		for ( const style of styles ) {
			const command = editor.commands.get( style.name );
			const buttonView = editor.ui.componentFactory.create( style.name );

			expect( buttonView ).to.be.instanceOf( ButtonView );
			expect( buttonView.label ).to.equal( style.title );
			expect( buttonView.icon ).to.equal( style.icon );

			command.isEnabled = true;
			expect( buttonView.isEnabled ).to.be.true;
			command.isEnabled = false;
			expect( buttonView.isEnabled ).to.be.false;

			buttonView.fire( 'execute' );
			sinon.assert.calledWithExactly( editor.execute, style.name );

			spy.reset();
		}
	} );

	it( 'should not add buttons to image toolbar if configuration is present', () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageStyle ],
				image: {
					styles,
					toolbar: [ 'foo', 'bar' ]
				}
			} )
			.then( newEditor => {
				expect( newEditor.config.get( 'image.toolbar' ) ).to.eql( [ 'foo', 'bar' ] );
				newEditor.destroy();
			} );
	} );
} );
