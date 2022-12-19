import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CodeBlockEditing from '../../src/codeblockediting';
import CodeBlock from '../../src/codeblock';
import CodeblockCaptionEditing from '../../src/codeblockcaption/codeblockcaptionediting';
import ToggleCodeblockCaptionCommand from '../../src/codeblockcaption/togglecodeblockcaptioncommand';


import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'CodeblockCaptionEditing', () => {
	let editor, model, doc, view;

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
		editor = await VirtualTestEditor.create( {
			plugins: [
				CodeBlockEditing,
				CodeblockCaptionEditing,
				UndoEditing,
				Paragraph
			]
		} );

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

				expect( editor.getData() ).to.equal(
                    '<pre data-language="Plain text" spellcheck="false">' + 
                        '<code class="language-plaintext">' + 
                            '<figcaption>&nbsp;</figcaption>' + 
                        '</code>' +
                    '</pre>' );
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

} );