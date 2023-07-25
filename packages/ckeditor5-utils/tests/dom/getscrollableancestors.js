/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import { getScrollableAncestors } from '../../src';

describe( 'getScrollableAncestors()', () => {
	it( 'should return all parents of given node that are scrollable', () => {
		const element = document.createElement( 'div' );
		const parentWithOverflow = document.createElement( 'div' );
		parentWithOverflow.style.overflow = 'scroll';
		const parentWithOverflow2 = document.createElement( 'div' );
		parentWithOverflow2.style.overflow = 'auto';
		const parentWithoutOverflow = document.createElement( 'div' );
		parentWithoutOverflow.style.overflow = 'visible';

		parentWithOverflow.appendChild( element );
		parentWithOverflow2.appendChild( parentWithOverflow );
		parentWithoutOverflow.appendChild( parentWithOverflow2 );
		document.body.appendChild( parentWithOverflow2 );

		expect( getScrollableAncestors( element ) ).to.deep.equal( [ parentWithOverflow, parentWithOverflow2, document ] );

		element.remove();
		parentWithOverflow.remove();
		parentWithOverflow2.remove();
	} );

	it( 'should return only document when there are no parent elements with overflow', () => {
		const element = document.createElement( 'div' );

		expect( getScrollableAncestors( element ) ).to.deep.equal( [ document ] );

		element.remove();
	} );
} );
