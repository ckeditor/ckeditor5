/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewDocument } from '../../../src/view/document.js';
import { ViewRootEditableElement } from '../../../src/view/rooteditableelement.js';
import { createViewRoot } from '../_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'createRoot', () => {
	let viewDoc;

	beforeEach( () => {
		viewDoc = new ViewDocument( new StylesProcessor() );
	} );

	it( 'should create view root element with given data', () => {
		const root = createViewRoot( viewDoc, 'h1', 'header' );

		expect( root ).toBeInstanceOf( ViewRootEditableElement );
		expect( root.name ).toBe( 'h1' );
		expect( root.rootName ).toBe( 'header' );
	} );

	it( 'should create view root element with default data', () => {
		const root = createViewRoot( viewDoc );

		expect( root ).toBeInstanceOf( ViewRootEditableElement );
		expect( root.name ).toBe( 'div' );
		expect( root.rootName ).toBe( 'main' );
	} );

	it( 'should insert root element to view document roots collection', () => {
		const root = createViewRoot( viewDoc );

		expect( viewDoc.getRoot() ).toBe( root );
	} );
} );
