/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { ButtonView, createLabeledInputText, IconView } from '@ckeditor/ckeditor5-ui';
import { SearchTextQueryView } from '../../../src/search/text/searchtextqueryview.js';
import { IconCancel, IconLoupe } from '@ckeditor/ckeditor5-icons';

describe( 'SearchTextQueryView', () => {
	let locale, view;

	beforeEach( () => {
		locale = new Locale();

		view = new SearchTextQueryView( locale, {
			creator: createLabeledInputText,
			label: 'Test'
		} );

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'should have a label', () => {
			expect( view.label ).toBe( 'Test' );
		} );

		describe( 'reset value button', () => {
			it( 'should be created by default', () => {
				const resetButtonView = view.fieldWrapperChildren.last;

				expect( resetButtonView ).toBe( view.resetButtonView );
				expect( resetButtonView ).toBeInstanceOf( ButtonView );
				expect( resetButtonView.isVisible ).toBe( false );
				expect( resetButtonView.tooltip ).toBe( true );
				expect( resetButtonView.class ).toBe( 'ck-search__reset' );
				expect( resetButtonView.label ).toBe( 'Clear' );
				expect( resetButtonView.icon ).toBe( IconCancel );
			} );

			it( 'should reset the search field value upon #execute', () => {
				const resetSpy = vi.spyOn( view, 'reset' );

				view.resetButtonView.fire( 'execute' );

				expect( resetSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should focus the field view upon #execute', () => {
				const focusSpy = vi.spyOn( view, 'focus' );

				view.resetButtonView.fire( 'execute' );

				expect( focusSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should get hidden upon #execute', () => {
				view.resetButtonView.isVisible = true;

				view.resetButtonView.fire( 'execute' );

				expect( view.resetButtonView.isVisible ).toBe( false );
			} );

			it( 'should fire the #reset event upon #execute', () => {
				const spy = vi.fn();

				view.on( 'reset', spy );

				view.resetButtonView.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should be possible to hide using view\'s configuration', () => {
				const view = new SearchTextQueryView( locale, {
					creator: createLabeledInputText,
					label: 'Test',
					showResetButton: false
				} );

				expect( view.resetButtonView ).toBeUndefined();
				expect( view.fieldWrapperChildren.last ).toBe( view.labelView );

				view.destroy();
			} );
		} );

		describe( 'icon', () => {
			it( 'should be added to the view by default', () => {
				const iconView = view.fieldWrapperChildren.first;

				expect( view.iconView ).toBe( iconView );
				expect( iconView ).toBe( view.iconView );
				expect( iconView ).toBeInstanceOf( IconView );
				expect( iconView.content ).toBe( IconLoupe );
			} );

			it( 'should be possible to hide using view\'s configuration', () => {
				const view = new SearchTextQueryView( locale, {
					creator: createLabeledInputText,
					label: 'Test',
					showIcon: false
				} );

				expect( view.iconView ).toBeUndefined();
				expect( view.fieldWrapperChildren.first ).toBe( view.fieldView );

				view.destroy();
			} );
		} );

		describe( '#input event', () => {
			it( 'should toggle visibility of the clear value button', () => {
				view.fieldView.value = 'foo';
				view.fieldView.fire( 'input' );

				expect( view.resetButtonView.isVisible ).toBe( true );

				view.fieldView.value = '';
				view.fieldView.fire( 'input' );

				expect( view.resetButtonView.isVisible ).toBe( false );
			} );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should not update resetButtonView visibility if showResetButton is false', () => {
			const viewWithoutReset = new SearchTextQueryView( locale, {
				creator: createLabeledInputText,
				label: 'Test',
				showResetButton: false
			} );

			viewWithoutReset.render();

			expect( () => viewWithoutReset.reset() ).not.toThrow();

			viewWithoutReset.destroy();
		} );

		it( 'should not fire the #reset event', () => {
			const spy = vi.fn();

			view.on( 'reset', spy );

			view.reset();

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should clear the field view value in DOM', () => {
			view.fieldView.element.value = 'foo';

			view.reset();

			expect( view.fieldView.element.value ).toBe( '' );
		} );

		it( 'should clear the field view value in InputView', () => {
			view.fieldView.value = 'foo';

			view.reset();

			expect( view.fieldView.value ).toBe( '' );
		} );
	} );
} );
