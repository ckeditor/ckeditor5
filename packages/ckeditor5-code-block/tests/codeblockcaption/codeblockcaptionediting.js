/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import CodeBlockEditing from '../../src/codeblockediting';
// import CodeBlock from '../../src/codeblock';
import CodeblockCaptionEditing from '../../src/codeblockcaption/codeblockcaptionediting';
import CodeblockCaption from '../../src/codeblockcaption';
import ToggleCodeblockCaptionCommand from '../../src/codeblockcaption/togglecodeblockcaptioncommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'CodeblockCaptionEditing', () => {
	let editor, model, doc, view, element;

	// FakePlugin helps check if the plugin under test extends existing schema correctly.
	class FakePlugin extends Plugin {
		init() {
			const schema = this.editor.model.schema;
			const conversion = this.editor.conversion;

			schema.register( 'foo', {
				isObject: true,
				isBlock: true,
				allowWhere: '$block'
			} );
			schema.register( 'caption', {
				allowIn: 'foo',
				allowContentOf: '$block',
				isLimit: true
			} );

			conversion.elementToElement( {
				view: 'foo',
				model: 'foo'
			} );
			conversion.elementToElement( {
				view: 'caption',
				model: 'caption'
			} );
		}
	}

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				language: 'en',
				plugins: [
					CodeBlockEditing,
					CodeblockCaption,
					CodeblockCaptionEditing,
					UndoEditing,
					Paragraph
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				view = editor.editing.view;
				model.schema.register( 'widget' );
				model.schema.extend( 'widget', { allowIn: '$root' } );
				model.schema.extend( 'caption', { allowIn: 'widget' } );
				model.schema.extend( '$text', { allowIn: 'widget' } );

				editor.conversion.elementToElement( {
					model: 'widget',
					view: 'widget'
				} );
			} );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( CodeblockCaptionEditing.pluginName ).to.equal( 'CodeblockCaptionEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CodeblockCaptionEditing ) ).to.be.instanceOf( CodeblockCaptionEditing );
	} );

	describe( 'schema', () => {
		it( 'should set proper schema rules for caption', () => {
			expect( model.schema.checkChild( [ '$root', 'codeBlock' ], 'caption' ) ).to.be.true;
			expect( model.schema.checkChild( [ '$root', 'codeBlock', 'caption' ], '$text' ) ).to.be.true;
			expect( model.schema.isLimit( 'caption' ) ).to.be.true;

			expect( model.schema.checkChild( [ '$root', 'codeBlock', 'caption' ], 'caption' ) ).to.be.false;

			model.schema.extend( '$block', { allowAttributes: 'aligmnent' } );
			expect( model.schema.checkAttribute( [ '$root', 'codeBlock', 'caption' ], 'alignment' ) ).to.be.false;
		} );

		it( 'should not set rules for codeBlock when CodeBlockEditing is not loaded', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ CodeBlockEditing, CodeblockCaptionEditing ]
			} );

			expect( editor.model.schema.checkAttribute( [ '$root', 'codeBlock' ], 'caption' ) ).to.be.false;

			return editor.destroy();
		} );
	} );

	describe( 'command', () => {
		it( 'should register the toggleCodeblockCaption command', () => {
			const command = editor.commands.get( 'toggleCodeblockCaption' );

			expect( command ).to.be.instanceOf( ToggleCodeblockCaptionCommand );
		} );
	} );

	it( 'should extend caption if schema for it is already registered', async () => {
		const { model } = await VirtualTestEditor
			.create( {
				plugins: [ FakePlugin, CodeblockCaptionEditing, UndoEditing, Paragraph, CodeBlockEditing ]
			} );

		expect( model.schema.isRegistered( 'caption' ) ).to.be.true;
		expect( model.schema.isLimit( 'caption' ) ).to.be.true;
		expect( model.schema.checkChild( [ 'codeBlock' ], 'caption' ) ).to.be.true;
	} );

	describe( 'data pipeline', () => {
		describe( 'view to model (upcast)', () => {
			it( 'should convert figcaption inside codeblock', () => {
				editor.setData( '<pre><code>Test<figcaption>foo bar</figcaption></code></pre>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<codeBlock language="plaintext">Test<caption>foo bar</caption></codeBlock>' );
			} );

			it( 'should not add an empty caption if there is no figcaption', () => {
				editor.setData( '<pre><code>Test</code></pre>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<codeBlock language="plaintext">Test</codeBlock>' );
			} );

			it( 'should not convert figcaption inside other elements than codeBlock', () => {
				editor.setData( '<widget><figcaption>foobar</figcaption></widget>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<widget>foobar</widget>' );
			} );
		} );

		describe( 'model to view (downcast)', () => {
			it( 'should convert caption element to figcaption', () => {
				setModelData( model, '<codeBlock language="plaintext"><caption>Foo bar baz.</caption></codeBlock>' );

				expect( editor.getData() ).to.equal(
					'<pre>' +
						'<code class="language-plaintext">' +
							'<figcaption>Foo bar baz.</figcaption>' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should not convert caption to figcaption if it\'s empty', () => {
				setModelData( model, '<codeBlock language="plaintext"><caption></caption></codeBlock>' );

				expect( editor.getData() ).to.equal( '' );
			} );

			it( 'should convert empty codeblock with empty caption to empty pre and figcaption tag', () => {
				setModelData( model, '<codeBlock language="plaintext"><caption></caption></codeBlock>' );

				expect( editor.getData( { trim: 'none' } ) ).to.equal(
					'<pre><code class="language-plaintext">' +
					'<figcaption>&nbsp;</figcaption></code></pre>'
				);
			} );

			it( 'should not convert caption from other elements', () => {
				editor.conversion.for( 'downcast' ).add(
					dispatcher => dispatcher.on( 'insert:caption', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'lowest' } )
				);

				setModelData( model, '<widget>foo bar<caption></caption></widget>' );

				expect( editor.getData() ).to.equal( '<widget>foo bar</widget>' );
			} );
		} );
	} );

	describe( 'editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert caption element to figcaption contenteditable', () => {
				setModelData( model, '<codeBlock language="plaintext"><caption>Foo bar baz.</caption></codeBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<pre data-language="Plain text" spellcheck="false">' +
						'<code class="language-plaintext">' +
							'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
							'contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">' +
								'Foo bar baz.' +
							'</figcaption>' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should not convert caption from other elements', () => {
				editor.conversion.for( 'downcast' ).add(
					dispatcher => dispatcher.on( 'insert:caption', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'lowest' } )
				);

				setModelData( model, '<widget>foo bar<caption></caption></widget>' );
				expect( getViewData( view, { withoutSelection: true } ) ).to.equal( '<widget>foo bar</widget>' );
			} );

			it( 'should not convert when element is already consumed', () => {
				editor.editing.downcastDispatcher.on(
					'insert:caption',
					( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'insert' );

						const codeFigure = conversionApi.mapper.toViewElement( data.range.start.parent );
						const viewElement = conversionApi.writer.createAttributeElement( 'span' );

						const viewPosition = conversionApi.writer.createPositionAt( codeFigure, 'end' );
						conversionApi.mapper.bindElements( data.item, viewElement );
						conversionApi.writer.insert( viewPosition, viewElement );
					},
					{ priority: 'high' }
				);

				setModelData( model, '<codeBlock language="plaintext"><caption>Foo bar baz.</caption></codeBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<pre data-language="Plain text" spellcheck="false">' +
					'<code class="language-plaintext"><span></span>Foo bar baz.</code></pre>'
				);
			} );

			it( 'should show caption when something is inserted inside', () => {
				setModelData( model, '<paragraph>foo</paragraph><codeBlock language="plaintext"><caption></caption></codeBlock>' );

				const code = doc.getRoot().getChild( 1 );
				const caption = code.getChild( 0 );

				model.change( writer => {
					writer.insertText( 'foo bar', caption );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>{}foo</p>' +
					'<pre data-language="Plain text" spellcheck="false">' +
						'<code class="language-plaintext">' +
							'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
							'contenteditable="true" data-placeholder="Enter codeblock caption" ' +
							'role="textbox">' +
							'foo bar' +
							'</figcaption>' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should not hide when everything is removed from caption', () => {
				setModelData( model,
					'<paragraph>foo</paragraph><codeBlock language="plaintext"><caption>foo bar baz</caption></codeBlock>'
				);

				const code = doc.getRoot().getChild( 1 );
				const caption = code.getChild( 0 );

				model.change( writer => {
					writer.remove( writer.createRangeIn( caption ) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>{}foo</p>' +
					'<pre data-language="Plain text" spellcheck="false">' +
						'<code class="language-plaintext">' +
							'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
							'contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">' +
							'</figcaption>' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should show when not everything is removed from caption', () => {
				setModelData( model,
					'<paragraph>foo</paragraph><codeBlock language="plaintext"><caption>foo bar baz</caption></codeBlock>'
				);

				const code = doc.getRoot().getChild( 1 );
				const caption = code.getChild( 0 );

				model.change( writer => {
					writer.remove( writer.createRange( writer.createPositionAt( caption, 0 ), writer.createPositionAt( caption, 8 ) ) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>{}foo</p>' +
					'<pre data-language="Plain text" spellcheck="false">' +
						'<code class="language-plaintext">' +
							'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
							'contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">' +
								'baz' +
							'</figcaption>' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should apply highlighting on figcaption', () => {
				editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
					model: 'marker',
					view: data => ( {
						classes: 'highlight-' + data.markerName.split( ':' )[ 1 ],
						attributes: {
							'data-foo': data.markerName.split( ':' )[ 1 ]
						}
					} )
				} );

				setModelData( model, '<codeBlock language="plaintext"><caption>Foo bar baz.</caption></codeBlock>' );

				const caption = doc.getRoot().getNodeByPath( [ 0, 0 ] );

				model.change( writer => {
					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( caption ),
						usingOperation: false
					} );
				} );

				const viewElement = editor.editing.mapper.toViewElement( caption );

				expect( viewElement.getCustomProperty( 'addHighlight' ) ).to.be.a( 'function' );
				expect( viewElement.getCustomProperty( 'removeHighlight' ) ).to.be.a( 'function' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<pre data-language="Plain text" spellcheck="false">' +
						'<code class="language-plaintext">' +
							'<figcaption class="ck-editor__editable ck-editor__nested-editable ' +
							'highlight-yellow" contenteditable="true" data-foo="yellow" ' +
							'data-placeholder="Enter codeblock caption" role="textbox">' +
								'Foo bar baz.' +
							'</figcaption>' +
						'</code>' +
					'</pre>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<pre data-language="Plain text" spellcheck="false">' +
						'<code class="language-plaintext">' +
							'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
							'contenteditable="true" data-placeholder="Enter codeblock caption" ' +
							'role="textbox">' +
								'Foo bar baz.' +
							'</figcaption>' +
						'</code>' +
					'</pre>'
				);
			} );
		} );
	} );

	describe( 'inserting code to the document', () => {
		it( 'should not add a caption element if code does not have it', () => {
			model.change( writer => {
				writer.insertElement( 'codeBlock', { language: 'plaintext' }, doc.getRoot() );
			} );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[]</codeBlock><paragraph></paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text" spellcheck="false">' +
				'<code class="language-plaintext">[]</code>' +
				'</pre><p></p>'
			);
		} );

		it( 'should not add a caption element if an code does not have it (code is nested in inserted element)', () => {
			model.change( writer => {
				model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
				model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
				model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
				model.schema.extend( '$block', { allowIn: 'tableCell' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'td' } );

				const table = writer.createElement( 'table' );
				const tableRow = writer.createElement( 'tableRow' );
				const tableCell1 = writer.createElement( 'tableCell' );
				const tableCell2 = writer.createElement( 'tableCell' );
				const code1 = writer.createElement( 'codeBlock', { language: 'plaintext' } );
				const code2 = writer.createElement( 'codeBlock', { language: 'plaintext' } );

				writer.insert( tableRow, table );
				writer.insert( tableCell1, tableRow );
				writer.insert( tableCell2, tableRow );
				writer.insert( code1, tableCell1 );
				writer.insert( code2, tableCell2 );
				writer.insert( table, doc.getRoot() );
			} );

			expect( getModelData( model ) ).to.equal(
				'[<table>' +
					'<tableRow>' +
						'<tableCell><codeBlock language="plaintext"></codeBlock></tableCell>' +
						'<tableCell><codeBlock language="plaintext"></codeBlock></tableCell>' +
					'</tableRow>' +
				'</table>]' +
				'<paragraph></paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'[<table>' +
					'<tr>' +
					'<td>' +
						'<pre data-language="Plain text" spellcheck="false">' +
							'<code class="language-plaintext">' +
							'</code>' +
						'</pre>' +
					'</td>' +
					'<td>' +
						'<pre data-language="Plain text" spellcheck="false">' +
							'<code class="language-plaintext">' +
							'</code>' +
						'</pre>' +
					'</td>' +
					'</tr>' +
				'</table>]' +
				'<p></p>'
			);
		} );

		it( 'should not add caption element if code already have it', () => {
			model.change( writer => {
				const caption = writer.createElement( 'caption' );
				const code = writer.createElement( 'codeBlock', { language: 'plaintext' } );

				writer.insertText( 'foo bar', caption );
				writer.insert( caption, code );
				writer.insert( code, doc.getRoot() );
			} );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[]<caption>foo bar</caption></codeBlock><paragraph></paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text" spellcheck="false">' +
					'<code class="language-plaintext">[]' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
						'contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">' +
							'foo bar' +
						'</figcaption>' +
					'</code>' +
				'</pre>' +
				'<p></p>'
			);
		} );

		it( 'should not add caption element twice', () => {
			model.change( writer => {
				const code = writer.createElement( 'codeBlock', { language: 'plaintext' } );
				const caption = writer.createElement( 'caption' );

				// Since we are adding an empty code, this should trigger caption fixer.
				writer.insert( code, doc.getRoot() );

				// Add caption just after the code is inserted, in same batch.
				writer.insert( caption, code );
			} );

			// Check whether caption fixer added redundant caption.
			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[]<caption></caption></codeBlock><paragraph></paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text" spellcheck="false">' +
					'<code class="language-plaintext">[]' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter codeblock caption" ' +
						'role="textbox">' +
						'</figcaption>' +
					'</code>' +
				'</pre>' +
				'<p></p>'
			);
		} );

		it( 'should do nothing for other changes than insert', () => {
			setModelData( model, '<codeBlock language="plaintext"><caption>foo bar</caption></codeBlock>' );

			const code = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'language', 'css', code );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<codeBlock language="css"><caption>foo bar</caption></codeBlock>'
			);
		} );

		it( 'should do nothing on $text insert', () => {
			setModelData( model, '<codeBlock language="plaintext"><caption>foo bar</caption></codeBlock><paragraph>[]</paragraph>' );

			const paragraph = doc.getRoot().getChild( 1 );

			// Simulate typing behavior - second input will generate input change without entry.item in change entry.
			const batch = model.createBatch();

			model.enqueueChange( batch, writer => {
				writer.insertText( 'f', paragraph, 0 );
			} );

			model.enqueueChange( batch, writer => {
				writer.insertText( 'oo', paragraph, 1 );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<codeBlock language="plaintext"><caption>foo bar</caption></codeBlock><paragraph>foo</paragraph>'
			);
		} );
	} );

	describe( 'editing view', () => {
		it( 'code should have empty figcaption element when is selected', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<codeBlock language="plaintext"><caption></caption></codeBlock>]' );

			expect( getViewData( view ) ).to.equal(
				'<p>foo</p><pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'[<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true" ' +
				'data-placeholder="Enter codeblock caption" role="textbox"></figcaption>]</code></pre>'
			);
		} );

		it( 'code should have empty figcaption element when not selected', () => {
			setModelData( model, '<paragraph>[]foo</paragraph><codeBlock language="plaintext"><caption></caption></codeBlock>' );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo</p><pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true" ' +
				'data-placeholder="Enter codeblock caption" role="textbox"></figcaption></code></pre>'
			);
		} );

		it( 'should keep the placeholder visible when the figcaption is focused', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<codeBlock language="plaintext"></codeBlock>]' );

			editor.execute( 'toggleCodeblockCaption' );

			expect( getViewData( view ) ).to.equal(
				'<p>foo</p><pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'[]<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true" ' +
				'data-placeholder="Enter codeblock caption" role="textbox"></figcaption></code></pre>'
			);

			const caption = doc.getRoot().getNodeByPath( [ 1, 0 ] );

			editor.editing.view.document.isFocused = true;
			editor.focus();

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( caption ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'<p>foo</p><pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-editor__nested-editable_focused ck-placeholder" ' +
				'contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">[]</figcaption></code></pre>'
			);
		} );

		it( 'should not add additional figcaption if one is already present', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<codeBlock language="plaintext"><caption>foo bar</caption></codeBlock>]' );

			expect( getViewData( view ) ).to.equal(
				'<p>foo</p><pre data-language="Plain text" spellcheck="false">' +
				'<code class="language-plaintext">[<figcaption class="ck-editor__editable ' +
				'ck-editor__nested-editable" contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">' +
				'foo bar</figcaption>]</code></pre>'
			);
		} );

		it( 'should not alter the figcaption when the caption is empty and the code is no longer selected', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<codeBlock language="plaintext"><caption></caption></codeBlock>]' );

			model.change( writer => {
				writer.setSelection( null );
			} );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo</p><pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true" ' +
				'data-placeholder="Enter codeblock caption" role="textbox"></figcaption></code></pre>'
			);
		} );

		it( 'should not remove figcaption when selection is inside it even when it is empty', () => {
			setModelData( model, '<codeBlock language="plaintext"><caption>[foo bar]</caption></codeBlock>' );

			model.change( writer => {
				writer.remove( doc.selection.getFirstRange() );
			} );

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true" ' +
				'data-placeholder="Enter codeblock caption" role="textbox">[]</figcaption></code></pre>'
			);
		} );

		it( 'should not remove figcaption when selection is moved from it to its code', () => {
			setModelData( model, '<codeBlock language="plaintext">baz<caption>[foo bar]</caption></codeBlock>' );
			const code = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.remove( doc.selection.getFirstRange() );
				writer.setSelection( writer.createRangeOn( code ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'{baz<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
				'contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox"></figcaption>]</code></pre>'
			);
		} );

		it( 'should not remove figcaption when selection is moved from it to other code', () => {
			setModelData( model, '<codeBlock language="plaintext">' +
				'<caption>[foo bar]</caption></codeBlock><codeBlock language="plaintext"><caption></caption>' +
			'</codeBlock>' );
			const code = doc.getRoot().getChild( 1 );

			model.change( writer => {
				writer.setSelection( writer.createRangeOn( code ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'<figcaption class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" ' +
				'data-placeholder="Enter codeblock caption" role="textbox">foo bar</figcaption></code></pre>' +
				'<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'[<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true" ' +
				'data-placeholder="Enter codeblock caption" role="textbox"></figcaption>]</code></pre>'
			);
		} );

		it( 'should show empty figcaption when code is selected but editor is in the readOnly mode', () => {
			editor.enableReadOnlyMode( 'unit-test' );

			setModelData( model, '[<codeBlock language="plaintext"><caption></caption></codeBlock>]' );

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
				'[<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="false" ' +
				'data-placeholder="Enter codeblock caption" role="textbox"></figcaption>]</code></pre>'
			);
		} );

		describe( 'undo/redo integration', () => {
			it( 'should create view element after redo', () => {
				setModelData( model,
					'<paragraph>foo</paragraph><codeBlock language="plaintext">' +
					'<caption>[foo bar baz]</caption></codeBlock>'
				);

				const modelRoot = doc.getRoot();
				const modelcode = modelRoot.getChild( 1 );
				const modelCaption = modelcode.getChild( 0 );

				// Remove text and selection from caption.
				model.change( writer => {
					writer.remove( writer.createRangeIn( modelCaption ) );
					writer.setSelection( null );
				} );

				// Check if there is no figcaption in the view.
				expect( getViewData( view ) ).to.equal(
					'<p>{}foo</p><pre data-language="Plain text" spellcheck="false"><code class="language-plaintext">' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true" ' +
					'data-placeholder="Enter codeblock caption" role="textbox"></figcaption></code></pre>'
				);

				editor.execute( 'undo' );

				// Check if figcaption is back with contents.
				expect( getViewData( view ) ).to.equal(
					'<p>foo</p><pre data-language="Plain text" spellcheck="false">' +
					'<code class="language-plaintext"><figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
					'contenteditable="true" data-placeholder="Enter codeblock caption" role="textbox">' +
					'{foo bar baz}</figcaption></code></pre>'
				);
			} );

			it( 'undo should work after inserting the code', () => {
				setModelData( model, '<paragraph>foo[]</paragraph>' );

				model.change( writer => {
					const code = writer.createElement( 'codeBlock', { language: 'plaintext' } );

					writer.insert( code, doc.getRoot() );
				} );

				expect( getModelData( model ) ).to.equal(
					'<codeBlock language="plaintext"></codeBlock><paragraph>foo[]</paragraph>'
				);

				editor.execute( 'undo' );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
			} );
		} );
	} );
} );
