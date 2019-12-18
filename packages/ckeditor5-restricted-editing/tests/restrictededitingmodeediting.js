/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

import RestrictedEditingModeEditing from './../src/restrictededitingmodeediting';
import RestrictedEditingModeNavigationCommand from '../src/restrictededitingmodenavigationcommand';

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

	describe( 'conversion', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, RestrictedEditingModeEditing ] } );
			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'upcast', () => {
			it( 'should convert <span class="restricted-editing-exception"> to marker', () => {
				editor.setData( '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' );

				expect( model.markers.has( 'restrictedEditingException:1' ) ).to.be.true;

				const marker = model.markers.get( 'restrictedEditingException:1' );

				expect( marker.getStart().path ).to.deep.equal( [ 0, 4 ] );
				expect( marker.getEnd().path ).to.deep.equal( [ 0, 7 ] );
			} );

			it( 'should convert multiple <span class="restricted-editing-exception">', () => {
				editor.setData(
					'<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' +
					'<p>ABCDEF<span class="restricted-editing-exception">GHIJK</span>LMNOPQRST</p>'
				);

				expect( model.markers.has( 'restrictedEditingException:1' ) ).to.be.true;
				expect( model.markers.has( 'restrictedEditingException:2' ) ).to.be.true;

				// Data for the first marker is the same as in previous tests so no need to test it again.
				const secondMarker = model.markers.get( 'restrictedEditingException:2' );

				expect( secondMarker.getStart().path ).to.deep.equal( [ 1, 6 ] );
				expect( secondMarker.getEnd().path ).to.deep.equal( [ 1, 11 ] );
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
			setModelData( model, '<paragraph>foo [bar] baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			addExceptionMarker( 2, 'end', firstParagraph );

			model.change( () => {
				model.deleteContent( model.document.selection );
			} );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo [] baz</paragraph>' );
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

		it( 'should prevent changing text before exception marker', () => {
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
		let model, viewDoc;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, Clipboard, RestrictedEditingModeEditing ] } );
			model = editor.model;
			viewDoc = editor.editing.view.document;
		} );

		afterEach( () => {
			return editor.destroy();
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

			it( 'should be blocked inside exception marker', () => {
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
					method: 'cut'
				} );

				sinon.assert.notCalled( spy );
				assertEqualMarkup( getModelData( model ), '<paragraph>foo b[]ar baz</paragraph>' );
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
			it( 'should be blocked outside exception markers', () => {
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

			it( 'should be blocked inside exception marker', () => {
				setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
				const firstParagraph = model.document.getRoot().getChild( 0 );
				const spy = sinon.spy();
				viewDoc.on( 'clipboardInput', spy, { priority: 'high' } );

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

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: {
						getData: sinon.spy()
					}
				} );

				sinon.assert.notCalled( spy );
				assertEqualMarkup( getModelData( model ), '<paragraph>foo b[]ar baz</paragraph>' );
			} );
		} );
	} );

	describe( 'exception highlighting', () => {
		let model, view;

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
		let model, view, domEvtDataStub;

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

		it( 'should not move to the closest next exception on tab key when there is none', () => {
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
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
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

		it( 'should not move to the closest previous exception on shift+tab key when there is none', () => {
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
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
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
} );
