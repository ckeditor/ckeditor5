/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ImageBlock, ImageCaption } from '@ckeditor/ckeditor5-image';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Table, TableCaption } from '@ckeditor/ckeditor5-table';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Style } from '../../src/style.js';
import { TableStyleSupport } from '../../src/integrations/table.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

describe( 'TableStyleSupport', () => {
	let editor, editorElement, command, model;

	testUtils.createSinonSandbox();

	const tableStyle = {
		name: 'Test table style',
		element: 'table',
		classes: [ 'test-table-style' ]
	};
	const theadStyle = {
		name: 'Test thead style',
		element: 'thead',
		classes: [ 'test-thead-style' ]
	};
	const tbodyStyle = {
		name: 'Test tbody style',
		element: 'tbody',
		classes: [ 'test-tbody-style' ]
	};
	const trStyle = {
		name: 'Test tr style',
		element: 'tr',
		classes: [ 'test-tr-style' ]
	};
	const thStyle = {
		name: 'Test th style',
		element: 'th',
		classes: [ 'test-th-style' ]
	};
	const tdStyle = {
		name: 'Test td style',
		element: 'td',
		classes: [ 'test-td-style' ]
	};
	const captionStyle = {
		name: 'Test caption style',
		element: 'caption',
		classes: [ 'test-caption-style' ]
	};
	const figcaptionStyle = {
		name: 'Test figcaption style',
		element: 'figcaption',
		classes: [ 'test-figcaption-style' ]
	};

	beforeEach( async () => {
		await createEditor( [
			tableStyle,
			theadStyle,
			tbodyStyle,
			trStyle,
			thStyle,
			tdStyle,
			captionStyle,
			figcaptionStyle
		] );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableStyleSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableStyleSupport.isPremiumPlugin ).to.be.false;
	} );

	it( 'should add class to table element', () => {
		_setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[foo]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
		expect( command.enabledStyles ).to.deep.include( tableStyle.name );
		command.execute( { styleName: 'Test table style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table htmlTableAttributes="{"classes":["test-table-style"]}">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should add class to table element then remove', () => {
		_setModelData( model,
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[foo]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.deep.include( tableStyle.name );
		command.execute( { styleName: 'Test table style' } );
		expect( command.enabledStyles ).to.deep.include( tableStyle.name );
		command.execute( { styleName: 'Test table style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should add class to thead element', () => {
		_setModelData( model,
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[foo]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.have.members( [
			tableStyle.name,
			tbodyStyle.name,
			theadStyle.name,
			trStyle.name,
			thStyle.name
		] );

		command.execute( { styleName: 'Test thead style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table headingRows="1" htmlTheadAttributes="{"classes":["test-thead-style"]}">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		command.execute( { styleName: 'Test thead style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should add class to tbody element (table without heading rows)', () => {
		_setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[foo]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.have.members( [
			tableStyle.name,
			tbodyStyle.name,
			trStyle.name,
			tdStyle.name
		] );

		command.execute( { styleName: 'Test tbody style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table htmlTbodyAttributes="{"classes":["test-tbody-style"]}">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		command.execute( { styleName: 'Test tbody style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should add class to thead element (table only with heading rows)', () => {
		_setModelData( model,
			'<table headingRows="2">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[foo]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.have.members( [
			tableStyle.name,
			theadStyle.name,
			trStyle.name,
			thStyle.name
		] );

		command.execute( { styleName: 'Test thead style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table headingRows="2" htmlTheadAttributes="{"classes":["test-thead-style"]}">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		command.execute( { styleName: 'Test thead style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table headingRows="2">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should add class to th element when heading is selected', () => {
		_setModelData( model,
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[foo]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.deep.include( thStyle.name );
		expect( command.enabledStyles ).to.not.deep.include( tdStyle.name );
		command.execute( { styleName: 'Test th style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell htmlThAttributes="{"classes":["test-th-style"]}">' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should not add class to th element when regular row is selected', () => {
		_setModelData( model,
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[bar]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.deep.include( tdStyle.name );
		expect( command.enabledStyles ).to.not.deep.include( thStyle.name );

		sinon.stub( console, 'warn' );
		command.execute( { styleName: 'Test th style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should add class to tr element', () => {
		_setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[foo]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.deep.include( trStyle.name );
		command.execute( { styleName: 'Test tr style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table>' +
				'<tableRow htmlTrAttributes="{"classes":["test-tr-style"]}">' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should add class to td element', () => {
		_setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>[foo]</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.deep.include( tdStyle.name );
		expect( command.enabledStyles ).to.not.deep.include( thStyle.name );
		command.execute( { styleName: 'Test td style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table>' +
				'<tableRow>' +
					'<tableCell htmlTdAttributes="{"classes":["test-td-style"]}">' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should add class to caption element', () => {
		_setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<caption>a[bc]</caption>' +
			'</table>'
		);

		expect( command.enabledStyles ).to.deep.include( captionStyle.name );
		command.execute( { styleName: 'Test caption style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<caption htmlCaptionAttributes="{"classes":["test-caption-style"]}">abc</caption>' +
			'</table>'
		);
	} );

	it( 'should allow setting both caption and figcaption styles on caption element', () => {
		_setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<caption>[abc]</caption>' +
			'</table>'
		);
		expect( command.enabledStyles ).to.deep.include( captionStyle.name );
		expect( command.enabledStyles ).to.deep.include( figcaptionStyle.name );
		command.execute( { styleName: 'Test caption style' } );
		command.execute( { styleName: 'Test figcaption style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<caption' +
					' htmlCaptionAttributes="{"classes":["test-caption-style"]}"' +
					' htmlFigcaptionAttributes="{"classes":["test-figcaption-style"]}"' +
					'>' +
					'abc</caption>' +
			'</table>'
		);
	} );

	it( 'should apply th style only to th elements even if other cells are selected', () => {
		_setModelData( model,
			'<table headingRows="1">' +
				'<tableRow>' +
					'[<tableCell>' +
						'<paragraph>header</paragraph>' +
					'</tableCell>]' +
				'</tableRow>' +
				'<tableRow>' +
					'[<tableCell>' +
						'<paragraph>regular</paragraph>' +
					'</tableCell>]' +
				'</tableRow>' +
				'<tableRow>' +
					'[<tableCell>' +
						'<paragraph>regular</paragraph>' +
					'</tableCell>]' +
				'</tableRow>' +
			'</table>'
		);

		command.execute( { styleName: 'Test th style' } );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table headingRows="1">' +
				'<tableRow>' +
					'<tableCell htmlThAttributes="{"classes":["test-th-style"]}">' +
						'<paragraph>header</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>regular</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>regular</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	async function createEditor( styleDefinitions ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph, ImageBlock, ImageCaption, Heading, CodeBlock, BlockQuote, Table, TableCaption, GeneralHtmlSupport, Style
			],
			style: {
				definitions: styleDefinitions
			},
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

		model = editor.model;
		command = editor.commands.get( 'style' );
	}
} );
