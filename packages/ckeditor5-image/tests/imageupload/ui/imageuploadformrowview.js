/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ImageUploadFormRowView from '../../../src/imageupload/ui/imageuploadformrowview';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

describe( 'ImageUploadFormRowView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t: val => val };
		view = new ImageUploadFormRowView( locale );
		view.render();
	} );

	afterEach( () => {
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should create view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
			expect( view.children ).to.have.length( 0 );
		} );

		it( 'should set view#class', () => {
			expect( view.class ).to.be.null;
		} );

		it( 'should set the template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-form__row' ) ).to.be.true;
		} );

		describe( 'options', () => {
			it( 'should set view#class when class was passed', () => {
				const view = new ImageUploadFormRowView( locale, {
					class: 'foo'
				} );

				expect( view.class ).to.equal( 'foo' );

				view.destroy();
			} );

			it( 'should fill view#children when children were passed', () => {
				const view = new ImageUploadFormRowView( locale, {
					children: [
						new View()
					]
				} );

				expect( view.children ).to.have.length( 1 );

				view.destroy();
			} );

			it( 'should use a label view when passed', () => {
				const labelView = new View();
				labelView.id = '123';

				const view = new ImageUploadFormRowView( locale, {
					labelView
				} );

				view.render();

				expect( view.element.getAttribute( 'role' ) ).to.equal( 'group' );
				expect( view.element.getAttribute( 'aria-labelledby' ) ).to.equal( '123' );

				view.destroy();
			} );
		} );

		describe( 'template bindings', () => {
			it( 'should bind #class to the template', () => {
				view.class = 'foo';
				expect( view.element.classList.contains( 'foo' ) ).to.be.true;
			} );

			it( 'should bind #children to the template', () => {
				const child = new View();
				child.setTemplate( { tag: 'div' } );

				view.children.add( child );

				expect( view.element.firstChild ).to.equal( child.element );

				view.destroy();
			} );
		} );
	} );
} );
