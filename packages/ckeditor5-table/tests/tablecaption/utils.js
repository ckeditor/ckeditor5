/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import View from '@ckeditor/ckeditor5-engine/src/view/view.js';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableCaptionEditing from '../../src/tablecaption/tablecaptionediting.js';
import TableEditing from '../../src/tableediting.js';
import {
	getCaptionFromModelSelection,
	getCaptionFromTableModelElement,
	isTable,
	matchTableCaptionViewElement
} from '../../src/tablecaption/utils.js';

describe( 'table caption utils', () => {
	let editor, model, modelRoot;
	let view, document;

	beforeEach( async () => {
		view = new View();
		document = view.document;

		editor = await VirtualTestEditor.create( {
			plugins: [ TableEditing, TableCaptionEditing, Paragraph ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();

		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>11[]</paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<paragraph>12</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>21</paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<paragraph>22</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<caption></caption>' +
			'</table>'
		);
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'isTable', () => {
		it( 'should return true when given a table as a parameter', () => {
			const element = modelRoot.getNodeByPath( [ 0 ] );

			expect( isTable( element ) ).to.be.true;
		} );

		it( 'should return false when given parameter is not a table', () => {
			const element = modelRoot.getNodeByPath( [ 0, 0 ] );

			expect( isTable( element ) ).to.be.false;
		} );

		it( 'should return false when given parameter is not an element', () => {
			expect( isTable() ).to.be.false;
		} );
	} );

	describe( 'getCaptionFromTableModelElement', () => {
		it( 'should return null when given table has no caption', () => {
			setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>11[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
			const element = modelRoot.getNodeByPath( [ 0 ] );

			expect( getCaptionFromTableModelElement( element ) ).to.be.null;
		} );

		it( 'should return caption when given table has it', () => {
			const element = modelRoot.getNodeByPath( [ 0 ] );

			const captionElement = getCaptionFromTableModelElement( element );
			expect( captionElement.is( 'element', 'caption' ) ).to.be.true;
		} );
	} );

	describe( 'getCaptionFromModelSelection', () => {
		it( 'should return null when given table has no caption - selection in a cell', () => {
			setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>11[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( getCaptionFromModelSelection( model.document.selection ) ).to.be.null;
		} );

		it( 'should return null when given table has no caption - selection on a table', () => {
			setModelData( model,
				'[<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>11</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);

			expect( getCaptionFromModelSelection( model.document.selection ) ).to.be.null;
		} );

		it( 'should return caption when given table has it', () => {
			const captionElement = getCaptionFromModelSelection( model.document.selection );

			expect( captionElement.is( 'element', 'caption' ) ).to.be.true;
		} );

		it( 'should return null when no table has been found', () => {
			setModelData( model,
				'<paragraph>[]</paragraph>'
			);

			expect( getCaptionFromModelSelection( model.document.selection ) ).to.be.null;
		} );
	} );

	describe( 'matchTableCaptionViewElement', () => {
		describe( 'figcaption', () => {
			it( 'should return null for element that is not a figcaption', () => {
				const element = new ViewElement( document, 'div' );

				expect( matchTableCaptionViewElement( element ) ).to.be.null;
			} );

			it( 'should return null if figcaption has no parent', () => {
				const element = new ViewElement( document, 'figcaption' );

				expect( matchTableCaptionViewElement( element ) ).to.be.null;
			} );

			it( 'should return null if figcaption\'s parent is not a figure', () => {
				const element = new ViewElement( document, 'figcaption' );
				new ViewElement( document, 'div', null, element ); // eslint-disable-line no-new

				expect( matchTableCaptionViewElement( element ) ).to.be.null;
			} );

			it( 'should return null if parent has no image class', () => {
				const element = new ViewElement( document, 'figcaption' );
				new ViewElement( document, 'figure', null, element ); // eslint-disable-line no-new

				expect( matchTableCaptionViewElement( element ) ).to.be.null;
			} );

			it( 'should return object if element is a valid caption', () => {
				const element = new ViewElement( document, 'figcaption' );
				new ViewElement( document, 'figure', { class: 'table' }, element ); // eslint-disable-line no-new

				expect( matchTableCaptionViewElement( element ) ).to.deep.equal( { name: true } );
			} );
		} );

		describe( 'caption', () => {
			it( 'should return null for element that is not a caption', () => {
				const element = new ViewElement( document, 'div' );

				expect( matchTableCaptionViewElement( element ) ).to.be.null;
			} );

			it( 'should return null if caption has no parent', () => {
				const element = new ViewElement( document, 'caption' );

				expect( matchTableCaptionViewElement( element ) ).to.be.null;
			} );

			it( 'should return null if caption\'s parent is not a table', () => {
				const element = new ViewElement( document, 'caption' );
				new ViewElement( document, 'div', null, element ); // eslint-disable-line no-new

				expect( matchTableCaptionViewElement( element ) ).to.be.null;
			} );

			it( 'should return object if element is a valid caption', () => {
				const element = new ViewElement( document, 'caption' );
				new ViewElement( document, 'table', null, element ); // eslint-disable-line no-new

				expect( matchTableCaptionViewElement( element ) ).to.deep.equal( { name: true } );
			} );
		} );
	} );
} );
