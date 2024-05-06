/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { tryRemoveDropdownMenuTreeChild } from '../../../../src/dropdown/menu/search/tryremovedropdownmenutreechild.js';
import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';

describe( 'tryRemoveDropdownMenuTreeChild', () => {
	it( 'should remove menu child from root node', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;
		const [ child ] = tree.children;

		const resultTree = tryRemoveDropdownMenuTreeChild( tree, child );

		expect( tree ).to.be.equal( resultTree );
		expect( tree.children ).not.to.contain( child );
	} );

	it( 'should remove menu child from menu node', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;

		const [ parent ] = tree.children;
		const [ child ] = parent.children;

		tryRemoveDropdownMenuTreeChild( parent, child );
		expect( parent.children ).not.to.contain( child );
	} );

	it( 'should do do nothing on item entry', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;

		const [ parent ] = tree.children;
		const [ child ] = parent.children;

		expect( () => {
			tryRemoveDropdownMenuTreeChild( child, null );
		} ).not.to.throw();
	} );

	it( 'should throw on unknown entry', () => {
		expect( () => {
			tryRemoveDropdownMenuTreeChild( {}, null );
		} ).to.throw();
	} );
} );
