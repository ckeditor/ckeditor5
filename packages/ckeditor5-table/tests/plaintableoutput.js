/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Table from '../src/table';
import TableUtils from '../src/tableutils';
import PlainTableOutput from '../src/plaintableoutput';
import { modelTable } from './_utils/utils';
import TableCaption from '../src/tablecaption';
import TablePropertiesEditing from '../src/tableproperties/tablepropertiesediting';

describe( 'PlainTableOutput', () => {
	let editor, editorElement, model;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, Table, TableCaption, PlainTableOutput ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'requires Table, TablePropertiesEditing, TableCaption and  TableUtils', () => {
		expect( PlainTableOutput.requires ).to.deep.equal( [
			Table,
			TablePropertiesEditing,
			TableCaption,
			TableUtils
		] );
	} );

	it( 'should have pluginName', () => {
		expect( PlainTableOutput.pluginName ).to.equal( 'PlainTableOutput' );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should create tbody section', () => {
				setModelData( model, modelTable( [
					[ 'foo' ]
				] ) );

				expect( editor.getData() ).to.equal(
					'<table>' +
						'<tbody>' +
							'<tr><td>foo</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should create heading rows', () => {
				setModelData( model, modelTable( [
					[ '1', '2' ],
					[ '3', '4' ],
					[ '5', '6' ]
				], { headingRows: 2 } ) );

				expect( editor.getData() ).to.equal(
					'<table>' +
						'<tbody>' +
							'<tr><th>1</th><th>2</th></tr>' +
							'<tr><th>3</th><th>4</th></tr>' +
							'<tr><td>5</td><td>6</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should create heading columns', () => {
				setModelData( model, modelTable( [
					[ '1', '2' ],
					[ '3', '4' ],
					[ '5', '6' ]
				], { headingColumns: 1 } ) );

				expect( editor.getData() ).to.equal(
					'<table>' +
						'<tbody>' +
							'<tr><th>1</th><td>2</td></tr>' +
							'<tr><th>3</th><td>4</td></tr>' +
							'<tr><th>5</th><td>6</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should create heading rows and columns', () => {
				setModelData( model, modelTable( [
					[ '1', '2' ],
					[ '3', '4' ],
					[ '5', '6' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				expect( editor.getData() ).to.equal(
					'<table>' +
						'<tbody>' +
							'<tr><th>1</th><th>2</th></tr>' +
							'<tr><th>3</th><td>4</td></tr>' +
							'<tr><th>5</th><td>6</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should work when heading rows number is bigger than number of rows', () => {
				setModelData( model, modelTable( [
					[ '1', '2' ],
					[ '3', '4' ]
				], { headingRows: 3 } ) );

				expect( editor.getData() ).to.equal(
					'<table>' +
						'<tbody>' +
							'<tr><th>1</th><th>2</th></tr>' +
							'<tr><th>3</th><th>4</th></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should create caption element', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>1</paragraph></tableCell>' +
							'<tableCell><paragraph>2</paragraph></tableCell>' +
						'</tableRow>' +
						'<caption>Foo</caption>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal(
					'<table>' +
						'<caption>Foo</caption>' +
						'<tbody>' +
							'<tr><td>1</td><td>2</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );
		} );
	} );
} );
