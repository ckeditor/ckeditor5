/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { getRangeFromMouseEvent } from '../../src/dom/getrangefrommouseevent.js';

describe( 'getRangeFromMouseEvent()', () => {
	it( 'should use Document#caretRangeFromPoint method to obtain range on Webkit & Blink', () => {
		const fakeRange = {
			startOffset: 0,
			endOffset: 0
		};

		const caretRangeFromPointSpy = vi.fn().mockReturnValue( fakeRange );
		const evt = {
			clientX: 10,
			clientY: 11,
			target: {
				ownerDocument: {
					caretRangeFromPoint: caretRangeFromPointSpy
				}
			}
		};

		expect( getRangeFromMouseEvent( evt ) ).toBe( fakeRange );
		expect( caretRangeFromPointSpy ).toHaveBeenCalledWith( 10, 11 );
	} );

	it( 'should use Document#createRange method to obtain range on Firefox', () => {
		const fakeRange = {
			startOffset: 0,
			endOffset: 0,
			setStart: vi.fn(),
			collapse: vi.fn()
		};

		const evt = {
			clientX: 10,
			clientY: 11,
			rangeOffset: 13,
			rangeParent: { parent: true },
			target: {
				ownerDocument: {
					createRange: vi.fn().mockReturnValue( fakeRange )
				}
			}
		};

		expect( getRangeFromMouseEvent( evt ) ).toBe( fakeRange );

		expect( fakeRange.collapse ).toHaveBeenCalledWith( true );
		expect( fakeRange.setStart ).toHaveBeenCalledWith( evt.rangeParent, evt.rangeOffset );
	} );

	it( 'should return null if event target is null', () => {
		const evt = {
			target: null
		};

		expect( getRangeFromMouseEvent( evt ) ).toBeNull();
	} );

	it( 'should return null if event target is not null but it\'s not possible to create range on document', () => {
		const evt = {
			target: {
				ownerDocument: {
					createRange: null,
					caretRangeFromPoint: null
				}
			}
		};

		expect( getRangeFromMouseEvent( evt ) ).toBeNull();
	} );
} );
