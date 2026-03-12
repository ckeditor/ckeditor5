/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BoldEditing, StrikethroughEditing, ItalicEditing } from '@ckeditor/ckeditor5-basic-styles';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { ImageInlineEditing } from '@ckeditor/ckeditor5-image';

import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { TableEditing } from '@ckeditor/ckeditor5-table';

import { RestrictedEditingModeEditing } from '../src/restrictededitingmodeediting.js';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';
import { Command } from '@ckeditor/ckeditor5-core';

describe( 'RestrictedEditingModeEditing - block exceptions', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	describe( 'enabling commands', () => {
		let plugin, firstParagraph, secondParagraph;

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

			_setModelData( editor.model,
				'<paragraph>foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);

			firstParagraph = model.document.getRoot().getChild( 0 );
			secondParagraph = model.document.getRoot().getChild( 1 ).getChild( 0 );

			addExceptionMarker( 1, 2, model.document.getRoot(), 'block:1' );
		} );

		it( 'all commands should be enabled in exception marker', () => {
			const command = editor.commands.get( 'regularCommand' );

			expect( command.isEnabled ).to.be.false;

			moveIntoExceptionMarker();

			expect( command.isEnabled ).to.be.true;

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
				writer.setSelection( secondParagraph, 4 );
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
			it( 'should convert <div class="restricted-editing-exception">', () => {
				editor.setData(
					'<p>foo</p>' +
					'<div class="restricted-editing-exception">bar</div>' +
					'<p>baz</p>'
				);

				expect( model.markers.has( 'restrictedEditingException:block:1' ) ).to.be.true;

				assertMarkerRangePaths( [ 1 ], [ 2 ], 'block:1' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>bar</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>baz</paragraph>'
				);
			} );

			it( 'should convert multiple <div class="restricted-editing-exception">', () => {
				editor.setData(
					'<p>foo</p>' +
					'<div class="restricted-editing-exception">123</div>' +
					'<p>bar</p>' +
					'<div class="restricted-editing-exception">456</div>' +
					'<p>baz</p>'
				);

				expect( model.markers.has( 'restrictedEditingException:block:1' ) ).to.be.true;
				expect( model.markers.has( 'restrictedEditingException:block:2' ) ).to.be.true;

				assertMarkerRangePaths( [ 1 ], [ 2 ], 'block:1' );
				assertMarkerRangePaths( [ 3 ], [ 4 ], 'block:2' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>123</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>bar</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>456</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>baz</paragraph>'
				);
			} );

			it( 'should convert <div class="restricted-editing-exception"> inside table', () => {
				editor.setData(
					'<figure class="table">' +
						'<table><tbody><tr><td><div class="restricted-editing-exception">bar</div></td></tr></tbody></table>' +
					'</figure>'
				);

				expect( model.markers.has( 'restrictedEditingException:block:1' ) ).to.be.true;

				const marker = model.markers.get( 'restrictedEditingException:block:1' );

				expect( marker.getStart().path ).to.deep.equal( [ 0, 0, 0, 0 ] );
				expect( marker.getEnd().path ).to.deep.equal( [ 0, 0, 0, 1 ] );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<restrictedEditingException>' +
									'<paragraph>bar</paragraph>' +
								'</restrictedEditingException>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should not convert other <div> elements', () => {
				editor.setData( '<p>foo</p><div class="foo bar">bar</div><p>baz</p>' );

				expect( model.markers.has( 'restrictedEditingException:block:1' ) ).to.be.false;
			} );

			it( 'should remove previous `restrictedEditingException` markers before setting new ones', () => {
				editor.setData(
					'<figure class="table">' +
						'<table><tbody><tr><td><div class="restricted-editing-exception">bar</div></td></tr></tbody></table>' +
					'</figure>'
				);

				expect( model.markers.has( 'restrictedEditingException:block:1' ) ).to.be.true;
				expect( model.markers.has( 'restrictedEditingException:block:2' ) ).to.be.false;

				editor.setData(
					'<figure class="table">' +
						'<table><tbody><tr><td><div class="restricted-editing-exception">bar</div></td></tr></tbody></table>' +
					'</figure>'
				);

				expect( model.markers.has( 'restrictedEditingException:block:1' ) ).to.be.false;
				expect( model.markers.has( 'restrictedEditingException:block:2' ) ).to.be.true;
			} );

			it( 'should be overridable', () => {
				model.schema.register( 'container', { inheritAllFrom: '$container' } );
				editor.conversion.elementToElement( { view: 'div', model: 'container', converterPriority: 'high' } );

				editor.setData(
					'<p>foo</p>' +
					'<div class="restricted-editing-exception">bar</div>' +
					'<p>baz</p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<container>' +
						'<paragraph>bar</paragraph>' +
					'</container>' +
					'<paragraph>baz</paragraph>'
				);

				expect( model.markers.has( 'restrictedEditingException:block:1' ) ).to.be.false;
			} );
		} );

		describe( 'schema', () => {
			it( 'should register block exception wrapper', () => {
				expect( model.schema.isRegistered( 'restrictedEditingException' ) ).to.be.true;
			} );

			it( 'should set rules for wrapper element', () => {
				expect( model.schema.checkChild( '$root', 'restrictedEditingException' ) ).to.be.true;
				expect( model.schema.checkChild( '$container', 'restrictedEditingException' ) ).to.be.true;
				expect( model.schema.checkChild( 'restrictedEditingException', '$block' ) ).to.be.true;
				expect( model.schema.checkChild( 'restrictedEditingException', '$container' ) ).to.be.true;

				expect( model.schema.isLimit( 'restrictedEditingException' ) ).to.be.true;
				expect( model.schema.isObject( 'restrictedEditingException' ) ).to.be.false;
				expect( model.schema.isBlock( 'restrictedEditingException' ) ).to.be.false;
				expect( model.schema.isSelectable( 'restrictedEditingException' ) ).to.be.false;
			} );
		} );

		describe( 'downcast', () => {
			it( 'should convert block exception', () => {
				_setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>bar</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>baz</paragraph>'
				);

				const wrapper = model.document.getRoot().getChild( 1 );

				model.change( writer => {
					writer.addMarker( 'restrictedEditingException:block:1', {
						range: writer.createRangeOn( wrapper ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				const expectedView =
					'<p>foo</p>' +
					'<div class="restricted-editing-exception"><p>bar</p></div>' +
					'<p>baz</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );
		} );
	} );

	describe( 'editing behavior', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [
				Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline, ImageInlineEditing
			] } );
			model = editor.model;

			_setModelData( editor.model,
				'<paragraph>foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);

			addExceptionMarker( 1, 2, model.document.getRoot(), 'block:1' );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should block user typing outside exception markers', () => {
			editor.execute( 'insertText', { text: 'X' } );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>[]foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);
		} );

		it( 'should not block user typing inside exception marker', () => {
			model.change( writer => {
				writer.setSelection( model.document.getRoot().getChild( 1 ).getChild( 0 ), 4 );
			} );

			editor.execute( 'insertText', { text: 'X' } );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc X[]def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);
		} );
	} );

	describe( 'enforcing restrictions on deleteContent', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline ] } );
			model = editor.model;

			_setModelData( editor.model,
				'<paragraph>foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);

			addExceptionMarker( 1, 2, model.document.getRoot(), 'block:1' );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not allow to delete content outside restricted area', () => {
			model.deleteContent( model.createSelection( model.document.getRoot().getChild( 0 ), 'in' ) );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>[]foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);
		} );

		it( 'should not allow to delete restricted area wrapper', () => {
			model.deleteContent( model.createSelection( model.document.getRoot().getChild( 1 ), 'on' ) );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>[]foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);
		} );

		it( 'should trim deleted content to a exception marker (focus in marker)', () => {
			model.change( writer => {
				model.deleteContent( writer.createSelection(
					writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 1 ).getChild( 0 ), 3 )
					)
				), { doNotAutoparagraph: true } );
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>[]foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph> def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);
		} );

		it( 'should trim deleted content to a exception marker (anchor in marker)', () => {
			model.change( writer => {
				model.deleteContent( writer.createSelection(
					writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 1 ).getChild( 0 ), 3 ),
						writer.createPositionAt( model.document.getRoot().getChild( 2 ), 3 )
					)
				) );
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>[]foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);
		} );
	} );

	describe( 'enforcing restrictions on insertText command', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline ] } );
			model = editor.model;

			_setModelData( editor.model,
				'<paragraph>foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);

			addExceptionMarker( 1, 2, model.document.getRoot(), 'block:1' );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should prevent changing text before exception marker', () => {
			const firstParagraph = model.document.getRoot().getChild( 0 );

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

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>foo b[]ar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);
		} );

		it( 'should allow changing text inside single marker', () => {
			model.change( writer => {
				writer.setSelection( model.document.getRoot().getChild( 1 ).getChild( 0 ), 2 );
			} );

			editor.execute( 'insertText', {
				text: 'xxxxxxx'
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abxxxxxxx[]c def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);
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

			_setModelData( editor.model,
				'<paragraph>foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);

			addExceptionMarker( 1, 2, model.document.getRoot(), 'block:1' );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'cut', () => {
			it( 'should be blocked outside exception markers', () => {
				const spy = sinon.spy();
				viewDoc.on( 'clipboardOutput', spy, { priority: 'high' } );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'cut'
				} );

				sinon.assert.notCalled( spy );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>[]foo bar baz qux</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc def</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>123</paragraph>'
				);
			} );

			it( 'should cut selected content inside exception marker (selection inside marker)', () => {
				const paragraph = model.document.getRoot().getChild( 1 ).getChild( 0 );

				model.change( writer => writer.setSelection(
					writer.createRange(
						writer.createPositionAt( paragraph, 2 ),
						writer.createPositionAt( paragraph, 5 )
					)
				) );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'cut'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo bar baz qux</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>ab[]ef</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>123</paragraph>'
				);
			} );

			it( 'should cut selected content inside exception marker (selection touching wrapper edges)', () => {
				const paragraph = model.document.getRoot().getChild( 1 ).getChild( 0 );

				model.change( writer => writer.setSelection( paragraph, 'on' ) );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'cut'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo bar baz qux</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>[]</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>123</paragraph>'
				);
			} );

			it( 'should not cut selected content inside exception marker (selection on wrapper)', () => {
				model.change( writer => writer.setSelection( model.document.getRoot().getChild( 1 ), 'on' ) );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'cut'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo bar baz qux</paragraph>' +
					'[<restrictedEditingException>' +
						'<paragraph>abc def</paragraph>' +
					'</restrictedEditingException>]' +
					'<paragraph>123</paragraph>'
				);
			} );
		} );

		describe( 'copy', () => {
			it( 'should not be blocked outside exception markers', () => {
				const spy = sinon.spy();
				viewDoc.on( 'clipboardOutput', spy, { priority: 'high' } );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'copy'
				} );

				sinon.assert.calledOnce( spy );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>[]foo bar baz qux</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc def</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>123</paragraph>'
				);
			} );

			it( 'should not be blocked inside exception marker', () => {
				const spy = sinon.spy();
				viewDoc.on( 'clipboardOutput', spy, { priority: 'high' } );

				model.change( writer => writer.setSelection( model.document.getRoot().getChild( 1 ).getChild( 0 ), 5 ) );

				viewDoc.fire( 'clipboardOutput', {
					content: {
						isEmpty: true
					},
					method: 'copy'
				} );

				sinon.assert.calledOnce( spy );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo bar baz qux</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc d[]ef</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>123</paragraph>'
				);
			} );
		} );

		describe( 'paste', () => {
			beforeEach( () => {
				// Required when testing without DOM using VirtualTestEditor - Clipboard feature scrolls after paste event.
				sinon.stub( editor.editing.view, 'scrollToTheSelection' );
			} );

			it( 'should be blocked outside exception markers (collapsed selection)', () => {
				const spy = sinon.spy();

				editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', spy );

				model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 3 ) );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
				} );

				sinon.assert.notCalled( spy );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo[] bar baz qux</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc def</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>123</paragraph>'
				);
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection)', () => {
				const spy = sinon.spy();

				editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', spy );

				model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' ) );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
				} );

				sinon.assert.notCalled( spy );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>[foo bar baz qux]</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc def</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>123</paragraph>'
				);
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection, ends inside exception marker)', () => {
				const spy = sinon.spy();

				editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', spy );

				model.change( writer => writer.setSelection(
					writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 4 ),
						writer.createPositionAt( model.document.getRoot().getChild( 1 ).getChild( 0 ), 3 )
					)
				) );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
				} );

				sinon.assert.notCalled( spy );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo [bar baz qux</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc def</paragraph>' +
					'</restrictedEditingException>]' +
					'<paragraph>123</paragraph>'
				);
			} );

			it( 'should be blocked outside exception markers (non-collapsed selection, starts inside exception marker)', () => {
				const spy = sinon.spy();

				editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', spy );

				model.change( writer => writer.setSelection(
					writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 1 ).getChild( 0 ), 3 ),
						writer.createPositionAt( model.document.getRoot().getChild( 2 ), 2 )
					)
				) );

				viewDoc.fire( 'clipboardInput', {
					dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
				} );

				sinon.assert.notCalled( spy );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo bar baz qux</paragraph>' +
					'[<restrictedEditingException>' +
						'<paragraph>abc def</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>12]3</paragraph>'
				);
			} );

			describe( 'into exception block', () => {
				let paragraphInException;

				beforeEach( () => {
					paragraphInException = model.document.getRoot().getChild( 1 ).getChild( 0 );
					model.change( writer => writer.setSelection( paragraphInException, 3 ) );
				} );

				it( 'should paste text inside exception marker', () => {
					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p>', 'text/plain': 'XXX' } )
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo bar baz qux</paragraph>' +
						'<restrictedEditingException>' +
							'<paragraph>abcXXX[] def</paragraph>' +
						'</restrictedEditingException>' +
						'<paragraph>123</paragraph>'
					);

					assertMarkerRangePaths( [ 1 ], [ 2 ], 'block:1' );
				} );

				it( 'should paste allowed text attributes inside exception marker', () => {
					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( {
							'text/html': '<p><a href="foo"><b><i>XXX</i></b></a></p>',
							'text/plain': 'XXX'
						} )
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo bar baz qux</paragraph>' +
						'<restrictedEditingException>' +
							'<paragraph>' +
								'abc' +
								'<$text bold="true" italic="true" linkHref="foo">XXX</$text>' +
								'<$text bold="true" italic="true">[]</$text>' +
								' def' +
							'</paragraph>' +
						'</restrictedEditingException>' +
						'<paragraph>123</paragraph>'
					);
					assertMarkerRangePaths( [ 1 ], [ 2 ], 'block:1' );
				} );

				it( 'should paste disallowed (for inline exceptions) text attributes inside exception marker', () => {
					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p><s>XXX</s></p>', 'text/plain': 'XXX' } )
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo bar baz qux</paragraph>' +
						'<restrictedEditingException>' +
							'<paragraph>abc<$text strikethrough="true">XXX[]</$text> def</paragraph>' +
						'</restrictedEditingException>' +
						'<paragraph>123</paragraph>'
					);
					assertMarkerRangePaths( [ 1 ], [ 2 ], 'block:1' );
				} );

				it( 'should allow pasting block elements', () => {
					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<blockquote><p>XXX</p></blockquote>', 'text/plain': 'XXX' } )
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo bar baz qux</paragraph>' +
						'<restrictedEditingException>' +
							'<paragraph>abc</paragraph>' +
							'<blockQuote><paragraph>XXX</paragraph></blockQuote>' +
							'<paragraph>[] def</paragraph>' +
						'</restrictedEditingException>' +
						'<paragraph>123</paragraph>'
					);
					assertMarkerRangePaths( [ 1 ], [ 2 ], 'block:1' );
				} );

				it( 'should allow pasting multiple block elements', () => {
					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( { 'text/html': '<p>XXX</p><p>YYY</p><p>ZZZ</p>', 'text/plain': 'XXX' } )
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo bar baz qux</paragraph>' +
						'<restrictedEditingException>' +
							'<paragraph>abcXXX</paragraph>' +
							'<paragraph>YYY</paragraph>' +
							'<paragraph>ZZZ[] def</paragraph>' +
						'</restrictedEditingException>' +
						'<paragraph>123</paragraph>'
					);
					assertMarkerRangePaths( [ 1 ], [ 2 ], 'block:1' );
				} );

				it( 'should strip block exception while pasting', () => {
					viewDoc.fire( 'clipboardInput', {
						dataTransfer: createDataTransfer( {
							'text/html':
								'<p>AAA</p>' +
								'<div class="restricted-editing-exception">XXX</div>' +
								'<blockquote>' +
									'<p>BBB</p>' +
									'<div class="restricted-editing-exception">YYY</div>' +
								'</blockquote>' +
								'<p>CCC</p>',
							'text/plain': 'XXX'
						} )
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo bar baz qux</paragraph>' +
						'<restrictedEditingException>' +
							'<paragraph>abcAAA</paragraph>' +
							'<paragraph>XXX</paragraph>' +
							'<blockQuote>' +
								'<paragraph>BBB</paragraph>' +
								'<paragraph>YYY</paragraph>' +
							'</blockQuote>' +
							'<paragraph>CCC[] def</paragraph>' +
						'</restrictedEditingException>' +
						'<paragraph>123</paragraph>'
					);
					assertMarkerRangePaths( [ 1 ], [ 2 ], 'block:1' );
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

			_setModelData( editor.model,
				'<paragraph>foo bar baz qux</paragraph>' +
				'<restrictedEditingException>' +
				'<paragraph>abc def</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>123</paragraph>'
			);

			addExceptionMarker( 1, 2, model.document.getRoot(), 'block:1' );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should convert the highlight to a proper view classes', () => {
			expect( _getViewData( view ) ).to.equal(
				'<p>{}foo bar baz qux</p>' +
				'<div class="restricted-editing-exception">' +
					'<p>abc def</p>' +
				'</div>' +
				'<p>123</p>'
			);
		} );

		it( 'should remove classes when selection is moved in/out from an exception', () => {
			expect( _getViewData( view ) ).to.equal(
				'<p>{}foo bar baz qux</p>' +
				'<div class="restricted-editing-exception">' +
					'<p>abc def</p>' +
				'</div>' +
				'<p>123</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 1 ).getChild( 0 ), 2 ) );

			expect( _getViewData( view ) ).to.equal(
				'<p>foo bar baz qux</p>' +
				'<div class="restricted-editing-exception restricted-editing-exception_selected">' +
					'<p>ab{}c def</p>' +
				'</div>' +
				'<p>123</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 0 ) );

			expect( _getViewData( view ) ).to.equal(
				'<p>{}foo bar baz qux</p>' +
				'<div class="restricted-editing-exception">' +
					'<p>abc def</p>' +
				'</div>' +
				'<p>123</p>'
			);
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
