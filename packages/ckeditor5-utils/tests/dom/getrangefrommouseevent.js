/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import getRangeFromMouseEvent from '../../src/dom/getrangefrommouseevent.js';

describe( 'getRangeFromMouseEvent()', () => {
	it( 'should use Document#caretRangeFromPoint method to obtain range on Webkit & Blink', () => {
		const fakeRange = {
			startOffset: 0,
			endOffset: 0
		};

		const caretRangeFromPointSpy = sinon.stub().returns( fakeRange );
		const evt = {
			clientX: 10,
			clientY: 11,
			target: {
				ownerDocument: {
					caretRangeFromPoint: caretRangeFromPointSpy
				}
			}
		};

		expect( getRangeFromMouseEvent( evt ) ).to.be.equal( fakeRange );
		expect( caretRangeFromPointSpy ).to.be.calledWith( 10, 11 );
	} );

	it( 'should use Document#createRange method to obtain range on Firefox', () => {
		const fakeRange = {
			startOffset: 0,
			endOffset: 0,
			setStart: sinon.stub(),
			collapse: sinon.stub()
		};

		const evt = {
			clientX: 10,
			clientY: 11,
			rangeOffset: 13,
			rangeParent: { parent: true },
			target: {
				ownerDocument: {
					createRange: sinon.stub().returns( fakeRange )
				}
			}
		};

		expect( getRangeFromMouseEvent( evt ) ).to.be.equal( fakeRange );

		expect( fakeRange.collapse ).to.be.calledWith( true );
		expect( fakeRange.setStart ).to.be.calledWith( evt.rangeParent, evt.rangeOffset );
	} );

	it( 'should return null if event target is null', () => {
		const evt = {
			target: null
		};

		expect( getRangeFromMouseEvent( evt ) ).to.be.null;
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

		expect( getRangeFromMouseEvent( evt ) ).to.be.null;
	} );
} );
