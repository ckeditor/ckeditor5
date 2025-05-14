/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { priorities } from 'ckeditor5/src/utils.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';
import { getModelDataWithAttributes } from '../_utils/utils.js';
import TableElementSupport from '../../src/integrations/table.js';

import { range } from 'es-toolkit/compat';

describe( 'TableElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Table, TableCaption, Paragraph, GeneralHtmlSupport, ClipboardPipeline ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataFilter = editor.plugins.get( 'DataFilter' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableElementSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableElementSupport.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be named', () => {
		expect( editor.plugins.has( 'TableElementSupport' ) ).to.be.true;
	} );

	it( 'should allow attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			attributes: /^data-.*$/
		} ] );

		const expectedHtml =
			'<figure class="table" data-figure="figure">' +
				'<table data-table="table">' +
					'<thead data-thead="thead">' +
						'<tr data-tr="tr">' +
							'<th data-th="th">1</th>' +
							'<th data-th="th">2</th>' +
							'<th data-th="th">3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody data-tbody="tbody">' +
						'<tr data-tr="tr">' +
							'<td data-td="td">1.1</td>' +
							'<td data-td="td">1.2</td>' +
							'<td data-td="td">1.3</td>' +
						'</tr>' +
						'<tr data-tr="tr">' +
							'<td data-td="td">2.1</td>' +
							'<td data-td="td">2.2</td>' +
							'<td data-td="td">2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1" htmlFigureAttributes="(1)" htmlTableAttributes="(2)" ' +
					'htmlTbodyAttributes="(3)" htmlTheadAttributes="(4)">' +
					'<tableRow htmlTrAttributes="(5)">' +
						'<tableCell htmlThAttributes="(6)">' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlThAttributes="(7)">' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlThAttributes="(8)">' +
							'<paragraph>3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow htmlTrAttributes="(9)">' +
						'<tableCell htmlTdAttributes="(10)">' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(11)">' +
							'<paragraph>1.2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(12)">' +
							'<paragraph>1.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow htmlTrAttributes="(13)">' +
						'<tableCell htmlTdAttributes="(14)">' +
							'<paragraph>2.1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(15)">' +
							'<paragraph>2.2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(16)">' +
							'<paragraph>2.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					attributes: {
						'data-figure': 'figure'
					}
				},
				2: {
					attributes: {
						'data-table': 'table'
					}
				},
				3: {
					attributes: {
						'data-tbody': 'tbody'
					}
				},
				4: {
					attributes: {
						'data-thead': 'thead'
					}
				},
				5: {
					attributes: {
						'data-tr': 'tr'
					}
				},
				6: {
					attributes: {
						'data-th': 'th'
					}
				},
				7: {
					attributes: {
						'data-th': 'th'
					}
				},
				8: {
					attributes: {
						'data-th': 'th'
					}
				},
				9: {
					attributes: {
						'data-tr': 'tr'
					}
				},
				10: {
					attributes: {
						'data-td': 'td'
					}
				},
				11: {
					attributes: {
						'data-td': 'td'
					}
				},
				12: {
					attributes: {
						'data-td': 'td'
					}
				},
				13: {
					attributes: {
						'data-tr': 'tr'
					}
				},
				14: {
					attributes: {
						'data-td': 'td'
					}
				},
				15: {
					attributes: {
						'data-td': 'td'
					}
				},
				16: {
					attributes: {
						'data-td': 'td'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should allow classes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			classes: 'foobar'
		} ] );

		const expectedHtml =
			'<figure class="table foobar">' +
				'<table class="foobar">' +
					'<thead class="foobar">' +
						'<tr class="foobar">' +
							'<th class="foobar">1</th>' +
							'<th class="foobar">2</th>' +
							'<th class="foobar">3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody class="foobar">' +
						'<tr class="foobar">' +
							'<td class="foobar">1.1</td>' +
							'<td class="foobar">1.2</td>' +
							'<td class="foobar">1.3</td>' +
						'</tr>' +
						'<tr class="foobar">' +
							'<td class="foobar">2.1</td>' +
							'<td class="foobar">2.2</td>' +
							'<td class="foobar">2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1" htmlFigureAttributes="(1)" htmlTableAttributes="(2)" ' +
					'htmlTbodyAttributes="(3)" htmlTheadAttributes="(4)">' +
					'<tableRow htmlTrAttributes="(5)">' +
						'<tableCell htmlThAttributes="(6)">' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlThAttributes="(7)">' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlThAttributes="(8)">' +
							'<paragraph>3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow htmlTrAttributes="(9)">' +
						'<tableCell htmlTdAttributes="(10)">' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(11)">' +
							'<paragraph>1.2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(12)">' +
							'<paragraph>1.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow htmlTrAttributes="(13)">' +
						'<tableCell htmlTdAttributes="(14)">' +
							'<paragraph>2.1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(15)">' +
							'<paragraph>2.2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(16)">' +
							'<paragraph>2.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: range( 1, 17 ).reduce( ( attributes, index ) => {
				attributes[ index ] = {
					classes: [ 'foobar' ]
				};
				return attributes;
			}, {} )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should allow styles', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			styles: 'color'
		} ] );

		const expectedHtml =
			'<figure class="table" style="color:red;">' +
				'<table style="color:red;">' +
					'<thead style="color:red;">' +
						'<tr style="color:red;">' +
							'<th style="color:red;">1</th>' +
							'<th style="color:red;">2</th>' +
							'<th style="color:red;">3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody style="color:red;">' +
						'<tr style="color:red;">' +
							'<td style="color:red;">1.1</td>' +
							'<td style="color:red;">1.2</td>' +
							'<td style="color:red;">1.3</td>' +
						'</tr>' +
						'<tr style="color:red;">' +
							'<td style="color:red;">2.1</td>' +
							'<td style="color:red;">2.2</td>' +
							'<td style="color:red;">2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1" htmlFigureAttributes="(1)" htmlTableAttributes="(2)" ' +
					'htmlTbodyAttributes="(3)" htmlTheadAttributes="(4)">' +
					'<tableRow htmlTrAttributes="(5)">' +
						'<tableCell htmlThAttributes="(6)">' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlThAttributes="(7)">' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlThAttributes="(8)">' +
							'<paragraph>3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow htmlTrAttributes="(9)">' +
						'<tableCell htmlTdAttributes="(10)">' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(11)">' +
							'<paragraph>1.2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(12)">' +
							'<paragraph>1.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow htmlTrAttributes="(13)">' +
						'<tableCell htmlTdAttributes="(14)">' +
							'<paragraph>2.1</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(15)">' +
							'<paragraph>2.2</paragraph>' +
						'</tableCell>' +
						'<tableCell htmlTdAttributes="(16)">' +
							'<paragraph>2.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: range( 1, 17 ).reduce( ( attributes, index ) => {
				attributes[ index ] = {
					styles: {
						color: 'red'
					}
				};
				return attributes;
			}, {} )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should allow enabling only tbody attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'tbody',
			styles: 'color'
		} ] );

		editor.setData(
			'<figure class="table" style="color:red;">' +
				'<table style="color:red;">' +
					'<thead style="color:red;">' +
						'<tr style="color:red;">' +
							'<th style="color:red;">1</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody style="color:red;">' +
						'<tr style="color:red;">' +
							'<td style="color:red;">2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1" ' +
					'htmlTbodyAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					styles: {
						color: 'red'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table">' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>1</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody style="color:red;">' +
						'<tr>' +
							'<td>2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should allow enabling only thead attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'thead',
			styles: 'color'
		} ] );

		editor.setData(
			'<figure class="table" style="color:red;">' +
				'<table style="color:red;">' +
					'<thead style="color:red;">' +
						'<tr style="color:red;">' +
							'<th style="color:red;">1</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody style="color:red;">' +
						'<tr style="color:red;">' +
							'<td style="color:red;">2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1" ' +
					'htmlTheadAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					styles: {
						color: 'red'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table">' +
				'<table>' +
					'<thead style="color:red;">' +
						'<tr>' +
							'<th>1</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should allow enabling only figure attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'figure',
			styles: 'color'
		} ] );

		editor.setData(
			'<figure class="table" style="color:red;">' +
				'<table style="color:red;">' +
					'<thead style="color:red;">' +
						'<tr style="color:red;">' +
							'<th style="color:red;">1</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody style="color:red;">' +
						'<tr style="color:red;">' +
							'<td style="color:red;">2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1" ' +
					'htmlFigureAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					styles: {
						color: 'red'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table" style="color:red;">' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>1</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should disallow attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			attributes: /^data-.*$/
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			attributes: /^data-.*$/
		} ] );

		editor.setData(
			'<figure class="table" data-figure="figure">' +
				'<table data-table="table">' +
					'<thead data-thead="thead">' +
						'<tr data-tr="tr">' +
							'<th data-th="th">1</th>' +
							'<th data-th="th">2</th>' +
							'<th data-th="th">3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody data-tbody="tbody">' +
						'<tr data-tr="tr">' +
							'<td data-td="td">1.1</td>' +
							'<td data-td="td">1.2</td>' +
							'<td data-td="td">1.3</td>' +
						'</tr>' +
						'<tr data-tr="tr">' +
							'<td data-td="td">2.1</td>' +
							'<td data-td="td">2.2</td>' +
							'<td data-td="td">2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>2.1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2.2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table">' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>1</th>' +
							'<th>2</th>' +
							'<th>3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
							'<td>1.2</td>' +
							'<td>1.3</td>' +
						'</tr>' +
						'<tr>' +
							'<td>2.1</td>' +
							'<td>2.2</td>' +
							'<td>2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should disallow classes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			classes: 'foobar'
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			classes: 'foobar'
		} ] );

		editor.setData(
			'<figure class="table foobar">' +
				'<table class="foobar">' +
					'<thead class="foobar">' +
						'<tr class="foobar">' +
							'<th class="foobar">1</th>' +
							'<th class="foobar">2</th>' +
							'<th class="foobar">3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody class="foobar">' +
						'<tr class="foobar">' +
							'<td class="foobar">1.1</td>' +
							'<td class="foobar">1.2</td>' +
							'<td class="foobar">1.3</td>' +
						'</tr>' +
						'<tr class="foobar">' +
							'<td class="foobar">2.1</td>' +
							'<td class="foobar">2.2</td>' +
							'<td class="foobar">2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>2.1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2.2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table">' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>1</th>' +
							'<th>2</th>' +
							'<th>3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
							'<td>1.2</td>' +
							'<td>1.3</td>' +
						'</tr>' +
						'<tr>' +
							'<td>2.1</td>' +
							'<td>2.2</td>' +
							'<td>2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should allow attributes modification', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			classes: true
		} ] );

		editor.setData(
			'<figure class="table foo-figure">' +
				'<table class="foobar foo-table">' +
					'<thead class="foobar foo-thead">' +
						'<tr class="foobar foo-tr">' +
							'<th class="foobar foo-th">a</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody class="foobar foo-tbody">' +
						'<tr class="foobar foo-tr">' +
							'<td class="foobar foo-td">b</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		model.change( () => {
			const htmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );
			const root = editor.model.document.getRoot();

			htmlSupport.addModelHtmlClass( 'figure', 'added-figure', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'figure', 'foo-figure', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.addModelHtmlClass( 'table', 'added-table', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'table', 'foo-table', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.addModelHtmlClass( 'thead', 'added-thead', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'thead', 'foo-thead', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.addModelHtmlClass( 'tbody', 'added-tbody', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'tbody', 'foo-tbody', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.addModelHtmlClass( 'tr', 'added-tr', root.getNodeByPath( [ 0, 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'tr', 'foo-tr', root.getNodeByPath( [ 0, 0 ] ) );
			htmlSupport.addModelHtmlClass( 'th', 'added-th', root.getNodeByPath( [ 0, 0, 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'th', 'foo-th', root.getNodeByPath( [ 0, 0, 0 ] ) );
			htmlSupport.addModelHtmlClass( 'td', 'added-td', root.getNodeByPath( [ 0, 1, 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'td', 'foo-td', root.getNodeByPath( [ 0, 1, 0 ] ) );
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table added-figure">' +
				'<table class="foobar added-table">' +
					'<thead class="foobar added-thead">' +
						'<tr class="foobar added-tr">' +
							'<th class="foobar added-th">a</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody class="foobar added-tbody">' +
						'<tr class="foobar foo-tr">' +
							'<td class="foobar added-td">b</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should allow removing attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			classes: true
		} ] );

		editor.setData(
			'<figure class="table foobar">' +
				'<table class="foobar">' +
					'<thead class="foobar">' +
						'<tr class="foobar">' +
							'<th class="foobar">a</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody class="foobar">' +
						'<tr class="foobar">' +
							'<td class="foobar">b</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		model.change( () => {
			const htmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );
			const root = editor.model.document.getRoot();

			htmlSupport.removeModelHtmlClass( 'figure', 'foobar', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'table', 'foobar', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'thead', 'foobar', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'tbody', 'foobar', root.getNodeByPath( [ 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'tr', 'foobar', root.getNodeByPath( [ 0, 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'th', 'foobar', root.getNodeByPath( [ 0, 0, 0 ] ) );
			htmlSupport.removeModelHtmlClass( 'td', 'foobar', root.getNodeByPath( [ 0, 1, 0 ] ) );
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table">' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>a</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr class="foobar">' +
							'<td>b</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should disallow styles', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			styles: 'color'
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(figure|table|tbody|thead|tr|th|td)$/,
			styles: 'color'
		} ] );

		editor.setData(
			'<figure class="table" style="color:red;">' +
				'<table style="color:red;">' +
					'<thead style="color:red;">' +
						'<tr style="color:red;">' +
							'<th style="color:red;">1</th>' +
							'<th style="color:red;">2</th>' +
							'<th style="color:red;">3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody style="color:red;">' +
						'<tr style="color:red;">' +
							'<td style="color:red;">1.1</td>' +
							'<td style="color:red;">1.2</td>' +
							'<td style="color:red;">1.3</td>' +
						'</tr>' +
						'<tr style="color:red;">' +
							'<td style="color:red;">2.1</td>' +
							'<td style="color:red;">2.2</td>' +
							'<td style="color:red;">2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>2.1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2.2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>2.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table">' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>1</th>' +
							'<th>2</th>' +
							'<th>3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
							'<td>1.2</td>' +
							'<td>1.3</td>' +
						'</tr>' +
						'<tr>' +
							'<td>2.1</td>' +
							'<td>2.2</td>' +
							'<td>2.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should not set attributes on non existing figure', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|table|tbody|tr|td)$/,
			attributes: true
		} ] );

		editor.setData(
			'<table data-foo="foo">' +
				'<tbody>' +
					'<tr>' +
						'<td>1.1</td>' +
						'<td>1.2</td>' +
						'<td>1.3</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table htmlTableAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					attributes: { 'data-foo': 'foo' }
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table">' +
				'<table data-foo="foo">' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
							'<td>1.2</td>' +
							'<td>1.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	it( 'should not break figure integration for other features', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|figcaption|table|tbody|tr|td)$/,
			attributes: /^data-.*$/
		} ] );

		const expectedHtml =
			'<figure class="table" data-figure="table">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
							'<td>1.2</td>' +
							'<td>1.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>' +
			'<figure data-figure="standalone">' +
				'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
			'</figure>';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table htmlFigureAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.2</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>1.3</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>' +
				'<htmlFigure htmlFigureAttributes="(2)">' +
					'<htmlFigcaption htmlFigcaptionAttributes="(3)">foobar</htmlFigcaption>' +
				'</htmlFigure>',
			attributes: {
				1: {
					attributes: {
						'data-figure': 'table'
					}
				},
				2: {
					attributes: {
						'data-figure': 'standalone'
					}
				},
				3: {
					attributes: {
						'data-figcaption': 'figcaption'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should not double convert figure element', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^.*$/,
			styles: true,
			attributes: true,
			classes: true
		} ] );

		const expectedHtml =
			'<figure class="table">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>foo</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>';

		editor.setData( expectedHtml );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should not consume attributes already consumed (downcast)', () => {
		[
			'htmlTableAttributes',
			'htmlFigureAttributes',
			'htmlTbodyAttributes',
			'htmlTheadAttributes'
		].forEach( attributeName => {
			editor.conversion.for( 'downcast' ).add( dispatcher => {
				dispatcher.on( `attribute:${ attributeName }:table`, ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'high' } );
			} );
		} );

		dataFilter.allowElement( /^(figure|table|tbody|thead)$/ );
		dataFilter.allowAttributes( {
			name: /^(figure|table|tbody|thead)$/,
			attributes: { 'data-foo': true }
		} );

		editor.setData(
			'<figure class="table" data-foo="foo">' +
				'<table data-foo="foo">' +
					'<thead data-foo="foo">' +
						'<tr>' +
							'<th>1</th>' +
							'<th>2</th>' +
							'<th>3</th>' +
						'</tr>' +
					'</tbody>' +
					'<tbody data-foo="foo">' +
						'<tr>' +
							'<td>1.1</td>' +
							'<td>1.2</td>' +
							'<td>1.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( editor.getData() ).to.equal(
			'<figure class="table">' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>1</th>' +
							'<th>2</th>' +
							'<th>3</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
							'<td>1.2</td>' +
							'<td>1.3</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);
	} );

	// https://github.com/ckeditor/ckeditor5/issues/11000
	it( 'should not strip allowed attributes from elements that are not directly upcasted (like <thead> or <tbody>) ' +
		'if another upcast converter exists for all possible view elements', async () => {
		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Table, TableCaption, Paragraph, GeneralHtmlSupport, ClipboardPipeline, function( editor ) {
				editor.conversion.for( 'upcast' ).attributeToAttribute( {
					view: 'align',
					model: 'alignment'
				} );
			} ],
			htmlSupport: {
				allow: [
					{
						name: /^(figure|table|tbody|thead|tr|th|td)$/,
						attributes: true
					}
				]
			}
		} );

		editor.setData(
			'<table>' +
				'<thead align="right" dir="ltr" lang="en" valign="bottom">' +
					'<tr>' +
						'<th>Bar</th>' +
					'</tr>' +
				'</thead>' +
				'<tbody align="right" dir="ltr" lang="en" valign="bottom">' +
					'<tr align="right" valign="bottom">' +
						'<td align="right" valign="bottom">Foo</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);

		expect( editor.getData() ).to.equalMarkup(
			'<figure class="table">' +
				'<table>' +
					'<thead align="right" dir="ltr" lang="en" valign="bottom">' +
						'<tr>' +
							'<th>Bar</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody align="right" dir="ltr" lang="en" valign="bottom">' +
						'<tr align="right" valign="bottom">' +
							'<td align="right" valign="bottom">Foo</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		await editor.destroy();
	} );

	// https://github.com/ckeditor/ckeditor5/issues/11479
	it( 'should not strip attributes from <colgroup> and <col> elements', async () => {
		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Table, TableCaption, TableColumnResize, Paragraph, GeneralHtmlSupport, ClipboardPipeline ],
			htmlSupport: {
				allow: [
					{
						name: /^(figure|table|colgroup|col|tbody|thead|tr|th|td)$/,
						attributes: true
					}
				]
			}
		} );

		editor.setData(
			'<table>' +
				'<colgroup data-foo="bar">' +
					'<col data-baz="qux"></col>' +
				'</colgroup>' +
				'<tbody>' +
					'<tr>' +
						'<td>Foo</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);

		expect( editor.getData() ).to.equalMarkup(
			'<figure class="table">' +
				'<table class="ck-table-resized">' +
					'<colgroup data-foo="bar">' +
						'<col style="width:100%;" data-baz="qux">' +
					'</colgroup>' +
					'<tbody>' +
						'<tr>' +
							'<td>Foo</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		await editor.destroy();
	} );

	// https://github.com/ckeditor/ckeditor5/issues/13876
	it( 'should not throw error when pasting table inside the custom element', async () => {
		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Typing,
				Paragraph,
				ClipboardPipeline,
				Table,
				TableCaption,
				TableColumnResize,
				GeneralHtmlSupport
			],
			htmlSupport: {
				allow: [
					{
						name: /^.*$/,
						styles: true,
						attributes: true,
						classes: true
					}
				]
			}
		} );

		setData( editor.model, '<paragraph>[]</paragraph>' );

		pasteHtml( editor,
			'<custom-element>' +
				'<table dir="ltr">' +
					'<tbody>' +
						'<tr>' +
							'<td>Foo</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</custom-element>'
		);

		expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
			'<paragraph>' +
				'<htmlCustomElement ' +
					'htmlContent="<table dir="ltr"><tbody><tr><td>Foo</td></tr></tbody></table>" ' +
					'htmlElementName="custom-element"' +
				'>' +
				'</htmlCustomElement>' +
			'</paragraph>'
		);

		await editor.destroy();
	} );

	it( 'should upcast GHS attributes at the low priority (feature attribute converter at low + 1 priority)', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true,
			styles: true,
			classes: true
		} ] );

		editor.model.schema.extend( 'table', { allowAttributes: [ 'barAttr' ] } );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: 'foo-attr',
			model: 'barAttr',
			converterPriority: priorities.get( 'low' ) + 1
		} );

		editor.setData(
			'<figure class="table" foo-attr="100">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table barAttr="100">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: { }
		} );
	} );

	it( 'should upcast GHS attributes at the low priority (feature attribute converter at low priority)', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true,
			styles: true,
			classes: true
		} ] );

		// Apply filtering rules added after initial data load.
		editor.setData( '' );

		editor.model.schema.extend( 'table', { allowAttributes: [ 'barAttr' ] } );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: 'foo-attr',
			model: 'barAttr',
			converterPriority: 'low'
		} );

		editor.setData(
			'<figure class="table" foo-attr="100">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table htmlFigureAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: { attributes: { 'foo-attr': '100' } }
			}
		} );
	} );

	it( 'should convert markers on the figure element', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true,
			styles: true,
			classes: true
		} ] );

		editor.conversion.for( 'upcast' ).dataToMarker( {
			view: 'commented'
		} );

		editor.setData(
			'<figure data-commented-end-after="foo:id" data-commented-start-before="foo:id" class="table">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: { }
		} );

		const marker = model.markers.get( 'commented:foo:id' );

		expect( marker.getStart().path ).to.deep.equal( [ 0 ] );
		expect( marker.getEnd().path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should convert markers on the table element', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true,
			styles: true,
			classes: true
		} ] );

		editor.conversion.for( 'upcast' ).dataToMarker( {
			view: 'commented'
		} );

		editor.setData(
			'<table data-commented-end-after="foo:id" data-commented-start-before="foo:id">' +
				'<tbody>' +
					'<tr>' +
						'<td>1.1</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: { }
		} );

		const marker = model.markers.get( 'commented:foo:id' );

		expect( marker.getStart().path ).to.deep.equal( [ 0 ] );
		expect( marker.getEnd().path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should upcast custom attributes with marker', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true,
			styles: true,
			classes: true
		} ] );

		editor.conversion.for( 'upcast' ).dataToMarker( {
			view: 'commented'
		} );

		editor.setData(
			'<figure data-commented-end-after="foo:id" data-commented-start-before="foo:id" class="table" foo="bar">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>1.1</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table htmlFigureAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1.1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					attributes: {
						foo: 'bar'
					}
				}
			}
		} );

		const marker = model.markers.get( 'commented:foo:id' );

		expect( marker.getStart().path ).to.deep.equal( [ 0 ] );
		expect( marker.getEnd().path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should propagate specific styles from table to figure element', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true,
			styles: true,
			classes: true
		} ] );

		editor.setData(
			'<table style="max-width: 49%; min-width: 49%; width: 100%; ' +
					'max-height: 100px; min-height: 100px; height: 100px; background-color: red;">' +
				'<tbody>' +
					'<tr>' +
						'<td>1</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);

		expect( editor.getData() ).to.equal(
			'<figure class="table" style="height:100px;max-height:100px;max-width:49%;min-height:100px;min-width:49%;width:100%;">' +
				'<table style="background-color:red;">' +
					'<tbody>' +
						'<tr>' +
							'<td>1</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table htmlTableAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					styles: {
						'background-color': 'red',
						'height': '100px',
						'max-height': '100px',
						'max-width': '49%',
						'min-height': '100px',
						'min-width': '49%',
						width: '100%'
					}
				}
			}
		} );
	} );

	it( 'should propagate specific styles change from table to figure element', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true,
			styles: true,
			classes: true
		} ] );

		editor.setData(
			'<table style="width: 100%; background-color: red;">' +
				'<tbody>' +
					'<tr>' +
						'<td>1</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);

		expect( editor.getData() ).to.equal(
			'<figure class="table" style="width:100%;">' +
				'<table style="background-color:red;">' +
					'<tbody>' +
						'<tr>' +
							'<td>1</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table htmlTableAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					styles: {
						'background-color': 'red',
						width: '100%'
					}
				}
			}
		} );

		editor.model.change( writer => {
			const table = writer.model.document.getRoot().getChild( 0 );
			const tableAttributes = table.getAttribute( 'htmlTableAttributes' );
			const newTableAttributes = {
				...tableAttributes,
				styles: {
					...tableAttributes.styles,
					width: '30%'
				}
			};

			writer.setAttribute( 'htmlTableAttributes', newTableAttributes, table );
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="table" style="width:30%;">' +
				'<table style="background-color:red;">' +
					'<tbody>' +
						'<tr>' +
							'<td>1</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table htmlTableAttributes="(1)">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>1</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>',
			attributes: {
				1: {
					styles: {
						'background-color': 'red',
						width: '30%'
					}
				}
			}
		} );
	} );

	it( 'should remove htmlTheadAttributes if table does not have thead', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true
		} ] );

		editor.setData(
			'<figure class="table">' +
				'<table>' +
					'<thead data-foo="head">' +
						'<tr>' +
							'<th>1</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody data-bar="body">' +
						'<tr>' +
							'<td>2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1" htmlTbodyAttributes="(1)" htmlTheadAttributes="(2)">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'</table>',
			attributes: {
				1: {
					attributes: {
						'data-bar': 'body'
					}
				},
				2: {
					attributes: {
						'data-foo': 'head'
					}
				}
			}
		} );

		model.change( writer => {
			writer.removeAttribute( 'headingRows', model.document.getRoot().getChild( 0 ) );
		} );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table htmlTbodyAttributes="(1)">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'</table>',
			attributes: {
				1: {
					attributes: {
						'data-bar': 'body'
					}
				}
			}
		} );
	} );

	it( 'should remove htmlTbodyAttributes if table does not have tbody', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /.*/,
			attributes: true
		} ] );

		editor.setData(
			'<figure class="table">' +
				'<table>' +
					'<thead data-foo="head">' +
						'<tr>' +
							'<th>1</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody data-bar="body">' +
						'<tr>' +
							'<td>2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="1" htmlTbodyAttributes="(1)" htmlTheadAttributes="(2)">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'</table>',
			attributes: {
				1: {
					attributes: {
						'data-bar': 'body'
					}
				},
				2: {
					attributes: {
						'data-foo': 'head'
					}
				}
			}
		} );

		model.change( writer => {
			writer.setAttribute( 'headingRows', 2, model.document.getRoot().getChild( 0 ) );
		} );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<table headingRows="2" htmlTheadAttributes="(1)">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'</table>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'head'
					}
				}
			}
		} );
	} );

	describe( 'TableCaption', () => {
		// Sanity tests verifying if table caption is correctly handled by default converters.

		it( 'should allow attributes (caption)', () => {
			dataFilter.loadAllowedConfig( [ {
				// caption is changed to figcaption by TableCaption feature.
				name: /^(caption|figcaption)$/,
				attributes: 'data-foo',
				styles: 'color',
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="table">' +
					'<table>' +
						'<caption class="foobar" style="color:red;" data-foo="foo">caption</caption>' +
						'<tbody>' +
							'<tr>' +
								'<td>1.1</td>' +
								'<td>1.2</td>' +
								'<td>1.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>1.1</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>1.2</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>1.3</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<caption htmlCaptionAttributes="(1)">caption</caption>' +
					'</table>',
				attributes: {
					1: {
						attributes: { 'data-foo': 'foo' },
						styles: { color: 'red' },
						classes: [ 'foobar' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>1.1</td>' +
								'<td>1.2</td>' +
								'<td>1.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<figcaption class="foobar" style="color:red;" data-foo="foo">caption</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should disallow attributes (caption)', () => {
			dataFilter.loadAllowedConfig( [ {
				// caption is changed to figcaption by TableCaption feature.
				name: /^(caption|figcaption)$/,
				attributes: 'data-foo',
				styles: 'color',
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				// caption is changed to figcaption by TableCaption feature.
				name: /^(caption|figcaption)$/,
				attributes: 'data-foo',
				styles: 'color',
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="table">' +
					'<table>' +
						'<caption class="foobar" style="color:red;" data-foo="foo">caption</caption>' +
						'<tbody>' +
							'<tr>' +
								'<td>1.1</td>' +
								'<td>1.2</td>' +
								'<td>1.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>1.1</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>1.2</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>1.3</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<caption>caption</caption>' +
					'</table>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>1.1</td>' +
								'<td>1.2</td>' +
								'<td>1.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<figcaption>caption</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should allow attributes (figcaption)', () => {
			dataFilter.loadAllowedConfig( [ {
				name: 'figcaption',
				attributes: 'data-foo',
				styles: 'color',
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>1.1</td>' +
								'<td>1.2</td>' +
								'<td>1.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<figcaption class="foobar" style="color:red;" data-foo="foo">caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>1.1</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>1.2</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>1.3</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<caption htmlFigcaptionAttributes="(1)">caption</caption>' +
					'</table>',
				attributes: {
					1: {
						attributes: { 'data-foo': 'foo' },
						styles: { color: 'red' },
						classes: [ 'foobar' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>1.1</td>' +
								'<td>1.2</td>' +
								'<td>1.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<figcaption class="foobar" style="color:red;" data-foo="foo">caption</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should disallow attributes (figcaption)', () => {
			dataFilter.loadAllowedConfig( [ {
				name: 'figcaption',
				attributes: 'data-foo',
				styles: 'color',
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: 'figcaption',
				attributes: 'data-foo',
				styles: 'color',
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>1.1</td>' +
								'<td>1.2</td>' +
								'<td>1.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<figcaption class="foobar" style="color:red;" data-foo="foo">caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>1.1</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>1.2</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>1.3</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<caption>caption</caption>' +
					'</table>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>1.1</td>' +
								'<td>1.2</td>' +
								'<td>1.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<figcaption>caption</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should handle mixed allowed and disallowed attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|table|tbody|thead|tr|th|td)$/,
				attributes: /^data-.*$/,
				classes: [ 'allow', 'disallow' ],
				styles: [ 'color', 'background' ]
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|table|tbody|thead|tr|th|td)$/,
				attributes: 'data-disallow',
				classes: 'disallow',
				styles: 'background'
			} ] );

			/* eslint-disable @stylistic/max-len */
			editor.setData(
				'<figure class="table allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
					'<table class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
						'<thead class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
							'<tr class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
								'<th class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">1</th>' +
								'<th class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">2</th>' +
								'<th class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">3</th>' +
							'</tr>' +
						'</thead>' +
						'<tbody class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
							'<tr class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
								'<td class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">1.1</td>' +
								'<td class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">1.2</td>' +
								'<td class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">1.3</td>' +
							'</tr>' +
							'<tr class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
								'<td class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">2.1</td>' +
								'<td class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">2.2</td>' +
								'<td class="allow disallow invalid" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">2.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<table headingRows="1" htmlFigureAttributes="(1)" htmlTableAttributes="(2)" htmlTbodyAttributes="(3)" htmlTheadAttributes="(4)">' +
						'<tableRow htmlTrAttributes="(5)">' +
							'<tableCell htmlThAttributes="(6)">' +
								'<paragraph>1</paragraph>' +
							'</tableCell>' +
							'<tableCell htmlThAttributes="(7)">' +
								'<paragraph>2</paragraph>' +
							'</tableCell>' +
							'<tableCell htmlThAttributes="(8)">' +
								'<paragraph>3</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<tableRow htmlTrAttributes="(9)">' +
							'<tableCell htmlTdAttributes="(10)">' +
								'<paragraph>1.1</paragraph>' +
							'</tableCell>' +
							'<tableCell htmlTdAttributes="(11)">' +
								'<paragraph>1.2</paragraph>' +
							'</tableCell>' +
							'<tableCell htmlTdAttributes="(12)">' +
								'<paragraph>1.3</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<tableRow htmlTrAttributes="(13)">' +
							'<tableCell htmlTdAttributes="(14)">' +
								'<paragraph>2.1</paragraph>' +
							'</tableCell>' +
							'<tableCell htmlTdAttributes="(15)">' +
								'<paragraph>2.2</paragraph>' +
							'</tableCell>' +
							'<tableCell htmlTdAttributes="(16)">' +
								'<paragraph>2.3</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>',
				attributes: range( 1, 17 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						attributes: {
							'data-allow': 'allow'
						},
						styles: {
							color: 'red'
						},
						classes: [ 'allow' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="table allow" style="color:red;" data-allow="allow">' +
					'<table class="allow" style="color:red;" data-allow="allow">' +
						'<thead class="allow" style="color:red;" data-allow="allow">' +
							'<tr class="allow" style="color:red;" data-allow="allow">' +
								'<th class="allow" style="color:red;" data-allow="allow">1</th>' +
								'<th class="allow" style="color:red;" data-allow="allow">2</th>' +
								'<th class="allow" style="color:red;" data-allow="allow">3</th>' +
							'</tr>' +
						'</thead>' +
						'<tbody class="allow" style="color:red;" data-allow="allow">' +
							'<tr class="allow" style="color:red;" data-allow="allow">' +
								'<td class="allow" style="color:red;" data-allow="allow">1.1</td>' +
								'<td class="allow" style="color:red;" data-allow="allow">1.2</td>' +
								'<td class="allow" style="color:red;" data-allow="allow">1.3</td>' +
							'</tr>' +
							'<tr class="allow" style="color:red;" data-allow="allow">' +
								'<td class="allow" style="color:red;" data-allow="allow">2.1</td>' +
								'<td class="allow" style="color:red;" data-allow="allow">2.2</td>' +
								'<td class="allow" style="color:red;" data-allow="allow">2.3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
			/* eslint-enable @stylistic/max-len */
		} );
	} );
} );

function pasteHtml( editor, html ) {
	editor.editing.view.document.fire( 'paste', {
		dataTransfer: createDataTransfer( { 'text/html': html } ),
		stopPropagation() { },
		preventDefault() { }
	} );
}

function createDataTransfer( data ) {
	return {
		getData( type ) {
			return data[ type ];
		}
	};
}
