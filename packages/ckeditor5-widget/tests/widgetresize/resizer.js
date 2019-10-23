/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Resizer from '../../src/widgetresize/resizer';

import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import ContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import DowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';

// import {
// 	getData as getViewData
// } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

const view = new View();
const doc = view.document;
const writer = new DowncastWriter( doc );

describe( 'Resizer', () => {
	it( 'constructs properly', () => {
		const instance = createResizer();

		expect( instance.isEnabled ).to.be.true;
	} );

	it( 'adds a proper markup when attached', () => {
		const instance = createResizer();
		instance.attach();

		// TODO: check output

		// console.log( instance._options.viewElement );

		// expect( getViewData( instance._options.viewElement ) ).to.be.eql( 'foo' );
	} );
} );

function createResizer() {
	const model = new Element( 'resizable' );
	const viewElement = new ContainerElement( 'div' );

	return new Resizer( {
		modelElement: model,
		viewElement,
		downcastWriter: writer
	} );
}
