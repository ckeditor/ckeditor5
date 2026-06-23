/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { createViewDocumentMock } from '../../../tests/view/_utils/createdocumentmock.js';

describe( 'createViewDocumentMock', () => {
	it( 'should create document mock', () => {
		const docMock = createViewDocumentMock();
		const rootMock = {};

		const isFocusedSpy = vi.fn();
		const isReadOnlySpy = vi.fn();

		docMock.on( 'change:selectedEditable', ( evt, key, value ) => {
			expect( value ).toBe( rootMock );
		} );

		docMock.on( 'change:isFocused', isFocusedSpy );
		docMock.on( 'change:isReadOnly', isReadOnlySpy );

		docMock.isFocused = true;
		docMock.isReadOnly = true;

		expect( isFocusedSpy ).toHaveBeenCalledOnce();
		expect( isFocusedSpy.mock.lastCall[ 2 ] ).toBe( true );
		expect( isReadOnlySpy ).toHaveBeenCalledOnce();
		expect( isReadOnlySpy.mock.lastCall[ 2 ] ).toBe( true );
	} );
} );
