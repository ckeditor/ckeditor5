/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import StrikethroughEditing from '@ckeditor/ckeditor5-basic-styles/src/strikethrough/strikethroughediting.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import InsertImageCommand from '@ckeditor/ckeditor5-image/src/image/insertimagecommand.js';

import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import RestrictedEditingModeEditing from './../src/restrictededitingmodeediting.js';
import RestrictedEditingModeNavigationCommand from '../src/restrictededitingmodenavigationcommand.js';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import Command from '@ckeditor/ckeditor5-core/src/command.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';

describe( 'RestrictedEditingModeEditing', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	describe( 'plugin', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ RestrictedEditingModeEditing, ClipboardPipeline ] } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should be named', () => {
			expect( RestrictedEditingModeEditing.pluginName ).to.equal( 'RestrictedEditingModeEditing' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( RestrictedEditingModeEditing.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( RestrictedEditingModeEditing.isPremiumPlugin ).to.be.false;
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( RestrictedEditingModeEditing ) ).to.be.instanceOf( RestrictedEditingModeEditing );
		} );

		it( 'root should have "ck-restricted-editing_mode_restricted" class', () => {
			for ( const root of editor.editing.view.document.roots ) {
				expect( root.hasClass( 'ck-restricted-editing_mode_restricted' ) ).to.be.true;
			}
		} );

		it( 'adds a "goToPreviousRestrictedEditingException" command', () => {
			expect( editor.commands.get( 'goToPreviousRestrictedEditingException' ) )
				.to.be.instanceOf( RestrictedEditingModeNavigationCommand );
		} );

		it( 'adds a "goToNextRestrictedEditingException" command', () => {
			expect(
				editor.commands.get( 'goToNextRestrictedEditingException' )
			).to.be.instanceOf( RestrictedEditingModeNavigationCommand );
		} );
	} );

	describe( 'enabling commands', () => {
		let plugin, firstParagraph;

		class FakeCommand extends Command {
			constructor( editor, affectsData = true ) {
				super( editor );
				this.affectsData = affectsData;
			}

			refresh() {
				this.isEnabled = true;
			}
		}

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, RestrictedEditingModeEditing, ClipboardPipeline ],
				restrictedEditing: {
					allowedCommands: [ 'allowedCommand' ]
				}
			} );
			model = editor.model;

			plugin = editor.plugins.get( RestrictedEditingModeEditing );

			editor.commands.add( 'regularCommand', new FakeCommand( editor ) );
			editor.commands.add( 'allowedCommand', new FakeCommand( editor ) );
			editor.commands.add( 'commandNotAffectingData', new FakeCommand( editor, false ) );

			setModelData( editor.model, '<paragraph>[]foo bar baz qux</paragraph>' );

			firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 4, 7, firstParagraph );
		} );

		it( 'command not allowed in exception marker should always be disabled', () => {
			const command = editor.commands.get( 'regularCommand' );

			expect( command.isEnabled ).to.be.false;

			moveIntoExceptionMarker();

			expect( command.isEnabled ).to.be.false;

			moveOutOfExceptionMarker();

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'command allowed in exception marker should be enabled in it', () => {
			const command = editor.commands.get( 'allowedCommand' );

			expect( command.isEnabled ).to.be.false;

			moveIntoExceptionMarker();

			expect( command.isEnabled ).to.be.true;

			moveOutOfExceptionMarker();

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'command not affecting data should always be enabled', () => {
			const command = editor.commands.get( 'commandNotAffectingData' );

			expect( command.isEnabled ).to.be.true;

			moveIntoExceptionMarker();

			expect( command.isEnabled ).to.be.true;

			moveOutOfExceptionMarker();

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'command explicitly enabled should always be enabled', () => {
			const command = editor.commands.get( 'regularCommand' );

			expect( command.isEnabled ).to.be.false;

			plugin.enableCommand( 'regularCommand' );

			expect( command.isEnabled ).to.be.true;

			moveIntoExceptionMarker();

			expect( command.isEnabled ).to.be.true;

			moveOutOfExceptionMarker();

			expect( command.isEnabled ).to.be.true;
		} );

		function moveIntoExceptionMarker() {
			model.change( writer => {
				writer.setSelection( firstParagraph, 4 );
			} );
		}

		function moveOutOfExceptionMarker() {
			model.change( writer => {
				writer.setSelection( firstParagraph, 1 );
			} );
		}
	} );

	describe( 'conversion', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, TableEditing, RestrictedEditingModeEditing, ImageInlineEditing, ClipboardPipeline ]
			} );
			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'upcast', () => {
			it( 'should convert <span class="restricted-editing-exception"> to marker', () => {
				editor.setData( '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' );

				expect( model.markers.has( 'restrictedEditingException:1' ) ).to.be.true;

				assertMarkerRangePaths( [ 0, 4 ], [ 0, 7 ] );
			} );

			it( 'should convert multiple <span class="restricted-editing-exception">', () => {
				editor.setData(
					'<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' +
					'<p>ABCDEF<span class="restricted-editing-exception">GHIJK</span>LMNOPQRST</p>'
				);

				expect( model.markers.has( 'restrictedEditingException:1' ) ).to.be.true;
				expect( model.markers.has( 'restrictedEditingException:2' ) ).to.be.true;

				// Data for the first marker is the same as in previous tests so no need to test it again.
				assertMarkerRangePaths( [ 1, 6 ], [ 1, 11 ], 2 );
			} );

			it( 'should convert <span class="restricted-editing-exception"> inside table to marker', () => {
				editor.setData(
					'<figure class="table">' +
						'<table><tbody><tr><td><span class="restricted-editing-exception">bar</span></td></tr></tbody></table>' +
					'</figure>'
				);

				expect( model.markers.has( 'restrictedEditingException:1' ) ).to.be.true;

				const marker = model.markers.get( 'restrictedEditingException:1' );

				expect( marker.getStart().path ).to.deep.equal( [ 0, 0, 0, 0, 0 ] );
				expect( marker.getEnd().path ).to.deep.equal( [ 0, 0, 0, 0, 3 ] );
			} );

			it( 'should not convert other <span> elements', () => {
				editor.setData( '<p>foo <span class="foo bar">bar</span> baz</p>' );

				expect( model.markers.has( 'restrictedEditingException:1' ) ).to.be.false;
			} );

			it( 'should remove previous `restrictedEditingException` markers before setting new ones', () => {
				editor.setData(
					'<figure class="table">' +
						'<table><tbody><tr><td><span class="restricted-editing-exception">bar</span></td></tr></tbody></table>' +
					'</figure>'
				);

				expect( model.markers.has( 'restrictedEditingException:1' ) ).to.be.true;
				expect( model.markers.has( 'restrictedEditingException:2' ) ).to.be.false;

				editor.setData(
					'<figure class="table">' +
						'<table><tbody><tr><td><span class="restricted-editing-exception">bar</span></td></tr></tbody></table>' +
					'</figure>'
				);

				expect( model.markers.has( 'restrictedEditingException:1' ) ).to.be.false;
				expect( model.markers.has( 'restrictedEditingException:2' ) ).to.be.true;
			} );
		} );

		describe( 'downcast', () => {
			it( 'should convert model marker to <span>', () => {
				setModelData( model, '<paragraph>foo bar baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				const expectedView = '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>';
				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );

			it( 'should convert collapsed model marker to <span>', () => {
				setModelData( model, '<paragraph>foo bar baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 4 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				expect( editor.getData() ).to.equal( '<p>foo <span class="restricted-editing-exception"></span>bar baz</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p>foo <span class="restricted-editing-exception restricted-editing-exception_collapsed"></span>bar baz</p>'
				);
			} );

			it( 'converted <span> should be the outermost attribute element', () => {
				editor.conversion.for( 'downcast' ).attributeToElement( { model: 'bold', view: 'b' } );
				setModelData( model, '<paragraph><$text bold="true">foo bar baz</$text></paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 0 ), writer.createPositionAt( paragraph, 'end' ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				expect( editor.getData() ).to.equal(
					'<p><span class="restricted-editing-exception"><b>foo bar baz</b></span></p>'
				);
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p>' +
						'<span class="restricted-editing-exception restricted-editing-exception_selected"><b>foo bar baz</b></span>' +
					'</p>'
				);
			} );

			it( 'converted <span> should be the outermost attribute element (inside table)', () => {
				editor.conversion.for( 'downcast' ).attributeToElement( { model: 'bold', view: 'b' } );
				setModelData( model,
					'<table><tableRow><tableCell>' +
					'<paragraph><$text bold="true">foo bar baz</$text></paragraph>' +
					'</tableCell></tableRow></table>'
				);

				const paragraph = model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 0 ), writer.createPositionAt( paragraph, 'end' ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table"><table><tbody><tr><td>' +
					'<span class="restricted-editing-exception"><b>foo bar baz</b></span>' +
					'</td></tr></tbody></table></figure>'
				);
				expect(
					getViewData( editor.editing.view, { withoutSelection: true } )
				).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<table><tbody><tr><td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" ' +
					'tabindex="-1">' +
					'<span class="ck-table-bogus-paragraph"><span class="restricted-editing-exception"><b>foo bar baz</b></span></span>' +
					'</td></tr></tbody></table>' +
					'</figure>'
				);
			} );

			it( 'inline image should not split span between text nodes', () => {
				setModelData( model, '<paragraph>foo <imageInline src="foo/bar.jpg"></imageInline> baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRangeIn( paragraph ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				expect( editor.getData() ).to.equal(
					'<p><span class="restricted-editing-exception">foo <img src="foo/bar.jpg">baz</span></p>'
				);
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p>' +
						'<span class="restricted-editing-exception restricted-editing-exception_selected">' +
							'foo' +
								' <span class="ck-widget image-inline" contenteditable="false"><img src="foo/bar.jpg"></img></span>' +
							'baz' +
						'</span>' +
					'</p>'
				);
			} );

			it( 'inline image should not split span between text nodes (inline image at start)', () => {
				setModelData( model, '<paragraph><imageInline src="foo/bar.jpg"></imageInline>foo baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRangeIn( paragraph ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				expect( editor.getData() ).to.equal(
					'<p><span class="restricted-editing-exception"><img src="foo/bar.jpg">foo baz</span></p>'
				);
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p>' +
						'<span class="restricted-editing-exception restricted-editing-exception_selected">' +
							'<span class="ck-widget image-inline" contenteditable="false"><img src="foo/bar.jpg"></img></span>' +
							'foo ' +
							'baz' +
						'</span>' +
					'</p>'
				);
			} );

			it( 'inline image should not split span between text nodes (inline image at the end)', () => {
				setModelData( model, '<paragraph>foo baz<imageInline src="foo/bar.jpg"></imageInline></paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRangeIn( paragraph ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				expect( editor.getData() ).to.equal(
					'<p><span class="restricted-editing-exception">foo baz<img src="foo/bar.jpg"></span></p>'
				);
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p>' +
						'<span class="restricted-editing-exception restricted-editing-exception_selected">' +
							'foo ' +
							'baz' +
							'<span class="ck-widget image-inline" contenteditable="false"><img src="foo/bar.jpg"></img></span>' +
						'</span>' +
					'</p>'
				);
			} );

			it( 'should be possible to override marker conversion', () => {
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( 'addMarker:restrictedEditingException', ( evt, data, conversionApi ) => {
						if ( !data.item || data.item.is( 'selection' ) || !conversionApi.schema.isInline( data.item ) ) {
							return;
						}

						if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
							return;
						}

						const viewWriter = conversionApi.writer;
						const viewElement = viewWriter.createAttributeElement(
							'span',
							{
								class: 'restricted-editing-custom-exception'
							},
							{
								id: data.markerName,
								priority: -10
							}
						);

						const viewRange = conversionApi.mapper.toViewRange( data.range );
						const rangeAfterWrap = viewWriter.wrap( viewRange, viewElement );

						for ( const element of rangeAfterWrap.getItems() ) {
							if ( element.is( 'attributeElement' ) && element.isSimilar( viewElement ) ) {
								conversionApi.mapper.bindElementToMarker( element, data.markerName );

								// One attribute element is enough, because all of them are bound together by the view writer.
								// Mapper uses this binding to get all the elements no matter how many of them are registered in the mapper.
								break;
							}
						}
					}, { priority: 'high' } );
				} );

				setModelData( model, '<paragraph>foo bar baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRangeIn( paragraph ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				expect( editor.getData() ).to.equal(
					'<p><span class="restricted-editing-custom-exception">foo bar baz</span></p>'
				);
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="restricted-editing-custom-exception restricted-editing-exception_selected">foo bar baz</span></p>'
				);
			} );
		} );

		describe( 'flattening exception markers', () => {
			it( 'should fix non-flat marker range (start is higher in tree)', () => {
				setModelData( model, '<table><tableRow><tableCell><paragraph>foo bar baz</paragraph></tableCell></tableRow></table>' );
				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
				const paragraph = model.document.getRoot().getNodeByPath( [ 0, 0, 0, 0 ] );

				model.change( writer => {
					writer.addMarker( `restrictedEditingException:${ 1 }`, {
						range: writer.createRange(
							writer.createPositionAt( paragraph, 0 ),
							writer.createPositionAt( tableCell, 'end' )
						),
						usingOperation: true,
						affectsData: true
					} );
				} );

				const marker = model.markers.get( 'restrictedEditingException:1' );

				expect( marker.getStart().parent ).to.equal( marker.getEnd().parent );
				expect( marker.getStart().path ).to.deep.equal( [ 0, 0, 0, 0, 0 ] );
				expect( marker.getEnd().path ).to.deep.equal( [ 0, 0, 0, 0, 11 ] );
			} );

			it( 'should fix non-flat marker range (end is higher in tree)', () => {
				setModelData( model, '<table><tableRow><tableCell><paragraph>foo bar baz</paragraph></tableCell></tableRow></table>' );
				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
				const paragraph = model.document.getRoot().getNodeByPath( [ 0, 0, 0, 0 ] );

				model.change( writer => {
					writer.addMarker( `restrictedEditingException:${ 1 }`, {
						range: writer.createRange(
							writer.createPositionAt( tableCell, 0 ),
							writer.createPositionAt( paragraph, 'end' )
						),
						usingOperation: true,
						affectsData: true
					} );
				} );

				const marker = model.markers.get( 'restrictedEditingException:1' );

				expect( marker.getStart().parent ).to.equal( marker.getEnd().parent );
				expect( marker.getStart().path ).to.deep.equal( [ 0, 0, 0, 0, 0 ] );
				expect( marker.getEnd().path ).to.deep.equal( [ 0, 0, 0, 0, 11 ] );
			} );
		} );
	} );

	describe( 'editing behavior', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [
				Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline, ImageInlineEditing
			] } );
			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should keep markers in the view when editable region is edited', () => {
			setModelData( model,
				'<paragraph>foo bar baz</paragraph>' +
				'<paragraph>xxx y[]yy zzz</paragraph>'
			);

			const firstParagraph = model.document.getRoot().getChild( 0 );
			const secondParagraph = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
				writer.addMarker( 'restrictedEditingException:2', {
					range: writer.createRange(
						writer.createPositionAt( secondParagraph, 4 ),
						writer.createPositionAt( secondParagraph, 7 )
					),
					usingOperation: true,
					affectsData: true
				} );
			} );

			model.change( writer => {
				model.insertContent( writer.createText( 'R', model.document.selection.getAttributes() ) );
			} );

			expect( editor.getData() ).to.equal(
				'<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' +
				'<p>xxx <span class="restricted-editing-exception">yRyy</span> zzz</p>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' +
				'<p>xxx <span class="restricted-editing-exception restricted-editing-exception_selected">yRyy</span> zzz</p>' );
		} );

		it( 'should block user typing outside exception markers', () => {
			setModelData( model, '<paragraph>foo []bar baz</paragraph>' );

			editor.execute( 'insertText', { text: 'X' } );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo []bar baz</paragraph>' );
		} );

		it( 'should not block user typing inside exception marker', () => {
			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			model.change( writer => {
				writer.setSelection( firstParagraph, 5 );
			} );
			editor.execute( 'insertText', { text: 'X' } );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo bX[]ar baz</paragraph>' );
		} );

		it( 'should extend marker when typing on the marker boundary (end)', () => {
			setModelData( model, '<paragraph>foo bar[] baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			editor.execute( 'insertText', { text: 'X' } );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo barX[] baz</paragraph>' );
			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();
			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 8 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );

		it( 'should extend marker when inserting inline image on the marker boundary (end)', () => {
			setModelData( model, '<paragraph>foo bar[] baz</paragraph>' );
			const imgSrc = 'foo/bar.jpg';
			const firstParagraph = model.document.getRoot().getChild( 0 );
			// We don't use `editor.execute( ... )` because it requires adding Image plugin into VirtualTestEditor,
			// so it's impossible because it doesn't has 'ui' which Image package requires. So we are simply using
			// `new InsertImageCommand()` command.
			const command = new InsertImageCommand( editor );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			command.execute( { source: imgSrc } );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph>foo bar[<imageInline src="foo/bar.jpg"></imageInline>] baz</paragraph>'
			);
			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();
			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 8 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );

		it( 'should extend marker when inserting inline image on the marker boundary (start)', () => {
			setModelData( model, '<paragraph>foo []bar baz</paragraph>' );
			const imgSrc = 'foo/bar.jpg';
			const firstParagraph = model.document.getRoot().getChild( 0 );
			// We don't use `editor.execute( ... )` because it requires adding Image plugin into VirtualTestEditor,
			// so it's impossible because it doesn't has 'ui' which Image package requires. So we are simply using
			// `new InsertImageCommand()` command.
			const command = new InsertImageCommand( editor );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			command.execute( { source: imgSrc } );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph>foo [<imageInline src="foo/bar.jpg"></imageInline>]bar baz</paragraph>'
			);
			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();
			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 8 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );

		it( 'should extend marker when typing on the marker boundary (start)', () => {
			setModelData( model, '<paragraph>foo []bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			editor.execute( 'insertText', { text: 'X' } );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo X[]bar baz</paragraph>' );
			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();

			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 8 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );

		it( 'should extend marker when typing on the marker boundary (collapsed marker)', () => {
			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			model.change( writer => {
				writer.setSelection( writer.createPositionAt( firstParagraph, 4 ) );
			} );

			editor.execute( 'insertText', { text: 'X' } );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo X[]bar baz</paragraph>' );
			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();

			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 5 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );

		it( 'should retain marker on non-typing change at the marker boundary (start)', () => {
			setModelData( model, '<paragraph>foo bar[] baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );
			addExceptionMarker( 4, 7, firstParagraph );

			model.change( writer => {
				editor.execute( 'delete', {
					selection: writer.createSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 6 )
					) )
				} );
				editor.execute( 'insertText', {
					text: 'XX',
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ) )
				} );
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo XX[]r baz</paragraph>' );

			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();
			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 7 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );

		it( 'should retain marker on non-typing change at marker boundary (end)', () => {
			setModelData( model, '<paragraph>foo bar[] baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );
			addExceptionMarker( 4, 7, firstParagraph );

			model.change( writer => {
				editor.execute( 'delete', {
					selection: writer.createSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 5 ),
						writer.createPositionAt( firstParagraph, 7 )
					) )
				} );
				editor.execute( 'insertText', {
					text: 'XX',
					range: writer.createRange( writer.createPositionAt( firstParagraph, 5 ) )
				} );
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo bXX[] baz</paragraph>' );

			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();
			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 7 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );

		it( 'should not move collapsed marker to $graveyard', () => {
			setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 5 )
					),
					usingOperation: true,
					affectsData: true
				} );
			} );

			editor.execute( 'delete' );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo []ar baz</paragraph>' );
			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();

			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 4 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );

		// https://github.com/ckeditor/ckeditor5/issues/9650
		it( 'should not try to fix the marker if it was removed from markers collection', () => {
			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 5 )
					),
					usingOperation: true,
					affectsData: true
				} );
			} );

			expect( () => {
				model.change( writer => {
					writer.removeMarker( 'restrictedEditingException:1' );
				} );
			} ).not.to.throw();

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>[]foo bar baz</paragraph>' );
		} );

		it( 'should not move collapsed marker to $graveyard if it was removed by dragging', () => {
			setModelData( model, '<paragraph>foo bar b[]az</paragraph>' );

			const firstParagraph = model.document.getRoot().getChild( 0 );
			const range = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 5 )
			);

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range,
					usingOperation: true,
					affectsData: true
				} );
			} );

			model.deleteContent( model.createSelection( range ) );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo ar b[]az</paragraph>' );
			const markerRange = editor.model.markers.get( 'restrictedEditingException:1' ).getRange();

			const expectedRange = model.createRange(
				model.createPositionAt( firstParagraph, 4 ),
				model.createPositionAt( firstParagraph, 4 )
			);

			expect( markerRange.isEqual( expectedRange ) ).to.be.true;
		} );
	} );

	describe( 'enforcing restrictions on deleteContent', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline ] } );
			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not allow to delete content outside restricted area', () => {
			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 3, 9, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 2 );
			} );

			model.deleteContent( model.document.selection );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>fo[]o bar baz</paragraph>' );
		} );

		it( 'should trim deleted content to a exception marker (focus in marker)', () => {
			setModelData( model, '<paragraph>[]foofoo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 3, 9, firstParagraph );

			model.change( writer => {
				const selection = writer.createSelection( writer.createRange(
					writer.createPositionAt( firstParagraph, 0 ),
					writer.createPositionAt( firstParagraph, 6 )
				) );
				model.deleteContent( selection );
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>[]foo bar baz</paragraph>' );
		} );

		it( 'should trim deleted content to a exception marker (anchor in marker)', () => {
			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 4, 7, firstParagraph );

			model.change( writer => {
				const selection = writer.createSelection( writer.createRange(
					writer.createPositionAt( firstParagraph, 5 ),
					writer.createPositionAt( firstParagraph, 8 )
				) );
				model.deleteContent( selection );
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>[]foo b baz</paragraph>' );
		} );

		it( 'should trim deleted content to a exception marker and alter the selection argument (delete command integration)', () => {
			setModelData( model, '<paragraph>[]foofoo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 3, 9, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 6 );
			} );
			editor.execute( 'delete', { unit: 'word' } );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo[] bar baz</paragraph>' );
		} );

		it( 'should work with document selection', () => {
			setModelData( model, '<paragraph>f[oo bar] baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 2, 'end', firstParagraph );

			model.change( () => {
				model.deleteContent( model.document.selection );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( '<paragraph>fo baz</paragraph>' );
		} );
	} );

	describe( 'enforcing restrictions on input command', () => {
		let firstParagraph;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline ] } );
			model = editor.model;

			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );

			firstParagraph = model.document.getRoot().getChild( 0 );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should prevent changing text before exception marker', () => {
			addExceptionMarker( 4, 7, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 5 );
			} );

			// Simulate native spell-check action.
			editor.execute( 'input', {
				text: 'xxxxxxx',
				range: model.createRange(
					model.createPositionAt( firstParagraph, 0 ),
					model.createPositionAt( firstParagraph, 7 )
				)
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b[]ar baz</paragraph>' );
		} );

		it( 'should prevent changing text before exception marker (native spell-check simulation)', () => {
			addExceptionMarker( 4, 7, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 5 );
			} );

			// Simulate native spell-check action.
			editor.execute( 'input', {
				text: 'xxxxxxx',
				range: model.createRange(
					model.createPositionAt( firstParagraph, 4 ),
					model.createPositionAt( firstParagraph, 9 )
				)
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b[]ar baz</paragraph>' );
		} );

		it( 'should prevent changing text before (change crossing different markers)', () => {
			addExceptionMarker( 0, 4, firstParagraph );
			addExceptionMarker( 7, 9, firstParagraph, 2 );

			model.change( writer => {
				writer.setSelection( firstParagraph, 2 );
			} );

			// Simulate native spell-check action.
			editor.execute( 'input', {
				text: 'xxxxxxx',
				range: model.createRange(
					model.createPositionAt( firstParagraph, 2 ),
					model.createPositionAt( firstParagraph, 8 )
				)
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>fo[]o bar baz</paragraph>' );
		} );

		it( 'should allow changing text inside single marker', () => {
			addExceptionMarker( 0, 9, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 2 );
			} );

			// Simulate native spell-check action.
			editor.execute( 'input', {
				text: 'xxxxxxx',
				range: model.createRange(
					model.createPositionAt( firstParagraph, 2 ),
					model.createPositionAt( firstParagraph, 8 )
				)
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foxxxxxxx[]baz</paragraph>' );
		} );
	} );

	describe( 'enforcing restrictions on insertText command', () => {
		let firstParagraph;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline ] } );
			model = editor.model;

			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );

			firstParagraph = model.document.getRoot().getChild( 0 );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should prevent changing text before exception marker', () => {
			addExceptionMarker( 4, 7, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 5 );
			} );

			// Simulate native spell-check action.
			editor.execute( 'insertText', {
				text: 'xxxxxxx',
				range: model.createRange(
					model.createPositionAt( firstParagraph, 0 ),
					model.createPositionAt( firstParagraph, 7 )
				)
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b[]ar baz</paragraph>' );
		} );

		it( 'should prevent changing text before exception marker (native spell-check simulation)', () => {
			addExceptionMarker( 4, 7, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 5 );
			} );

			// Simulate native spell-check action.
			editor.execute( 'insertText', {
				text: 'xxxxxxx',
				range: model.createRange(
					model.createPositionAt( firstParagraph, 4 ),
					model.createPositionAt( firstParagraph, 9 )
				)
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b[]ar baz</paragraph>' );
		} );

		it( 'should prevent changing text before (change crossing different markers)', () => {
			addExceptionMarker( 0, 4, firstParagraph );
			addExceptionMarker( 7, 9, firstParagraph, 2 );

			model.change( writer => {
				writer.setSelection( firstParagraph, 2 );
			} );

			// Simulate native spell-check action.
			editor.execute( 'insertText', {
				text: 'xxxxxxx',
				range: model.createRange(
					model.createPositionAt( firstParagraph, 2 ),
					model.createPositionAt( firstParagraph, 8 )
				)
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>fo[]o bar baz</paragraph>' );
		} );

		it( 'should allow changing text inside single marker', () => {
			addExceptionMarker( 0, 9, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 2 );
			} );

			// Simulate native spell-check action.
			editor.execute( 'insertText', {
				text: 'xxxxxxx',
				range: model.createRange(
					model.createPositionAt( firstParagraph, 2 ),
					model.createPositionAt( firstParagraph, 8 )
				)
			} );

			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foxxxxxxx[]baz</paragraph>' );
		} );
	} );

	describe( 'clipboard', () => {
		let viewDoc;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, BoldEditing, ItalicEditing, StrikethroughEditing, BlockQuoteEditing, LinkEditing, Typing,
					ClipboardPipeline, RestrictedEditingModeEditing
				]
			} );
			model = editor.model;
			viewDoc = editor.editing.view.document;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'cut', () => {
			it( 'should be blocked outside exception markers', () => {
				setModelData( model, '<paragraph>foo []bar baz</paragraph>' );
				const spy = sinon.spy();
				viewDoc.on( 'clipboardOutput', spy, { priority: 'high' } );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'cut'
				} );

				sinon.assert.notCalled( spy );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo []bar baz</paragraph>' );
			} );

			it( 'should cut selected content inside exception marker (selection inside marker)', () => {
				setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );
				const firstParagraph = model.document.getRoot().getChild( 0 );
				addExceptionMarker( 4, 7, firstParagraph );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'cut'
				} );

				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b[]r baz</paragraph>' );
			} );

			it( 'should cut selected content inside exception marker (selection touching marker start)', () => {
				setModelData( model, '<paragraph>foo [ba]r baz</paragraph>' );
				const firstParagraph = model.document.getRoot().getChild( 0 );
				addExceptionMarker( 4, 7, firstParagraph );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'cut'
				} );

				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo []r baz</paragraph>' );
			} );

			it( 'should cut selected content inside exception marker (selection touching marker end)', () => {
				setModelData( model, '<paragraph>foo b[ar] baz</paragraph>' );
				const firstParagraph = model.document.getRoot().getChild( 0 );
				addExceptionMarker( 4, 7, firstParagraph );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'cut'
				} );

				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b[] baz</paragraph>' );
			} );
		} );

		describe( 'copy', () => {
			it( 'should not be blocked outside exception markers', () => {
				setModelData( model, '<paragraph>foo []bar baz</paragraph>' );
				const spy = sinon.spy();
				viewDoc.on( 'clipboardOutput', spy, { priority: 'high' } );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'copy'
				} );

				sinon.assert.calledOnce( spy );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo []bar baz</paragraph>' );
			} );

			it( 'should not be blocked inside exception marker', () => {
				setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
				const firstParagraph = model.document.getRoot().getChild( 0 );
				const spy = sinon.spy();
				viewDoc.on( 'clipboardOutput', spy, { priority: 'high' } );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 7 )
						),
						usingOperation: true,
						affectsData: true
					} );
				} );

				model.change( writer => {
					writer.setSelection( firstParagraph, 5 );
				} );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'copy'
				} );

				sinon.assert.calledOnce( spy );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b[]ar baz</paragraph>' );
			} );
		} );

		describe( 'paste', () => {
			beforeEach( () => {
				// Required when testing without DOM using VirtualTestEditor - Clipboard feature scrolls after paste event.
				sinon.stub( editor.editing.view, 'scrollToTheSelection' );
			} );

			it( 'should be blocked outside exception markers (collapsed selection)', () => {
				setModelData( model, '<paragraph>foo []bar baz</paragraph>' );
				const spy = sinon.spy();

				editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', spy );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
				} );

				sinon.assert.notCalled( spy );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo []bar baz</paragraph>' );
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection)', () => {
				setModelData( model, '<paragraph>[foo bar baz]</paragraph>' );
				const spy = sinon.spy();

				editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', spy );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
				} );

				sinon.assert.notCalled( spy );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>[foo bar baz]</paragraph>' );
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection, starts inside exception marker)', () => {
				setModelData( model, '<paragraph>foo b[ar baz]</paragraph>' );
				addExceptionMarker( 4, 7, model.document.getRoot().getChild( 0 ) );

				const spy = sinon.spy();

				editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', spy );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
				} );

				sinon.assert.notCalled( spy );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b[ar baz]</paragraph>' );
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection, ends inside exception marker)', () => {
				setModelData( model, '<paragraph>[foo ba]r baz</paragraph>' );
				addExceptionMarker( 4, 7, model.document.getRoot().getChild( 0 ) );

				const spy = sinon.spy();

				editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', spy );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
				} );

				sinon.assert.notCalled( spy );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>[foo ba]r baz</paragraph>' );
			} );

			describe( 'collapsed selection', () => {
				it( 'should paste text inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
					} );

					expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo bXXX[]ar baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 10 ] );
				} );

				it( 'should paste allowed text attributes inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( {
							'text/html': '<p><a href="foo"><b><i>XXX</i></b></a></p>',
							'text/plain': 'XXX'
						} )
					} );

					expect( getModelData( model ) ).to.equalMarkup(
						'<paragraph>foo b<$text bold="true" italic="true" linkHref="foo">XXX</$text>' +
						// The link attribute is removed from selection after pasting.
						// See https://github.com/ckeditor/ckeditor5/issues/6053.
						'<$text bold="true" italic="true">[]</$text>ar baz</paragraph>'
					);
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 10 ] );
				} );

				it( 'should not allow to paste disallowed text attributes inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><s>XXX</s></p>', 'text/plain': 'XXX' } )
					} );

					expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo bXXX[]ar baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 10 ] );
				} );

				it( 'should filter out disallowed attributes from other text attributes when pasting inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><b><s><i>XXX</i></s></b></p>', 'text/plain': 'XXX' } )
					} );

					expect(
						getModelData( model ) ).to.equalMarkup(
						'<paragraph>foo b<$text bold="true" italic="true">XXX[]</$text>ar baz</paragraph>'
					);
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 10 ] );
				} );

				it( 'should not allow pasting block elements other then paragraph', () => {
					setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<blockquote><p>XXX</p></blockquote>', 'text/plain': 'XXX' } )
					} );

					expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo bXXX[]ar baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 10 ] );
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should paste text inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
					} );

					expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo bXXX[]r baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 9 ] );
				} );

				it( 'should paste allowed text attributes inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><b>XXX</b></p>', 'text/plain': 'XXX' } )
					} );

					expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo b<$text bold="true">XXX[]</$text>r baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 9 ] );
				} );

				it( 'should not allow to paste disallowed text attributes inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><s>XXX</s></p>', 'text/plain': 'XXX' } )
					} );

					expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo bXXX[]r baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 9 ] );
				} );

				it( 'should filter out disallowed attributes from other text attributes when pasting inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><b><s><i>XXX</i></s></b></p>', 'text/plain': 'XXX' } )
					} );

					expect(
						getModelData( model ) ).to.equalMarkup(
						'<paragraph>foo b<$text bold="true" italic="true">XXX[]</$text>r baz</paragraph>'
					);
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 9 ] );
				} );
			} );
		} );
	} );

	describe( 'exception highlighting', () => {
		let view;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, RestrictedEditingModeEditing, BoldEditing, ClipboardPipeline ]
			} );
			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should convert the highlight to a proper view classes', () => {
			setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );

			const paragraph = model.document.getRoot().getChild( 0 );

			// <paragraph>foo <$marker>b[a]r</$marker> baz</paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			expect( getViewData( view ) ).to.equal(
				'<p>foo <span class="restricted-editing-exception restricted-editing-exception_selected">b{a}r</span> baz</p>'
			);
		} );

		it( 'should remove classes when selection is moved away from an exception', () => {
			setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );

			const paragraph = model.document.getRoot().getChild( 0 );

			// <paragraph>foo <$marker>b[a]r</$marker> baz</paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			expect( getViewData( view ) ).to.equal(
				'<p>foo <span class="restricted-editing-exception restricted-editing-exception_selected">b{a}r</span> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 0 ) );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo <span class="restricted-editing-exception">bar</span> baz</p>'
			);
		} );

		it( 'should work correctly when selection is moved inside an exception', () => {
			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );

			const paragraph = model.document.getRoot().getChild( 0 );

			// <paragraph>[]foo <$marker>bar</$marker> baz</paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo <span class="restricted-editing-exception">bar</span> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 6 ) );

			expect( getViewData( view ) ).to.equal(
				'<p>foo <span class="restricted-editing-exception restricted-editing-exception_selected">ba{}r</span> baz</p>'
			);
		} );

		describe( 'editing downcast conversion integration', () => {
			it( 'works for the #insert event', () => {
				setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				// <paragraph>foo <$marker>b[a]r</$marker> baz</paragraph>
				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				model.change( writer => {
					writer.insertText( 'FOO', { linkHref: 'url' }, model.document.selection.getFirstPosition() );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <span class="restricted-editing-exception restricted-editing-exception_selected">bFOO{a}r</span> baz</p>'
				);
			} );

			it( 'works for the #remove event', () => {
				setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				// <paragraph>foo <$marker>b[a]r</$marker> baz</paragraph>
				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				model.change( writer => {
					writer.remove( writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 6 )
					) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <span class="restricted-editing-exception restricted-editing-exception_selected">b{}r</span> baz</p>'
				);
			} );

			it( 'works for the #attribute event', () => {
				setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				// <paragraph>foo <$marker>b[a]r</$marker> baz</paragraph>
				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				model.change( writer => {
					writer.setAttribute( 'bold', true, writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo ' +
						'<span class="restricted-editing-exception restricted-editing-exception_selected">' +
							'<strong>b{a</strong>' +
						'}r</span>' +
					' baz</p>'
				);
			} );

			it( 'works for the #selection event', () => {
				setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				// <paragraph>foo <$marker>b[a]r</$marker> baz</paragraph>
				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				model.change( writer => {
					writer.setSelection( writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo {<span class="restricted-editing-exception restricted-editing-exception_selected">ba}r</span> baz</p>'
				);
			} );

			it( 'works for the addMarker and removeMarker events', () => {
				editor.conversion.for( 'editingDowncast' ).markerToHighlight( { model: 'fooMarker', view: {} } );

				setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				// <paragraph>foo <$marker>b[a]r</$marker> baz</paragraph>
				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					);

					writer.addMarker( 'fooMarker', { range, usingOperation: true } );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>' +
						'<span>foo </span>' +
						'<span class="restricted-editing-exception restricted-editing-exception_selected">' +
							'<span>b</span>{a}r' +
						'</span>' +
					' baz</p>'
				);

				model.change( writer => writer.removeMarker( 'fooMarker' ) );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <span class="restricted-editing-exception restricted-editing-exception_selected">b{a}r</span> baz</p>'
				);
			} );
		} );
	} );

	describe( 'exception cycling with the keyboard', () => {
		let view, domEvtDataStub, element;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, RestrictedEditingModeEditing, BoldEditing, ClipboardPipeline, Table ]
			} );

			model = editor.model;
			view = editor.editing.view;

			domEvtDataStub = {
				keyCode: getCode( 'Tab' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			sinon.spy( editor, 'execute' );
		} );

		afterEach( () => {
			element.remove();

			return editor.destroy();
		} );

		it( 'should move to the closest next exception on tab key', () => {
			setModelData( model, '<paragraph>[]foo bar baz qux</paragraph>' );

			const paragraph = model.document.getRoot().getChild( 0 );

			// <paragraph>[]foo <marker>bar</marker> baz qux</paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			// <paragraph>[]foo <marker>bar</marker> <marker>baz</marker≥ qux</paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:2', {
					range: writer.createRange( writer.createPositionAt( paragraph, 8 ), writer.createPositionAt( paragraph, 11 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'goToNextRestrictedEditingException' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should let the focus go outside the editor on tab key when in the last exception', () => {
			setModelData( model, '<paragraph>foo qux[]</paragraph>' );

			const paragraph = model.document.getRoot().getChild( 0 );

			// <paragraph><marker>foo</marker> qux[]</paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( paragraph, 0 ), writer.createPositionAt( paragraph, 3 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );

		it( 'should move to the closest previous exception on shift+tab key', () => {
			setModelData( model, '<paragraph>foo bar baz qux[]</paragraph>' );

			const paragraph = model.document.getRoot().getChild( 0 );

			// <paragraph>foo <marker>bar</marker> baz qux[]</paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			// <paragraph>foo <marker>bar</marker> <marker>baz</marker≥ qux[]</paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:2', {
					range: writer.createRange( writer.createPositionAt( paragraph, 8 ), writer.createPositionAt( paragraph, 11 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			domEvtDataStub.shiftKey = true;
			view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'goToPreviousRestrictedEditingException' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should get into the table', () => {
			setModelData( model, `
				<paragraph>foo[]</paragraph>
				<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>
			` );

			const paragraph = model.document.getRoot().getChild( 0 );
			const paragraph2 = model.document.getRoot().getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRangeIn( paragraph ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:2', {
					range: writer.createRangeIn( paragraph2 ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'goToNextRestrictedEditingException' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

			const position = model.document.selection.getFirstRange().start;

			expect( position.parent ).to.deep.equal( paragraph2 );
		} );

		it( 'should escape from the table', () => {
			setModelData( model, `
				<table><tableRow><tableCell><paragraph>bar[]</paragraph></tableCell></tableRow></table>
				<paragraph>foo</paragraph>
			` );

			const paragraph = model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 );
			const paragraph2 = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRangeIn( paragraph ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:2', {
					range: writer.createRangeIn( paragraph2 ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'goToNextRestrictedEditingException' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

			const position = model.document.selection.getFirstRange().start;

			expect( position.parent ).to.deep.equal( paragraph2 );
		} );

		it( 'should let the focus go outside the editor on shift+tab when in the first exception', () => {
			setModelData( model, '<paragraph>[]foo qux</paragraph>' );

			const paragraph = model.document.getRoot().getChild( 0 );

			// <paragraph>[]foo <marker>qux</marker></paragraph>
			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			domEvtDataStub.keyCode += getCode( 'Shift' );
			view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );
	} );

	describe( 'custom keydown behaviour', () => {
		let view, evtData;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, RestrictedEditingModeEditing, BoldEditing, ClipboardPipeline ]
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'Ctrl+A handler', () => {
			beforeEach( async () => {
				evtData = {
					keyCode: getCode( 'A' ),
					ctrlKey: !env.isMac,
					metaKey: env.isMac,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
			} );

			describe( 'collapsed selection', () => {
				it( 'should select text only within an exception when selection is inside an exception', () => {
					setModelData( model, '<paragraph>foo ba[]r baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph>foo <marker>ba[]r</marker> baz</paragraph>
					addExceptionMarker( 4, 7, paragraph );

					view.document.fire( 'keydown', evtData );

					sinon.assert.calledOnce( evtData.preventDefault );
					sinon.assert.calledOnce( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo [bar] baz</paragraph>' );
				} );

				it( 'should select text only within an exception when selection is at the begining of an exception', () => {
					setModelData( model, '<paragraph>foo []bar baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph>foo <marker>[]bar</marker> baz</paragraph>
					addExceptionMarker( 4, 7, paragraph );

					view.document.fire( 'keydown', evtData );

					sinon.assert.calledOnce( evtData.preventDefault );
					sinon.assert.calledOnce( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo [bar] baz</paragraph>' );
				} );

				it( 'should select text only within an exception when selection is at the end of an exception', () => {
					setModelData( model, '<paragraph>foo bar[] baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph>foo <marker>bar[]</marker> baz</paragraph>
					addExceptionMarker( 4, 7, paragraph );

					view.document.fire( 'keydown', evtData );

					sinon.assert.calledOnce( evtData.preventDefault );
					sinon.assert.calledOnce( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo [bar] baz</paragraph>' );
				} );

				it( 'should not change the selection if the caret is not inside an exception', () => {
					setModelData( model, '<paragraph>foo ba[]r baz</paragraph>' );

					// no markers
					// <paragraph>foo ba[]r baz</paragraph>

					view.document.fire( 'keydown', evtData );

					sinon.assert.notCalled( evtData.preventDefault );
					sinon.assert.notCalled( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo ba[]r baz</paragraph>' );
				} );

				it( 'should not extend the selection outside an exception when press Ctrl+A second time', () => {
					setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph>foo <marker>b[]ar</marker> baz</paragraph>
					addExceptionMarker( 4, 7, paragraph );

					view.document.fire( 'keydown', evtData );
					view.document.fire( 'keydown', evtData );

					sinon.assert.calledTwice( evtData.preventDefault );
					sinon.assert.calledTwice( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo [bar] baz</paragraph>' );
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should select text within an exception when a whole selection range is inside an exception', () => {
					setModelData( model, '<paragraph>fo[o ba]r baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph><marker>fo[o ba]r</marker> baz</paragraph>
					addExceptionMarker( 0, 7, paragraph );

					view.document.fire( 'keydown', evtData );

					sinon.assert.calledOnce( evtData.preventDefault );
					sinon.assert.calledOnce( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>[foo bar] baz</paragraph>' );
				} );

				it( 'should select text within an exception when end of selection range is equal exception end', () => {
					setModelData( model, '<paragraph>foo b[ar] baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph>foo <marker>b[ar]</marker> baz</paragraph>
					addExceptionMarker( 4, 7, paragraph );

					view.document.fire( 'keydown', evtData );

					sinon.assert.calledOnce( evtData.preventDefault );
					sinon.assert.calledOnce( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo [bar] baz</paragraph>' );
				} );

				it( 'should select text within an exception when start of selection range is equal exception start', () => {
					setModelData( model, '<paragraph>foo [ba]r baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph>foo <marker>[ba]r</marker> baz</paragraph>
					addExceptionMarker( 4, 7, paragraph );

					view.document.fire( 'keydown', evtData );

					sinon.assert.calledOnce( evtData.preventDefault );
					sinon.assert.calledOnce( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo [bar] baz</paragraph>' );
				} );

				it( 'should not select text within an exception when a part of the selection range is outside an exception', () => {
					setModelData( model, '<paragraph>fo[o ba]r baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph>fo[o <marker>ba]r</marker> baz</paragraph>
					addExceptionMarker( 4, 7, paragraph );

					view.document.fire( 'keydown', evtData );

					sinon.assert.notCalled( evtData.preventDefault );
					sinon.assert.notCalled( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>fo[o ba]r baz</paragraph>' );
				} );

				it( 'should not extend the selection outside an exception when press Ctrl+A second time', () => {
					setModelData( model, '<paragraph>foo [bar] baz</paragraph>' );

					const paragraph = model.document.getRoot().getChild( 0 );

					// <paragraph>foo <marker>[bar]</marker> baz</paragraph>
					addExceptionMarker( 4, 7, paragraph );

					view.document.fire( 'keydown', evtData );
					view.document.fire( 'keydown', evtData );

					sinon.assert.calledTwice( evtData.preventDefault );
					sinon.assert.calledTwice( evtData.stopPropagation );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo [bar] baz</paragraph>' );
				} );
			} );
		} );
	} );

	// Helper method that creates an exception marker inside given parent.
	// Marker range is set to given position offsets (start, end).
	function addExceptionMarker( startOffset, endOffset = startOffset, parent, id = 1 ) {
		model.change( writer => {
			writer.addMarker( `restrictedEditingException:${ id }`, {
				range: writer.createRange(
					writer.createPositionAt( parent, startOffset ),
					writer.createPositionAt( parent, endOffset )
				),
				usingOperation: true,
				affectsData: true
			} );
		} );
	}

	function createDataTransfer( data ) {
		return {
			getData( type ) {
				return data[ type ];
			}
		};
	}

	function assertMarkerRangePaths( startPath, endPath, markerId = 1 ) {
		const marker = model.markers.get( `restrictedEditingException:${ markerId }` );

		expect( marker.getStart().path ).to.deep.equal( startPath );
		expect( marker.getEnd().path ).to.deep.equal( endPath );
	}
} );
