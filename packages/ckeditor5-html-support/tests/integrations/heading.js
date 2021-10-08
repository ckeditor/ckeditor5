/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';

/* global document */

describe( 'HeadingElementSupport', () => {
	let editor, editorElement, dataSchema;

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'HeadingEditing plugin is available', () => {
		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const newEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ HeadingEditing, GeneralHtmlSupport ],
					heading: {
						options: [
							{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
							{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
							{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
							{ model: 'otherHeading', view: 'h5', title: 'Other kind of heading', class: 'ck-heading_heading3' }
						]
					}
				} );

			editor = newEditor;
			dataSchema = editor.plugins.get( 'DataSchema' );
		} );

		it( 'should register heading schemas', () => {
			expect( dataSchema._definitions.get( 'heading1' ) ).to.deep.equal( {
				model: 'heading1',
				view: 'h1',
				isBlock: true
			} );

			expect( dataSchema._definitions.get( 'heading2' ) ).to.deep.equal( {
				model: 'heading2',
				view: 'h2',
				isBlock: true
			} );

			expect( dataSchema._definitions.get( 'otherHeading' ) ).to.deep.equal( {
				model: 'otherHeading',
				view: 'h5',
				isBlock: true
			} );
		} );

		it( 'should add heading models as allowed children of htmlHgroup', () => {
			expect( dataSchema._definitions.get( 'htmlHgroup' ) ).to.deep.equal( {
				model: 'htmlHgroup',
				view: 'hgroup',
				modelSchema: {
					allowChildren: [
						'htmlH1',
						'htmlH2',
						'htmlH3',
						'htmlH4',
						'htmlH5',
						'htmlH6',
						'heading1',
						'heading2',
						'otherHeading'
					],
					isBlock: true
				},
				isBlock: true
			} );
		} );
	} );

	describe( 'HeadingEditing plugin is not available', () => {
		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const newEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ GeneralHtmlSupport ],
					// there is no HeadingEditing plugin, but let's add options just to test they're not read
					heading: {
						options: [
							{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
							{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
							{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
							{ model: 'otherHeading', view: 'h5', title: 'Other kind of heading', class: 'ck-heading_heading3' }
						]
					}
				} );

			editor = newEditor;
			dataSchema = editor.plugins.get( 'DataSchema' );
		} );

		it( 'should not register heading schemas', () => {
			expect( dataSchema._definitions.has( 'heading1' ) ).to.be.false;
			expect( dataSchema._definitions.has( 'heading2' ) ).to.be.false;
			expect( dataSchema._definitions.has( 'otherHeading' ) ).to.be.false;
		} );

		it( 'should not add heading models as allowed children of htmlHgroup', () => {
			expect( dataSchema._definitions.get( 'htmlHgroup' ) ).to.deep.equal( {
				model: 'htmlHgroup',
				view: 'hgroup',
				modelSchema: {
					allowChildren: [
						'htmlH1',
						'htmlH2',
						'htmlH3',
						'htmlH4',
						'htmlH5',
						'htmlH6'
					],
					isBlock: true
				},
				isBlock: true
			} );
		} );
	} );
} );
