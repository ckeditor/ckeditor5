/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import CodeBlockEditing from '../src/codeblockediting';
import CodeBlockCommand from '../src/codeblockcommand';

import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';

describe( 'CodeBlockEditing', () => {
	let editor, element, model, view;

	before( () => {
		addTranslations( 'en', {
			'Plain text': 'Plain text'
		} );

		addTranslations( 'pl', {
			'Plain text': 'Zwykły tekst'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				language: 'en',
				plugins: [ CodeBlockEditing, AlignmentEditing, BoldEditing, Enter, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
			} );
	} );

	afterEach( () => {
		return editor.destroy().then( () => element.remove() );
	} );

	it( 'defines plugin name', () => {
		expect( CodeBlockEditing.pluginName ).to.equal( 'CodeBlockEditing' );
	} );

	it( 'defines plugin dependencies', () => {
		expect( CodeBlockEditing.requires ).to.have.members( [ ShiftEnter ] );
	} );

	describe( 'config', () => {
		describe( 'languages', () => {
			describe( 'default value', () => {
				it( 'should be set', () => {
					expect( editor.config.get( 'codeBlock.languages' ) ).to.deep.equal( [
						{ class: 'plaintext', label: 'Plain text' },
						{ class: 'c', label: 'C' },
						{ class: 'cs', label: 'C#' },
						{ class: 'cpp', label: 'C++' },
						{ class: 'css', label: 'CSS' },
						{ class: 'diff', label: 'Diff' },
						{ class: 'xml', label: 'HTML/XML' },
						{ class: 'java', label: 'Java' },
						{ class: 'javascript', label: 'JavaScript' },
						{ class: 'php', label: 'PHP' },
						{ class: 'python', label: 'Python' },
						{ class: 'ruby', label: 'Ruby' },
						{ class: 'typescript', label: 'TypeScript' }
					] );
				} );
			} );

			it( 'should be recognized when loading data', () => {
				return ClassicTestEditor.create(
					'<pre><code class="foo">bar</code></pre>' +
					'<pre><code class="bar">baz</code></pre>',
					{
						plugins: [ CodeBlockEditing ],
						codeBlock: {
							languages: [
								{ class: 'foo', label: 'Foo' },
								{ class: 'bar', label: 'Bar' },
							]
						}
					} )
					.then( editor => {
						model = editor.model;

						expect( getModelData( model ) ).to.equal(
							'<codeBlock language="foo">[]bar</codeBlock>' +
							'<codeBlock language="bar">baz</codeBlock>'
						);

						return editor.destroy();
					} );
			} );

			it( 'should use the first if the code in data has no language', () => {
				return ClassicTestEditor
					.create( '<pre><code>bar</code></pre>', {
						plugins: [ CodeBlockEditing ],
						codeBlock: {
							languages: [
								{ class: 'foo', label: 'Foo' },
								{ class: 'bar', label: 'Bar' }
							]
						}
					} )
					.then( editor => {
						model = editor.model;

						expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">[]bar</codeBlock>' );

						return editor.destroy();
					} );
			} );

			it( 'should use the first if the code in data has an invalid language', () => {
				return ClassicTestEditor
					.create( '<pre><code class="baz">bar</code></pre>', {
						plugins: [ CodeBlockEditing ],
						codeBlock: {
							languages: [
								{ class: 'foo', label: 'Foo' },
								{ class: 'bar', label: 'Bar' }
							]
						}
					} )
					.then( editor => {
						model = editor.model;

						expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">[]bar</codeBlock>' );

						return editor.destroy();
					} );
			} );
		} );
	} );

	it( 'adds a codeBlock command', () => {
		expect( editor.commands.get( 'codeBlock' ) ).to.be.instanceOf( CodeBlockCommand );
	} );

	it( 'allows for codeBlock in the $root', () => {
		expect( model.schema.checkChild( [ '$root' ], 'codeBlock' ) ).to.be.true;
	} );

	it( 'allows only for $text in codeBlock', () => {
		expect( model.schema.checkChild( [ '$root', 'codeBlock' ], '$text' ) ).to.equal( true );
		expect( model.schema.checkChild( [ '$root', 'codeBlock' ], '$block' ) ).to.equal( false );
		expect( model.schema.checkChild( [ '$root', 'codeBlock' ], 'codeBlock' ) ).to.equal( false );
	} );

	it( 'disallows all attributes (except "language") for codeBlock', () => {
		setModelData( model, '<codeBlock language="css">f[o]o</codeBlock>' );

		editor.execute( 'alignment', { value: 'right' } );
		editor.execute( 'bold' );

		expect( getModelData( model ) ).to.equal( '<codeBlock language="css">f[o]o</codeBlock>' );
	} );

	it( 'should force shiftEnter command when pressing enter inside a codeBlock', () => {
		const enterCommand = editor.commands.get( 'enter' );
		const shiftEnterCommand = editor.commands.get( 'shiftEnter' );

		sinon.spy( enterCommand, 'execute' );
		sinon.spy( shiftEnterCommand, 'execute' );

		setModelData( model, '<codeBlock>foo[]bar</codeBlock>' );

		editor.editing.view.document.fire( 'enter', {
			preventDefault: () => {}
		} );

		expect( getModelData( model ) ).to.equal( '<codeBlock>foo<softBreak></softBreak>[]bar</codeBlock>' );
		sinon.assert.calledOnce( shiftEnterCommand.execute );
		sinon.assert.notCalled( enterCommand.execute );
	} );

	it( 'should execute enter command when pressing enter out of codeBlock', () => {
		const enterCommand = editor.commands.get( 'enter' );
		const shiftEnterCommand = editor.commands.get( 'shiftEnter' );

		sinon.spy( enterCommand, 'execute' );
		sinon.spy( shiftEnterCommand, 'execute' );

		setModelData( model, '<paragraph>foo[]bar</paragraph>' );

		editor.editing.view.document.fire( 'enter', {
			preventDefault: () => {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[]bar</paragraph>' );
		sinon.assert.calledOnce( enterCommand.execute );
		sinon.assert.notCalled( shiftEnterCommand.execute );
	} );

	describe( 'editing pipeline m -> v', () => {
		it( 'should convert empty codeBlock to empty pre tag', () => {
			setModelData( model, '<codeBlock language="plaintext"></codeBlock>' );

			expect( getViewData( view ) ).to.equal( '<pre data-language="Plain text"><code class="plaintext">[]</code></pre>' );
		} );

		it( 'should convert non-empty codeBlock to pre tag', () => {
			setModelData( model, '<codeBlock language="plaintext">Foo</codeBlock>' );

			expect( getViewData( view ) ).to.equal( '<pre data-language="Plain text"><code class="plaintext">{}Foo</code></pre>' );
		} );

		it( 'should convert codeBlock with softBreaks to pre tag #1', () => {
			setModelData( model,
				'<codeBlock language="plaintext">' +
					'Foo<softBreak></softBreak>' +
					'Bar<softBreak></softBreak>' +
					'Biz' +
				'</codeBlock>'
			);

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text">' +
					'<code class="plaintext">{}Foo<br></br>Bar<br></br>Biz</code>' +
				'</pre>' );
		} );

		it( 'should convert codeBlock with softBreaks to pre tag #2', () => {
			setModelData( model,
				'<codeBlock language="plaintext">' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
					'Foo' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
				'</codeBlock>'
			);

			expect( getViewData( view ) ).to.equal(
				'<pre data-language="Plain text">' +
					'<code class="plaintext">[]<br></br><br></br>Foo<br></br><br></br></code>' +
				'</pre>' );
		} );

		it( 'should use localized "Plain text" label', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					language: 'pl',
					plugins: [ CodeBlockEditing, AlignmentEditing, BoldEditing, Enter, Paragraph ]
				} )
				.then( newEditor => {
					const editor = newEditor;
					const model = editor.model;
					const view = editor.editing.view;

					setModelData( model,
						'<codeBlock language="plaintext">foo</codeBlock>'
					);

					expect( getViewData( view ) ).to.equal(
						'<pre data-language="Zwykły tekst">' +
							'<code class="plaintext">{}foo</code>' +
						'</pre>' );

					element.remove();

					return editor.destroy();
				} );
		} );
	} );

	describe( 'data pipeline m -> v conversion ', () => {
		it( 'should convert empty codeBlock to empty pre tag', () => {
			setModelData( model, '<codeBlock language="plaintext"></codeBlock>' );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( '<pre><code class="plaintext">&nbsp;</code></pre>' );
		} );

		it( 'should convert non-empty codeBlock to pre tag', () => {
			setModelData( model, '<codeBlock language="plaintext">Foo</codeBlock>' );

			expect( editor.getData() ).to.equal( '<pre><code class="plaintext">Foo</code></pre>' );
		} );

		it( 'should convert codeBlock with softBreaks to pre tag #1', () => {
			setModelData( model,
				'<codeBlock language="plaintext">' +
					'Foo<softBreak></softBreak>' +
					'Bar<softBreak></softBreak>' +
					'Biz' +
				'</codeBlock>' +
				'<paragraph>A<softBreak></softBreak>B</paragraph>'
			);

			expect( editor.getData() ).to.equal( '<pre><code class="plaintext">Foo\nBar\nBiz</code></pre><p>A<br>B</p>' );
		} );

		it( 'should convert codeBlock with softBreaks to pre tag #2', () => {
			setModelData( model,
				'<codeBlock language="plaintext">' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
					'Foo' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
				'</codeBlock>'
			);

			expect( editor.getData() ).to.equal( '<pre><code class="plaintext">\n\nFoo\n\n</code></pre>' );
		} );

		it( 'should convert codeBlock with html content', () => {
			setModelData( model, '<codeBlock language="plaintext">[]</codeBlock>' );

			model.change( writer => writer.insertText( '<div><p>Foo</p></div>', model.document.selection.getFirstPosition() ) );

			expect( editor.getData() ).to.equal(
				'<pre>' +
					'<code class="plaintext">&lt;div&gt;&lt;p&gt;Foo&lt;/p&gt;&lt;/div&gt;</code>' +
				'</pre>' );
		} );

		it( 'should be overridable', () => {
			editor.data.downcastDispatcher.on( 'insert:codeBlock', ( evt, data, api ) => {
				const targetViewPosition = api.mapper.toViewPosition( model.createPositionBefore( data.item ) );
				const code = api.writer.createContainerElement( 'code' );

				api.consumable.consume( data.item, 'insert' );
				api.writer.insert( targetViewPosition, code );
				api.mapper.bindElements( data.item, code );
			}, { priority: 'high' } );

			editor.data.downcastDispatcher.on( 'insert:softBreak', ( evt, data, api ) => {
				const position = api.mapper.toViewPosition( model.createPositionBefore( data.item ) );

				api.consumable.consume( data.item, 'insert' );
				api.writer.insert( position, api.writer.createText( '\n' ) );
			}, { priority: 'highest' } );

			setModelData( model, '<codeBlock language="plaintext">Foo<softBreak></softBreak>Bar</codeBlock>' );

			expect( editor.getData() ).to.equal( '<code>Foo\nBar</code>' );
		} );
	} );

	describe( 'data pipeline v -> m conversion ', () => {
		it( 'should not convert empty pre tag to code block', () => {
			editor.setData( '<pre></pre>' );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'should not convert pre with no code child to code block', () => {
			editor.setData( '<pre><samp></samp></pre>' );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'should convert pre > code to code block', () => {
			editor.setData( '<pre><code></code></pre>' );

			expect( getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]</codeBlock>' );
		} );

		it( 'should convert pre > code with multi-line text to code block #1', () => {
			editor.setData( '<pre><code>foo\nbar</code></pre>' );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[]' +
					'foo' +
					'<softBreak></softBreak>' +
					'bar' +
				'</codeBlock>'
			);
		} );

		it( 'should convert pre > code with multi-line text to code block #2', () => {
			editor.setData( '<pre><code>\n\nfoo\n\n</code></pre>' );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[]' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
					'foo' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
				'</codeBlock>'
			);
		} );

		it( 'should convert pre > code with HTML inside', () => {
			editor.setData( '<pre><code><p>Foo</p>\n<p>Bar</p></code></pre>' );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[]' +
					'<p>Foo</p>' +
					'<softBreak></softBreak>' +
					'<p>Bar</p>' +
				'</codeBlock>'
			);
		} );

		it( 'should convert pre > code tag with HTML and nested pre > code tag', () => {
			editor.setData( '<pre><code><p>Foo</p><pre>Bar</pre><p>Biz</p></code></pre>' );

			expect( getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]<p>Foo</p><pre>Bar</pre><p>Biz</p></codeBlock>' );
		} );

		it( 'should convert pre > code tag with escaped html content', () => {
			editor.setData( '<pre><code>&lt;div&gt;&lt;p&gt;Foo&lt;/p&gt;&lt;/div&gt;</code></pre>' );

			expect( getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]<div><p>Foo</p></div></codeBlock>' );
		} );

		it( 'should be overridable', () => {
			editor.data.upcastDispatcher.on( 'element:pre', ( evt, data, api ) => {
				const modelItem = api.writer.createElement( 'codeBlock' );

				api.writer.appendText( 'Hello World!', modelItem );
				api.writer.insert( modelItem, data.modelCursor );
				api.consumable.consume( data.viewItem, { name: true } );

				data.modelCursor = api.writer.createPositionAfter( modelItem );
				data.modelRange = api.writer.createRangeOn( modelItem );
			}, { priority: 'high' } );

			editor.setData( '<pre><code>Foo Bar</code></pre>' );

			expect( getModelData( model ) ).to.equal( '<codeBlock>[]Hello World!</codeBlock>' );
		} );

		it( 'should split parents to correctly upcast the code block', () => {
			editor.setData( '<p>foo<pre><code>x</code></pre>bar</p>' );

			// Note: The empty <paragraph> should not be here. It's a conversion/auto–paragraphing bug.
			expect( getModelData( model ) ).to.equal(
				'<paragraph>[]foo</paragraph>' +
				'<codeBlock language="plaintext">x</codeBlock>' +
				'<paragraph>bar</paragraph>' +
				'<paragraph></paragraph>' );
		} );

		it( 'should upcast two code blocks in a row (#1)', () => {
			editor.setData( '<pre><code>foo</code></pre><pre><code>bar</code></pre>' );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[]foo</codeBlock><codeBlock language="plaintext">bar</codeBlock>' );
		} );

		it( 'should upcast two code blocks in a row (#2)', () => {
			editor.setData( `<pre><code>foo</code></pre>
				<pre><code>bar</code></pre>` );

			// Note: The empty <paragraph> in between should not be here. It's a conversion/auto–paragraphing bug.
			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[]foo</codeBlock>' +
				'<paragraph> </paragraph>' +
				'<codeBlock language="plaintext">bar</codeBlock>' );
		} );

		it( 'should not convert when modelCursor and its ancestors disallow to insert codeBlock', () => {
			model.document.createRoot( '$title', 'title' );

			model.schema.register( '$title', {
				disallow: '$block',
				allow: 'inline'
			} );

			editor.data.set( { title: '<pre><code>foo</code></pre>' } );

			expect( getModelData( model, { rootName: 'title', withoutSelection: true } ) ).to.equal( '' );
		} );
	} );

	describe( 'clipboard integration', () => {
		it( 'should not intercept input when selection anchored outside any code block', () => {
			setModelData( model, '<paragraph>f[]oo</paragraph>' );

			const dataTransferMock = {
				getData: sinon.stub().withArgs( 'text/plain' ).returns( 'bar' )
			};

			editor.editing.view.document.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				stop: sinon.spy()
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
			sinon.assert.notCalled( dataTransferMock.getData );
		} );

		it( 'should intercept input when selection anchored in the code block', () => {
			setModelData( model, '<codeBlock language="css">f[o]o</codeBlock>' );

			const dataTransferMock = {
				getData: sinon.stub().withArgs( 'text/plain' ).returns( 'bar\nbaz\n' )
			};

			editor.editing.view.document.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				stop: sinon.spy()
			} );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="css">' +
					'fbar' +
					'<softBreak></softBreak>' +
					'baz' +
					'<softBreak></softBreak>' +
					'[]o' +
				'</codeBlock>' );

			sinon.assert.calledOnce( dataTransferMock.getData );
		} );
	} );
} );
