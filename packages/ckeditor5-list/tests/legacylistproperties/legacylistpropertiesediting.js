/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import LegacyListPropertiesEditing from '../../src/legacylistproperties/legacylistpropertiesediting.js';
import LegacyTodoListEditing from '../../src/legacytodolist/legacytodolistediting.js';
import LegacyListStyleCommand from '../../src/legacylistproperties/legacyliststylecommand.js';
import LegacyListReversedCommand from '../../src/legacylistproperties/legacylistreversedcommand.js';
import LegacyListStartCommand from '../../src/legacylistproperties/legacyliststartcommand.js';

describe( 'LegacyListPropertiesEditing', () => {
	let editor, model, view;

	it( 'should have pluginName', () => {
		expect( LegacyListPropertiesEditing.pluginName ).to.equal( 'LegacyListPropertiesEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LegacyListPropertiesEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LegacyListPropertiesEditing.isPremiumPlugin ).to.be.false;
	} );

	describe( 'config', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ LegacyListPropertiesEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should have default values', () => {
			expect( editor.config.get( 'list' ) ).to.deep.equal( {
				properties: {
					styles: true,
					startIndex: false,
					reversed: false
				}
			} );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( LegacyListPropertiesEditing ) ).to.be.instanceOf( LegacyListPropertiesEditing );
		} );
	} );

	describe( 'listStyle', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Paragraph, LegacyListPropertiesEditing, UndoEditing ],
					list: {
						properties: { styles: true, startIndex: false, reversed: false }
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					view = editor.editing.view;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should allow set `listStyle` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStyle' ) ).to.be.true;
			} );

			it( 'should not allow set `listReversed` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listReversed' ) ).to.be.false;
			} );

			it( 'should not allow set `listStart` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStart' ) ).to.be.false;
			} );
		} );

		describe( 'command', () => {
			it( 'should register `listStyle` command', () => {
				const command = editor.commands.get( 'listStyle' );

				expect( command ).to.be.instanceOf( LegacyListStyleCommand );
			} );

			it( 'should not register `listReversed` command', () => {
				const command = editor.commands.get( 'listReversed' );

				expect( command ).to.be.undefined;
			} );

			it( 'should not register `listStart` command', () => {
				const command = editor.commands.get( 'listStart' );

				expect( command ).to.be.undefined;
			} );
		} );

		describe( 'conversion in data pipeline', () => {
			describe( 'model to data', () => {
				it( 'should convert single list (type: bulleted)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ul><li>Foo</li><li>Bar</li></ul>' );
				} );

				it( 'should convert single list (type: numbered)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should convert single list (type: bulleted, style: default)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="default">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="default">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ul><li>Foo</li><li>Bar</li></ul>' );
				} );

				it( 'should convert single list (type: numbered, style: default)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStyle="default">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStyle="default">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should convert single list (type: bulleted, style: circle)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ul style="list-style-type:circle;"><li>Foo</li><li>Bar</li></ul>' );
				} );

				it( 'should convert single list (type: numbered, style: upper-latin)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStyle="upper-latin">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStyle="upper-latin">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol style="list-style-type:upper-latin;"><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should convert nested bulleted lists (main: circle, nested: disc)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ul style="list-style-type:circle;">' +
						'<li>Foo 1' +
							'<ul style="list-style-type:disc;">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ul>' +
						'</li>' +
						'<li>Foo 2</li>' +
						'<li>Foo 3</li>' +
					'</ul>'
					);
				} );

				it( 'should convert nested numbered lists (main: decimal-leading-zero, nested: lower-latin)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStyle="lower-latin">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStyle="lower-latin">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol style="list-style-type:decimal-leading-zero;">' +
						'<li>Foo 1' +
							'<ol style="list-style-type:lower-latin;">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ol>' +
						'</li>' +
						'<li>Foo 2</li>' +
						'<li>Foo 3</li>' +
					'</ol>'
					);
				} );

				it( 'should convert nested mixed lists (ul>ol, main: square, nested: lower-roman)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStyle="lower-roman">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStyle="lower-roman">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ul style="list-style-type:square;">' +
						'<li>Foo 1' +
							'<ol style="list-style-type:lower-roman;">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ol>' +
						'</li>' +
						'<li>Foo 2</li>' +
						'<li>Foo 3</li>' +
					'</ul>'
					);
				} );

				it( 'should produce nested lists (different `listIndent` attribute)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 1</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 2</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStyle="decimal">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStyle="decimal">Bar 2</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol style="list-style-type:decimal;">' +
						'<li>Foo 1</li>' +
						'<li>Foo 2' +
							'<ol style="list-style-type:decimal;">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
					);
				} );

				it( 'should produce two different lists (different `listType` attribute)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 1</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="disc">Bar 2</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol style="list-style-type:decimal;">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ol>' +
						'<ul style="list-style-type:disc;">' +
							'<li>Bar 1</li>' +
							'<li>Bar 2</li>' +
						'</ul>'
					);
				} );

				it( 'should produce two different lists (different `listStyle` attribute)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="disc">Foo 1</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="disc">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar 1</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar 2</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ul style="list-style-type:disc;">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ul>' +
						'<ul style="list-style-type:circle;">' +
							'<li>Bar 1</li>' +
							'<li>Bar 2</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'view to model', () => {
				it( 'should convert single list (type: bulleted)', () => {
					editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: numbered)', () => {
					editor.setData( '<ol><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStyle="default" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="default" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: bulleted, style: circle)', () => {
					editor.setData( '<ul style="list-style-type:circle;"><li>Foo</li><li>Bar</li></ul>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: numbered, style: upper-latin)', () => {
					editor.setData( '<ol style="list-style-type:upper-latin;"><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStyle="upper-latin" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="upper-latin" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert nested and mixed lists', () => {
					editor.setData(
						'<ol style="list-style-type:upper-latin;">' +
							'<li>OL 1</li>' +
							'<li>OL 2' +
								'<ul style="list-style-type:circle;">' +
									'<li>UL 1</li>' +
									'<li>UL 2</li>' +
								'</ul>' +
							'</li>' +
							'<li>OL 3</li>' +
						'</ol>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStyle="upper-latin" listType="numbered">OL 1</listItem>' +
						'<listItem listIndent="0" listStyle="upper-latin" listType="numbered">OL 2</listItem>' +
						'<listItem listIndent="1" listStyle="circle" listType="bulleted">UL 1</listItem>' +
						'<listItem listIndent="1" listStyle="circle" listType="bulleted">UL 2</listItem>' +
						'<listItem listIndent="0" listStyle="upper-latin" listType="numbered">OL 3</listItem>'
					);
				} );

				it( 'should convert when the list is in the middle of the content', () => {
					editor.setData(
						'<p>Paragraph.</p>' +
						'<ol style="list-style-type:upper-latin;">' +
							'<li>Foo</li>' +
							'<li>Bar</li>' +
						'</ol>' +
						'<p>Paragraph.</p>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>Paragraph.</paragraph>' +
						'<listItem listIndent="0" listStyle="upper-latin" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="upper-latin" listType="numbered">Bar</listItem>' +
						'<paragraph>Paragraph.</paragraph>'
					);
				} );

				// See: #8262.
				describe( 'list conversion with surrounding text nodes', () => {
					let editor;

					beforeEach( () => {
						return VirtualTestEditor
							.create( {
								plugins: [ Paragraph, LegacyListPropertiesEditing ],
								list: {
									properties: { styles: true, startIndex: false, reversed: false }
								}
							} )
							.then( newEditor => {
								editor = newEditor;
							} );
					} );

					afterEach( () => {
						return editor.destroy();
					} );

					it( 'should convert a list if raw text is before the list', () => {
						editor.setData( 'Foo<ul><li>Foo</li></ul>' );

						expect( editor.getData() ).to.equal( '<p>Foo</p><ul><li>Foo</li></ul>' );
					} );

					it( 'should convert a list if raw text is after the list', () => {
						editor.setData( '<ul><li>Foo</li></ul>Foo' );

						expect( editor.getData() ).to.equal( '<ul><li>Foo</li></ul><p>Foo</p>' );
					} );

					it( 'should convert a list if it is surrender by two text nodes', () => {
						editor.setData( 'Foo<ul><li>Foo</li></ul>Foo' );

						expect( editor.getData() ).to.equal( '<p>Foo</p><ul><li>Foo</li></ul><p>Foo</p>' );
					} );
				} );
			} );
		} );

		// At this moment editing and data pipelines produce exactly the same content.
		// Just a few tests will be enough here. `model to data` block contains all cases checked.
		describe( 'conversion in editing pipeline', () => {
			describe( 'model to view', () => {
				it( 'should convert single list (type: bulleted, style: default)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="default">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="default">Bar</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul><li>Foo</li><li>Bar</li></ul>'
					);
				} );

				it( 'should convert single list (type: bulleted, style: circle)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul style="list-style-type:circle"><li>Foo</li><li>Bar</li></ul>'
					);
				} );

				it( 'should convert nested bulleted lists (main: circle, nested: disc)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 3</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul style="list-style-type:circle">' +
							'<li>Foo 1' +
								'<ul style="list-style-type:disc">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ul>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ul>'
					);
				} );

				// See: #8081.
				it( 'should convert properly nested list styles', () => {
					// ■ Level 0
					//     ▶ Level 0.1
					//         ○ Level 0.1.1
					//     ▶ Level 0.2
					//         ○ Level 0.2.1
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted" listStyle="default">Level 0</listItem>' +
						'<listItem listIndent="1" listType="bulleted" listStyle="default">Level 0.1</listItem>' +
						'<listItem listIndent="2" listType="bulleted" listStyle="circle">Level 0.1.1</listItem>' +
						'<listItem listIndent="1" listType="bulleted" listStyle="default">Level 0.2</listItem>' +
						'<listItem listIndent="2" listType="bulleted" listStyle="circle">Level 0.2.1</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li>Level 0' +
								'<ul>' +
									'<li>Level 0.1' +
										'<ul style="list-style-type:circle">' +
											'<li>Level 0.1.1</li>' +
										'</ul>' +
									'</li>' +
									'<li>Level 0.2' +
										'<ul style="list-style-type:circle">' +
											'<li>Level 0.2.1</li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );
		} );

		describe( 'integrations', () => {
			describe( 'merging a list into a styled list', () => {
				it( 'should inherit the list style attribute when merging the same kind of lists (from top, merge a single item)', () => {
					setModelData( model,
						'<paragraph>Foo Bar.[]</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should inherit the list style attribute when merging the same kind of lists (from top, merge a few items)', () => {
					setModelData( model,
						'<paragraph>[Foo Bar 1.</paragraph>' +
						'<paragraph>Foo Bar 2.]</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">[Foo Bar 1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar 2.]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should not inherit anything if there is no list below the inserted list', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar 1.[]</listItem>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);
				} );

				it( 'should not inherit anything if replacing the entire content with a list', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar 1.[]</listItem>'
					);
				} );

				it(
					'should not inherit the list style attribute when merging different kind of lists (from top, merge a single item)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
						'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Bar</listItem>'
						);

						editor.execute( 'bulletedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Bar</listItem>'
						);
					} );

				it(
					'should not inherit the list style attribute when merging different kind of lists (from bottom, merge a single item)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'bulletedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>'
						);
					}
				);

				it(
					'should inherit the list style attribute when merging the same kind of lists (from bottom, merge a single item)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'bulletedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>'
						);
					} );

				it(
					'should inherit the list style attribute from listIndent=0 element when merging the same kind of lists (from bottom)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="1" listStyle="square" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="2" listStyle="disc" listType="bulleted">Foo Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'bulletedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="1" listStyle="square" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="2" listStyle="disc" listType="bulleted">Foo Bar</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>'
						);
					}
				);
			} );

			describe( 'modifying "listType" attribute', () => {
				it( 'should inherit the list style attribute when the modified list is the same kind of the list as next sibling', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="default" listType="numbered">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it(
					'should inherit the list style attribute when the modified list is the same kind of the list as previous sibling',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="0" listStyle="default" listType="numbered">Foo Bar.[]</listItem>'
						);

						editor.execute( 'bulletedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>'
						);
					} );

				it(
					'should not inherit the list style attribute when the modified list already has defined it (next sibling check)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
						);

						editor.execute( 'listStyle', { type: 'disc' } );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="disc" listType="bulleted">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
						);
					} );

				it(
					'should not inherit the list style attribute when the modified list already has defined it (previous sibling check)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>'
						);

						editor.execute( 'listStyle', { type: 'disc' } );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="0" listStyle="disc" listType="bulleted">Foo Bar.[]</listItem>'
						);
					}
				);
			} );

			describe( 'indenting lists', () => {
				it( 'should restore the default value for the list style attribute when indenting a single item', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">1A.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2B.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">1A.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2B.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
					);
				} );

				it( 'should restore the default value for the list style attribute when indenting a few items', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">[2.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.]</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">[2.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">3.]</listItem>'
					);
				} );

				it(
					'should copy the value for the list style attribute when indenting a single item into a nested list (default value)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.[]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="1" listStyle="default" listType="bulleted">3.[]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
						);
					}
				);

				it(
					'should copy the value for the list style attribute when indenting a single item into a nested list (changed value)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.[]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="1" listStyle="disc" listType="bulleted">3.[]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
						);
					}
				);

				it( 'should copy the value for the list style attribute when indenting a single item into a nested list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">3.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
					);
				} );

				it(
					'should copy the value for the list style attribute when indenting a single item into a nested list ' +
				'(many nested lists check)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.[]</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
							'<listItem listIndent="1" listStyle="disc" listType="bulleted">4.[]</listItem>'
						);
					}
				);

				it( 'should inherit the list style attribute from nested list if the `listType` is other than indenting element', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.[]</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">3.[]</listItem>'
					);
				} );

				// See: #8072.
				it( 'should not throw when indenting a list without any other content in the editor', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="default" listType="bulleted">[]</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">[]</listItem>'
					);
				} );
			} );

			describe( 'outdenting lists', () => {
				it( 'should inherit the list style attribute from parent list (change the first nested item)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
					);
				} );

				it( 'should inherit the list style attribute from parent list (change the second nested item)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">3.[]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.[]</listItem>'
					);
				} );

				it( 'should inherit the list style attribute from parent list (modifying nested lists)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">[2.</listItem>' +
						'<listItem listIndent="2" listStyle="square" listType="bulleted">3.]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">[2.</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">3.]</listItem>'
					);
				} );

				it(
					'should inherit the list style attribute from parent list (outdenting many items, including the first one in the list)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">[1.</listItem>' +
							'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="2" listStyle="square" listType="bulleted">3.]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<paragraph>[1.</paragraph>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="1" listStyle="square" listType="bulleted">3.]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
						);
					}
				);

				it(
					'should inherit the list style attribute from parent list (outdenting the first item that is a parent for next list)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
							'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
							'<listItem listIndent="3" listStyle="disc" listType="bulleted">4.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">5.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<paragraph>1.[]</paragraph>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="1" listStyle="square" listType="bulleted">3.</listItem>' +
							'<listItem listIndent="2" listStyle="disc" listType="bulleted">4.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">5.</listItem>'
						);
					}
				);

				it( 'should not inherit the list style if outdented the only one item in the list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
						'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>' +
						'<listItem listIndent="0" listStyle="disc" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">3.</listItem>'
					);
				} );

				it( 'should not inherit the list style if outdented the only one item in the list (a paragraph below the list)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
						'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
						'<paragraph>Foo</paragraph>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>' +
						'<listItem listIndent="0" listStyle="disc" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">3.</listItem>' +
						'<paragraph>Foo</paragraph>'
					);
				} );

				it(
					'should not inherit the list style attribute from parent list if the `listType` is other than outdenting element',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.[]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="decimal" listType="numbered">2.[]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
						);
					} );

				it( 'should not do anything if there is no list after outdenting', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>'
					);
				} );
			} );

			describe( 'indent/outdent + undo', () => {
				it( 'should use the same batch for indenting a list and updating `listType` attribute', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">1A.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2B.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
					);

					editor.execute( 'indentList' );
					editor.execute( 'undo' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">1A.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2B.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
					);
				} );

				it( 'should use the same batch for outdenting a list and updating `listType` attribute', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
					);

					editor.execute( 'outdentList' );
					editor.execute( 'undo' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
					);
				} );
			} );

			describe( 'delete + undo', () => {
				let editor, model, view;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, Typing, UndoEditing ],
							list: {
								properties: { styles: true, startIndex: false, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							view = editor.editing.view;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				// See: #7930.
				it( 'should restore proper list style attribute after undo merging lists', () => {
				// ○ 1.
				// ○ 2.
				// ○ 3.
				// <paragraph>
				// ■ 1.
				// ■ 2.
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ), 'initial data' ).to.equal(
						'<ul style="list-style-type:circle">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
						'</ul>' +
						'<p></p>' +
						'<ul style="list-style-type:square">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ul>'
					);

					// After removing the paragraph.
					// ○ 1.
					// ○ 2.
					// ○ 3.
					// ○ 1.
					// ○ 2.
					editor.execute( 'delete' );

					expect( getViewData( view, { withoutSelection: true } ), 'executing delete' ).to.equal(
						'<ul style="list-style-type:circle">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ul>'
					);

					// After undo.
					// ○ 1.
					// ○ 2.
					// ○ 3.
					// <paragraph>
					// ■ 1.
					// ■ 2.
					editor.execute( 'undo' );

					expect( getViewData( view, { withoutSelection: true } ), 'initial data' ).to.equal(
						'<ul style="list-style-type:circle">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
						'</ul>' +
						'<p></p>' +
						'<ul style="list-style-type:square">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'todo list', () => {
				let editor, model;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
						// TodoListEditing is at the end by design. Check `ListPropertiesEditing.afterInit()` call.
							plugins: [ Paragraph, LegacyListPropertiesEditing, LegacyTodoListEditing ],
							list: {
								properties: { styles: true, startIndex: false, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should not add the `listStyle` attribute while creating a todo list', () => {
					setModelData( model, '<paragraph>Foo[]</paragraph>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should not add the `listStyle` attribute while switching the list type', () => {
					setModelData( model, '<listItem listIndent="0" listType="bulleted">Foo[]</listItem>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should remove the `listStyle` attribute while switching the list type that uses the list style feature', () => {
					setModelData( model, '<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo[]</listItem>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should  not inherit the list style attribute when inserting a todo list item', () => {
					setModelData( model,
						'<paragraph>Foo Bar.[]</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					editor.execute( 'todoList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="todo">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should not allow to set the `listStyle` attribute in to-do list item', () => {
					setModelData( model, '<listItem listIndent="0" listType="todo">Foo</listItem>' );

					const listItem = model.document.getRoot().getChild( 0 );

					expect( listItem.hasAttribute( 'listStyle' ) ).to.be.false;

					model.change( writer => {
						writer.setAttribute( 'listStyle', 'foo', listItem );
					} );

					expect( listItem.hasAttribute( 'listStyle' ) ).to.be.false;
				} );
			} );

			describe( 'removing content between two lists', () => {
				let editor, model;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, Typing ],
							list: {
								properties: { styles: true, startIndex: false, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should not do anything while removing a letter inside a listItem', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.[]</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2[]</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);
				} );

				it( 'should not do anything if there is a non-listItem before the removed content', () => {
					setModelData( model,
						'<paragraph>Foo</paragraph>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>Foo[]</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);
				} );

				it( 'should not do anything if there is a non-listItem after the removed content', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<paragraph>Foo</paragraph>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
						'<paragraph>Foo</paragraph>'
					);
				} );

				it( 'should not do anything if there is no element after the removed content', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
						'<paragraph>[]</paragraph>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>'
					);
				} );

				it(
					'should modify the the `listStyle` attribute for the merged (second) list when removing content between those lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
							'<paragraph>[]</paragraph>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.[]</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
						);
					}
				);

				it( 'should read the `listStyle` attribute from the most outer list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.1.</listItem>' +
						'<listItem listIndent="2" listStyle="default" listType="numbered">2.1.1</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.1.</listItem>' +
						'<listItem listIndent="2" listStyle="default" listType="numbered">2.1.1[]</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
					);
				} );

				it(
					'should not modify the the `listStyle` attribute for the merged (second) list ' +
					'if merging different `listType` attribute',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
							'<paragraph>[]</paragraph>' +
							'<listItem listIndent="0" listStyle="decimal" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStyle="decimal" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.[]</listItem>' +
							'<listItem listIndent="0" listStyle="decimal" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStyle="decimal" listType="numbered">2.</listItem>'
						);
					}
				);

				it(
					'should modify the the `listStyle` attribute for the merged (second) list when removing content from both lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">[3.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">[]</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
						);
					}
				);

				it(
					'should modify the the `listStyle` attribute for the merged (second) list when typing over content from both lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">[3.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.]</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
						);

						editor.execute( 'insertText', { text: 'Foo' } );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">Foo[]</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
						);
					}
				);

				it(
					'should not modify the the `listStyle` if lists were not merged but the content was partially removed',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStyle="square" listType="bulleted">111.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">222.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">[333.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">1]11.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="square" listType="bulleted">111.</listItem>' +
							'<listItem listIndent="0" listStyle="square" listType="bulleted">222.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">[]11.</listItem>' +
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
						);
					}
				);

				it( 'should not do anything while typing in a list item', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">3.</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);

					const modelChangeStub = sinon.stub( model, 'change' ).callThrough();

					simulateTyping( ' Foo' );

					// Each character calls `editor.model.change()`.
					expect( modelChangeStub.callCount ).to.equal( 4 );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2. Foo[]</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">3.</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);
				} );

				// See: #8073.
				it( 'should not crash when removing a content between intended lists', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="default" listType="bulleted">aaaa</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">bb[bb</listItem>' +
						'<listItem listIndent="2" listStyle="default" listType="bulleted">cc]cc</listItem>' +
						'<listItem listIndent="3" listStyle="default" listType="bulleted">dddd</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="default" listType="bulleted">aaaa</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">bb[]cc</listItem>' +
						'<listItem listIndent="2" listStyle="default" listType="bulleted">dddd</listItem>'
					);
				} );

				it( 'should read the `listStyle` attribute from the most outer selected list while removing content between lists', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.1.</listItem>' +
						'<listItem listIndent="2" listStyle="lower-latin" listType="numbered">2.1.1[foo</listItem>' +
						'<paragraph>Foo</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="circle" listType="bulleted">bar]2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.1.</listItem>' +
						'<listItem listIndent="2" listStyle="lower-latin" listType="numbered">2.1.1[]2.</listItem>'
					);
				} );

				// See: #8642.
				it( 'should not crash when removing entire list item followed by a paragraph element with another list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="default" listType="bulleted">aaaa</listItem>' +
						'<listItem listIndent="0" listStyle="default" listType="bulleted">[bbbb</listItem>' +
						'<paragraph>]foo</paragraph>' +
						'<listItem listIndent="0" listStyle="default" listType="bulleted">aaaa</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="default" listType="bulleted">aaaa</listItem>' +
						'<listItem listIndent="0" listStyle="default" listType="bulleted">[]</listItem>' +
						'<paragraph>foo</paragraph>' +
						'<listItem listIndent="0" listStyle="default" listType="bulleted">aaaa</listItem>'
					);
				} );

				function simulateTyping( text ) {
				// While typing, every character is an atomic change.
					text.split( '' ).forEach( character => {
						editor.execute( 'insertText', {
							text: character
						} );
					} );
				}
			} );

			// #8160
			describe( 'pasting a list into another list', () => {
				let element;

				beforeEach( () => {
					element = document.createElement( 'div' );
					document.body.append( element );

					return ClassicTestEditor
						.create( element, {
							plugins: [ Paragraph, Clipboard, LegacyListPropertiesEditing, UndoEditing ],
							list: {
								properties: { styles: true, startIndex: false, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy()
						.then( () => {
							element.remove();
						} );
				} );

				it( 'should inherit attributes from the previous sibling element (collapsed selection)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ul style="list-style-type: square">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ul>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should inherit attributes from the previous sibling element (non-collapsed selection)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">[Foo]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ul style="list-style-type: square">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ul>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should inherit attributes from the previous sibling element (non-collapsed selection over a few elements)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">[Foo 1.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 2.</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 3.]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ul style="list-style-type: square">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ul>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should do nothing when pasting the similar list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ol style="list-style-type: decimal">' +
							'<li>Foo</li>' +
						'</ol>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should replace the entire list if selected', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="decimal" listType="numbered">[Foo Bar]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ul style="list-style-type: square">' +
							'<li>Foo</li>' +
						'</ul>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">Foo[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
					);
				} );

				function pasteHtml( editor, html ) {
					editor.editing.view.document.fire( 'paste', {
						dataTransfer: createDataTransfer( { 'text/html': html } ),
						stopPropagation() {},
						preventDefault() {}
					} );
				}

				function createDataTransfer( data ) {
					return {
						getData( type ) {
							return data[ type ];
						},
						setData() {}
					};
				}
			} );

			describe( 'toggling list', () => {
				// #11408
				it( 'should copy the `listStyle` attribute from the previous list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">Mercury</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">Gemini</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">Apollo</listItem>' +
						'<paragraph>[Space shuttle</paragraph>' +
						'<paragraph>Dragon]</paragraph>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">Mercury</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">Gemini</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">Apollo</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">[Space shuttle</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">Dragon]</listItem>'
					);
				} );
			} );
		} );
	} );

	describe( 'listReversed', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Paragraph, LegacyListPropertiesEditing, UndoEditing ],
					list: {
						properties: { styles: false, startIndex: false, reversed: true }
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					view = editor.editing.view;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should not allow set `listStyle` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStyle' ) ).to.be.false;
			} );

			it( 'should allow set `listReversed` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listReversed' ) ).to.be.true;
			} );

			it( 'should not allow set `listStart` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStart' ) ).to.be.false;
			} );
		} );

		describe( 'command', () => {
			it( 'should register `listReversed` command', () => {
				const command = editor.commands.get( 'listReversed' );

				expect( command ).to.be.instanceOf( LegacyListReversedCommand );
			} );

			it( 'should not register `listStyle` command', () => {
				const command = editor.commands.get( 'listStyle' );

				expect( command ).to.be.undefined;
			} );

			it( 'should not register `listStart` command', () => {
				const command = editor.commands.get( 'listStart' );

				expect( command ).to.be.undefined;
			} );
		} );

		describe( 'conversion in data pipeline', () => {
			describe( 'model to data', () => {
				it( 'should convert single list (type: numbered, reversed: true)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="true">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol reversed="reversed"><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should convert single list (type: numbered, reversed: false)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="false">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="false">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should convert nested numbered lists (main: non-reversed, nested: reversed)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="false">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="true">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="true">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="false">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="false">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol>' +
							'<li>Foo 1' +
								'<ol reversed="reversed">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ol>'
					);
				} );

				it( 'should convert nested numbered lists (main: reversed, nested: non-reversed)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="false">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="false">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol reversed="reversed">' +
							'<li>Foo 1' +
								'<ol>' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ol>'
					);
				} );

				it( 'should convert nested mixed lists (ul>ol, main: square, nested: reversed)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="true">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="true">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ul>' +
							'<li>Foo 1' +
								'<ol reversed="reversed">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ul>'
					);
				} );

				it( 'should produce nested lists (different `listIndent` attribute)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 1</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 2</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="true">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="true">Bar 2</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol reversed="reversed">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2' +
								'<ol reversed="reversed">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'should produce two different lists (different `listReversed` attribute)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 1</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="false">Bar 1</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="false">Bar 2</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol reversed="reversed">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ol>' +
						'<ol>' +
							'<li>Bar 1</li>' +
							'<li>Bar 2</li>' +
						'</ol>'
					);
				} );
			} );

			describe( 'view to model', () => {
				it( 'should convert single list (type: bulleted)', () => {
					editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: numbered, reversed: false)', () => {
					editor.setData( '<ol><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: numbered, reversed: true)', () => {
					editor.setData( '<ol reversed="reversed"><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: numbered, reversed: true) (attribute without value)', () => {
					editor.setData( '<ol reversed><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert nested and mixed lists', () => {
					editor.setData(
						'<ol reversed>' +
							'<li>OL 1</li>' +
							'<li>OL 2' +
								'<ul>' +
									'<li>UL 1</li>' +
									'<li>UL 2</li>' +
								'</ul>' +
							'</li>' +
							'<li>OL 3</li>' +
						'</ol>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">OL 1</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">OL 2</listItem>' +
						'<listItem listIndent="1" listType="bulleted">UL 1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">UL 2</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">OL 3</listItem>'
					);
				} );

				it( 'should convert when the list is in the middle of the content', () => {
					editor.setData(
						'<p>Paragraph.</p>' +
						'<ol reversed="reversed">' +
							'<li>Foo</li>' +
							'<li>Bar</li>' +
						'</ol>' +
						'<p>Paragraph.</p>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>Paragraph.</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>' +
						'<paragraph>Paragraph.</paragraph>'
					);
				} );

				// See: #8262.
				describe( 'list conversion with surrounding text nodes', () => {
					let editor;

					beforeEach( () => {
						return VirtualTestEditor
							.create( {
								plugins: [ Paragraph, LegacyListPropertiesEditing ],
								list: {
									properties: { styles: false, startIndex: false, reversed: true }
								}
							} )
							.then( newEditor => {
								editor = newEditor;
							} );
					} );

					afterEach( () => {
						return editor.destroy();
					} );

					it( 'should convert a list if raw text is before the list', () => {
						editor.setData( 'Foo<ol><li>Foo</li></ol>' );

						expect( editor.getData() ).to.equal( '<p>Foo</p><ol><li>Foo</li></ol>' );
					} );

					it( 'should convert a list if raw text is after the list', () => {
						editor.setData( '<ol><li>Foo</li></ol>Foo' );

						expect( editor.getData() ).to.equal( '<ol><li>Foo</li></ol><p>Foo</p>' );
					} );

					it( 'should convert a list if it is surrender by two text nodes', () => {
						editor.setData( 'Foo<ol><li>Foo</li></ol>Foo' );

						expect( editor.getData() ).to.equal( '<p>Foo</p><ol><li>Foo</li></ol><p>Foo</p>' );
					} );
				} );
			} );
		} );

		describe( 'conversion in editing pipeline', () => {
			describe( 'model to view', () => {
				it( 'should convert single list (type: bulleted)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul><li>Foo</li><li>Bar</li></ul>'
					);
				} );

				it( 'should convert single list (type: numbered, reversed: true)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="true">Bar</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ol reversed="reversed"><li>Foo</li><li>Bar</li></ol>'
					);
				} );

				it( 'should convert single list (type: numbered, reversed: false)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="false">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="false">Bar</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ol><li>Foo</li><li>Bar</li></ol>'
					);
				} );

				it( 'should convert nested numbered lists (main: non-reversed, nested: reversed)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="false">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="true">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="true">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="false">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="false">Foo 3</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ol>' +
							'<li>Foo 1' +
								'<ol reversed="reversed">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ol>'
					);
				} );

				it( 'should convert nested numbered lists (main: reversed, nested: non-reversed)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="false">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listReversed="false">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listReversed="true">Foo 3</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ol reversed="reversed">' +
							'<li>Foo 1' +
								'<ol>' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ol>'
					);
				} );
			} );
		} );

		describe( 'integrations', () => {
			describe( 'merging a list into a reversed list', () => {
				it(
					'should inherit the reversed attribute ' +
					'when merging the same kind of lists (from top, merge a single item, reversed: true)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>'
						);
					}
				);

				it(
					'should inherit the reversed attribute ' +
					'when merging the same kind of lists (from top, merge a single item, reversed: false)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">Bar</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="false" listType="numbered">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">Bar</listItem>'
						);
					}
				);

				it(
					'should inherit the reversed attribute ' +
					'when merging the same kind of lists (from top, merge a single item, bulleted)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
						);

						editor.execute( 'bulletedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
						);
					}
				);

				it( 'should inherit the reversed attribute when merging the same kind of lists (from top, merge a few items)', () => {
					setModelData( model,
						'<paragraph>[Foo Bar 1.</paragraph>' +
						'<paragraph>Foo Bar 2.]</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">[Foo Bar 1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo Bar 2.]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should not inherit anything if there is no list below the inserted list (numbered)', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo Bar 1.[]</listItem>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);
				} );

				it( 'should not inherit anything if there is no list below the inserted list (bulleted)', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo Bar 1.[]</listItem>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);
				} );

				it( 'should not inherit anything if replacing the entire content with a list', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo Bar 1.[]</listItem>'
					);
				} );

				it(
					'should not inherit the reversed attribute when merging different kind of lists (from top, merge a single item)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="false" listType="numbered">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
						);
					} );

				it(
					'should not inherit the reversed attribute when merging different kind of lists (from bottom, merge a single item)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">Foo Bar.[]</listItem>'
						);
					}
				);

				it(
					'should inherit the reversed attribute when merging the same kind of lists (from bottom, merge a single item)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo Bar.[]</listItem>'
						);
					} );

				it(
					'should inherit the reversed attribute from listIndent=0 element when merging the same kind of lists (from bottom)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="2" listReversed="false" listType="numbered">Foo Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="2" listReversed="false" listType="numbered">Foo Bar</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo Bar.[]</listItem>'
						);
					}
				);
			} );

			describe( 'modifying "listType" attribute', () => {
				it( 'should inherit the reversed attribute when the modified list is the same kind of the list as next sibling', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">Bar</listItem>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">Bar</listItem>'
					);
				} );

				it(
					'should inherit the reversed attribute when the modified list is the same kind of the list as previous sibling',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo Bar.[]</listItem>'
						);
					}
				);

				it( 'should remove the reversed attribute when changing `listType` to `bulleted`', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo Bar.[]</listItem>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>'
					);
				} );

				it( 'should add default reversed attribute when changing `listType` to `numbered`', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo Bar.[]</listItem>'
					);
				} );
			} );

			describe( 'indenting lists', () => {
				it( 'should restore the default value of the reversed attribute when indenting a single item', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">1A.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2B.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">1A.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2B.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>'
					);
				} );

				it( 'should restore the default value of the reversed attribute when indenting a few items', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">[2.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.]</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">[2.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">3.]</listItem>'
					);
				} );

				it(
					'should copy the value of the reversed attribute when indenting a single item into a nested list (default value)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">3.[]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">4.</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">3.[]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">4.</listItem>'
						);
					}
				);

				it(
					'should copy the value of the reversed attribute when indenting a single item into a nested list (changed value)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">3.[]</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">4.</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">3.[]</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">4.</listItem>'
						);
					}
				);

				it( 'should set default value of the reversed attribute when indenting a single item into a nested list', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">3.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">4.</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="2" listReversed="true" listType="numbered">3.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">4.</listItem>'
					);
				} );

				it(
					'should copy the value of the reversed attribute when indenting a single item into a nested list ' +
					'(many nested lists check)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listReversed="false" listType="numbered">3.</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">4.[]</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listReversed="false" listType="numbered">3.</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">4.[]</listItem>'
						);
					}
				);

				it( 'should inherit the reversed attribute from nested list if the `listType` is other than indenting element', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">2.</listItem>' +
						'<listItem listIndent="0" listType="bulleted">3.[]</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">3.[]</listItem>'
					);
				} );
			} );

			describe( 'outdenting lists', () => {
				it( 'should inherit the reversed attribute from parent list (change the first nested item)', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>'
					);
				} );

				it( 'should inherit the reversed attribute from parent list (change the second nested item)', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">3.[]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.[]</listItem>'
					);
				} );

				it( 'should inherit the reversed attribute from parent list (modifying nested lists)', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">[2.</listItem>' +
						'<listItem listIndent="2" listReversed="true" listType="numbered">3.]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">[2.</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">3.]</listItem>'
					);
				} );

				it(
					'should inherit the reversed attribute from parent list (outdenting many items, including the first one in the list)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">[1.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listReversed="false" listType="numbered">3.]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">4.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<paragraph>[1.</paragraph>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">3.]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">4.</listItem>'
						);
					}
				);

				it(
					'should inherit the reversed attribute from parent list (outdenting the first item that is a parent for next list)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.[]</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listReversed="true" listType="numbered">3.</listItem>' +
							'<listItem listIndent="3" listReversed="false" listType="numbered">4.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">5.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<paragraph>1.[]</paragraph>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">3.</listItem>' +
							'<listItem listIndent="2" listReversed="false" listType="numbered">4.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">5.</listItem>'
						);
					}
				);

				it( 'should not inherit the reversed if outdented the only one item in the list', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.[]</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">2.</listItem>' +
						'<listItem listIndent="2" listReversed="false" listType="numbered">3.</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">3.</listItem>'
					);
				} );

				it(
					'should not inherit the reversed attribute if outdented the only one item in the list (a paragraph below the list)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.[]</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listReversed="false" listType="numbered">3.</listItem>' +
							'<paragraph>Foo</paragraph>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<paragraph>1.[]</paragraph>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">3.</listItem>' +
							'<paragraph>Foo</paragraph>'
						);
					}
				);

				it( 'should not inherit the reversed attribute if outdented bulleted list', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listType="bulleted">3.[]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listType="bulleted">3.[]</listItem>'
					);
				} );

				it(
					'should not inherit the reversed attribute from parent list if the `listType` is other than outdenting element',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listReversed="true" listType="numbered">2.[]</listItem>' +
							'<listItem listIndent="0" listType="bulleted">3.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
							'<listItem listIndent="0" listType="bulleted">3.</listItem>'
						);
					} );

				it( 'should not do anything if there is no list after outdenting', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.[]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>'
					);
				} );
			} );

			describe( 'indent/outdent + undo', () => {
				it( 'should use the same batch for indenting a list and updating `listType` attribute', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">1A.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2B.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>'
					);

					editor.execute( 'indentList' );
					editor.execute( 'undo' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">1A.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2B.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>'
					);
				} );

				it( 'should use the same batch for outdenting a list and updating `listType` attribute', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>'
					);

					editor.execute( 'outdentList' );
					editor.execute( 'undo' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>'
					);
				} );
			} );

			describe( 'delete + undo', () => {
				let editor, model, view;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, Typing, UndoEditing ],
							list: {
								properties: { styles: false, startIndex: false, reversed: true }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							view = editor.editing.view;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				// See: #7930.
				it( 'should restore proper reversed attribute after undo merging lists', () => {
				// ○ 1.
				// ○ 2.
				// ○ 3.
				// <paragraph>
				// ■ 1.
				// ■ 2.
					setModelData( model,
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">3.</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ), 'initial data' ).to.equal(
						'<ol>' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
						'</ol>' +
						'<p></p>' +
						'<ol reversed="reversed">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ol>'
					);

					// After removing the paragraph.
					// ○ 1.
					// ○ 2.
					// ○ 3.
					// ○ 1.
					// ○ 2.
					editor.execute( 'delete' );

					expect( getViewData( view, { withoutSelection: true } ), 'executing delete' ).to.equal(
						'<ol>' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ol>'
					);

					// After undo.
					// ○ 1.
					// ○ 2.
					// ○ 3.
					// <paragraph>
					// ■ 1.
					// ■ 2.
					editor.execute( 'undo' );

					expect( getViewData( view, { withoutSelection: true } ), 'initial data' ).to.equal(
						'<ol>' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
						'</ol>' +
						'<p></p>' +
						'<ol reversed="reversed">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ol>'
					);
				} );
			} );

			describe( 'todo list', () => {
				let editor, model;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, LegacyTodoListEditing ],
							list: {
								properties: { styles: false, startIndex: false, reversed: true }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should not add the `listReversed` attribute while creating a todo list', () => {
					setModelData( model, '<paragraph>Foo[]</paragraph>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should not add the `listReversed` attribute while switching the list type', () => {
					setModelData( model, '<listItem listIndent="0" listType="bulleted">Foo[]</listItem>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should remove the `listReversed` attribute while switching the list type that uses the list style feature', () => {
					setModelData( model, '<listItem listIndent="0" listReversed="true" listType="numbered">Foo[]</listItem>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should not inherit the `listReversed` attribute when inserting a todo list item', () => {
					setModelData( model,
						'<paragraph>Foo Bar.[]</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>'
					);

					editor.execute( 'todoList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="todo">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should not allow to set the `listReversed` attribute in to-do list item', () => {
					setModelData( model, '<listItem listIndent="0" listType="todo">Foo</listItem>' );

					const listItem = model.document.getRoot().getChild( 0 );

					expect( listItem.hasAttribute( 'listReversed' ) ).to.be.false;

					model.change( writer => {
						writer.setAttribute( 'listReversed', true, listItem );
					} );

					expect( listItem.hasAttribute( 'listReversed' ) ).to.be.false;
				} );
			} );

			describe( 'removing content between two lists', () => {
				let editor, model;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, Typing ],
							list: {
								properties: { styles: false, startIndex: false, reversed: true }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should not do anything while removing a letter inside a listItem', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2[]</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
					);
				} );

				it( 'should not do anything if there is a non-listItem before the removed content', () => {
					setModelData( model,
						'<paragraph>Foo</paragraph>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>Foo[]</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
					);
				} );

				it( 'should not do anything if there is a non-listItem after the removed content', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<paragraph>Foo</paragraph>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">2.[]</listItem>' +
						'<paragraph>Foo</paragraph>'
					);
				} );

				it( 'should not do anything if there is no element after the removed content', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
						'<paragraph>[]</paragraph>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>'
					);
				} );

				it(
					'should modify the the `listReversed` attribute for the merged (second) list when removing content between those lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
							'<paragraph>[]</paragraph>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
						);
					}
				);

				it( 'should read the `listReversed` attribute from the most outer list', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.1.</listItem>' +
						'<listItem listIndent="2" listReversed="false" listType="numbered">2.1.1</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">2.1.</listItem>' +
						'<listItem listIndent="2" listReversed="false" listType="numbered">2.1.1[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
					);
				} );

				it(
					'should not modify the the `listReversed` attribute for the merged (second) list ' +
					'if merging different `listType` attribute',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listType="bulleted">2.</listItem>' +
							'<paragraph>[]</paragraph>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listType="bulleted">2.[]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
						);
					}
				);

				it(
					'should modify the the `listReversed` attribute for the merged (second) list when removing content from both lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">[3.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.]</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">[]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
						);
					}
				);

				it(
					'should modify the the `listReversed` attribute for the merged (second) list when typing over content from both lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">[3.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.]</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
						);

						editor.execute( 'insertText', { text: 'Foo' } );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">Foo[]</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">2.</listItem>'
						);
					}
				);

				it(
					'should not modify the the `listReversed` if lists were not merged but the content was partially removed',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listType="numbered">111.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">222.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">[333.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">1]11.</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listType="numbered">111.</listItem>' +
							'<listItem listIndent="0" listReversed="true" listType="numbered">222.</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">[]11.</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
						);
					}
				);

				it( 'should not do anything while typing in a list item', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
					);

					const modelChangeStub = sinon.stub( model, 'change' ).callThrough();

					simulateTyping( ' Foo' );

					// Each character calls `editor.model.change()`.
					expect( modelChangeStub.callCount ).to.equal( 4 );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">2. Foo[]</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">3.</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>'
					);
				} );

				// See: #8073.
				it( 'should not crash when removing a content between intended lists', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="false" listType="numbered">aaaa</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">bb[bb</listItem>' +
						'<listItem listIndent="2" listReversed="false" listType="numbered">cc]cc</listItem>' +
						'<listItem listIndent="3" listReversed="false" listType="numbered">dddd</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">aaaa</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">bb[]cc</listItem>' +
						'<listItem listIndent="2" listReversed="false" listType="numbered">dddd</listItem>'
					);
				} );

				// See: #8642.
				it( 'should not crash when removing entire list item followed by a paragraph element with another list', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">aaaa</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">[bbbb</listItem>' +
						'<paragraph>]foo</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">aaaa</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">aaaa</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">[]</listItem>' +
						'<paragraph>foo</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">aaaa</listItem>'
					);
				} );

				it(
					'should read the `listReversed` attribute from the most outer selected list while removing content between lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">2.1.</listItem>' +
							'<listItem listIndent="2" listReversed="true" listType="numbered">2.1.1[foo</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">bar]2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="false" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listReversed="false" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listReversed="false" listType="numbered">2.1.</listItem>' +
							'<listItem listIndent="2" listReversed="true" listType="numbered">2.1.1[]2.</listItem>'
						);
					}
				);

				function simulateTyping( text ) {
				// While typing, every character is an atomic change.
					text.split( '' ).forEach( character => {
						editor.execute( 'insertText', {
							text: character
						} );
					} );
				}
			} );

			// #8160
			describe( 'pasting a list into another list', () => {
				let element;

				beforeEach( () => {
					element = document.createElement( 'div' );
					document.body.append( element );

					return ClassicTestEditor
						.create( element, {
							plugins: [ Paragraph, Clipboard, LegacyListPropertiesEditing, UndoEditing ],
							list: {
								properties: { styles: false, startIndex: false, reversed: true }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy()
						.then( () => {
							element.remove();
						} );
				} );

				it( 'should inherit attributes from the previous sibling element (collapsed selection)', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">[]</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ol>' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ol>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listReversed="false" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should inherit attributes from the previous sibling element (non-collapsed selection)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">[Foo]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ul>' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ul>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should inherit attributes from the previous sibling element (non-collapsed selection over a few elements)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">[Foo 1.</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo 2.</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo 3.]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ul>' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ul>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should do nothing when pasting the similar list', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ol reversed="reversed">' +
							'<li>Foo</li>' +
						'</ol>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listReversed="true" listType="numbered">Foo[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should replace the entire list if selected', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listType="bulleted">[Foo Bar]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ol>' +
							'<li>Foo</li>' +
						'</ol>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listReversed="false" listType="numbered">Foo[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				function pasteHtml( editor, html ) {
					editor.editing.view.document.fire( 'paste', {
						dataTransfer: createDataTransfer( { 'text/html': html } ),
						stopPropagation() {},
						preventDefault() {}
					} );
				}

				function createDataTransfer( data ) {
					return {
						getData( type ) {
							return data[ type ];
						},
						setData() {}
					};
				}
			} );

			describe( 'toggling list', () => {
				// #11408
				it( 'should copy the `listReversed` attribute from the previous list', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listType="numbered">Mercury</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Gemini</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Apollo</listItem>' +
						'<paragraph>[Space shuttle</paragraph>' +
						'<paragraph>Dragon]</paragraph>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listType="numbered">Mercury</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Gemini</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Apollo</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">[Space shuttle</listItem>' +
						'<listItem listIndent="0" listReversed="true" listType="numbered">Dragon]</listItem>'
					);
				} );
			} );
		} );
	} );

	describe( 'listStart', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Paragraph, LegacyListPropertiesEditing, UndoEditing ],
					list: {
						properties: { styles: false, startIndex: true, reversed: false }
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					view = editor.editing.view;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should not allow set `listStyle` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStyle' ) ).to.be.false;
			} );

			it( 'should not allow set `listReversed` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listReversed' ) ).to.be.false;
			} );

			it( 'should allow set `listStart` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStart' ) ).to.be.true;
			} );
		} );

		describe( 'command', () => {
			it( 'should not register `listReversed` command', () => {
				const command = editor.commands.get( 'listReversed' );

				expect( command ).to.be.undefined;
			} );

			it( 'should not register `listStyle` command', () => {
				const command = editor.commands.get( 'listStyle' );

				expect( command ).to.be.undefined;
			} );

			it( 'should register `listStart` command', () => {
				const command = editor.commands.get( 'listStart' );

				expect( command ).to.be.instanceOf( LegacyListStartCommand );
			} );
		} );

		describe( 'conversion in data pipeline', () => {
			describe( 'model to data', () => {
				it( 'should convert single list (type: numbered, start: 2)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="2">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol start="2"><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should convert single list (type: numbered, start: 1)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="1">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="1">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should convert nested numbered lists (main: 2, nested: 3)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="2">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="3">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="3">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol start="2">' +
							'<li>Foo 1' +
								'<ol start="3">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ol>'
					);
				} );

				it( 'should convert nested numbered lists (main: 2, nested: 1)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="2">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="1">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="1">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol start="2">' +
							'<li>Foo 1' +
								'<ol>' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ol>'
					);
				} );

				it( 'should convert nested mixed lists (ul>ol, main: square, nested: 2)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="2">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="2">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Foo 3</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ul>' +
							'<li>Foo 1' +
								'<ol start="2">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ul>'
					);
				} );

				it( 'should produce nested lists (different `listIndent` attribute)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="3">Foo 1</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="3">Foo 2</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="3">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="3">Bar 2</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol start="3">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2' +
								'<ol start="3">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'should produce two different lists (different `listStart` attribute)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="3">Foo 1</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="3">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="4">Bar 1</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="4">Bar 2</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol start="3">' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ol>' +
						'<ol start="4">' +
							'<li>Bar 1</li>' +
							'<li>Bar 2</li>' +
						'</ol>'
					);
				} );

				it( 'should allow 0 as list start index', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="0">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="0">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol start="0"><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should not allow a negative start index', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="-3">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="-3">Bar</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
				} );
			} );

			describe( 'view to model', () => {
				it( 'should convert single list (type: bulleted)', () => {
					editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: numbered, start: 1)', () => {
					editor.setData( '<ol><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStart="1" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="1" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: numbered, start: 2)', () => {
					editor.setData( '<ol start="2"><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert single list (type: numbered, start: 0)', () => {
					editor.setData( '<ol start="0"><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStart="0" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="0" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert single list and change negative start index (type: numbered, start: -3)', () => {
					editor.setData( '<ol start="-3"><li>Foo</li><li>Bar</li></ol>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStart="1" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="1" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should convert nested and mixed lists', () => {
					editor.setData(
						'<ol start="3">' +
							'<li>OL 1</li>' +
							'<li>OL 2' +
								'<ul>' +
									'<li>UL 1</li>' +
									'<li>UL 2</li>' +
								'</ul>' +
							'</li>' +
							'<li>OL 3</li>' +
						'</ol>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listStart="3" listType="numbered">OL 1</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">OL 2</listItem>' +
						'<listItem listIndent="1" listType="bulleted">UL 1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">UL 2</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">OL 3</listItem>'
					);
				} );

				it( 'should convert when the list is in the middle of the content', () => {
					editor.setData(
						'<p>Paragraph.</p>' +
						'<ol start="2">' +
							'<li>Foo</li>' +
							'<li>Bar</li>' +
						'</ol>' +
						'<p>Paragraph.</p>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>Paragraph.</paragraph>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">Bar</listItem>' +
						'<paragraph>Paragraph.</paragraph>'
					);
				} );

				// See: #8262.
				describe( 'list conversion with surrounding text nodes', () => {
					let editor;

					beforeEach( () => {
						return VirtualTestEditor
							.create( {
								plugins: [ Paragraph, LegacyListPropertiesEditing ],
								list: {
									properties: { styles: false, startIndex: true, reversed: false }
								}
							} )
							.then( newEditor => {
								editor = newEditor;
							} );
					} );

					afterEach( () => {
						return editor.destroy();
					} );

					it( 'should convert a list if raw text is before the list', () => {
						editor.setData( 'Foo<ol><li>Foo</li></ol>' );

						expect( editor.getData() ).to.equal( '<p>Foo</p><ol><li>Foo</li></ol>' );
					} );

					it( 'should convert a list if raw text is after the list', () => {
						editor.setData( '<ol><li>Foo</li></ol>Foo' );

						expect( editor.getData() ).to.equal( '<ol><li>Foo</li></ol><p>Foo</p>' );
					} );

					it( 'should convert a list if it is surrender by two text nodes', () => {
						editor.setData( 'Foo<ol><li>Foo</li></ol>Foo' );

						expect( editor.getData() ).to.equal( '<p>Foo</p><ol><li>Foo</li></ol><p>Foo</p>' );
					} );
				} );
			} );
		} );

		describe( 'conversion in editing pipeline', () => {
			describe( 'model to view', () => {
				it( 'should convert single list (type: bulleted)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul><li>Foo</li><li>Bar</li></ul>'
					);
				} );

				it( 'should convert single list (type: numbered, start: 2)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="2">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2">Bar</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ol start="2"><li>Foo</li><li>Bar</li></ol>'
					);
				} );

				it( 'should convert single list (type: numbered, start: 1)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="1">Foo</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="1">Bar</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ol><li>Foo</li><li>Bar</li></ol>'
					);
				} );

				it( 'should convert nested numbered lists (main: 1, nested: 2)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="1">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="2">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="2">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="1">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="1">Foo 3</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ol>' +
							'<li>Foo 1' +
								'<ol start="2">' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ol>'
					);
				} );

				it( 'should convert nested numbered lists (main: 3, nested: 1)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="3">Foo 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="1">Bar 1</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="1">Bar 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="3">Foo 2</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="3">Foo 3</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ol start="3">' +
							'<li>Foo 1' +
								'<ol>' +
									'<li>Bar 1</li>' +
									'<li>Bar 2</li>' +
								'</ol>' +
							'</li>' +
							'<li>Foo 2</li>' +
							'<li>Foo 3</li>' +
						'</ol>'
					);
				} );
			} );
		} );

		describe( 'integrations', () => {
			describe( 'merging a list into a list', () => {
				it(
					'should inherit the start attribute ' +
					'when merging the same kind of lists (from top, merge a single item, start: 3)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">Bar</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="3" listType="numbered">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">Bar</listItem>'
						);
					}
				);

				it(
					'should inherit the start attribute ' +
					'when merging the same kind of lists (from top, merge a single item, start: 1)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
							'<listItem listIndent="0" listStart="1" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStart="1" listType="numbered">Bar</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="1" listType="numbered">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listStart="1" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStart="1" listType="numbered">Bar</listItem>'
						);
					}
				);

				it(
					'should inherit the start attribute ' +
					'when merging the same kind of lists (from top, merge a single item, bulleted)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
						);

						editor.execute( 'bulletedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
						);
					}
				);

				it( 'should inherit the start attribute when merging the same kind of lists (from top, merge a few items)', () => {
					setModelData( model,
						'<paragraph>[Foo Bar 1.</paragraph>' +
						'<paragraph>Foo Bar 2.]</paragraph>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Bar</listItem>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="5" listType="numbered">[Foo Bar 1.</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Foo Bar 2.]</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should not inherit anything if there is no list below the inserted list (numbered)', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="1" listType="numbered">Foo Bar 1.[]</listItem>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);
				} );

				it( 'should not inherit anything if there is no list below the inserted list (bulleted)', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo Bar 1.[]</listItem>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);
				} );

				it( 'should not inherit anything if replacing the entire content with a list', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="1" listType="numbered">Foo Bar 1.[]</listItem>'
					);
				} );

				it(
					'should not inherit the start attribute when merging different kind of lists (from top, merge a single item)',
					() => {
						setModelData( model,
							'<paragraph>Foo Bar.[]</paragraph>' +
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="1" listType="numbered">Foo Bar.[]</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
						);
					} );

				it(
					'should not inherit the start attribute when merging different kind of lists (from bottom, merge a single item)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Bar</listItem>' +
							'<listItem listIndent="0" listStart="1" listType="numbered">Foo Bar.[]</listItem>'
						);
					}
				);

				it(
					'should inherit the start attribute when merging the same kind of lists (from bottom, merge a single item)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="3" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="3" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">Foo Bar.[]</listItem>'
						);
					} );

				it(
					'should inherit the start attribute from listIndent=0 element when merging the same kind of lists (from bottom)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="4" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="1" listStart="5" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="2" listStart="5" listType="numbered">Foo Bar</listItem>' +
							'<paragraph>Foo Bar.[]</paragraph>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="4" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="1" listStart="5" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="2" listStart="5" listType="numbered">Foo Bar</listItem>' +
							'<listItem listIndent="0" listStart="4" listType="numbered">Foo Bar.[]</listItem>'
						);
					}
				);
			} );

			describe( 'modifying "listType" attribute', () => {
				it( 'should inherit the start attribute when the modified list is the same kind of the list as next sibling', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listStart="4" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="4" listType="numbered">Bar</listItem>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="4" listType="numbered">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listStart="4" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="4" listType="numbered">Bar</listItem>'
					);
				} );

				it(
					'should inherit the start attribute when the modified list is the same kind of the list as previous sibling',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="2" listType="numbered">Foo</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">Bar</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">Foo Bar.[]</listItem>'
						);
					}
				);

				it( 'should remove the start attribute when changing `listType` to `bulleted`', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">Foo Bar.[]</listItem>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>'
					);
				} );

				it( 'should add default start attribute when changing `listType` to `numbered`', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo Bar.[]</listItem>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="1" listType="numbered">Foo Bar.[]</listItem>'
					);
				} );
			} );

			describe( 'indenting lists', () => {
				it( 'should restore the default value of the start attribute when indenting a single item', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">1A.</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2B.</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">3.</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">1A.</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2B.</listItem>' +
						'<listItem listIndent="1" listStart="1" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">3.</listItem>'
					);
				} );

				it( 'should restore the default value of the start attribute when indenting a few items', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">[2.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.]</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="1" listType="numbered">[2.</listItem>' +
						'<listItem listIndent="1" listStart="1" listType="numbered">3.]</listItem>'
					);
				} );

				it(
					'should copy the value of the start attribute when indenting a single item into a nested list (default value)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listStart="1" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">3.[]</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">4.</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listStart="1" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listStart="1" listType="numbered">3.[]</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">4.</listItem>'
						);
					}
				);

				it(
					'should copy the value of the start attribute when indenting a single item into a nested list (changed value)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="4" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listStart="4" listType="numbered">3.[]</listItem>' +
							'<listItem listIndent="0" listStart="4" listType="numbered">4.</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="4" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">3.[]</listItem>' +
							'<listItem listIndent="0" listStart="4" listType="numbered">4.</listItem>'
						);
					}
				);

				it( 'should set default value of the start attribute when indenting a single item into a nested list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">3.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">4.</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="1" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="2" listStart="2" listType="numbered">3.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">4.</listItem>'
					);
				} );

				it(
					'should copy the value of the start attribute when indenting a single item into a nested list ' +
					'(many nested lists check)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listStart="4" listType="numbered">3.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">4.[]</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listStart="4" listType="numbered">3.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">4.[]</listItem>'
						);
					}
				);

				it( 'should inherit the start attribute from nested list if the `listType` is other than indenting element', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">2.</listItem>' +
						'<listItem listIndent="0" listType="bulleted">3.[]</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">3.[]</listItem>'
					);
				} );
			} );

			describe( 'outdenting lists', () => {
				it( 'should inherit the start attribute from parent list (change the first nested item)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>'
					);
				} );

				it( 'should inherit the start attribute from parent list (change the second nested item)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">3.[]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.[]</listItem>'
					);
				} );

				it( 'should inherit the start attribute from parent list (modifying nested lists)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">[2.</listItem>' +
						'<listItem listIndent="2" listStart="3" listType="numbered">3.]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">[2.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">3.]</listItem>'
					);
				} );

				it(
					'should inherit the start attribute from parent list (outdenting many items, including the first one in the list)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">[1.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listStart="4" listType="numbered">3.]</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">4.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<paragraph>[1.</paragraph>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listStart="4" listType="numbered">3.]</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">4.</listItem>'
						);
					}
				);

				it(
					'should inherit the start attribute from parent list (outdenting the first item that is a parent for next list)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listStart="4" listType="numbered">3.</listItem>' +
							'<listItem listIndent="3" listStart="5" listType="numbered">4.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">5.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<paragraph>1.[]</paragraph>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listStart="4" listType="numbered">3.</listItem>' +
							'<listItem listIndent="2" listStart="5" listType="numbered">4.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">5.</listItem>'
						);
					}
				);

				it( 'should not inherit the start if outdented the only one item in the list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
						'<listItem listIndent="2" listStart="4" listType="numbered">3.</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listStart="4" listType="numbered">3.</listItem>'
					);
				} );

				it(
					'should not inherit the start attribute if outdented the only one item in the list (a paragraph below the list)',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.</listItem>' +
							'<listItem listIndent="2" listStart="4" listType="numbered">3.</listItem>' +
							'<paragraph>Foo</paragraph>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<paragraph>1.[]</paragraph>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listStart="4" listType="numbered">3.</listItem>' +
							'<paragraph>Foo</paragraph>'
						);
					}
				);

				it( 'should not inherit the start attribute if outdented bulleted list', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listType="bulleted">3.[]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listType="bulleted">3.[]</listItem>'
					);
				} );

				it(
					'should not inherit the start attribute from parent list if the `listType` is other than outdenting element',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="1" listStart="2" listType="numbered">2.[]</listItem>' +
							'<listItem listIndent="0" listType="bulleted">3.</listItem>'
						);

						editor.execute( 'outdentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
							'<listItem listIndent="0" listType="bulleted">3.</listItem>'
						);
					} );

				it( 'should not do anything if there is no list after outdenting', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="5" listType="numbered">1.[]</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>'
					);
				} );
			} );

			describe( 'indent/outdent + undo', () => {
				it( 'should use the same batch for indenting a list and updating `listType` attribute', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">1A.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2B.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>'
					);

					editor.execute( 'indentList' );
					editor.execute( 'undo' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">1A.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2B.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>'
					);
				} );

				it( 'should use the same batch for outdenting a list and updating `listType` attribute', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>'
					);

					editor.execute( 'outdentList' );
					editor.execute( 'undo' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>'
					);
				} );
			} );

			describe( 'delete + undo', () => {
				let editor, model, view;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, Typing, UndoEditing ],
							list: {
								properties: { styles: false, startIndex: true, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							view = editor.editing.view;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				// See: #7930.
				it( 'should restore proper start attribute after undo merging lists', () => {
				// ○ 1.
				// ○ 2.
				// ○ 3.
				// <paragraph>
				// ■ 1.
				// ■ 2.
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
					);

					expect( getViewData( view, { withoutSelection: true } ), 'initial data' ).to.equal(
						'<ol start="2">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
						'</ol>' +
						'<p></p>' +
						'<ol start="3">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ol>'
					);

					// After removing the paragraph.
					// ○ 1.
					// ○ 2.
					// ○ 3.
					// ○ 1.
					// ○ 2.
					editor.execute( 'delete' );

					expect( getViewData( view, { withoutSelection: true } ), 'executing delete' ).to.equal(
						'<ol start="2">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ol>'
					);

					// After undo.
					// ○ 1.
					// ○ 2.
					// ○ 3.
					// <paragraph>
					// ■ 1.
					// ■ 2.
					editor.execute( 'undo' );

					expect( getViewData( view, { withoutSelection: true } ), 'initial data' ).to.equal(
						'<ol start="2">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
							'<li>3.</li>' +
						'</ol>' +
						'<p></p>' +
						'<ol start="3">' +
							'<li>1.</li>' +
							'<li>2.</li>' +
						'</ol>'
					);
				} );
			} );

			describe( 'todo list', () => {
				let editor, model;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, LegacyTodoListEditing ],
							list: {
								properties: { styles: false, startIndex: true, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should not add the `listStart` attribute while creating a todo list', () => {
					setModelData( model, '<paragraph>Foo[]</paragraph>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should not add the `listStart` attribute while switching the list type', () => {
					setModelData( model, '<listItem listIndent="0" listType="bulleted">Foo[]</listItem>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should remove the `listStart` attribute while switching the list type that uses the list style feature', () => {
					setModelData( model, '<listItem listIndent="0" listStart="2" listType="numbered">Foo[]</listItem>' );

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );

				it( 'should not inherit the `listStart` attribute when inserting a todo list item', () => {
					setModelData( model,
						'<paragraph>Foo Bar.[]</paragraph>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Bar</listItem>'
					);

					editor.execute( 'todoList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="todo">Foo Bar.[]</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should not allow to set the `listStart` attribute in to-do list item', () => {
					setModelData( model, '<listItem listIndent="0" listType="todo">Foo</listItem>' );

					const listItem = model.document.getRoot().getChild( 0 );

					expect( listItem.hasAttribute( 'listStart' ) ).to.be.false;

					model.change( writer => {
						writer.setAttribute( 'listStart', 5, listItem );
					} );

					expect( listItem.hasAttribute( 'listStart' ) ).to.be.false;
				} );
			} );

			describe( 'removing content between two lists', () => {
				let editor, model;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, Typing ],
							list: {
								properties: { styles: false, startIndex: true, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should not do anything while removing a letter inside a listItem', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2[]</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
					);
				} );

				it( 'should not do anything if there is a non-listItem before the removed content', () => {
					setModelData( model,
						'<paragraph>Foo</paragraph>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>Foo[]</paragraph>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>'
					);
				} );

				it( 'should not do anything if there is a non-listItem after the removed content', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<paragraph>Foo</paragraph>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
						'<paragraph>Foo</paragraph>'
					);
				} );

				it( 'should not do anything if there is no element after the removed content', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="4" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="4" listType="numbered">2.</listItem>' +
						'<paragraph>[]</paragraph>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="4" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="4" listType="numbered">2.[]</listItem>'
					);
				} );

				it(
					'should modify the the `listStart` attribute for the merged (second) list when removing content between those lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<paragraph>[]</paragraph>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>'
						);
					}
				);

				it( 'should read the `listStart` attribute from the most outer list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">2.1.</listItem>' +
						'<listItem listIndent="2" listStart="4" listType="numbered">2.1.1</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listStart="1" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="1" listType="numbered">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">2.1.</listItem>' +
						'<listItem listIndent="2" listStart="4" listType="numbered">2.1.1[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>'
					);
				} );

				it(
					'should not modify the the `listStart` attribute for the merged (second) list ' +
					'if merging different `listType` attribute',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listType="bulleted">2.</listItem>' +
							'<paragraph>[]</paragraph>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listType="bulleted">1.</listItem>' +
							'<listItem listIndent="0" listType="bulleted">2.[]</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>'
						);
					}
				);

				it(
					'should modify the the `listStart` attribute for the merged (second) list when removing content from both lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">[3.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">1.]</listItem>' +
							'<listItem listIndent="0" listStart="fa3se" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">[]</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>'
						);
					}
				);

				it(
					'should modify the the `listStart` attribute for the merged (second) list when typing over content from both lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">[3.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">1.]</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
						);

						editor.execute( 'insertText', { text: 'Foo' } );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">Foo[]</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>'
						);
					}
				);

				it(
					'should not modify the the `listStart` attribute if lists were not merged but the content was partially removed',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">111.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">222.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">[333.</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">1]11.</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="2" listType="numbered">111.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">222.</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">[]11.</listItem>' +
							'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
						);
					}
				);

				it( 'should not do anything while typing in a list item', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2.[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
					);

					const modelChangeStub = sinon.stub( model, 'change' ).callThrough();

					simulateTyping( ' Foo' );

					// Each character calls `editor.model.change()`.
					expect( modelChangeStub.callCount ).to.equal( 4 );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">2. Foo[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>' +
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>'
					);
				} );

				// See: #8073.
				it( 'should not crash when removing a content between intended lists', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="1" listType="numbered">aaaa</listItem>' +
						'<listItem listIndent="1" listStart="1" listType="numbered">bb[bb</listItem>' +
						'<listItem listIndent="2" listStart="1" listType="numbered">cc]cc</listItem>' +
						'<listItem listIndent="3" listStart="1" listType="numbered">dddd</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="1" listType="numbered">aaaa</listItem>' +
						'<listItem listIndent="1" listStart="1" listType="numbered">bb[]cc</listItem>' +
						'<listItem listIndent="2" listStart="1" listType="numbered">dddd</listItem>'
					);
				} );

				// See: #8642.
				it( 'should not crash when removing entire list item followed by a paragraph element with another list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="1" listType="numbered">aaaa</listItem>' +
						'<listItem listIndent="0" listStart="1" listType="numbered">[bbbb</listItem>' +
						'<paragraph>]foo</paragraph>' +
						'<listItem listIndent="0" listStart="1" listType="numbered">aaaa</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="1" listType="numbered">aaaa</listItem>' +
						'<listItem listIndent="0" listStart="1" listType="numbered">[]</listItem>' +
						'<paragraph>foo</paragraph>' +
						'<listItem listIndent="0" listStart="1" listType="numbered">aaaa</listItem>'
					);
				} );

				it(
					'should read the `listStart` attribute from the most outer selected list while removing content between lists',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.1.</listItem>' +
							'<listItem listIndent="2" listStart="4" listType="numbered">2.1.1[foo</listItem>' +
							'<paragraph>Foo</paragraph>' +
							'<listItem listIndent="0" listStart="5" listType="numbered">1.</listItem>' +
							'<listItem listIndent="1" listStart="6" listType="numbered">bar]2.</listItem>'
						);

						editor.execute( 'delete' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
							'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
							'<listItem listIndent="1" listStart="3" listType="numbered">2.1.</listItem>' +
							'<listItem listIndent="2" listStart="4" listType="numbered">2.1.1[]2.</listItem>'
						);
					}
				);

				function simulateTyping( text ) {
				// While typing, every character is an atomic change.
					text.split( '' ).forEach( character => {
						editor.execute( 'insertText', {
							text: character
						} );
					} );
				}
			} );

			// #8160
			describe( 'pasting a list into another list', () => {
				let element;

				beforeEach( () => {
					element = document.createElement( 'div' );
					document.body.append( element );

					return ClassicTestEditor
						.create( element, {
							plugins: [ Paragraph, Clipboard, LegacyListPropertiesEditing, UndoEditing ],
							list: {
								properties: { styles: false, startIndex: true, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy()
						.then( () => {
							element.remove();
						} );
				} );

				it( 'should inherit attributes from the previous sibling element (collapsed selection)', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ol>' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ol>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="2" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listStart="3" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listStart="2" listType="numbered">Bar</listItem>'
					);
				} );

				it( 'should inherit attributes from the previous sibling element (non-collapsed selection)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">[Foo]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ul>' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ul>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should inherit attributes from the previous sibling element (non-collapsed selection over a few elements)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">[Foo 1.</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo 2.</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo 3.]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ul>' +
							'<li>Foo 1</li>' +
							'<li>Foo 2</li>' +
						'</ul>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo 1</listItem>' +
						'<listItem listIndent="1" listStart="2" listType="numbered">Foo 2[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should do nothing when pasting the similar list', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStart="5" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStart="5" listType="numbered">[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ol reversed="reversed">' +
							'<li>Foo</li>' +
						'</ol>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStart="5" listType="numbered">Foo Bar</listItem>' +
						'<listItem listIndent="1" listStart="5" listType="numbered">Foo[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				it( 'should replace the entire list if selected', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listType="bulleted">[Foo Bar]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);

					pasteHtml( editor,
						'<ol>' +
							'<li>Foo</li>' +
						'</ol>'
					);

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStart="1" listType="numbered">Foo[]</listItem>' +
						'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
					);
				} );

				function pasteHtml( editor, html ) {
					editor.editing.view.document.fire( 'paste', {
						dataTransfer: createDataTransfer( { 'text/html': html } ),
						stopPropagation() {},
						preventDefault() {}
					} );
				}

				function createDataTransfer( data ) {
					return {
						getData( type ) {
							return data[ type ];
						},
						setData() {}
					};
				}
			} );

			describe( 'toggling list', () => {
				// #11408
				it( 'should copy the `listStart` attribute from the previous list', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="5" listType="numbered">Mercury</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Gemini</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Apollo</listItem>' +
						'<paragraph>[Space shuttle</paragraph>' +
						'<paragraph>Dragon]</paragraph>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStart="5" listType="numbered">Mercury</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Gemini</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Apollo</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">[Space shuttle</listItem>' +
						'<listItem listIndent="0" listStart="5" listType="numbered">Dragon]</listItem>'
					);
				} );
			} );
		} );
	} );

	describe( 'listStyle + listStart + listReversed', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Paragraph, LegacyListPropertiesEditing, UndoEditing ],
					list: {
						properties: { styles: true, startIndex: true, reversed: true }
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					view = editor.editing.view;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should allow set `listStyle` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStyle' ) ).to.be.true;
			} );

			it( 'should allow set `listReversed` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listReversed' ) ).to.be.true;
			} );

			it( 'should allow set `listStart` on the `listItem`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStart' ) ).to.be.true;
			} );
		} );

		describe( 'command', () => {
			it( 'should register `listReversed` command', () => {
				const command = editor.commands.get( 'listReversed' );

				expect( command ).to.be.instanceOf( LegacyListReversedCommand );
			} );

			it( 'should register `listStyle` command', () => {
				const command = editor.commands.get( 'listStyle' );

				expect( command ).to.be.instanceOf( LegacyListStyleCommand );
			} );

			it( 'should register `listStart` command', () => {
				const command = editor.commands.get( 'listStart' );

				expect( command ).to.be.instanceOf( LegacyListStartCommand );
			} );
		} );

		describe( 'conversion in data pipeline', () => {
			describe( 'model to data', () => {
				it( 'should convert single list (default values)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="1" listReversed="false" listStyle="default">' +
							'Foo' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="1" listReversed="false" listStyle="default">' +
							'Bar' +
						'</listItem>'
					);

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
				} );

				it( 'should convert single list (non-default values)', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="5" listReversed="true" listStyle="circle">' +
							'Foo' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="5" listReversed="true" listStyle="circle">' +
							'Bar' +
						'</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol style="list-style-type:circle;" start="5" reversed="reversed"><li>Foo</li><li>Bar</li></ol>'
					);
				} );

				it( 'should convert nested lists', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="false" listStyle="default">' +
							'1' +
						'</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="1" listReversed="false" listStyle="default">' +
							'1.1' +
						'</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="1" listReversed="false" listStyle="default">' +
							'1.2' +
						'</listItem>' +
						'<listItem listIndent="2" listType="numbered" listStart="1" listReversed="true" listStyle="default">' +
							'1.2.1' +
						'</listItem>' +
						'<listItem listIndent="3" listType="numbered" listStart="1" listReversed="true" listStyle="circle">' +
							'1.2.1.1' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="false" listStyle="default">' +
							'2' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="false" listStyle="default">' +
							'3' +
						'</listItem>' +
						'<listItem listIndent="1" listType="numbered" listStart="3" listReversed="true" listStyle="circle">' +
							'3.1' +
						'</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol start="2">' +
							'<li>1' +
								'<ol>' +
									'<li>1.1</li>' +
									'<li>1.2' +
										'<ol reversed="reversed">' +
											'<li>1.2.1' +
												'<ol style="list-style-type:circle;" reversed="reversed">' +
													'<li>1.2.1.1</li>' +
												'</ol>' +
											'</li>' +
										'</ol>' +
									'</li>' +
								'</ol>' +
							'</li>' +
							'<li>2</li>' +
							'<li>3' +
								'<ol style="list-style-type:circle;" start="3" reversed="reversed">' +
									'<li>3.1</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'should produce different lists', () => {
					setModelData( model,
						'<listItem listIndent="0" listType="numbered" listStart="1" listReversed="false" listStyle="default">' +
							'A1' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="1" listReversed="false" listStyle="default">' +
							'A2' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="false" listStyle="default">' +
							'B1' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="false" listStyle="default">' +
							'B2' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="true" listStyle="default">' +
							'C1' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="true" listStyle="default">' +
							'C2' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="true" listStyle="circle">' +
							'D1' +
						'</listItem>' +
						'<listItem listIndent="0" listType="numbered" listStart="2" listReversed="true" listStyle="circle">' +
							'D2' +
						'</listItem>' +
						'<listItem listIndent="0" listType="bulleted">' +
							'E1' +
						'</listItem>' +
						'<listItem listIndent="0" listType="bulleted">' +
							'E2' +
						'</listItem>'
					);

					expect( editor.getData() ).to.equal(
						'<ol>' +
							'<li>A1</li>' +
							'<li>A2</li>' +
						'</ol>' +
						'<ol start="2">' +
							'<li>B1</li>' +
							'<li>B2</li>' +
						'</ol>' +
						'<ol start="2" reversed="reversed">' +
							'<li>C1</li>' +
							'<li>C2</li>' +
						'</ol>' +
						'<ol style="list-style-type:circle;" start="2" reversed="reversed">' +
							'<li>D1</li>' +
							'<li>D2</li>' +
						'</ol>' +
						'<ul>' +
							'<li>E1</li>' +
							'<li>E2</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'view to model', () => {
				it( 'should convert single list', () => {
					editor.setData(
						'<ol reversed="reversed" start="5" style="list-style-type:lower-latin;"><li>Foo</li><li>Bar</li></ol>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listStart="5" listStyle="lower-latin" listType="numbered">' +
							'Foo' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="5" listStyle="lower-latin" listType="numbered">' +
							'Bar' +
						'</listItem>'
					);
				} );

				it( 'should convert nested lists', () => {
					editor.setData(
						'<ol start="2">' +
							'<li>1</li>' +
							'<li>2' +
								'<ul>' +
									'<li>2.1</li>' +
									'<li>2.2</li>' +
								'</ul>' +
							'</li>' +
							'<li>3' +
								'<ol reversed="reversed">' +
									'<li>3.1</li>' +
									'<li>3.2' +
										'<ol style="list-style-type:lower-latin">' +
											'<li>3.2.1</li>' +
											'<li>3.2.2</li>' +
										'</ol>' +
									'</li>' +
								'</ol>' +
							'</li>' +
							'<li>4</li>' +
						'</ol>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listStart="2" listStyle="default" listType="numbered">' +
							'1' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="false" listStart="2" listStyle="default" listType="numbered">' +
							'2' +
						'</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">' +
							'2.1' +
						'</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">' +
							'2.2' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="false" listStart="2" listStyle="default" listType="numbered">' +
							'3' +
						'</listItem>' +
						'<listItem listIndent="1" listReversed="true" listStart="1" listStyle="default" listType="numbered">' +
							'3.1' +
						'</listItem>' +
						'<listItem listIndent="1" listReversed="true" listStart="1" listStyle="default" listType="numbered">' +
							'3.2' +
						'</listItem>' +
						'<listItem listIndent="2" listReversed="false" listStart="1" listStyle="lower-latin" listType="numbered">' +
							'3.2.1' +
						'</listItem>' +
						'<listItem listIndent="2" listReversed="false" listStart="1" listStyle="lower-latin" listType="numbered">' +
							'3.2.2' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="false" listStart="2" listStyle="default" listType="numbered">' +
							'4' +
						'</listItem>'
					);
				} );

				// https://github.com/ckeditor/ckeditor5/issues/13858
				it( 'should not convert if the schema does not allow it in the given context', () => {
					editor.model.schema.register( 'disallowedContext', {
						inheritAllFrom: '$blockObject'
					} );

					editor.conversion.elementToElement( {
						model: 'disallowedContext',
						view: {
							name: 'div',
							classes: 'disallowed-context'
						}
					} );

					editor.setData( '<div class="disallowed-context"><ul><li>foo</li></ul></div>' );

					expect( getModelData( editor.model ) ).to.equal( '[<disallowedContext></disallowedContext>]' );
				} );
			} );
		} );

		describe( 'integrations', () => {
			describe( 'merging a list into a reversed list', () => {
				it( 'should inherit the attributes when merging the same kind of lists', () => {
					setModelData( model,
						'<paragraph>Foo Bar.[]</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="upper-latin" listType="numbered">' +
							'Foo' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="upper-latin" listType="numbered">' +
							'Bar' +
						'</listItem>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="upper-latin" listType="numbered">' +
							'Foo Bar.[]' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="upper-latin" listType="numbered">' +
							'Foo' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="upper-latin" listType="numbered">' +
							'Bar' +
						'</listItem>'
					);
				} );

				it( 'should not inherit anything if there is no list below the inserted list', () => {
					setModelData( model,
						'<paragraph>Foo Bar 1.[]</paragraph>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listStart="1" listStyle="default" listType="numbered">' +
							'Foo Bar 1.[]' +
						'</listItem>' +
						'<paragraph>Foo Bar 2.</paragraph>'
					);
				} );
			} );

			describe( 'modifying "listType" attribute', () => {
				it(
					'should inherit the attributes when the modified list is the same kind of the list as previous sibling',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
								'Foo' +
							'</listItem>' +
							'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
								'Bar' +
							'</listItem>' +
							'<listItem listIndent="0" listStyle="upper-latin" listType="bulleted">Foo Bar.[]</listItem>'
						);

						editor.execute( 'numberedList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
								'Foo' +
							'</listItem>' +
							'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
								'Bar' +
							'</listItem>' +
							'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
								'Foo Bar.[]' +
							'</listItem>'
						);
					}
				);

				it( 'should add default attributes when changing `listType` to `numbered`', () => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>'
					);

					editor.execute( 'numberedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="false" listStart="1" listStyle="default" listType="numbered">' +
							'Foo Bar.[]' +
						'</listItem>'
					);
				} );
			} );

			describe( 'indenting lists', () => {
				it( 'should restore the default value of the start attribute when indenting', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="lower-latin" listType="numbered">' +
							'1.' +
						'</listItem>' +
						'<listItem listIndent="1" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
							'1A.' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="lower-latin" listType="numbered">' +
							'2B.' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="lower-latin" listType="numbered">' +
							'2.[]' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="lower-latin" listType="numbered">' +
							'3.' +
						'</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="lower-latin" listType="numbered">' +
							'1.' +
						'</listItem>' +
						'<listItem listIndent="1" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
							'1A.' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="lower-latin" listType="numbered">' +
							'2B.' +
						'</listItem>' +
						'<listItem listIndent="1" listReversed="false" listStart="1" listStyle="default" listType="numbered">' +
							'2.[]' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="lower-latin" listType="numbered">' +
							'3.' +
						'</listItem>'
					);
				} );

				it(
					'should copy the value of the start attribute when indenting a single item into a nested list',
					() => {
						setModelData( model,
							'<listItem listIndent="0" listReversed="false" listStart="3" listStyle="lower-lating" listType="numbered">' +
								'1.' +
							'</listItem>' +
							'<listItem listIndent="1" listReversed="true" listStart="1" listStyle="upper-latin" listType="numbered">' +
								'2.' +
							'</listItem>' +
							'<listItem listIndent="0" listReversed="false" listStart="3" listStyle="lower-lating" listType="numbered">' +
								'3.[]' +
							'</listItem>' +
							'<listItem listIndent="0" listReversed="false" listStart="3" listStyle="lower-lating" listType="numbered">' +
								'4.' +
							'</listItem>'
						);

						editor.execute( 'indentList' );

						expect( getModelData( model ) ).to.equal(
							'<listItem listIndent="0" listReversed="false" listStart="3" listStyle="lower-lating" listType="numbered">' +
								'1.' +
							'</listItem>' +
							'<listItem listIndent="1" listReversed="true" listStart="1" listStyle="upper-latin" listType="numbered">' +
								'2.' +
							'</listItem>' +
							'<listItem listIndent="1" listReversed="true" listStart="1" listStyle="upper-latin" listType="numbered">' +
								'3.[]' +
							'</listItem>' +
							'<listItem listIndent="0" listReversed="false" listStart="3" listStyle="lower-lating" listType="numbered">' +
								'4.' +
							'</listItem>'
						);
					}
				);
			} );

			describe( 'outdenting lists', () => {
				it( 'should inherit the attributes from parent list', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
							'1.' +
						'</listItem>' +
						'<listItem listIndent="1" listReversed="false" listStart="3" listStyle="upper-latin" listType="numbered">' +
							'2.[]' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
							'3.' +
						'</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
							'1.' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
							'2.[]' +
						'</listItem>' +
						'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
							'3.' +
						'</listItem>'
					);
				} );

				it( 'should not inherit the attributes if outdented the only one item in the list', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listStart="2" listStyle="lower-latin" listType="numbered">' +
							'1.[]' +
						'</listItem>' +
						'<listItem listIndent="1" listReversed="true" listStart="3" listStyle="upper-latin" listType="numbered">' +
							'2.' +
						'</listItem>' +
						'<listItem listIndent="2" listReversed="false" listStart="4" listStyle="lower-latin" listType="numbered">' +
							'3.' +
						'</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>' +
						'<listItem listIndent="0" listReversed="true" listStart="3" listStyle="upper-latin" listType="numbered">' +
							'2.' +
						'</listItem>' +
						'<listItem listIndent="1" listReversed="false" listStart="4" listStyle="lower-latin" listType="numbered">' +
							'3.' +
						'</listItem>'
					);
				} );

				it( 'should not do anything if there is no list after outdenting', () => {
					setModelData( model,
						'<listItem listIndent="0" listReversed="true" listStart="5" listStyle="lower-latin" listType="numbered">' +
							'1.[]' +
						'</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>'
					);
				} );
			} );

			describe( 'todo list', () => {
				let editor, model;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LegacyListPropertiesEditing, LegacyTodoListEditing ],
							list: {
								properties: { styles: false, startIndex: true, reversed: false }
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should remove the attributes while switching the list type that uses the list style feature', () => {
					setModelData( model,
						'<listItem listIndent="0" listStart="2" listReversed="true" listStyle="lower-latin" listType="numbered">' +
							'Foo[]' +
						'</listItem>'
					);

					editor.execute( 'todoList' );

					expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
				} );
			} );
		} );
	} );
} );
