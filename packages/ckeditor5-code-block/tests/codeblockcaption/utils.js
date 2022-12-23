/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import CodeBlock from '../../src/codeblock';
import CodeblockCaption from '../../src/codeblockcaption';
import {
	isCodeblockWrapper,
	matchCodeblockCaptionViewElement,
	getCaptionFromCodeblockModelElement,
	getCodeblockCaptionFromModelSelection,
	isInsideCodeblockCaptionFromSelection
} from '../../src/codeblockcaption/utils';

describe( 'codeblock caption utils', () => {
	let editor, model, modelRoot;
	let element;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				language: 'en',
				plugins: [
					CodeBlock,
					CodeblockCaption,
					Paragraph
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				setModelData( model,
					'<codeBlock language="plaintext">' +
						'Code snippet goes here[]' +
						'<caption>codeblock caption</caption>' +
					'</codeBlock>' +
					'<paragraph>' +
						'Paragraph data is here' +
					'</paragraph>'
				);
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'isCodeblockWrapper', () => {
		it( 'should return true when given a codeblock as a parameter', () => {
			const element = modelRoot.getNodeByPath( [ 0 ] );

			expect( isCodeblockWrapper( element ) ).to.be.true;
		} );

		it( 'should return false when given parameter is not a codeblock', () => {
			const element = modelRoot.getNodeByPath( [ 1 ] );

			expect( isCodeblockWrapper( element ) ).to.be.false;
		} );

		it( 'should return false when given parameter is not an element', () => {
			expect( isCodeblockWrapper() ).to.be.false;
		} );
	} );

	describe( 'matchCodeblockCaptionViewElement', () => {
		it( 'should return null for element that is not a figcaption', () => {
			const element = new ViewElement( document, 'div' );

			expect( matchCodeblockCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return null if figcaption has no parent', () => {
			const element = new ViewElement( document, 'figcaption' );

			expect( matchCodeblockCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return null if figcaption\'s parent is not a pre', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'div', null, element ); // eslint-disable-line no-new

			expect( matchCodeblockCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return object if element is a valid caption', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'pre', null, element ); // eslint-disable-line no-new

			expect( matchCodeblockCaptionViewElement( element ) ).to.deep.equal( { name: true } );
		} );
	} );

	describe( 'getCaptionFromCodeblockModelElement', () => {
		it( 'should return null when given element has no caption', () => {
			setModelData( model,
				'<codeBlock language="plaintext">' +
				'</codeBlock>'
			);
			const element = modelRoot.getNodeByPath( [ 0 ] );

			expect( getCaptionFromCodeblockModelElement( element ) ).to.be.null;
		} );

		it( 'should return caption when given codeblock has it', () => {
			const element = modelRoot.getNodeByPath( [ 0 ] );

			const captionElement = getCaptionFromCodeblockModelElement( element );
			expect( captionElement.is( 'element', 'caption' ) ).to.be.true;
		} );
	} );

	describe( 'getCodeblockCaptionFromModelSelection', () => {
		it( 'should return null when given codeblock has no caption - selection in a codeblock', () => {
			setModelData( model,
				'<codeBlock language="plaintext">' +
					'[]' +
				'</codeBlock>'
			);

			expect( getCodeblockCaptionFromModelSelection( model.document.selection ) ).to.be.null;
		} );

		it( 'should return null when given codeblock has no caption - selection on codeblock', () => {
			setModelData( model,
				'[<codeBlock language="plaintext">' +
				'</codeBlock>]'
			);

			expect( getCodeblockCaptionFromModelSelection( model.document.selection ) ).to.be.null;
		} );

		it( 'should return caption when given codeblock has it', () => {
			const captionElement = getCodeblockCaptionFromModelSelection( model.document.selection );

			expect( captionElement.is( 'element', 'caption' ) ).to.be.true;
		} );

		it( 'should return null when no codeblock has been found', () => {
			model.schema.register( 'widget' );
			model.schema.extend( 'widget', { allowIn: '$root' } );
			model.schema.extend( 'caption', { allowIn: 'widget' } );
			model.schema.extend( '$text', { allowIn: 'widget' } );

			editor.conversion.elementToElement( {
				model: 'widget',
				view: 'widget'
			} );

			editor.conversion.elementToElement( {
				model: 'caption',
				view: 'figcaption'
			} );

			setModelData( model,
				'<widget>[]<caption>foo</caption></widget>'
			);

			expect( getCodeblockCaptionFromModelSelection( model.document.selection ) ).to.be.null;
		} );
	} );

	describe( 'isInsideCodeblockCaptionFromSelection', () => {
		it( 'should return false when given codeblock has no caption - selection in a codeblock', () => {
			setModelData( model,
				'<codeBlock language="plaintext">' +
					'[]' +
				'</codeBlock>'
			);

			expect( isInsideCodeblockCaptionFromSelection( model.document.selection ) ).to.be.false;
		} );
	} );

	it( 'should return false when given codeblock has no caption - selection on codeblock', () => {
		setModelData( model,
			'[<codeBlock language="plaintext">' +
			'</codeBlock>]'
		);

		expect( isInsideCodeblockCaptionFromSelection( model.document.selection ) ).to.be.false;
	} );

	it( 'should return false when given codeblock  caption - selection in a codeblock', () => {
		expect( isInsideCodeblockCaptionFromSelection( model.document.selection ) ).to.be.false;
	} );

	it( 'should return true when selection is in codeblock empty caption', () => {
		setModelData( model,
			'<codeBlock language="plaintext">' +
				'<caption>[]</caption>' +
			'</codeBlock>'
		);
		expect( isInsideCodeblockCaptionFromSelection( model.document.selection ) ).to.be.true;
	} );

	it( 'should return true when selection is in codeblock non caption', () => {
		setModelData( model,
			'<codeBlock language="plaintext">' +
				'<caption>f[]oo</caption>' +
			'</codeBlock>'
		);
		expect( isInsideCodeblockCaptionFromSelection( model.document.selection ) ).to.be.true;
	} );

	it( 'should return false when selection inside caption of widget', () => {
		model.schema.register( 'widget' );
		model.schema.extend( 'widget', { allowIn: '$root' } );
		model.schema.extend( 'caption', { allowIn: 'widget' } );
		model.schema.extend( '$text', { allowIn: 'widget' } );

		editor.conversion.elementToElement( {
			model: 'widget',
			view: 'widget'
		} );

		editor.conversion.elementToElement( {
			model: 'caption',
			view: 'figcaption'
		} );

		setModelData( model,
			'<widget><caption>foo[]</caption></widget>'
		);

		expect( isInsideCodeblockCaptionFromSelection( model.document.selection ) ).to.be.false;
	} );
} );
