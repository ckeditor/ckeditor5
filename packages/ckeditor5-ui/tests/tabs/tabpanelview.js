/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { global, Locale } from '@ckeditor/ckeditor5-utils';

import { TabPanelView } from '../../src/tabs/tabpanelview.js';

describe( 'TabPanelView', () => {
	let domElement, view;

	beforeEach( () => {
		domElement = global.document.createElement( 'div' );
		view = new TabPanelView( new Locale() );

		view.render();
		domElement.appendChild( view.element );
	} );

	afterEach( () => {
		view = null;
		domElement.remove();
	} );

	describe( 'template', () => {
		it( 'should have dedicated CSS class', () => {
			expect( view.element.classList.contains( 'ck-tab-panel' ) ).toBe( true );
		} );

		it( 'should apply class passed in the constructor', () => {
			const customClass = 'custom-class';
			const testView = new TabPanelView( new Locale(), { class: customClass } );

			testView.render();

			expect( testView.element.classList.contains( customClass ) ).toBe( true );
		} );
	} );

	describe( '#show()', () => {
		it( 'should no nothing if there is no element', () => {
			const testView = new TabPanelView( new Locale() );

			expect( () => testView.show() ).not.toThrow();
		} );

		it( 'should add "ck-hidden" class to the element', () => {
			view.show();

			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( false );
		} );
	} );

	describe( '#hide()', () => {
		it( 'should no nothing if there is no element', () => {
			const testView = new TabPanelView( new Locale() );

			expect( () => testView.hide() ).not.toThrow();
		} );

		it( 'should add "ck-hidden" class to the element', () => {
			view.hide();

			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( true );
		} );
	} );
} );
