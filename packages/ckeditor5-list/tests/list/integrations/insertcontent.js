/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../../src/list/listediting.js';
import stubUid from '../_utils/uid.js';
import { modelList } from '../_utils/utils.js';

import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import MediaEmbedEditing from '@ckeditor/ckeditor5-media-embed/src/mediaembedediting.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import WidgetTypeAround from '@ckeditor/ckeditor5-widget/src/widgettypearound/widgettypearound.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from 'ckeditor5/src/paragraph.js';
import { modelTable } from '@ckeditor/ckeditor5-table/tests/_utils/utils.js';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'Inserting widgets in document lists', () => {
	let element;
	let editor, model, modelRoot;
	let insertCommand;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				Paragraph, CodeBlockEditing, ListEditing, IndentEditing, BlockQuoteEditing, MediaEmbedEditing,
				Table, Image, HtmlEmbed, PageBreak, HorizontalLine, Widget
			],
			image: { insert: { type: 'auto' } }
		} );

		model = editor.model;
		modelRoot = editor.model.document.getRoot();

		stubUid();
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'inserting table', () => {
		beforeEach( () => {
			insertCommand = () => {
				editor.execute( 'insertTable', { rows: 1, columns: 2 } );
			};
		} );

		it( 'should replace an empty list item with a table as a list item', () => {
			runTest( {
				input: [
					'* []'
				],
				expected: [
					'* ' + modelTable( [
						[ '[]', '' ]
					] )
				]
			} );
		} );

		it( 'should insert a table as a first block of a list item if selection is at the beginning of text', () => {
			runTest( {
				input: [
					'* []Foo'
				],
				expected: [
					'* ' + modelTable( [
						[ '[]', '' ]
					] ),
					'  Foo'
				]
			} );
		} );

		it( 'should insert a table as the next block of a list item when a selection is at the end of text', () => {
			runTest( {
				input: [
					'* Foo[]'
				],
				expected: [
					'* Foo',
					'  ' + modelTable( [
						[ '[]', '' ]
					] )
				]
			} );
		} );

		it( 'should insert a table in place of an empty block as a list item block', () => {
			runTest( {
				input: [
					'* Foo',
					'  []'
				],
				expected: [
					'* Foo',
					'  ' + modelTable( [
						[ '[]', '' ]
					] )
				]
			} );
		} );

		it( 'should insert a table after a block if selection was at the end of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  Bar[]'
				],
				expected: [
					'* Foo',
					'  Bar',
					'  ' + modelTable( [
						[ '[]', '' ]
					] )
				]
			} );
		} );

		it( 'should insert a table before a block if selection was at the start of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  []Bar'
				],
				expected: [
					'* Foo',
					'  ' + modelTable( [
						[ '[]', '' ]
					] ),
					'  Bar'
				]
			} );
		} );

		it( 'should insert a table before a non-collapsed selection as a list item', () => {
			runTest( {
				input: [
					'* [Foo',
					'* Bar',
					'* Yar]'
				],
				expected: [
					'* ' + modelTable( [
						[ '[]', '' ]
					] ),
					'  Foo',
					'* Bar {id:001}',
					'* Yar {id:002}'
				]
			} );
		} );

		it( 'should insert a table before a non-collapsed selection as a list item when selection is in the middle', () => {
			runTest( {
				input: [
					'* Fo[oo',
					'* Bar',
					'* Yar]'
				],
				expected: [
					'* ' + modelTable( [
						[ '[]', '' ]
					] ),
					'  Fooo',
					'* Bar {id:001}',
					'* Yar {id:002}'
				]
			} );
		} );

		it( 'should insert a table before a non-collapsed selection as a list item when selection is closer to the end of text', () => {
			runTest( {
				input: [
					'* Foo[o',
					'* Bar',
					'* Yar]'
				],
				expected: [
					'* ' + modelTable( [
						[ '[]', '' ]
					] ),
					'  Fooo',
					'* Bar {id:001}',
					'* Yar {id:002}'
				]
			} );
		} );

		it( 'should insert a table as a next block of an indented list item if selection is at the end', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Bar[]'
				],
				expected: [
					'* Foo',
					'  * Bar',
					'    ' + modelTable( [
						[ '[]', '' ]
					] )
				]
			} );
		} );

		it( 'should insert a table as a first block of an indented list item if selection is at the beginning', () => {
			runTest( {
				input: [
					'* Foo',
					'  * []Bar'
				],
				expected: [
					'* Foo',
					'  * ' + modelTable( [
						[ '[]', '' ]
					] ),
					'    Bar'
				]
			} );
		} );

		it( 'should insert a table as a first block of an indented list item if selection is not at the end', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Ba[]r'
				],
				expected: [
					'* Foo',
					'  * ' + modelTable( [
						[ '[]', '' ]
					] ),
					'    Bar'
				]
			} );
		} );
	} );

	describe( 'inserting media', () => {
		beforeEach( () => {
			insertCommand = () => {
				editor.execute( 'mediaEmbed', '' );
			};
		} );

		it( 'should replace an empty list item with a media as a list item', () => {
			runTest( {
				input: [
					'* []'
				],
				expected: '[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]'
			} );
		} );

		it( 'should insert a media as a first block of a list item if selection is at the beginning of text', () => {
			runTest( {
				input: [
					'* []Foo'
				],
				expected: '[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>'
			} );
		} );

		it( 'should insert a media as the next block of a list item when a selection is at the end of text', () => {
			runTest( {
				input: [
					'* Foo[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]'
			} );
		} );

		it( 'should insert a media in place of an empty block as a list item block', () => {
			runTest( {
				input: [
					'* Foo',
					'  []'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]'
			} );
		} );

		it( 'should insert a media after a block if selection was at the end of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar</paragraph>' +
					'[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]'
			} );
		} );

		it( 'should insert a media before a block if selection was at the start of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar</paragraph>'
			} );
		} );

		it( 'should insert a media before a non-collapsed selection as a list item', () => {
			runTest( {
				input: [
					'* [Foo',
					'* Bar',
					'* Yar]'
				],
				expected: '[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]' +
				'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="001" listType="bulleted">Bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="002" listType="bulleted">Yar</paragraph>'
			} );
		} );

		it( 'should insert a media before a non-collapsed selection as a list item when selection is in the middle', () => {
			runTest( {
				input: [
					'* Fo[oo',
					'* Bar',
					'* Yar]'
				],
				expected: '[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]' +
				'<paragraph listIndent="0" listItemId="000" listType="bulleted">Fooo</paragraph>' +
				'<paragraph listIndent="0" listItemId="001" listType="bulleted">Bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="002" listType="bulleted">Yar</paragraph>'
			} );
		} );

		it( 'should insert a media before a non-collapsed selection as a list item when selection is closer to the end of text', () => {
			runTest( {
				input: [
					'* Foo[o',
					'* Bar',
					'* Yar]'
				],
				expected: '[<media listIndent="0" listItemId="000" listType="bulleted" url=""></media>]' +
				'<paragraph listIndent="0" listItemId="000" listType="bulleted">Fooo</paragraph>' +
				'<paragraph listIndent="0" listItemId="001" listType="bulleted">Bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="002" listType="bulleted">Yar</paragraph>'
			} );
		} );

		it( 'should insert a media as a first block of an indended list item if selection is at the beginning', () => {
			runTest( {
				input: [
					'* Foo',
					'  * []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<media listIndent="1" listItemId="001" listType="bulleted" url=""></media>]' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Bar</paragraph>'
			} );
		} );

		it( 'should insert a media as a first block of an indended list item if selection is not at the end', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Ba[]r'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<media listIndent="1" listItemId="001" listType="bulleted" url=""></media>]' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Bar</paragraph>'
			} );
		} );

		it( 'should insert a media as a next block of an indended list item if selection is at the end', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="001" listType="bulleted">Bar</paragraph>' +
				'[<media listIndent="1" listItemId="001" listType="bulleted" url=""></media>]'
			} );
		} );
	} );

	describe( 'inserting image', () => {
		beforeEach( () => {
			insertCommand = () => {
				editor.execute( 'insertImage', { source: '' } );
			};
		} );

		it( 'should replace an empty list item with a block image as a list item', () => {
			runTest( {
				input: [
					'* []'
				],
				expected: '[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src=""></imageBlock>]'
			} );
		} );

		it( 'should insert an inline image inside paragraph if selection is at the beginning of text', () => {
			runTest( {
				input: [
					'* []Foo'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">' +
					'[<imageInline src=""></imageInline>]' +
					'Foo</paragraph>'
			} );
		} );

		it( 'should insert an inline image inside paragraph when a selection is at the end of text', () => {
			runTest( {
				input: [
					'* Foo[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo' +
					'[<imageInline src=""></imageInline>]' +
					'</paragraph>'
			} );
		} );

		it( 'should insert a block image in place of an empty block as a list item block', () => {
			runTest( {
				input: [
					'* Foo',
					'  []'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src=""></imageBlock>]'
			} );
		} );

		it( 'should insert an inline image inside a paragraph if selection was at the end of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar' +
						'[<imageInline src=""></imageInline>]' +
					'</paragraph>'
			} );
		} );

		it( 'should insert an inline image inside a paragraph if selection was at the start of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">' +
						'[<imageInline src=""></imageInline>]' +
					'Bar</paragraph>'
			} );
		} );

		it( 'should insert an inline image in place of a list if a non-collapsed selection spans entire list', () => {
			runTest( {
				input: [
					'* [Foo',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph>[<imageInline src=""></imageInline>]</paragraph>'
			} );
		} );

		it( 'should insert an inline image at the end of paragraph when selection is in the middle', () => {
			runTest( {
				input: [
					'* Fo[oo',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Fo' +
					'[<imageInline src=""></imageInline>]' +
					'</paragraph>'
			} );
		} );

		it( 'should insert an inline image at the end of paragraph when selection is closer to the end of text', () => {
			runTest( {
				input: [
					'* Foo[o',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo' +
					'[<imageInline src=""></imageInline>]' +
					'</paragraph>'
			} );
		} );

		it( 'should insert an inline image inside an indented list item', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Bar' +
						'[<imageInline src=""></imageInline>]' +
					'</paragraph>'
			} );
		} );

		it( 'should replace an indented empty paragraph with an indented block image', () => {
			runTest( {
				input: [
					'* Foo',
					'  * []'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<imageBlock listIndent="1" listItemId="001" listType="bulleted" src=""></imageBlock>]'
			} );
		} );
	} );

	describe( 'inserting page break', () => {
		beforeEach( () => {
			insertCommand = () => {
				editor.execute( 'pageBreak' );
			};
		} );

		it( 'should replace an empty list item with a page break as a list item', () => {
			runTest( {
				input: [
					'* []'
				],
				expected: '<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
				'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a page break as a first block of a list item if selection is at the beginning of text', () => {
			runTest( {
				input: [
					'* []Foo'
				],
				expected: '<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
				'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]Foo</paragraph>'
			} );
		} );

		it( 'should insert a page break as the next block of a list item when a selection is at the end of text', () => {
			runTest( {
				input: [
					'* Foo[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a page break in place of an empty block as a list item block', () => {
			runTest( {
				input: [
					'* Foo',
					'  []'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a page break embed after a block if selection was at the end of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar</paragraph>' +
					'<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a page break before a block if selection was at the start of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]Bar</paragraph>'
			} );
		} );

		it( 'should insert a page break as a list item in place of a list when whole list is selected', () => {
			runTest( {
				input: [
					'* [Foo',
					'* Bar',
					'* Yar]'
				],
				expected: '<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a page break before a non-collapsed selection as a list item when selection is in the middle', () => {
			runTest( {
				input: [
					'* Fo[oo',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Fo</paragraph>' +
					'<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a page break before a non-collapsed selection as a list item when selection is closer to the end', () => {
			runTest( {
				input: [
					'* Foo[o',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<pageBreak listIndent="0" listItemId="000" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a page break as a first block in an indented list item when selection is at the start', () => {
			runTest( {
				input: [
					'* Foo',
					'  * []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<pageBreak listIndent="1" listItemId="001" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">[]Bar</paragraph>'
			} );
		} );

		it( 'should insert a page break as a second block in an indented list item and split text', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Ba[]r'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Ba</paragraph>' +
					'<pageBreak listIndent="1" listItemId="001" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">[]r</paragraph>'
			} );
		} );

		it( 'should insert a page break as a second block in an indented list item and add a paragraph after', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Bar</paragraph>' +
					'<pageBreak listIndent="1" listItemId="001" listType="bulleted"></pageBreak>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">[]</paragraph>'
			} );
		} );
	} );

	describe( 'inserting horizontal line', () => {
		beforeEach( () => {
			insertCommand = () => {
				editor.execute( 'horizontalLine' );
			};
		} );

		it( 'should replace an empty list item with a horizontal line as a list item', () => {
			runTest( {
				input: [
					'* []'
				],
				expected: '<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
				'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line as a first block of a list item if selection is at the beginning of text', () => {
			runTest( {
				input: [
					'* []Foo'
				],
				expected: '<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
				'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]Foo</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line as the next block of a list item when a selection is at the end of text', () => {
			runTest( {
				input: [
					'* Foo[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line in place of an empty block as a list item block', () => {
			runTest( {
				input: [
					'* Foo',
					'  []'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line embed after a block if selection was at the end of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar</paragraph>' +
					'<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line before a block if selection was at the start of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]Bar</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line in place of a list when whole list is selected', () => {
			runTest( {
				input: [
					'* [Foo',
					'* Bar',
					'* Yar]'
				],
				expected: '<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line before a non-collapsed selection as a list item when selection is in the middle', () => {
			runTest( {
				input: [
					'* Fo[oo',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Fo</paragraph>' +
					'<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line before a non-collapsed selection as a list item when selection is closer to the end', () => {
			runTest( {
				input: [
					'* Foo[o',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<horizontalLine listIndent="0" listItemId="000" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line as a first block in an indented list item when selection is at the start', () => {
			runTest( {
				input: [
					'* Foo',
					'  * []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<horizontalLine listIndent="1" listItemId="001" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">[]Bar</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line as a second block in an indented list item and split text', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Ba[]r'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Ba</paragraph>' +
					'<horizontalLine listIndent="1" listItemId="001" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">[]r</paragraph>'
			} );
		} );

		it( 'should insert a horizontal line as a second block in an indented list item and add a paragraph after', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Bar</paragraph>' +
					'<horizontalLine listIndent="1" listItemId="001" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">[]</paragraph>'
			} );
		} );
	} );

	describe( 'inserting HTML block', () => {
		beforeEach( () => {
			insertCommand = () => {
				editor.execute( 'htmlEmbed' );
			};
		} );

		it( 'should replace an empty list item with a HTML embed as a list item', () => {
			runTest( {
				input: [
					'* []'
				],
				expected: '[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]'
			} );
		} );

		it( 'should insert a HTML embed as a first block of a list item if selection is at the beginning of text', () => {
			runTest( {
				input: [
					'* []Foo'
				],
				expected: '[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>'
			} );
		} );

		it( 'should insert a HTML embed as the next block of a list item when a selection is at the end of text', () => {
			runTest( {
				input: [
					'* Foo[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]'
			} );
		} );

		it( 'should insert a HTML embed in place of an empty block as a list item block', () => {
			runTest( {
				input: [
					'* Foo',
					'  []'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]'
			} );
		} );

		it( 'should insert a HTML embed after a block if selection was at the end of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar</paragraph>' +
					'[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]'
			} );
		} );

		it( 'should insert a HTML embed before a block if selection was at the start of a text', () => {
			runTest( {
				input: [
					'* Foo',
					'  []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar</paragraph>'
			} );
		} );

		it( 'should insert a HTML embed in place of a list as a first list item when whole list is selected', () => {
			runTest( {
				input: [
					'* [Foo',
					'* Bar',
					'* Yar]'
				],
				expected: '[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]'
			} );
		} );

		it( 'should insert a HTML embed before a non-collapsed selection as a list item when selection is in the middle', () => {
			runTest( {
				input: [
					'* Fo[oo',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Fo</paragraph>' +
					'[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]'
			} );
		} );

		it( 'should insert a HTML embed before a non-collapsed selection as a list item when selection is closer to the end', () => {
			runTest( {
				input: [
					'* Foo[o',
					'* Bar',
					'* Yar]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<rawHtml listIndent="0" listItemId="000" listType="bulleted"></rawHtml>]'
			} );
		} );

		it( 'should insert a HTML embed as a first block in an indented list item when selection is at the start', () => {
			runTest( {
				input: [
					'* Foo',
					'  * []Bar'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'[<rawHtml listIndent="1" listItemId="001" listType="bulleted"></rawHtml>]' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Bar</paragraph>'
			} );
		} );

		it( 'should insert a HTML embed as a second block in an indented list item and split the text', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Ba[]r'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Ba</paragraph>' +
					'[<rawHtml listIndent="1" listItemId="001" listType="bulleted"></rawHtml>]' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">r</paragraph>'
			} );
		} );

		it( 'should insert a HTML embed after selection in an indented list item', () => {
			runTest( {
				input: [
					'* Foo',
					'  * Bar[]'
				],
				expected: '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="001" listType="bulleted">Bar</paragraph>' +
					'[<rawHtml listIndent="1" listItemId="001" listType="bulleted"></rawHtml>]'
			} );
		} );
	} );

	describe( 'inserting paragraphs with widget type around', () => {
		beforeEach( () => {
			const plugin = editor.plugins.get( WidgetTypeAround );

			insertCommand = ( position, widgetPosition ) => {
				plugin._insertParagraph( modelRoot.getChild( widgetPosition ), position );
			};
		} );

		it( 'should insert a paragraph before an image block as a first block of a list item', () => {
			setModelData( model, modelList( [
				'* <imageBlock src=""></imageBlock>'
			] ) );

			insertCommand( 'before', 0 );

			const expectedModel = '<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>' +
			'<imageBlock listIndent="0" listItemId="000" listType="bulleted" src=""></imageBlock>';

			expect( getModelData( model ) ).to.equalMarkup( expectedModel );
		} );

		it( 'should insert a paragraph after an image block as a second block', () => {
			setModelData( model, modelList( [
				'* <imageBlock src=""></imageBlock>'
			] ) );

			insertCommand( 'after', 0 );

			const expectedModel = '<imageBlock listIndent="0" listItemId="000" listType="bulleted" src=""></imageBlock>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>';

			expect( getModelData( model ) ).to.equalMarkup( expectedModel );
		} );

		it( 'should insert a paragraph before an image block as a second block of a list item', () => {
			setModelData( model, modelList( [
				'* foo',
				'  [<imageBlock src=""></imageBlock>]'
			] ) );

			insertCommand( 'before', 1 );

			const expectedModel = '<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>' +
			'<imageBlock listIndent="0" listItemId="000" listType="bulleted" src=""></imageBlock>';

			expect( getModelData( model ) ).to.equalMarkup( expectedModel );
		} );

		it( 'should insert a paragraph after an image block as a third block of a list item', () => {
			setModelData( model, modelList( [
				'* Foo',
				'  <imageBlock src=""></imageBlock>'
			] ) );

			insertCommand( 'after', 1 );

			const expectedModel = '<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
			'<imageBlock listIndent="0" listItemId="000" listType="bulleted" src=""></imageBlock>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">[]</paragraph>';

			expect( getModelData( model ) ).to.equalMarkup( expectedModel );
		} );

		it( 'should insert a paragraph before an image block in and indented list item', () => {
			setModelData( model, modelList( [
				'* foo',
				'  * [<imageBlock src=""></imageBlock>]'
			] ) );

			insertCommand( 'before', 1 );

			const expectedModel = '<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">[]</paragraph>' +
			'<imageBlock listIndent="1" listItemId="001" listType="bulleted" src=""></imageBlock>';

			expect( getModelData( model ) ).to.equalMarkup( expectedModel );
		} );

		it( 'should insert a paragraph after an image block in and indented list item', () => {
			setModelData( model, modelList( [
				'* foo',
				'  * [<imageBlock src=""></imageBlock>]'
			] ) );

			insertCommand( 'after', 1 );

			const expectedModel = '<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<imageBlock listIndent="1" listItemId="001" listType="bulleted" src=""></imageBlock>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">[]</paragraph>';

			expect( getModelData( model ) ).to.equalMarkup( expectedModel );
		} );
	} );

	// @param {Iterable.<String>} input
	// @param {Iterable.<String>} expected
	function runTest( { input, expected } ) {
		setModelData( model, modelList( input ) );

		insertCommand();

		let expectedModel = expected;

		if ( Array.isArray( expected ) ) {
			expectedModel = modelList( expected );
		}

		expect( getModelData( model ) ).to.equalMarkup( expectedModel );
	}
} );
