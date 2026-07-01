/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ToolbarLineBreakView } from '../../src/toolbar/toolbarlinebreakview.js';

describe( 'ToolbarLineBreakView', () => {
	let view;

	beforeEach( () => {
		view = new ToolbarLineBreakView();

		view.render();
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).toBe( 'SPAN' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-toolbar__line-break' ) ).toBe( true );
		} );
	} );
} );
