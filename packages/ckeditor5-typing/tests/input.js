/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Input from '../src/input';

import Writer from '@ckeditor/ckeditor5-engine/src/model/writer';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';

import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewSelection from '@ckeditor/ckeditor5-engine/src/view/selection';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/* global document */

describe( 'Input feature', () => {
	let editor, model, modelRoot, view, viewDocument, viewRoot, listenter;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		listenter = Object.create( EmitterMixin );

		const domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		return ClassicTestEditor.create( domElement, { plugins: [ Input, Paragraph, Bold, Italic, List, ShiftEnter ] } )
			.then( newEditor => {
				// Mock image feature.
				newEditor.model.schema.register( 'image', { allowWhere: '$text' } );

				newEditor.conversion.elementToElement( {
					model: 'image',
					view: 'img'
				} );

				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				view = editor.editing.view;
				viewDocument = view.document;
				viewRoot = viewDocument.getRoot();

				editor.setData( '<p>foobar</p>' );

				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 3, modelRoot.getChild( 0 ), 3 )
					);
				} );
			} );
	} );

	afterEach( () => {
		listenter.stopListening();

		return editor.destroy();
	} );

	describe( 'mutations handling', () => {
		it( 'should handle text mutation', () => {
			viewDocument.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'fooxbar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foox[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foox{}bar</p>' );
		} );

		it( 'should handle text mutation change', () => {
			viewDocument.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'foodar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>food[]ar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>food{}ar</p>' );
		} );

		it( 'should handle text node insertion', () => {
			editor.setData( '<p></p>' );

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>x[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>x{}</p>' );
		} );

		it( 'should apply selection attributes to the inserted text', () => {
			setModelData( model, '<paragraph>[]</paragraph>', {
				selectionAttributes: {
					bold: true,
					italic: true
				}
			} );
			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text bold="true" italic="true">x[]</$text></paragraph>'
			);
		} );

		it( 'should handle multiple text mutations', () => {
			editor.setData( '<p>foo<strong>bar</strong></p>' );

			viewDocument.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foo',
					newText: 'foob',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				},
				{
					type: 'text',
					oldText: 'bar',
					newText: 'ar',
					node: viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foob[]<$text bold="true">ar</$text></paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foob{}<strong>ar</strong></p>' );
		} );

		it( 'should handle multiple text node insertion', () => {
			editor.setData( '<p></p><p></p>' );

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ) ],
					node: viewRoot.getChild( 0 )
				},
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'y' ) ],
					node: viewRoot.getChild( 1 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>x</paragraph><paragraph>y[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>x</p><p>y{}</p>' );
		} );

		it( 'should do nothing when two nodes were inserted', () => {
			editor.setData( '<p></p>' );

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ), new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>[]</p>' );
		} );

		it( 'should do nothing when two nodes were inserted and one removed', () => {
			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foobar' ) ],
					newChildren: [ new ViewText( 'x' ), new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo{}bar</p>' );
		} );

		it( 'should handle multiple children in the node', () => {
			editor.setData( '<p>foo<img></img></p>' );

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foo' ), viewRoot.getChild( 0 ).getChild( 1 ) ],
					newChildren: [ new ViewText( 'foo' ), viewRoot.getChild( 0 ).getChild( 1 ), new ViewText( 'x' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<image></image>x[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo<img></img>x{}</p>' );
		} );

		it( 'should do nothing when node was removed', () => {
			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foobar' ) ],
					newChildren: [],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo{}bar</p>' );
		} );

		it( 'should do nothing when element was inserted', () => {
			editor.setData( '<p></p>' );

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>[]</p>' );
		} );

		it( 'should set model selection appropriately to view selection passed in mutations event', () => {
			// This test case emulates spellchecker correction.

			const viewSelection = new ViewSelection();
			viewSelection.setTo( viewRoot.getChild( 0 ).getChild( 0 ), 6 );

			viewDocument.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'foobar',
					newText: 'foodar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>foodar[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foodar{}</p>' );
		} );

		it( 'should use up to one insert and remove operations (spellchecker)', () => {
			// This test case emulates spellchecker correction.

			const viewSelection = new ViewSelection();
			viewSelection.setTo( viewRoot.getChild( 0 ).getChild( 0 ), 6 );

			testUtils.sinon.spy( Writer.prototype, 'insert' );
			testUtils.sinon.spy( Writer.prototype, 'remove' );

			viewDocument.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'foobar',
					newText: 'fxobxr',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( Writer.prototype.insert.calledOnce ).to.be.true;
			expect( Writer.prototype.remove.calledOnce ).to.be.true;
		} );

		it( 'should place selection after when correcting to longer word (spellchecker)', () => {
			// This test case emulates spellchecker correction.
			editor.setData( '<p>Foo hous a</p>' );

			const viewSelection = new ViewSelection();
			viewSelection.setTo( viewRoot.getChild( 0 ).getChild( 0 ), 9 );

			viewDocument.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'Foo hous a',
					newText: 'Foo house a',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo house[] a</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>Foo house{} a</p>' );
		} );

		it( 'should place selection after when correcting to shorter word (spellchecker)', () => {
			// This test case emulates spellchecker correction.
			editor.setData( '<p>Bar athat foo</p>' );

			const viewSelection = new ViewSelection();
			viewSelection.setTo( viewRoot.getChild( 0 ).getChild( 0 ), 8 );

			viewDocument.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'Bar athat foo',
					newText: 'Bar that foo',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>Bar that[] foo</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>Bar that{} foo</p>' );
		} );

		it( 'should place selection after when merging two words (spellchecker)', () => {
			// This test case emulates spellchecker correction.
			editor.setData( '<p>Foo hous e</p>' );

			const viewSelection = new ViewSelection();
			viewSelection.setTo( viewRoot.getChild( 0 ).getChild( 0 ), 9 );

			viewDocument.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'Foo hous e',
					newText: 'Foo house',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo house[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>Foo house{}</p>' );
		} );

		it( 'should place non-collapsed selection after changing single character (composition)', () => {
			editor.setData( '<p>Foo house</p>' );

			const viewSelection = new ViewSelection();
			viewSelection.setTo( viewRoot.getChild( 0 ).getChild( 0 ), 8 );
			viewSelection.setFocus( viewRoot.getChild( 0 ).getChild( 0 ), 9 );

			viewDocument.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'Foo house',
					newText: 'Foo housa',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo hous[a]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>Foo hous{a}</p>' );
		} );

		it( 'should replace last &nbsp; with space', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 6, modelRoot.getChild( 0 ), 6 )
				);
			} );

			viewDocument.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'foobar\u00A0',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foobar []</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foobar {}</p>' );
		} );

		it( 'should replace first &nbsp; with space', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 0, modelRoot.getChild( 0 ), 0 )
				);
			} );

			viewDocument.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: '\u00A0foobar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph> []foobar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p> {}foobar</p>' );
		} );

		it( 'should replace all &nbsp; with spaces', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 6, modelRoot.getChild( 0 ), 6 )
				);
			} );

			viewDocument.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'foobar\u00A0\u00A0\u00A0baz',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foobar   baz[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foobar   baz{}</p>' );
		} );

		// ckeditor5#718.
		it( 'should not crash and prevent all changes if view common ancestor of mutations cannot be mapped to model', () => {
			editor.setData( '<p>Foo</p><ul><li>Bar</li><li>Baz</li></ul>' );

			const ul = viewRoot.getChild( 1 );

			viewDocument.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'Bar',
					newText: 'Bx',
					node: ul.getChild( 0 )
				},
				{
					type: 'children',
					oldChildren: [ ul.getChild( 0 ), ul.getChild( 1 ) ],
					newChildren: [ ul.getChild( 0 ) ],
					node: ul
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p>{}Foo</p><ul><li>Bar</li><li>Baz</li></ul>' );
		} );

		it( 'should handle bogus br correctly', () => {
			editor.setData( '<p><strong>Foo</strong></p>' );

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'end' );
				writer.removeSelectionAttribute( 'bold' );
			} );

			// We need to change the DOM content manually because typing algorithm actually does not check
			// `newChildren` and `oldChildren` list but takes them from DOM and model.
			const p = viewRoot.getChild( 0 );
			const domP = editor.editing.view.domConverter.mapViewToDom( p );
			domP.appendChild( document.createTextNode( ' ' ) );
			domP.appendChild( document.createElement( 'br' ) );

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ viewRoot.getChild( 0 ).getChild( 0 ) ],
					newChildren: [
						new ViewElement( 'strong', null, new ViewText( 'Foo' ) ),
						new ViewText( ' ' ),
						new ViewElement( 'br' )
					],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p><strong>Foo</strong> {}</p>' );
		} );

		it( 'should handle children mutation correctly if there are soft breaks in the mutated container', () => {
			editor.setData( '<p><strong>Foo</strong><br /><strong>Bar</strong></p>' );

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'end' );
				writer.removeSelectionAttribute( 'bold' );
			} );

			// We need to change the DOM content manually because typing algorithm actually does not check
			// `newChildren` and `oldChildren` list but takes them from DOM and model.
			const p = viewRoot.getChild( 0 );
			const domP = editor.editing.view.domConverter.mapViewToDom( p );
			domP.appendChild( document.createTextNode( ' ' ) );
			domP.appendChild( document.createElement( 'br' ) );

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ ...viewRoot.getChild( 0 ).getChildren() ],
					newChildren: [
						new ViewElement( 'strong', null, new ViewText( 'Foo' ) ),
						new ViewElement( 'br' ),
						new ViewElement( 'strong', null, new ViewText( 'Bar' ) ),
						new ViewText( ' ' ),
						new ViewElement( 'br' )
					],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p><strong>Foo</strong><br></br><strong>Bar</strong> {}</p>' );
		} );
	} );

	describe( 'keystroke handling', () => {
		it( 'should remove contents', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) );
			} );

			listenter.listenTo( viewDocument, 'keydown', () => {
				expect( getModelData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );
			}, { priority: 'lowest' } );
		} );

		// #97
		it( 'should remove contents and merge blocks', () => {
			setModelData( model, '<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>' );

			listenter.listenTo( viewDocument, 'keydown', () => {
				expect( getModelData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );

				viewDocument.fire( 'mutations', [
					{
						type: 'text',
						oldText: 'foar',
						newText: 'foyar',
						node: viewRoot.getChild( 0 ).getChild( 0 )
					}
				] );
			}, { priority: 'lowest' } );

			viewDocument.fire( 'keydown', { keyCode: getCode( 'y' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foy[]ar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foy{}ar</p>' );
		} );

		it( 'should do nothing on arrow key', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) );
			} );

			viewDocument.fire( 'keydown', { keyCode: getCode( 'arrowdown' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing on ctrl combinations', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) );
			} );

			viewDocument.fire( 'keydown', { ctrlKey: true, keyCode: getCode( 'c' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing on non printable keys', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) );
			} );

			viewDocument.fire( 'keydown', { keyCode: 16 } ); // Shift
			viewDocument.fire( 'keydown', { keyCode: 35 } ); // Home
			viewDocument.fire( 'keydown', { keyCode: 112 } ); // F1

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		// #69
		it( 'should do nothing on tab key', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) );
			} );

			viewDocument.fire( 'keydown', { keyCode: 9 } ); // Tab

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing if selection is collapsed', () => {
			viewDocument.fire( 'keydown', { ctrlKey: true, keyCode: getCode( 'c' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'should lock buffer if selection is not collapsed', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) );
			} );

			viewDocument.fire( 'keydown', { keyCode: getCode( 'y' ) } );

			expect( lockSpy.calledOnce ).to.be.true;
			expect( unlockSpy.calledOnce ).to.be.true;
		} );

		it( 'should not lock buffer on non printable keys', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			viewDocument.fire( 'keydown', { keyCode: 16 } ); // Shift
			viewDocument.fire( 'keydown', { keyCode: 35 } ); // Home
			viewDocument.fire( 'keydown', { keyCode: 112 } ); // F1

			expect( lockSpy.callCount ).to.be.equal( 0 );
			expect( unlockSpy.callCount ).to.be.equal( 0 );
		} );

		it( 'should not lock buffer on collapsed selection', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			viewDocument.fire( 'keydown', { keyCode: getCode( 'b' ) } );
			viewDocument.fire( 'keydown', { keyCode: getCode( 'a' ) } );
			viewDocument.fire( 'keydown', { keyCode: getCode( 'z' ) } );

			expect( lockSpy.callCount ).to.be.equal( 0 );
			expect( unlockSpy.callCount ).to.be.equal( 0 );
		} );

		it( 'should not modify document when input command is disabled and selection is collapsed', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.commands.get( 'input' ).isEnabled = false;

			viewDocument.fire( 'keydown', { keyCode: getCode( 'b' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'should not modify document when input command is disabled and selection is non-collapsed', () => {
			setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			editor.commands.get( 'input' ).isEnabled = false;

			viewDocument.fire( 'keydown', { keyCode: getCode( 'b' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		describe( '#83', () => {
			it( 'should remove contents on composition start key if not during composition', () => {
				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) );
				} );

				viewDocument.fire( 'keydown', { keyCode: 229 } );

				expect( getModelData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );
			} );

			it( 'should not remove contents on composition start key if during composition', () => {
				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) );
				} );

				viewDocument.fire( 'compositionstart' );
				viewDocument.fire( 'keydown', { keyCode: 229 } );

				expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
			} );

			it( 'should not remove contents on compositionstart event if selection is flat', () => {
				editor.setData( '<p><strong>foo</strong> <i>bar</i></p>' );

				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 5 ) );
				} );

				viewDocument.fire( 'compositionstart' );

				expect( getModelData( model ) ).to.equal(
					'<paragraph><$text bold="true">fo[o</$text> <$text italic="true">b]ar</$text></paragraph>' );
			} );

			it( 'should not remove contents on compositionstart event if selection is flat (no selection)', () => {
				editor.setData( '<p><strong>foo</strong> <i>bar</i></p>' );

				const documentSelection = model.document.selection;

				// Create empty selection.
				model.document.selection = new ModelSelection();

				viewDocument.fire( 'compositionstart' );

				expect( getModelData( model ) ).to.equal(
					'<paragraph><$text bold="true">foo</$text> <$text italic="true">bar</$text></paragraph>' );

				// Restore document selection.
				model.document.selection = documentSelection;
			} );

			it( 'should remove contents on compositionstart event if selection is not flat', () => {
				editor.setData( '<p><strong>foo</strong></p><p><i>bar</i></p>' );

				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 1 ), 2 ) );
				} );

				viewDocument.fire( 'compositionstart' );

				expect( getModelData( model ) ).to.equal(
					'<paragraph><$text bold="true">fo[]</$text><$text italic="true">r</$text></paragraph>' );
			} );

			it( 'should not remove contents on keydown event after compositionend event if selection did not change', () => {
				editor.setData( '<p><strong>foo</strong></p><p><i>bar</i></p>' );

				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 1 ), 2 ) );
				} );

				viewDocument.fire( 'compositionend' );
				viewDocument.fire( 'keydown', { keyCode: 229 } );

				expect( getModelData( model ) ).to.equal(
					'<paragraph><$text bold="true">fo[o</$text></paragraph><paragraph><$text italic="true">ba]r</$text></paragraph>' );
			} );

			it( 'should remove contents on keydown event after compositionend event if selection have changed', () => {
				editor.setData( '<p><strong>foo</strong></p><p><i>bar</i></p>' );

				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 1 ), 2 ) );
				} );

				viewDocument.fire( 'compositionend' );

				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 1 ), 1 ) );
				} );

				viewDocument.fire( 'keydown', { keyCode: 229 } );

				expect( getModelData( model ) ).to.equal(
					'<paragraph><$text bold="true">fo[]</$text><$text italic="true">ar</$text></paragraph>' );
			} );
		} );
	} );
} );

