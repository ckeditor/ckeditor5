/*
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/boldengine';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italicengine';
import LinkEngine from '@ckeditor/ckeditor5-link/src/linkengine';
import Input from '../src/input';

import Batch from '@ckeditor/ckeditor5-engine/src/model/batch';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewSelection from '@ckeditor/ckeditor5-engine/src/view/selection';
import MutationObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mutationobserver';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Input feature', () => {
	let editor, model, modelRoot, view, viewRoot, listenter;

	testUtils.createSinonSandbox();

	before( () => {
		listenter = Object.create( EmitterMixin );

		return VirtualTestEditor
			.create( {
				plugins: [ Input, Paragraph ]
			} )
			.then( newEditor => {
				// Mock image feature.
				newEditor.document.schema.registerItem( 'image', '$inline' );

				buildModelConverter().for( newEditor.data.modelToView, newEditor.editing.modelToView )
					.fromElement( 'image' )
					.toElement( 'img' );

				buildViewConverter().for( newEditor.data.viewToModel )
					.fromElement( 'img' )
					.toElement( 'image' );

				editor = newEditor;
				model = editor.editing.model;
				modelRoot = model.getRoot();
				view = editor.editing.view;
				viewRoot = view.getRoot();
			} );
	} );

	after( () => {
		return editor.destroy();
	} );

	beforeEach( () => {
		editor.setData( '<p>foobar</p>' );

		model.enqueueChanges( () => {
			model.selection.setRanges( [
				ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 3, modelRoot.getChild( 0 ), 3 )
			] );
		} );
	} );

	afterEach( () => {
		listenter.stopListening();
	} );

	describe( 'mutations handling', () => {
		it( 'should handle text mutation', () => {
			view.fire( 'mutations', [
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
			view.fire( 'mutations', [
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

			view.fire( 'mutations', [
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

		it( 'should do nothing when two nodes were inserted', () => {
			editor.setData( '<p></p>' );

			view.fire( 'mutations', [
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
			view.fire( 'mutations', [
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

			view.fire( 'mutations', [
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
			view.fire( 'mutations', [
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

			view.fire( 'mutations', [
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
			viewSelection.setCollapsedAt( viewRoot.getChild( 0 ).getChild( 0 ), 6 );

			view.fire( 'mutations',
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
			viewSelection.setCollapsedAt( viewRoot.getChild( 0 ).getChild( 0 ), 6 );

			testUtils.sinon.spy( Batch.prototype, 'weakInsert' );
			testUtils.sinon.spy( Batch.prototype, 'remove' );

			view.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'foobar',
					newText: 'fxobxr',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( Batch.prototype.weakInsert.calledOnce ).to.be.true;
			expect( Batch.prototype.remove.calledOnce ).to.be.true;
		} );

		it( 'should place selection after when correcting to longer word (spellchecker)', () => {
			// This test case emulates spellchecker correction.
			editor.setData( '<p>Foo hous a</p>' );

			const viewSelection = new ViewSelection();
			viewSelection.setCollapsedAt( viewRoot.getChild( 0 ).getChild( 0 ), 9 );

			view.fire( 'mutations',
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
			viewSelection.setCollapsedAt( viewRoot.getChild( 0 ).getChild( 0 ), 8 );

			view.fire( 'mutations',
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
			viewSelection.setCollapsedAt( viewRoot.getChild( 0 ).getChild( 0 ), 9 );

			view.fire( 'mutations',
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
			viewSelection.setCollapsedAt( viewRoot.getChild( 0 ).getChild( 0 ), 8 );
			viewSelection.moveFocusTo( viewRoot.getChild( 0 ).getChild( 0 ), 9 );

			view.fire( 'mutations',
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
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 6, modelRoot.getChild( 0 ), 6 )
				] );
			} );

			view.fire( 'mutations', [
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
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 0, modelRoot.getChild( 0 ), 0 )
				] );
			} );

			view.fire( 'mutations', [
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
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 6, modelRoot.getChild( 0 ), 6 )
				] );
			} );

			view.fire( 'mutations', [
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
	} );

	describe( 'keystroke handling', () => {
		it( 'should remove contents', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			listenter.listenTo( view, 'keydown', () => {
				expect( getModelData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );
			}, { priority: 'lowest' } );
		} );

		// #97
		it( 'should remove contents and merge blocks', () => {
			setModelData( model, '<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>' );

			listenter.listenTo( view, 'keydown', () => {
				expect( getModelData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );

				view.fire( 'mutations', [
					{
						type: 'text',
						oldText: 'foar',
						newText: 'foyar',
						node: viewRoot.getChild( 0 ).getChild( 0 )
					}
				] );
			}, { priority: 'lowest' } );

			view.fire( 'keydown', { keyCode: getCode( 'y' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foy[]ar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foy{}ar</p>' );
		} );

		it( 'should do nothing on arrow key', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: getCode( 'arrowdown' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing on ctrl combinations', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { ctrlKey: true, keyCode: getCode( 'c' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing on non printable keys', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: 16 } ); // Shift
			view.fire( 'keydown', { keyCode: 35 } ); // Home
			view.fire( 'keydown', { keyCode: 112 } ); // F1

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		// #69
		it( 'should do nothing on tab key', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: 9 } ); // Tab

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		// #82
		it( 'should do nothing on composition start key', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: 229 } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing if selection is collapsed', () => {
			view.fire( 'keydown', { ctrlKey: true, keyCode: getCode( 'c' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'should lock buffer if selection is not collapsed', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: getCode( 'y' ) } );

			expect( lockSpy.calledOnce ).to.be.true;
			expect( unlockSpy.calledOnce ).to.be.true;
		} );

		it( 'should not lock buffer on non printable keys', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			view.fire( 'keydown', { keyCode: 16 } ); // Shift
			view.fire( 'keydown', { keyCode: 35 } ); // Home
			view.fire( 'keydown', { keyCode: 112 } ); // F1

			expect( lockSpy.callCount ).to.be.equal( 0 );
			expect( unlockSpy.callCount ).to.be.equal( 0 );
		} );

		it( 'should not lock buffer on collapsed selection', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			view.fire( 'keydown', { keyCode: getCode( 'b' ) } );
			view.fire( 'keydown', { keyCode: getCode( 'a' ) } );
			view.fire( 'keydown', { keyCode: getCode( 'z' ) } );

			expect( lockSpy.callCount ).to.be.equal( 0 );
			expect( unlockSpy.callCount ).to.be.equal( 0 );
		} );

		it( 'should not modify document when input command is disabled and selection is collapsed', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.commands.get( 'input' ).isEnabled = false;

			view.fire( 'keydown', { keyCode: getCode( 'b' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'should not modify document when input command is disabled and selection is non-collapsed', () => {
			setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			editor.commands.get( 'input' ).isEnabled = false;

			view.fire( 'keydown', { keyCode: getCode( 'b' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );
	} );

	// NOTE: In all these tests we need to simulate the mutations. However, it's really tricky to tell what
	// should be in "newChildren" because we don't have yet access to these nodes. We pass new instances,
	// but this means that DomConverter which is used somewhere internally may return a different instance
	// (which wouldn't happen in practice because it'd cache it). Besides, it's really hard to tell if the
	// browser will keep the instances of the old elements when modifying the tree when the user is typing
	// or if it will create new instances itself too.
	// However, the code handling these mutations doesn't really care what's inside new/old children. It
	// just needs the mutations common ancestor to understand how big fragment of the tree has changed.
	describe( '#100', () => {
		let domElement, domRoot;

		beforeEach( () => {
			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			return ClassicTestEditor.create( domElement, { plugins: [ Input, Paragraph, Bold, Italic, LinkEngine ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.document;
					modelRoot = model.getRoot();
					view = editor.editing.view;
					viewRoot = view.getRoot();
					domRoot = view.getDomRoot();

					// Mock image feature.
					newEditor.document.schema.registerItem( 'image', '$inline' );

					buildModelConverter().for( newEditor.data.modelToView, newEditor.editing.modelToView )
						.fromElement( 'image' )
						.toElement( 'img' );

					buildViewConverter().for( newEditor.data.viewToModel )
						.fromElement( 'img' )
						.toElement( 'image' );

					// Disable MO completely and in a way it won't be reenabled on some Document#render() call.
					const mutationObserver = view.getObserver( MutationObserver );

					mutationObserver.disable();
					mutationObserver.enable = () => {};
				} );
		} );

		afterEach( () => {
			domElement.remove();

			return editor.destroy();
		} );

		// This happens when browser automatically switches parent and child nodes.
		it( 'should handle mutations switching inner and outer node when adding new text node after', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text italic="true" linkHref="foo">' +
						'text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><a href="foo"><i>text{}</i></a></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const link = paragraph.getChild( 0 );
			const italic = link.getChild( 0 );
			const text = italic.getChild( 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = '<i><a href="foo">text</a>x</i>';
			view.fire( 'mutations', [
				// First mutation - remove all children from link element.
				{
					type: 'children',
					node: link,
					oldChildren: [ italic ],
					newChildren: []
				},

				// Second mutation - remove link from paragraph and put italic there.
				{
					type: 'children',
					node: paragraph,
					oldChildren: [ link ],
					newChildren: [ new ViewElement( 'i' ) ]
				},

				// Third mutation - italic's new children.
				{
					type: 'children',
					node: italic,
					oldChildren: [ text ],
					newChildren: [ new ViewElement( 'a', null, text ), new ViewText( 'x' ) ]
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p><a href="foo"><i>textx{}</i></a></p>' );
		} );

		it( 'should handle mutations switching inner and outer node when adding new text node before', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text italic="true" linkHref="foo">' +
						'[]text' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><a href="foo"><i>{}text</i></a></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const link = paragraph.getChild( 0 );
			const italic = link.getChild( 0 );
			const text = italic.getChild( 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = '<i>x<a href="foo">text</a></i>';
			view.fire( 'mutations', [
				// First mutation - remove all children from link element.
				{
					type: 'children',
					node: link,
					oldChildren: [ italic ],
					newChildren: []
				},

				// Second mutation - remove link from paragraph and put italic there.
				{
					type: 'children',
					node: paragraph,
					oldChildren: [ link ],
					newChildren: [ new ViewElement( 'i' ) ]
				},

				// Third mutation - italic's new children.
				{
					type: 'children',
					node: italic,
					oldChildren: [ text ],
					newChildren: [ new ViewText( 'x' ), new ViewElement( 'a', null, 'text' ) ]
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p><a href="foo"><i>x{}text</i></a></p>' );
		} );

		it( 'should handle mutations switching inner and outer node - with text before', () => {
			setModelData( model,
				'<paragraph>' +
					'xxx<$text italic="true" linkHref="foo">' +
						'text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p>xxx<a href="foo"><i>text{}</i></a></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const textBefore = paragraph.getChild( 0 );
			const link = paragraph.getChild( 1 );
			const italic = link.getChild( 0 );
			const text = italic.getChild( 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = 'xxx<i><a href="foo">text</a>x</i>';
			view.fire( 'mutations', [
				// First mutation - remove all children from link element.
				{
					type: 'children',
					node: link,
					oldChildren: [ italic ],
					newChildren: []
				},

				// Second mutation - remove link from paragraph and put italic there.
				{
					type: 'children',
					node: paragraph,
					oldChildren: [ textBefore, link ],
					newChildren: [ new ViewText( 'xxx' ), new ViewElement( 'i' ) ]
				},

				// Third mutation - italic's new children.
				{
					type: 'children',
					node: italic,
					oldChildren: [ text ],
					newChildren: [ new ViewElement( 'a', null, 'text' ), new ViewText( 'x' ) ]
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p>xxx<a href="foo"><i>textx{}</i></a></p>' );
		} );

		// This happens when spell checker is applied on <strong> element and changes it to <b>.
		it( 'should handle mutations replacing node', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text bold="true">' +
						'text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const strong = paragraph.getChild( 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = '<b>fixed text</b>';
			view.fire( 'mutations', [
				// Replace `<strong>` with `<b>`.
				{
					type: 'children',
					node: paragraph,
					oldChildren: [ strong ],
					newChildren: [ new ViewElement( 'b', null, 'fixed text' ) ]
				}
			] );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal( '<p><strong>fixed text</strong></p>' );
		} );

		// Spell checker splits text inside attributes to two text nodes.
		it( 'should handle mutations inside attribute element', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text bold="true">' +
						'this is foo text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><strong>this is foo text{}</strong></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const strong = paragraph.getChild( 0 );
			const text = strong.getChild( 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].childNodes[ 0 ].innerHTML = 'this is bar text';
			view.fire( 'mutations', [
				{
					type: 'children',
					node: strong,
					oldChildren: [ text ],
					newChildren: [ new ViewText( 'this is bar' ), new ViewText( ' text' ) ]
				}
			] );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal( '<p><strong>this is bar text</strong></p>' );
		} );

		it( 'should do nothing if elements mutated', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text bold="true">' +
						'text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const strong = paragraph.getChild( 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = '<strong>text</strong><img />';
			view.fire( 'mutations', [
				{
					type: 'children',
					node: paragraph,
					oldChildren: [ strong ],
					newChildren: [
						new ViewElement( 'strong', null, new ViewText( 'text' ) ),
						new ViewElement( 'img' )
					]
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );
		} );

		it( 'should do nothing if text is not changed', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text bold="true">' +
						'text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const strong = paragraph.getChild( 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = '<strong>text</strong>';
			view.fire( 'mutations', [
				{
					type: 'children',
					node: paragraph,
					oldChildren: [ strong ],
					newChildren: [ new ViewElement( 'strong', null, new ViewText( 'text' ) ) ]
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );
		} );

		it( 'should do nothing on empty mutations', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text bold="true">' +
						'text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = '<strong>text</strong>';
			view.fire( 'mutations', [] );

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );
		} );

		it( 'should do nothing if mutations does not have common ancestor', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text bold="true">' +
						'text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const strong = paragraph.getChild( 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = '<strong>text</strong>';
			view.fire( 'mutations', [
				{
					type: 'children',
					node: paragraph,
					oldChildren: [ strong ],
					newChildren: [ strong ]
				},
				{
					type: 'children',
					node: new ViewContainerElement( 'div' ),
					oldChildren: [],
					newChildren: [ new ViewText( 'foo' ), new ViewText( 'bar' ) ]
				}
			] );

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );
		} );

		it( 'should handle view selection if one is returned from mutations', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text bold="true">' +
						'text[]' +
					'</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view ) ).to.equal( '<p><strong>text{}</strong></p>' );

			const paragraph = viewRoot.getChild( 0 );
			const strong = paragraph.getChild( 0 );
			const viewSelection = new ViewSelection();
			viewSelection.setCollapsedAt( paragraph, 0 );

			// Simulate mutations and DOM change.
			domRoot.childNodes[ 0 ].innerHTML = '<b>textx</b>';
			view.fire( 'mutations', [
				// Replace `<strong>` with `<b>`.
				{
					type: 'children',
					node: paragraph,
					oldChildren: [ strong ],
					newChildren: [ new ViewElement( 'b', null, new ViewText( 'textx' ) ) ]
				}
			], viewSelection );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text bold="true">[]textx</$text></paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p><strong>{}textx</strong></p>' );
		} );
	} );
} );

