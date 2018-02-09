/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageStyleEditing from '../../src/imagestyle/imagestyleediting';
import ImageStyleUI from '../../src/imagestyle/imagestyleui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'ImageStyleUI', () => {
	let editor;
	const styles = [
		{ name: 'style 1', title: 'Style 1 title', icon: 'style1-icon', isDefault: true },
		{ name: 'style 2', title: 'Style 2 title', icon: 'style2-icon', cssClass: 'style2-class' },
		{ name: 'style 3', title: 'Style 3 title', icon: 'style3-icon', cssClass: 'style3-class' }
	];

	beforeEach( () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageStyleEditing, ImageStyleUI ],
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
				plugins: [ ImageStyleEditing, ImageStyleUI ],
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
