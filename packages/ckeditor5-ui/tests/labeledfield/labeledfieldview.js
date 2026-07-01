/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { View } from '../../src/view.js';
import { LabeledFieldView } from '../../src/labeledfield/labeledfieldview.js';
import { LabelView } from '../../src/label/labelview.js';
import { ViewCollection } from '../../src/viewcollection.js';

describe( 'LabeledFieldView', () => {
	const locale = {};

	let labeledField, fieldView;

	beforeEach( () => {
		labeledField = new LabeledFieldView( locale, ( labeledField, viewUid, statusUid ) => {
			fieldView = new View( locale );
			fieldView.setTemplate( { tag: 'div' } );
			fieldView.focus = () => {};
			fieldView.viewUid = viewUid;
			fieldView.statusUid = statusUid;

			return fieldView;
		} );

		labeledField.render();
	} );

	afterEach( () => {
		labeledField.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set labeledField#locale', () => {
			expect( labeledField.locale ).toEqual( locale );
		} );

		it( 'should set labeledField#fieldView', () => {
			expect( labeledField.fieldView ).toBe( fieldView );
		} );

		it( 'should set labeledField#label', () => {
			expect( labeledField.label ).toBeUndefined();
		} );

		it( 'should set labeledField#isEnabled', () => {
			expect( labeledField.isEnabled ).toBe( true );
		} );

		it( 'should set labeledField#errorText', () => {
			expect( labeledField.errorText ).toBeNull();
		} );

		it( 'should set labeledField#infoText', () => {
			expect( labeledField.infoText ).toBeNull();
		} );

		it( 'should set labeledField#class', () => {
			expect( labeledField.class ).toBeUndefined();
		} );

		it( 'should set labeledField#isEmpty', () => {
			expect( labeledField.isEmpty ).toBe( true );
		} );

		it( 'should set labeledField#isFocused', () => {
			expect( labeledField.isFocused ).toBe( false );
		} );

		it( 'should create labeledField#labelView', () => {
			expect( labeledField.labelView ).toBeInstanceOf( LabelView );
		} );

		it( 'should create labeledField#statusView', () => {
			expect( labeledField.statusView ).toBeInstanceOf( View );

			expect( labeledField.statusView.element.tagName ).toBe( 'DIV' );
			expect( labeledField.statusView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( labeledField.statusView.element.classList.contains( 'ck-labeled-field-view__status' ) ).toBe( true );
		} );

		it( 'should create a #fieldWrapperChildren collection with #fieldView and #labelView', () => {
			expect( labeledField.fieldWrapperChildren ).toBeInstanceOf( ViewCollection );
			expect( Array.from( labeledField.fieldWrapperChildren ) ).toEqual( [
				labeledField.fieldView, labeledField.labelView
			] );
		} );

		it( 'should allow pairing #view and #labelView by unique id', () => {
			expect( labeledField.labelView.for ).toBe( fieldView.viewUid );
		} );

		it( 'should allow pairing #view and #statusView by unique id', () => {
			expect( fieldView.statusUid ).toBe( labeledField.statusView.element.id );
		} );
	} );

	describe( 'template', () => {
		it( 'should have the CSS class', () => {
			expect( labeledField.element.classList.contains( 'ck' ) ).toBe( true );
			expect( labeledField.element.classList.contains( 'ck-labeled-field-view' ) ).toBe( true );
		} );

		it( 'should have a wrapper for internals', () => {
			expect( labeledField.element.firstChild.classList.contains( 'ck' ) ).toBe( true );
			expect( labeledField.element.firstChild.classList.contains( 'ck-labeled-field-view__input-wrapper' ) ).toBe( true );
		} );

		it( 'should use the #fieldWrapperChildren collection', () => {
			expect( labeledField.template.children[ 0 ].children[ 0 ] ).toBe( labeledField.fieldWrapperChildren );
		} );

		it( 'should have the #statusView container', () => {
			expect( labeledField.template.children[ 1 ] ).toBe( labeledField.statusView );
		} );

		describe( 'DOM bindings', () => {
			describe( 'class', () => {
				it( 'should react on labeledField#class', () => {
					labeledField.class = 'foo';
					expect( labeledField.element.classList.contains( 'foo' ) ).toBe( true );

					labeledField.class = 'bar';
					expect( labeledField.element.classList.contains( 'foo' ) ).toBe( false );
					expect( labeledField.element.classList.contains( 'bar' ) ).toBe( true );
				} );

				it( 'should react on labeledField#isEnabled', () => {
					labeledField.isEnabled = true;
					expect( labeledField.element.classList.contains( 'ck-disabled' ) ).toBe( false );

					labeledField.isEnabled = false;
					expect( labeledField.element.classList.contains( 'ck-disabled' ) ).toBe( true );
				} );

				it( 'should react on labeledField#isEmpty', () => {
					labeledField.isEmpty = true;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_empty' ) ).toBe( true );

					labeledField.isEmpty = false;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_empty' ) ).toBe( false );
				} );

				it( 'should react on labeledField#isFocused', () => {
					labeledField.isFocused = true;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_focused' ) ).toBe( true );

					labeledField.isFocused = false;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_focused' ) ).toBe( false );
				} );

				it( 'should react on labeledField#placeholder', () => {
					labeledField.placeholder = 'asd';
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_placeholder' ) ).toBe( true );

					labeledField.placeholder = null;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_placeholder' ) ).toBe( false );
				} );
			} );

			describe( 'status container', () => {
				it( 'should react on labeledField#errorText', () => {
					const statusElement = labeledField.statusView.element;

					labeledField.errorText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).toBe( true );
					expect( statusElement.classList.contains( 'ck-labeled-field-view__status_error' ) ).toBe( false );
					expect( statusElement.hasAttribute( 'role' ) ).toBe( false );
					expect( statusElement.innerHTML ).toBe( '' );

					labeledField.errorText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).toBe( false );
					expect( statusElement.classList.contains( 'ck-labeled-field-view__status_error' ) ).toBe( true );
					expect( statusElement.getAttribute( 'role' ) ).toBe( 'alert' );
					expect( statusElement.innerHTML ).toBe( 'foo' );
				} );

				it( 'should react on labeledField#infoText', () => {
					const statusElement = labeledField.statusView.element;

					labeledField.infoText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).toBe( true );
					expect( statusElement.classList.contains( 'ck-labeled-field-view__status_error' ) ).toBe( false );
					expect( statusElement.hasAttribute( 'role' ) ).toBe( false );
					expect( statusElement.innerHTML ).toBe( '' );

					labeledField.infoText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).toBe( false );
					expect( statusElement.classList.contains( 'ck-labeled-field-view__status_error' ) ).toBe( false );
					expect( statusElement.hasAttribute( 'role' ) ).toBe( false );
					expect( statusElement.innerHTML ).toBe( 'foo' );
				} );
			} );
		} );
	} );

	describe( 'binding', () => {
		it( 'should bind labeledField#label to labeledField.labelView#label', () => {
			labeledField.label = 'Foo bar';

			expect( labeledField.labelView.text ).toBe( 'Foo bar' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the #view in DOM', () => {
			const spy = vi.spyOn( fieldView, 'focus' );

			labeledField.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should pass down the focus direction parameter', () => {
			const spy = vi.spyOn( fieldView, 'focus' );

			labeledField.focus( -1 );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( -1 );
		} );
	} );
} );
