/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { stringify as stringifyView, getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import MentionEditing, { _toMentionAttribute } from '../src/mentionediting';
import MentionCommand from '../src/mentioncommand';

describe( 'MentionEditing', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	afterEach( () => {
		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( MentionEditing.pluginName ).to.equal( 'MentionEditing' );
	} );

	it( 'should be loaded', () => {
		return createTestEditor()
			.then( newEditor => {
				expect( newEditor.plugins.get( MentionEditing ) ).to.be.instanceOf( MentionEditing );
			} );
	} );

	it( 'should set proper schema rules', () => {
		return createTestEditor()
			.then( newEditor => {
				model = newEditor.model;

				expect( model.schema.checkAttribute( [ '$root', '$text' ], 'mention' ) ).to.be.true;

				expect( model.schema.checkAttribute( [ '$block', '$text' ], 'mention' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'mention' ) ).to.be.true;

				expect( model.schema.checkAttribute( [ '$block' ], 'mention' ) ).to.be.false;
			} );
	} );

	it( 'should register mention command', () => {
		return createTestEditor()
			.then( newEditor => {
				const command = newEditor.commands.get( 'mention' );

				expect( command ).to.be.instanceof( MentionCommand );
			} );
	} );

	describe( 'conversion', () => {
		beforeEach( () => {
			return createTestEditor()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should convert <span class="mention" data-mention="@John"> to mention attribute', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const textNode = doc.getRoot().getChild( 0 ).getChild( 1 );

			expect( textNode ).to.not.be.null;
			expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'id', '@John' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_text', '@John' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_uid' );

			const expectedView = '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>';

			expect( editor.getData() ).to.equal( expectedView );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
		} );

		it( 'should be overridable', () => {
			addCustomMentionConverters( editor );

			editor.setData( '<p>Hello <b class="mention" data-mention="@Ted Mosby">Ted Mosby</b></p>' );

			const textNode = doc.getRoot().getChild( 0 ).getChild( 1 );

			expect( textNode ).to.not.be.null;
			expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'id', '@Ted Mosby' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_text', 'Ted Mosby' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_uid' );

			const expectedView = '<p>Hello <b class="mention" data-mention="@Ted Mosby">Ted Mosby</b></p>';

			expect( editor.getData() ).to.equal( expectedView );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
		} );

		it( 'should convert consecutive mentions spans as two text nodes and two spans in the view', () => {
			editor.setData(
				'<p>' +
					'<span class="mention" data-mention="@John">@John</span>' +
					'<span class="mention" data-mention="@John">@John</span>' +
				'</p>'
			);

			// getModelData() merges text blocks with "same" attributes:
			// So expected: <$text mention="{"name":"John"}">@John</$text><$text mention="{"name":"John"}">@John</$text>'
			// Is returned as: <$text mention="{"name":"John"}">@John@John</$text>'
			const paragraph = doc.getRoot().getChild( 0 );

			expect( paragraph.childCount ).to.equal( 2 );

			assertTextNode( paragraph.getChild( 0 ) );
			assertTextNode( paragraph.getChild( 1 ) );

			const firstMentionId = paragraph.getChild( 0 ).getAttribute( 'mention' )._uid;
			const secondMentionId = paragraph.getChild( 1 ).getAttribute( 'mention' )._uid;

			expect( firstMentionId ).to.not.equal( secondMentionId );

			const expectedView = '<p><span class="mention" data-mention="@John">@John</span>' +
				'<span class="mention" data-mention="@John">@John</span></p>';

			expect( editor.getData() ).to.equal( expectedView );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );

			function assertTextNode( textNode ) {
				expect( textNode ).to.not.be.null;
				expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
				expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'id', '@John' );
				expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_text', '@John' );
				expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_uid' );
			}
		} );

		it( 'should upcast partial mention', () => {
			editor.setData( '<p><span class="mention" data-mention="@John">@Jo</span></p>' );

			const textNode = doc.getRoot().getChild( 0 ).getChild( 0 );

			expect( textNode ).to.not.be.null;
			expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'id', '@John' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_text', '@Jo' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_uid' );

			const expectedView = '<p><span class="mention" data-mention="@John">@Jo</span></p>';

			expect( editor.getData() ).to.equal( expectedView );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
		} );

		it( 'should not downcast partial mention (default converter)', done => {
			editor.setData( '<p>Hello <span class="mention" data-mention="@John">@John</span></p>' );

			model.change( writer => {
				const start = writer.createPositionAt( doc.getRoot().getChild( 0 ), 0 );
				const end = writer.createPositionAt( doc.getRoot().getChild( 0 ), 9 );
				writer.setSelection( writer.createRange( start, end ) );
			} );

			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();

			editor.editing.view.document.on( 'clipboardOutput', ( evt, data ) => {
				expect( stringifyView( data.content ) ).to.equal( 'Hello @Jo' );

				done();
			} );

			editor.editing.view.document.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'should not downcast partial mention (custom converter)', done => {
			addCustomMentionConverters( editor );

			editor.conversion.for( 'downcast' ).attributeToElement( {
				model: 'mention',
				view: ( modelAttributeValue, viewWriter ) => {
					if ( !modelAttributeValue ) {
						return;
					}

					return viewWriter.createAttributeElement( 'a', {
						class: 'mention',
						'data-mention': modelAttributeValue.id,
						'href': modelAttributeValue.link
					}, { id: modelAttributeValue._uid } );
				},
				converterPriority: 'high'
			} );

			editor.setData( '<p>Hello <b class="mention" data-mention="@Ted Mosby">Ted Mosby</b></p>' );

			model.change( writer => {
				const start = writer.createPositionAt( doc.getRoot().getChild( 0 ), 0 );
				const end = writer.createPositionAt( doc.getRoot().getChild( 0 ), 9 );
				writer.setSelection( writer.createRange( start, end ) );
			} );

			const dataTransferMock = createDataTransfer();
			const preventDefaultSpy = sinon.spy();

			editor.editing.view.document.on( 'clipboardOutput', ( evt, data ) => {
				expect( stringifyView( data.content ) ).to.equal( 'Hello Ted' );

				done();
			} );

			editor.editing.view.document.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault: preventDefaultSpy
			} );
		} );

		it( 'should not convert empty mentions', () => {
			editor.setData( '<p>foo<span class="mention" data-mention="@John"></span></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foo</paragraph>' );

			const expectedView = '<p>foo</p>';

			expect( editor.getData() ).to.equal( expectedView );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
		} );
	} );

	describe( 'selection post-fixer', () => {
		beforeEach( () => {
			return createTestEditor()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should remove mention attribute from a selection if selection is on right side of a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span>bar</p>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 9 );
			} );

			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should allow to type after a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span>bar</p>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 9 );

				writer.insertText( ' ', paragraph, 9 );
			} );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );
		} );

		it( 'should not allow to type with mention attribute before mention', () => {
			editor.setData( '<p><span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			// Set selection before mention.
			model.change( writer => {
				writer.setSelection( paragraph, 0 );
			} );

			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [] );

			model.change( writer => {
				writer.insertText( 'a', doc.selection.getAttributes(), writer.createPositionAt( paragraph, 0 ) );
			} );

			expect( editor.getData() ).to.equal( '<p>a<span class="mention" data-mention="@John">@John</span> bar</p>' );
		} );
	} );

	describe( 'removing partial mention post-fixer', () => {
		beforeEach( () => {
			return createTestEditor()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should remove mention on adding a text inside mention (in the middle)', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const textNode = doc.getRoot().getChild( 0 ).getChild( 1 );

			expect( textNode ).to.not.be.null;
			expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'id', '@John' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_text', '@John' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_uid' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 6 );

				writer.insertText( 'a', doc.selection.getAttributes(), writer.createPositionAt( paragraph, 6 ) );
			} );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo @Jaohn bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo @Jaohn bar</p>' );
		} );

		it( 'should remove mention on typing in mention node with selection attributes set', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const textNode = doc.getRoot().getChild( 0 ).getChild( 1 );

			expect( textNode ).to.not.be.null;
			expect( textNode.hasAttribute( 'mention' ) ).to.be.true;

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 6 );
				writer.setSelectionAttribute( 'bold', true );

				writer.insertText( 'a', doc.selection.getAttributes(), writer.createPositionAt( paragraph, 6 ) );
			} );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo @J<$text bold="true">a</$text>ohn bar</paragraph>' );
		} );

		it( 'should remove mention on removing a text at the beginning of a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setSelection( paragraph, 4 );
			} );

			model.enqueueChange( () => {
				model.modifySelection( doc.selection, { direction: 'forward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo John bar</p>' );
		} );

		it( 'should remove mention on removing a text in the middle a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setSelection( paragraph, 6 );
			} );

			model.enqueueChange( () => {
				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @ohn bar</p>' );
		} );

		it( 'should remove mention on removing a text at the and of a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setSelection( paragraph, 9 );
			} );

			model.enqueueChange( () => {
				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Joh bar</p>' );
		} );

		it( 'should not remove mention on removing a text just after a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			// Set selection before bar.
			model.change( writer => {
				writer.setSelection( paragraph, 10 );
			} );

			model.enqueueChange( () => {
				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="@John">@John</span>bar</p>' );
		} );

		it( 'should remove mention on inserting text node inside a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.insertText( 'baz', paragraph, 7 );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Jobazhn bar</p>' );
		} );

		it( 'should remove mention on inserting inline element inside a mention', () => {
			model.schema.register( 'inline', {
				allowWhere: '$text',
				isInline: true
			} );
			editor.conversion.elementToElement( { model: 'inline', view: 'br' } );

			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.insertElement( 'inline', paragraph, 7 );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Jo<br>hn bar</p>' );
		} );

		it( 'should remove mention when splitting paragraph with a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.split( writer.createPositionAt( paragraph, 7 ) );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Jo</p><p>hn bar</p>' );
		} );

		it( 'should remove mention when deep splitting elements', () => {
			model.schema.register( 'blockQuote', {
				allowWhere: '$block',
				allowContentOf: '$root'
			} );

			editor.conversion.elementToElement( { model: 'blockQuote', view: 'blockquote' } );
			editor.setData( '<blockquote><p>foo <span class="mention" data-mention="@John">@John</span> bar</p></blockquote>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 ).getChild( 0 );

				writer.split( writer.createPositionAt( paragraph, 7 ), doc.getRoot() );
			} );

			expect( editor.getData() ).to.equal( '<blockquote><p>foo @Jo</p></blockquote><blockquote><p>hn bar</p></blockquote>' );
		} );
	} );

	describe( 'extend attribute on mention post-fixer', () => {
		beforeEach( () => {
			return createTestEditor()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should set attribute on whole mention when formatting part of a mention (beginning formatted)', () => {
			model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );
			editor.conversion.attributeToElement( { model: 'bold', view: 'strong' } );

			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				const start = writer.createPositionAt( paragraph, 0 );
				const range = writer.createRange( start, start.getShiftedBy( 6 ) );

				writer.setSelection( range );

				writer.setAttribute( 'bold', true, range );
			} );

			expect( editor.getData() )
				.to.equal( '<p><strong>foo <span class="mention" data-mention="@John">@John</span></strong> bar</p>' );
		} );

		it( 'should set attribute on whole mention when formatting part of a mention (end formatted)', () => {
			model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );
			editor.conversion.attributeToElement( { model: 'bold', view: 'strong' } );

			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				const start = writer.createPositionAt( paragraph, 6 );
				const range = writer.createRange( start, start.getShiftedBy( 6 ) );

				writer.setSelection( range );

				writer.setAttribute( 'bold', true, range );
			} );

			expect( editor.getData() )
				.to.equal( '<p>foo <strong><span class="mention" data-mention="@John">@John</span> ba</strong>r</p>' );
		} );

		it( 'should set attribute on whole mention when formatting part of a mention (middle of mention formatted)', () => {
			model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );
			editor.conversion.attributeToElement( { model: 'bold', view: 'strong' } );

			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				const start = writer.createPositionAt( paragraph, 6 );
				const range = writer.createRange( start, start.getShiftedBy( 1 ) );

				writer.setSelection( range );

				writer.setAttribute( 'bold', true, range );
			} );

			expect( editor.getData() )
				.to.equal( '<p>foo <strong><span class="mention" data-mention="@John">@John</span></strong> bar</p>' );
		} );

		it( 'should set attribute on whole mention when formatting part of two mentions', () => {
			model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );
			editor.conversion.attributeToElement( { model: 'bold', view: 'strong' } );

			editor.setData(
				'<p><span class="mention" data-mention="@John">@John</span><span class="mention" data-mention="@John">@John</span></p>'
			);

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				const start = writer.createPositionAt( paragraph, 4 );
				const range = writer.createRange( start, start.getShiftedBy( 4 ) );

				writer.setSelection( range );

				writer.setAttribute( 'bold', true, range );
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<strong>' +
						'<span class="mention" data-mention="@John">@John</span>' +
						'<span class="mention" data-mention="@John">@John</span>' +
					'</strong>' +
				'</p>'
			);
		} );

		it( 'should work with multiple ranges in change set', () => {
			model.schema.extend( '$text', { allowAttributes: [ 'foo' ] } );
			editor.conversion.attributeToElement( {
				model: {
					key: 'foo',
					values: [ 'a', 'b' ]
				},
				view: {
					a: {
						name: 'span',
						classes: 'mark-a'
					},
					b: {
						name: 'span',
						classes: 'mark-b'
					}
				},
				converterPriority: 'high'
			} );

			editor.setData(
				'<p>' +
					'<span class="mark-a">foo <span class="mention" data-mention="@John">@John</span></span>' +
					'<span class="mention" data-mention="@John">@John</span> bar' +
				'</p>'
			);

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );
				const start = writer.createPositionAt( paragraph, 7 );
				const range = writer.createRange( start, start.getShiftedBy( 5 ) );

				writer.setAttribute( 'foo', 'b', range );
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span class="mark-a">foo </span>' +
					'<span class="mark-b">' +
						'<span class="mention" data-mention="@John">@John</span>' +
						'<span class="mention" data-mention="@John">@John</span>' +
					'</span> bar' +
				'</p>'
			);
		} );
	} );

	function createTestEditor( mentionConfig ) {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, MentionEditing, Clipboard ],
				mention: mentionConfig
			} );
	}

	function createDataTransfer() {
		const store = new Map();

		return {
			setData( type, data ) {
				store.set( type, data );
			},

			getData( type ) {
				return store.get( type );
			}
		};
	}
} );

function addCustomMentionConverters( editor ) {
	editor.conversion.for( 'upcast' ).elementToAttribute( {
		view: {
			name: 'b',
			key: 'data-mention',
			classes: 'mention'
		},
		model: {
			key: 'mention',
			value: viewItem => {
				return _toMentionAttribute( viewItem );
			}
		},
		converterPriority: 'high'
	} );

	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, viewWriter ) => {
			if ( !modelAttributeValue ) {
				return;
			}

			return viewWriter.createAttributeElement( 'b', {
				class: 'mention',
				'data-mention': modelAttributeValue.id
			}, { id: modelAttributeValue._uid } );
		},
		converterPriority: 'high'
	} );
}
