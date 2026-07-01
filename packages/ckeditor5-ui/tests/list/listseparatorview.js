/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ListSeparatorView } from '../../src/list/listseparatorview.js';

describe( 'ListSeparatorView', () => {
	let view;

	beforeEach( () => {
		view = new ListSeparatorView();

		view.render();
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).toBe( 'LI' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-list__separator' ) ).toBe( true );
		} );
	} );
} );
