/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import StrikethroughEditing from '@ckeditor/ckeditor5-basic-styles/src/strikethrough/strikethroughediting';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

import RestrictedEditingModeEditing from './../src/restrictededitingmodeediting';
import RestrictedEditingModeNavigationCommand from '../src/restrictededitingmodenavigationcommand';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import Command from '@ckeditor/ckeditor5-core/src/command';

describe( 'RestrictedEditingModeEditing', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	describe( 'plugin', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ RestrictedEditingModeEditing ] } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should be named', () => {
			expect( RestrictedEditingModeEditing.pluginName ).to.equal( 'RestrictedEditingModeEditing' );
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

	describe( 'enableCommand()', () => {
		let plugin, command;

		class FakeCommand extends Command {
			refresh() {
				this.isEnabled = true;
			}
		}

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, RestrictedEditingModeEditing ] } );
			model = editor.model;

			plugin = editor.plugins.get( RestrictedEditingModeEditing );
			command = new FakeCommand( editor );
			editor.commands.add( 'fakeCommand', command );

			setModelData( editor.model, '<paragraph>[]foo bar baz qux</paragraph>' );
			addExceptionMarker( 4, 7, model.document.getRoot().getChild( 0 ) );
		} );

		it( 'should enable the command globally', () => {
			expect( command.isEnabled ).to.be.false;

			plugin.enableCommand( 'fakeCommand' );

			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'conversion', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing, RestrictedEditingModeEditing ] } );
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

				assertEqualMarkup( editor.getData(),
					'<figure class="table"><table><tbody><tr><td>' +
					'<span class="restricted-editing-exception"><b>foo bar baz</b></span>' +
					'</td></tr></tbody></table></figure>'
				);
				assertEqualMarkup( getViewData( editor.editing.view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<table><tbody><tr><td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
					'<span style="display:inline-block"><span class="restricted-editing-exception"><b>foo bar baz</b></span></span>' +
					'</td></tr></tbody></table>' +
					'</figure>'
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
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing ] } );
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

			editor.execute( 'input', { text: 'X' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo []bar baz</paragraph>' );
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
			editor.execute( 'input', { text: 'X' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo bX[]ar baz</paragraph>' );
		} );

		it( 'should extend maker when typing on the marker boundary (end)', () => {
			setModelData( model, '<paragraph>foo bar[] baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			editor.execute( 'input', { text: 'X' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo barX[] baz</paragraph>' );
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

			editor.execute( 'input', { text: 'X' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo X[]bar baz</paragraph>' );
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

			editor.execute( 'input', { text: 'X' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo X[]bar baz</paragraph>' );
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
				editor.execute( 'input', {
					text: 'XX',
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ) )
				} );
			} );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo XX[]r baz</paragraph>' );

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
				editor.execute( 'input', {
					text: 'XX',
					range: writer.createRange( writer.createPositionAt( firstParagraph, 5 ) )
				} );
			} );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo bXX[] baz</paragraph>' );

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

			assertEqualMarkup( getModelData( model ), '<paragraph>foo []ar baz</paragraph>' );
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
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing ] } );
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

			assertEqualMarkup( getModelData( model ), '<paragraph>fo[]o bar baz</paragraph>' );
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

			assertEqualMarkup( getModelData( model ), '<paragraph>[]foo bar baz</paragraph>' );
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

			assertEqualMarkup( getModelData( model ), '<paragraph>[]foo b baz</paragraph>' );
		} );

		it( 'should trim deleted content to a exception marker and alter the selection argument (delete command integration)', () => {
			setModelData( model, '<paragraph>[]foofoo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 3, 9, firstParagraph );

			model.change( writer => {
				writer.setSelection( firstParagraph, 6 );
			} );
			editor.execute( 'delete', { unit: 'word' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo[] bar baz</paragraph>' );
		} );

		it( 'should work with document selection', () => {
			setModelData( model, '<paragraph>f[oo bar] baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 2, 'end', firstParagraph );

			model.change( () => {
				model.deleteContent( model.document.selection );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), '<paragraph>fo baz</paragraph>' );
		} );
	} );

	describe( 'enforcing restrictions on input command', () => {
		let firstParagraph;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing ] } );
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

			assertEqualMarkup( getModelData( model ), '<paragraph>foo b[]ar baz</paragraph>' );
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

			assertEqualMarkup( getModelData( model ), '<paragraph>foo b[]ar baz</paragraph>' );
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

			assertEqualMarkup( getModelData( model ), '<paragraph>fo[]o bar baz</paragraph>' );
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

			assertEqualMarkup( getModelData( model ), '<paragraph>foxxxxxxx[]baz</paragraph>' );
		} );
	} );

	describe( 'clipboard', () => {
		let viewDoc;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, BoldEditing, ItalicEditing, StrikethroughEditing, BlockQuoteEditing, LinkEditing, Typing, Clipboard,
					RestrictedEditingModeEditing
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
				assertEqualMarkup( getModelData( model ), '<paragraph>foo []bar baz</paragraph>' );
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

				assertEqualMarkup( getModelData( model ), '<paragraph>foo b[]r baz</paragraph>' );
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

				assertEqualMarkup( getModelData( model ), '<paragraph>foo []r baz</paragraph>' );
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

				assertEqualMarkup( getModelData( model ), '<paragraph>foo b[] baz</paragraph>' );
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
				assertEqualMarkup( getModelData( model ), '<paragraph>foo []bar baz</paragraph>' );
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
				assertEqualMarkup( getModelData( model ), '<paragraph>foo b[]ar baz</paragraph>' );
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
				viewDoc.on( 'clipboardInput', spy, { priority: 'high' } );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: {
						getData: sinon.spy()
					}
				} );

				sinon.assert.notCalled( spy );
				assertEqualMarkup( getModelData( model ), '<paragraph>foo []bar baz</paragraph>' );
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection)', () => {
				setModelData( model, '<paragraph>[foo bar baz]</paragraph>' );
				const spy = sinon.spy();
				viewDoc.on( 'clipboardInput', spy, { priority: 'high' } );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: {
						getData: sinon.spy()
					}
				} );

				sinon.assert.notCalled( spy );
				assertEqualMarkup( getModelData( model ), '<paragraph>[foo bar baz]</paragraph>' );
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection, starts inside exception marker)', () => {
				setModelData( model, '<paragraph>foo b[ar baz]</paragraph>' );
				const spy = sinon.spy();
				viewDoc.on( 'clipboardInput', spy, { priority: 'high' } );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: {
						getData: sinon.spy()
					}
				} );

				sinon.assert.notCalled( spy );
				assertEqualMarkup( getModelData( model ), '<paragraph>foo b[ar baz]</paragraph>' );
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection, ends inside exception marker)', () => {
				setModelData( model, '<paragraph>[foo ba]r baz</paragraph>' );
				const spy = sinon.spy();
				viewDoc.on( 'clipboardInput', spy, { priority: 'high' } );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: {
						getData: sinon.spy()
					}
				} );

				sinon.assert.notCalled( spy );
				assertEqualMarkup( getModelData( model ), '<paragraph>[foo ba]r baz</paragraph>' );
			} );

			describe( 'collapsed selection', () => {
				it( 'should paste text inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
					} );

					assertEqualMarkup( getModelData( model ), '<paragraph>foo bXXX[]ar baz</paragraph>' );
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

					assertEqualMarkup( getModelData( model ),
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

					assertEqualMarkup( getModelData( model ), '<paragraph>foo bXXX[]ar baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 10 ] );
				} );

				it( 'should filter out disallowed attributes from other text attributes when pasting inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[]ar baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><b><s><i>XXX</i></s></b></p>', 'text/plain': 'XXX' } )
					} );

					assertEqualMarkup(
						getModelData( model ),
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

					assertEqualMarkup( getModelData( model ), '<paragraph>foo bXXX[]ar baz</paragraph>' );
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

					assertEqualMarkup( getModelData( model ), '<paragraph>foo bXXX[]r baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 9 ] );
				} );

				it( 'should paste allowed text attributes inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><b>XXX</b></p>', 'text/plain': 'XXX' } )
					} );

					assertEqualMarkup( getModelData( model ), '<paragraph>foo b<$text bold="true">XXX[]</$text>r baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 9 ] );
				} );

				it( 'should not allow to paste disallowed text attributes inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><s>XXX</s></p>', 'text/plain': 'XXX' } )
					} );

					assertEqualMarkup( getModelData( model ), '<paragraph>foo bXXX[]r baz</paragraph>' );
					assertMarkerRangePaths( [ 0, 4 ], [ 0, 9 ] );
				} );

				it( 'should filter out disallowed attributes from other text attributes when pasting inside exception marker', () => {
					setModelData( model, '<paragraph>foo b[a]r baz</paragraph>' );
					const firstParagraph = model.document.getRoot().getChild( 0 );
					addExceptionMarker( 4, 7, firstParagraph );

					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><b><s><i>XXX</i></s></b></p>', 'text/plain': 'XXX' } )
					} );

					assertEqualMarkup(
						getModelData( model ),
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
				plugins: [ Paragraph, RestrictedEditingModeEditing, BoldEditing ]
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
		let view, domEvtDataStub;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, RestrictedEditingModeEditing, BoldEditing ]
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

			domEvtDataStub.keyCode += getCode( 'Shift' );
			view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'goToPreviousRestrictedEditingException' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
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
				plugins: [ Paragraph, RestrictedEditingModeEditing, BoldEditing ]
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
					ctrlKey: true,
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
