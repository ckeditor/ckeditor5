/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaFormView } from '../../src/ui/mediaformview.js';
import { View } from '@ckeditor/ckeditor5-ui';
import { KeystrokeHandler, FocusTracker } from '@ckeditor/ckeditor5-utils';

describe( 'MediaFormView', () => {
	let view;

	beforeEach( () => {
		view = new MediaFormView( [], { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'accepts validators', () => {
			const validators = [];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view._validators ).toBe( validators );
		} );

		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-media-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).toBe( true );
			expect( view.element.getAttribute( 'tabindex' ) ).toBe( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.urlInputView ).toBeInstanceOf( View );

			expect( view._unboundChildren.get( 0 ) ).toBe( view.urlInputView );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		describe( 'url input view', () => {
			it( 'has info text', () => {
				expect( view.urlInputView.infoText ).toMatch( /^Paste the media URL/ );
			} );

			it( 'displays the tip upon #input when the field has a value', () => {
				view.urlInputView.fieldView.element.value = 'foo';
				view.urlInputView.fieldView.fire( 'input' );

				expect( view.urlInputView.infoText ).toMatch( /^Tip: Paste the URL into/ );

				view.urlInputView.fieldView.element.value = '';
				view.urlInputView.fieldView.fire( 'input' );

				expect( view.urlInputView.infoText ).toMatch( /^Paste the media URL/ );
			} );
		} );

		describe( 'template', () => {
			it( 'has url input view', () => {
				expect( view.template.children[ 0 ] ).toBe( view.urlInputView );
			} );

			it( 'has button views', () => {
				expect( view.template.children[ 1 ] ).toBe( view.saveButtonView );
				expect( view.template.children[ 2 ] ).toBe( view.cancelButtonView );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child view #element in #focusTracker', () => {
			const view = new MediaFormView( [], { t: () => {} } );

			const spy = vi.spyOn( view.focusTracker, 'add' );

			view.render();

			expect( spy ).toHaveBeenNthCalledWith( 1, view.urlInputView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new MediaFormView( [], { t: () => {} } );

			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();
			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( view.element );

			view.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( view.focusTracker, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( view.keystrokes, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'submit event', () => {
			it( 'should trigger submit event', () => {
				const spy = vi.fn();

				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #urlInputView', () => {
			const spy = vi.spyOn( view.urlInputView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'url()', () => {
		it( 'returns the #inputView DOM value', () => {
			view.urlInputView.fieldView.element.value = 'foo';

			expect( view.url ).toBe( 'foo' );
		} );

		it( 'sets the #inputView DOM value', () => {
			view.urlInputView.fieldView.element.value = 'bar';

			view.url = 'foo';
			expect( view.urlInputView.fieldView.element.value ).toBe( 'foo' );

			view.url = ' baz ';
			expect( view.urlInputView.fieldView.element.value ).toBe( 'baz' );
		} );
	} );

	describe( 'isValid()', () => {
		it( 'calls resetFormStatus()', () => {
			const spy = vi.spyOn( view, 'resetFormStatus' );

			view.isValid();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'returns false when at least one validator has failed', () => {
			const val1 = vi.fn().mockReturnValue( 'some error' );
			const val2 = vi.fn().mockReturnValue( false );
			const validators = [ val1, val2 ];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view.isValid() ).toBe( false );

			expect( val1 ).toHaveBeenCalledOnce();
			expect( val2 ).not.toHaveBeenCalled();

			expect( view.urlInputView.errorText ).toBe( 'some error' );
		} );

		it( 'returns true when all validators passed', () => {
			const val1 = vi.fn().mockReturnValue( false );
			const val2 = vi.fn().mockReturnValue( false );
			const validators = [ val1, val2 ];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view.isValid() ).toBe( true );

			expect( val1 ).toHaveBeenCalledOnce();
			expect( val2 ).toHaveBeenCalledOnce();

			expect( view.urlInputView.errorText ).toBeNull();
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'resets urlInputView#errorText', () => {
			view.urlInputView.errorText = 'foo';

			view.resetFormStatus();

			expect( view.urlInputView.errorText ).toBeNull();
		} );

		it( 'resets urlInputView#infoText', () => {
			view.urlInputView.infoText = 'foo';

			view.resetFormStatus();

			expect( view.urlInputView.infoText ).toMatch( /^Paste the media URL/ );
		} );
	} );
} );
