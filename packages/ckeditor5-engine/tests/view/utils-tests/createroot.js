/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Document from '../../../src/view/document.js';
import RootAttributeElement from '../../../src/view/rooteditableelement.js';
import createRoot from '../_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'createRoot', () => {
	let viewDoc;

	beforeEach( () => {
		viewDoc = new Document( new StylesProcessor() );
	} );

	it( 'should create view root element with given data', () => {
		const root = createRoot( viewDoc, 'h1', 'header' );

		expect( root ).to.instanceof( RootAttributeElement );
		expect( root.name ).to.equal( 'h1' );
		expect( root.rootName ).to.equal( 'header' );
	} );

	it( 'should create view root element with default data', () => {
		const root = createRoot( viewDoc );

		expect( root ).to.instanceof( RootAttributeElement );
		expect( root.name ).to.equal( 'div' );
		expect( root.rootName ).to.equal( 'main' );
	} );

	it( 'should insert root element to view document roots collection', () => {
		const root = createRoot( viewDoc );

		expect( viewDoc.getRoot() ).to.equal( root );
	} );
} );
