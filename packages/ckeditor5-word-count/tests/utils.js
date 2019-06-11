/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { modelElementToPlainText } from '../src/utils';

import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Text from '@ckeditor/ckeditor5-engine/src/model/text';

describe( 'modelElementToPlainText()', () => {
	it( 'should extract only plain text', () => {
		const text1 = new Text( 'Foo' );
		const text2 = new Text( 'Bar', { bold: true } );
		const text3 = new Text( 'Baz', { bold: true, underline: true } );

		const innerElement1 = new Element( 'paragraph', null, [ text1 ] );
		const innerElement2 = new Element( 'paragraph', null, [ text2, text3 ] );

		const mainElement = new Element( 'container', null, [ innerElement1, innerElement2 ] );

		expect( modelElementToPlainText( mainElement ) ).to.equal( 'Foo\nBarBaz' );
	} );
} );
