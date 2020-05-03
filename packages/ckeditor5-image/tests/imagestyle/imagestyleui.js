/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageStyleEditing from '../../src/imagestyle/imagestyleediting';
import ImageStyleUI from '../../src/imagestyle/imagestyleui';
import ImageEditing from '../../src/image/imageediting';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

describe( 'ImageStyleUI', () => {
	let editor, editorElement;

	const styles = [
		{ name: 'style 1', title: 'Style 1 title', icon: 'style1-icon', isDefault: true },
		{ name: 'style 2', title: 'Style 2 title', icon: 'style2-icon', cssClass: 'style2-class' },
		{ name: 'style 3', title: 'Style 3 title', icon: 'style3-icon', cssClass: 'style3-class' }
	];

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles
				}
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ImageStyleUI.pluginName ).to.equal( 'ImageStyleUI' );
	} );

	it( 'should register buttons for each style', () => {
		const spy = sinon.spy( editor, 'execute' );

		const command = editor.commands.get( 'imageStyle' );

		for ( const style of styles ) {
			const buttonView = editor.ui.componentFactory.create( `imageStyle:${ style.name }` );

			expect( buttonView ).to.be.instanceOf( ButtonView );
			expect( buttonView.label ).to.equal( style.title );
			expect( buttonView.icon ).to.equal( style.icon );
			expect( buttonView.isToggleable ).to.be.true;

			command.isEnabled = true;
			expect( buttonView.isEnabled ).to.be.true;
			command.isEnabled = false;
			expect( buttonView.isEnabled ).to.be.false;

			buttonView.fire( 'execute' );
			sinon.assert.calledWithExactly( editor.execute, 'imageStyle', { value: style.name } );

			spy.resetHistory();
		}
	} );

	it( 'should translate buttons if taken from default styles', () => {
		const editorElement = global.document.createElement( 'div' );

		global.document.body.appendChild( editorElement );

		class TranslationMock extends Plugin {
			init() {
				sinon.stub( this.editor, 't' ).returns( 'Default title' );
			}
		}

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TranslationMock, ImageEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: [
						{ name: 'style 1', title: 'Side image', icon: 'style1-icon', isDefault: true }
					]
				}
			} )
			.then( newEditor => {
				const buttonView = newEditor.ui.componentFactory.create( 'imageStyle:style 1' );

				expect( buttonView.label ).to.equal( 'Default title' );

				editorElement.remove();
				return newEditor.destroy();
			} );
	} );

	it( 'should not add buttons to image toolbar if configuration is present', () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles,
					toolbar: [ 'foo', 'bar' ]
				}
			} )
			.then( newEditor => {
				expect( newEditor.config.get( 'image.toolbar' ) ).to.deep.equal( [ 'foo', 'bar' ] );

				editorElement.remove();
				return newEditor.destroy();
			} );
	} );

	describe( 'localizedDefaultStylesTitles()', () => {
		it( 'should return localized titles of default styles', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleUI ]
				} )
				.then( newEditor => {
					const plugin = newEditor.plugins.get( ImageStyleUI );

					expect( plugin.localizedDefaultStylesTitles ).to.deep.equal( {
						'Full size image': 'Full size image',
						'Side image': 'Side image',
						'Left aligned image': 'Left aligned image',
						'Centered image': 'Centered image',
						'Right aligned image': 'Right aligned image'
					} );

					return newEditor.destroy();
				} );
		} );
	} );
} );
