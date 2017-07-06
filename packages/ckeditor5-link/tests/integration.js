/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import Link from '../src/link';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Link', () => {
	let editor, doc, element, linkCommand, unlinkCommand;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		linkCommand = editor.commands.get( 'link' );
		unlinkCommand = editor.commands.get( 'unlink' );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'compatibility with images', () => {
		it( 'does not link a caption–less image', () => {
			return ClassicTestEditor.create( element, {
				plugins: [ Paragraph, Image, Link ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				setModelData( doc,
					'<paragraph>fo[o</paragraph>' +
					'<image src="foo.png"></image>' +
					'<paragraph>b]ar</paragraph>'
				);

				editor.execute( 'link', 'url' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>fo[<$text linkHref="url">o</$text></paragraph>' +
					'<image src="foo.png"></image>' +
					'<paragraph><$text linkHref="url">b</$text>]ar</paragraph>'
				);

				expect( linkCommand.isEnabled ).to.be.true;
				expect( linkCommand.value ).to.equal( 'url' );
				expect( unlinkCommand.isEnabled ).to.be.true;
			} );
		} );

		it( 'links the image caption text if selection contains more than an image', () => {
			return ClassicTestEditor.create( element, {
				plugins: [ Paragraph, Image, ImageCaption, Link ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				setModelData( doc,
					'<paragraph>fo[o</paragraph>' +
					'<image src="foo.png">' +
						'<caption>abc</caption>' +
					'</image>' +
					'<paragraph>baz</paragraph>' +
					'<image src="bar.png">' +
						'<caption>abc</caption>' +
					'</image>' +
					'<paragraph>b]ar</paragraph>'
				);

				editor.execute( 'link', 'url' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>fo[<$text linkHref="url">o</$text></paragraph>' +
					'<image src="foo.png">' +
						'<caption><$text linkHref="url">abc</$text></caption>' +
					'</image>' +
					'<paragraph><$text linkHref="url">baz</$text></paragraph>' +
					'<image src="bar.png">' +
						'<caption><$text linkHref="url">abc</$text></caption>' +
					'</image>' +
					'<paragraph><$text linkHref="url">b</$text>]ar</paragraph>'
				);

				expect( linkCommand.isEnabled ).to.be.true;
				expect( linkCommand.value ).to.equal( 'url' );
				expect( unlinkCommand.isEnabled ).to.be.true;
			} );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/85
		it( 'is disabled when only the image is the only selected element', () => {
			return ClassicTestEditor.create( element, {
				plugins: [ Paragraph, Image, ImageCaption, Link ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				setModelData( doc, '[<image src="foo.png"></image>]' );
				expect( linkCommand.isEnabled ).to.be.false;

				setModelData( doc, '[<image src="foo.png"><caption>abc</caption></image>]' );
				expect( linkCommand.isEnabled ).to.be.false;

				setModelData( doc,
					'[<image src="foo.png">' +
						'<caption><$text linkHref="url">abc</$text></caption>' +
					'</image>]'
				);
				expect( linkCommand.isEnabled ).to.be.false;
				expect( unlinkCommand.isEnabled ).to.be.false;
			} );
		} );
	} );
} );
