/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageBlock from '@ckeditor/ckeditor5-image/src/imageblock';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import DocumentList from '@ckeditor/ckeditor5-list/src/documentlist';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Style from '../../src/style';

describe( 'DocumentListStyleSupport', () => {
	let editor, editorElement, command, model, doc, root;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		await createEditor( [
			{
				name: 'OL style',
				element: 'ol',
				classes: [ 'ol-styled' ]
			},
			{
				name: 'UL style',
				element: 'ul',
				classes: [ 'ul-styled' ]
			},
			{
				name: 'LI style',
				element: 'li',
				classes: [ 'li-styled' ]
			}
		] );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should apply OL style to the whole list', () => {
		editor.setData(
			'<ol>' +
				'<li>' +
					'<p>1</p>' +
					'<p>2</p>' +
				'</li>' +
				'<li>' +
					'<p>3</p>' +
					'<ul>' +
						'<li><p>4</p><p>5</p></li>' +
						'<li><p>6</p><p>7</p></li>' +
					'</ul>' +
					'<p>8</p>' +
				'</li>' +
			'</ol>'
		);

		model.change( writer => writer.setSelection( root.getChild( 0 ), 0 ) );
		command.refresh();

		expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style' ] );
		expect( command.value ).to.be.empty;

		command.execute( { styleName: 'OL style' } );

		expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style' ] );
		expect( command.value ).to.have.members( [ 'OL style' ] );

		expect( editor.getData() ).to.equal(
			'<ol class="ol-styled">' +
				'<li>' +
					'<p>1</p>' +
					'<p>2</p>' +
				'</li>' +
				'<li>' +
					'<p>3</p>' +
					'<ul>' +
						'<li><p>4</p><p>5</p></li>' +
						'<li><p>6</p><p>7</p></li>' +
					'</ul>' +
					'<p>8</p>' +
				'</li>' +
			'</ol>'
		);

		command.execute( { styleName: 'OL style' } );

		expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style' ] );
		expect( command.value ).to.be.empty;

		expect( editor.getData() ).to.equal(
			'<ol>' +
				'<li>' +
					'<p>1</p>' +
					'<p>2</p>' +
				'</li>' +
				'<li>' +
					'<p>3</p>' +
					'<ul>' +
						'<li><p>4</p><p>5</p></li>' +
						'<li><p>6</p><p>7</p></li>' +
					'</ul>' +
					'<p>8</p>' +
				'</li>' +
			'</ol>'
		);
	} );

	async function createEditor( styleDefinitions ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph, ImageBlock, ImageCaption, Heading, BlockQuote, DocumentList, GeneralHtmlSupport, Style
			],
			style: {
				definitions: styleDefinitions
			}
		} );

		model = editor.model;
		command = editor.commands.get( 'style' );
		doc = model.document;
		root = doc.getRoot();
	}
} );
