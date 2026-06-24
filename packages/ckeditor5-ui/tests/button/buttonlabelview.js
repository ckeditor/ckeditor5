/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ButtonLabelView } from '../../src/index.js';

describe( 'ButtonLabelView', () => {
	let view;

	beforeEach( () => {
		view = new ButtonLabelView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets default properties', () => {
			expect( view.style ).toBeUndefined();
			expect( view.text ).toBeUndefined();
			expect( view.id ).toBeUndefined();
		} );

		it( 'creates an element with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-button__label' ) ).toBe( true );
		} );

		it( 'creates a DOM binding for style', () => {
			view.style = 'color: red';

			expect( view.element.style.color ).toBe( 'red' );
		} );

		it( 'creates a DOM binding for #text', () => {
			view.text = 'foobar';

			expect( view.element.innerHTML ).toBe( 'foobar' );
		} );

		it( 'creates a DOM binding for #id', () => {
			view.id = 'foobar';

			expect( view.id ).toBe( 'foobar' );
		} );
	} );
} );
