/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getClosestListItem } from '../src/utils';

import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

describe( 'getClosestListItem', () => {
	const item = new Element( 'listItem', null, 'foobar' );
	const root = new Element( '$root', null, [ item ] );

	it( 'should return model listItem element if given position is in such element', () => {
		expect( getClosestListItem( Position.createAt( item ) ) ).to.equal( item );
	} );

	it( 'should return null if position is not in listItem', () => {
		expect( getClosestListItem( Position.createAt( root ) ) ).to.be.null;
	} );
} );
