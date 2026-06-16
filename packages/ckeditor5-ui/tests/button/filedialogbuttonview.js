/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileDialogButtonView, FileDialogListItemButtonView } from '../../src/button/filedialogbuttonview.ts';
import { ButtonView } from '../../src/button/buttonview.js';
import { ListItemButtonView } from '../../src/button/listitembuttonview.js';
import { View } from '../../src/view.js';

describe( 'FileDialogButtonView', () => {
	let view, localeMock;

	beforeEach( () => {
		localeMock = { t: val => val };
		view = new FileDialogButtonView( localeMock );

		view.render();
	} );

	it( 'should be rendered from a template', () => {
		expect( view.element.classList.contains( 'ck-file-dialog-button' ) ).toBe( true );
	} );

	describe( 'child views', () => {
		describe( 'button view', () => {
			it( 'should be rendered', () => {
				expect( view ).toBeInstanceOf( ButtonView );
			} );

			it( 'should open file dialog on execute', () => {
				const spy = vi.spyOn( view._fileInputView, 'open' );
				vi.spyOn( view._fileInputView.element, 'click' ).mockImplementation( () => {} );
				view.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'file dialog', () => {
			it( 'should be rendered', () => {
				expect( view._fileInputView ).toBeInstanceOf( View );
				expect( view._fileInputView ).toBe( view.children.get( 1 ) );
			} );

			it( 'should be bound to view#acceptedType', () => {
				view.set( { acceptedType: 'audio/*' } );

				expect( view._fileInputView.acceptedType ).toBe( 'audio/*' );
			} );

			it( 'should be bound to view#allowMultipleFiles', () => {
				view.set( { allowMultipleFiles: true } );

				expect( view._fileInputView.allowMultipleFiles ).toBe( true );
			} );

			it( 'should delegate done event to view', () => {
				const spy = vi.fn();
				const files = [];

				view.on( 'done', spy );
				view._fileInputView.fire( 'done', files );

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( files );
			} );
		} );
	} );

	describe( 'FileDialogListItemButtonView', () => {
		it( 'should use list item button view as a base', () => {
			const view = new FileDialogListItemButtonView( localeMock );

			view.render();

			expect( view ).toBeInstanceOf( ListItemButtonView );
			expect( view.element.classList.contains( 'ck-file-dialog-button' ) ).toBe( true );
			expect( view._fileInputView ).toBe( view.children.get( 1 ) );

			view.destroy();
		} );
	} );
} );
