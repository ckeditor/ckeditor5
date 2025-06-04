/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ImageBlock from '@ckeditor/ckeditor5-image/src/imageblock.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import Style from '../src/style.js';

describe( 'StyleCommand', () => {
	let editor, editorElement, command, model, doc, root;

	testUtils.createSinonSandbox();

	const inlineStyles = [
		{
			name: 'Marker',
			element: 'span',
			classes: [ 'marker' ]
		},
		{
			name: 'Typewriter',
			element: 'span',
			classes: [ 'typewriter' ]
		},
		{
			name: 'Deleted text',
			element: 'span',
			classes: [ 'deleted' ]
		},
		{
			name: 'Multiple classes',
			element: 'span',
			classes: [ 'class-one', 'class-two' ]
		},
		{
			name: 'Vibrant code',
			element: 'code',
			classes: [ 'vibrant-code' ]
		}
	];

	const blockParagraphStyles = [
		{
			name: 'Red paragraph',
			element: 'p',
			classes: [ 'red' ]
		}
	];

	const blockHeadingStyles = [
		{
			name: 'Big heading',
			element: 'h2',
			classes: [ 'big-heading' ]
		},
		{
			name: 'Red heading',
			element: 'h2',
			classes: [ 'red' ]
		}
	];

	const blockCodeBlockStyles = [
		{
			name: 'Vibrant code block',
			element: 'pre',
			classes: [ 'vibrant-code' ]
		},
		{
			name: 'Code (dark)',
			element: 'pre',
			classes: [ 'fancy-code', 'fancy-code-dark' ]
		},
		{
			name: 'Code (bright)',
			element: 'pre',
			classes: [ 'fancy-code', 'fancy-code-bright' ]
		}
	];

	const blockQuoteBlockStyles = [
		{
			name: 'Side quote',
			element: 'blockquote',
			classes: [ 'side-quote' ]
		}
	];

	const blockWidgetStyles = [
		{
			name: 'Table style',
			element: 'table',
			classes: [ 'example' ]
		},
		{
			name: 'Figure',
			element: 'figure',
			classes: [ 'fancy-figure' ]
		}
	];

	const blockDivStyles = [
		{
			name: 'Div style',
			element: 'div',
			classes: [ 'callout' ]
		}
	];

	beforeEach( async () => {
		await createEditor( [
			...inlineStyles,
			...blockParagraphStyles,
			...blockHeadingStyles,
			...blockCodeBlockStyles,
			...blockQuoteBlockStyles,
			...blockWidgetStyles,
			...blockDivStyles
		] );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	describe( '#enabledStyles', () => {
		describe( 'block styles', () => {
			it( 'should enable styles for paragraph', () => {
				setData( model, '<paragraph>foo[bar]baz</paragraph>' );

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...inlineStyles.map( ( { name } ) => name ),
					...blockParagraphStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should enable styles for heading', () => {
				setData( model,
					'<paragraph>foo</paragraph>' +
					'<heading1>bar[]</heading1>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...inlineStyles.map( ( { name } ) => name ),
					...blockHeadingStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should enable styles for block quote', () => {
				setData( model,
					'<paragraph>foo</paragraph>' +
					'<blockQuote>' +
						'<paragraph>bar[]</paragraph>' +
					'</blockQuote>' +
					'<heading1>baz</heading1>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...inlineStyles.map( ( { name } ) => name ),
					...blockParagraphStyles.map( ( { name } ) => name ),
					...blockQuoteBlockStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should enable styles for div (as container)', () => {
				setData( model,
					'<paragraph>foo</paragraph>' +
					'<htmlDiv>' +
						'<paragraph>bar[]</paragraph>' +
					'</htmlDiv>' +
					'<paragraph>baz</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...inlineStyles.map( ( { name } ) => name ),
					...blockParagraphStyles.map( ( { name } ) => name ),
					...blockDivStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should enable styles for div (as block)', () => {
				setData( model,
					'<paragraph>foo</paragraph>' +
					'<htmlDivParagraph>bar[]</htmlDivParagraph>' +
					'<paragraph>baz</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...inlineStyles.map( ( { name } ) => name ),
					...blockDivStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should enable styles for paragraphs when nested inside html section', () => {
				const dataFilter = editor.plugins.get( 'DataFilter' );
				dataFilter.allowElement( 'htmlSection' );

				setData( model,
					'<htmlSection><paragraph>[Foo</paragraph></htmlSection>' +
					'<htmlSection><paragraph>Bar</paragraph></htmlSection>' +
					'<htmlSection><paragraph>Baz]</paragraph></htmlSection>'
				);

				command.execute( { styleName: 'Red paragraph' } );

				expect( getData( model ) ).to.equal(
					'<htmlSection><paragraph htmlPAttributes="{"classes":["red"]}">[Foo</paragraph></htmlSection>' +
					'<htmlSection><paragraph htmlPAttributes="{"classes":["red"]}">Bar</paragraph></htmlSection>' +
					'<htmlSection><paragraph htmlPAttributes="{"classes":["red"]}">Baz]</paragraph></htmlSection>'
				);
			} );

			it( 'should enable styles for the code block', () => {
				setData( model, '<codeBlock language="plaintext">foo[bar]baz</codeBlock>' );

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...blockCodeBlockStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should enable styles for the closest widget but no outer blocks', () => {
				setData( model,
					'<blockQuote>' +
						'<table>' +
							'<tableRow>' +
								'[<tableCell>' +
									'<paragraph></paragraph>' +
								'</tableCell>]' +
							'</tableRow>' +
						'</table>' +
					'</blockQuote>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...blockParagraphStyles.map( ( { name } ) => name ),
					...blockWidgetStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should enable styles for view elements that does not map to model element', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell>' +
								'<paragraph></paragraph>' +
							'</tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...blockParagraphStyles.map( ( { name } ) => name ),
					...blockWidgetStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should enable styles for the first selected block', () => {
				setData( model,
					'<paragraph>foo</paragraph>' +
					'<heading1>b[ar</heading1>' +
					'<paragraph>ba]z</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...blockHeadingStyles.map( ( { name } ) => name ),
					...inlineStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should not enable styles for blocks that disable GHS', () => {
				model.schema.addAttributeCheck( ( context, attributeName ) => {
					if ( context.endsWith( 'paragraph' ) && attributeName == 'htmlPAttributes' ) {
						return false;
					}
				} );

				setData( model, '<paragraph>bar[]</paragraph>' );

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...inlineStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should not enable styles for elements outside an object element', () => {
				setData( model,
					'<blockQuote>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>[foo]</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
					'</blockQuote>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...inlineStyles.map( ( { name } ) => name ),
					...blockParagraphStyles.map( ( { name } ) => name ),
					...blockWidgetStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should not crash if there are no selected blocks', () => {
				setData( model, '<paragraph>foo</paragraph>' );

				model.change( writer => {
					writer.setSelection( root, 0 );

					command.refresh();

					expect( command.enabledStyles ).to.have.members( [
						...inlineStyles.map( ( { name } ) => name )
					] );
				} );
			} );
		} );

		describe( 'inline styles', () => {
			it( 'should enable styles for text', () => {
				setData( model, '<paragraph>foo[bar]baz</paragraph>' );

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...inlineStyles.map( ( { name } ) => name ),
					...blockParagraphStyles.map( ( { name } ) => name )
				] );
			} );

			it( 'should not enable styles for text in code block', () => {
				setData( model, '<codeBlock language="plaintext">foo[bar]baz</codeBlock>' );

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [
					...blockCodeBlockStyles.map( ( { name } ) => name )
				] );
			} );
		} );
	} );

	describe( '#isEnabled', () => {
		it( 'should be disabled if none of styles applies to selection', () => {
			setData( model, '[<horizontalLine></horizontalLine>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be enabled if selection is on a block widget but there are nested blocks that allow inline style', () => {
			setData( model, '[<imageBlock><caption>foo</caption></imageBlock>]' );

			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( '#value', () => {
		describe( 'block styles', () => {
			it( 'should detect a single style applied', () => {
				setData( model, '<paragraph>fo[]o</paragraph>' );

				model.change( writer => {
					writer.setAttribute( 'htmlPAttributes', { classes: [ 'red' ] }, root.getChild( 0 ) );
				} );

				expect( command.value ).to.have.members( [ 'Red paragraph' ] );
			} );

			it( 'should detect styles for heading', () => {
				setData( model,
					'<paragraph>foo</paragraph>' +
					'<heading1>bar[]</heading1>'
				);

				model.change( writer => {
					writer.setAttribute( 'htmlH2Attributes', { classes: [ 'big-heading' ] }, root.getChild( 1 ) );
				} );

				expect( command.value ).to.have.members( [ 'Big heading' ] );
			} );

			it( 'should detect style for specified element if style shares an element name', () => {
				setData( model,
					'<paragraph>fo[]o</paragraph>' +
					'<heading1>bar</heading1>'
				);

				model.change( writer => {
					writer.setAttribute( 'htmlPAttributes', { classes: [ 'red' ] }, root.getChild( 0 ) );
					writer.setAttribute( 'htmlH2Attributes', { classes: [ 'red' ] }, root.getChild( 1 ) );
				} );

				expect( command.value ).to.have.members( [ 'Red paragraph' ] );

				model.change( writer => {
					writer.setSelection( root.getChild( 1 ), 0 );
				} );

				expect( command.value ).to.have.members( [ 'Red heading' ] );
			} );

			it( 'should detect styles for block quote', () => {
				setData( model,
					'<paragraph>foo</paragraph>' +
					'<blockQuote>' +
						'<paragraph>bar[]</paragraph>' +
					'</blockQuote>' +
					'<heading1>baz</heading1>'
				);

				model.change( writer => {
					writer.setAttribute( 'htmlBlockquoteAttributes', { classes: [ 'side-quote' ] }, root.getChild( 1 ) );
				} );

				expect( command.value ).to.have.members( [ 'Side quote' ] );
			} );

			it( 'should detect styles for the code block', () => {
				setData( model, '<codeBlock language="plaintext">foo[bar]baz</codeBlock>' );

				model.change( writer => {
					writer.setAttribute( 'htmlPreAttributes', { classes: [ 'vibrant-code' ] }, root.getChild( 0 ) );
				} );

				expect( command.value ).to.have.members( [ 'Vibrant code block' ] );
			} );

			it( 'should detect styles for the div (as container)', () => {
				setData( model,
					'<htmlDiv>' +
						'<paragraph>foo[bar]baz</paragraph>' +
					'</htmlDiv>'
				);

				model.change( writer => {
					writer.setAttribute( 'htmlDivAttributes', { classes: [ 'callout' ] }, root.getChild( 0 ) );
				} );

				expect( command.value ).to.have.members( [ 'Div style' ] );
			} );

			it( 'should detect styles for the div (as block)', () => {
				setData( model,
					'<htmlDivParagraph>foo[bar]baz</htmlDivParagraph>'
				);

				model.change( writer => {
					writer.setAttribute( 'htmlDivAttributes', { classes: [ 'callout' ] }, root.getChild( 0 ) );
				} );

				expect( command.value ).to.have.members( [ 'Div style' ] );
			} );

			it( 'should not detect styles for elements outside a widget element', () => {
				setData( model,
					'<blockQuote>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>[foo]</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
					'</blockQuote>'
				);

				model.change( writer => {
					writer.setAttribute( 'htmlBlockquoteAttributes', { classes: [ 'side-quote' ] }, root.getChild( 0 ) );
					writer.setAttribute( 'htmlTableAttributes', { classes: [ 'example' ] }, root.getNodeByPath( [ 0, 0 ] ) );
					writer.setAttribute( 'htmlPAttributes', { classes: [ 'red' ] }, root.getNodeByPath( [ 0, 0, 0, 0, 0 ] ) );
				} );

				expect( command.value ).to.have.members( [ 'Red paragraph', 'Table style' ] );
			} );

			it( 'should detect styles for selected widget element only', () => {
				setData( model,
					'<blockQuote>' +
						'[<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>foo</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>]' +
					'</blockQuote>'
				);

				model.change( writer => {
					writer.setAttribute( 'htmlBlockquoteAttributes', { classes: [ 'side-quote' ] }, root.getChild( 0 ) );
					writer.setAttribute( 'htmlTableAttributes', { classes: [ 'example' ] }, root.getNodeByPath( [ 0, 0 ] ) );
					writer.setAttribute( 'htmlPAttributes', { classes: [ 'red' ] }, root.getNodeByPath( [ 0, 0, 0, 0, 0 ] ) );
				} );

				expect( command.value ).to.have.members( [ 'Table style' ] );
			} );

			it( 'should detect styles for view elements that does not map to model element', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell>' +
								'<paragraph></paragraph>' +
							'</tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				model.change( writer => {
					writer.setAttribute( 'htmlFigureAttributes', { classes: [ 'fancy-figure' ] }, root.getChild( 0 ) );
					writer.setAttribute( 'htmlTableAttributes', { classes: [ 'example' ] }, root.getChild( 0 ) );
				} );

				expect( command.value ).to.have.members( [
					...blockWidgetStyles.map( ( { name } ) => name )
				] );
			} );
		} );

		describe( 'inline styles', () => {
			it( 'should detect style', () => {
				setData( model, '<paragraph>foo[bar]baz</paragraph>' );

				model.change( writer => {
					writer.setAttribute( 'htmlSpan', { classes: [ 'marker', 'typewriter' ] }, doc.selection.getFirstRange() );
				} );

				expect( command.value ).to.have.members( [ 'Marker', 'Typewriter' ] );
			} );

			it( 'should detect styles that use multiple classes', () => {
				setData( model, '<paragraph>foo[bar]baz</paragraph>' );

				model.change( writer => {
					writer.setAttribute( 'htmlSpan', { classes: [ 'class-one', 'class-two' ] }, doc.selection.getFirstRange() );
				} );

				expect( command.value ).to.have.members( [ 'Multiple classes' ] );
			} );

			it( 'should not detect styles that does not have all classes for a style', () => {
				setData( model, '<paragraph>foo[bar]baz</paragraph>' );

				model.change( writer => {
					writer.setAttribute( 'htmlSpan', { classes: [ 'class-one', 'marker' ] }, doc.selection.getFirstRange() );
				} );

				expect( command.value ).to.have.members( [ 'Marker' ] );
			} );

			it( 'should detect applied inline style', () => {
				setData( model, '<paragraph>[foobar]</paragraph>' );

				model.change( writer => {
					writer.setAttribute( 'htmlSpan', { classes: [ 'marker' ] }, root.getChild( 0 ).getChild( 0 ) );
				} );

				expect( command.value ).to.deep.equal( [ 'Marker' ] );
				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text htmlSpan="{"classes":["marker"]}">foobar</$text>]</paragraph>'
				);
			} );

			it( 'should detect applied multiple inline styles', () => {
				setData( model, '<paragraph>[foobar]</paragraph>' );

				model.change( writer => {
					writer.setAttribute( 'htmlSpan', { classes: [ 'marker', 'typewriter' ] }, root.getChild( 0 ).getChild( 0 ) );
				} );

				expect( command.value ).to.deep.equal( [ 'Marker', 'Typewriter' ] );
				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text htmlSpan="{"classes":["marker","typewriter"]}">foobar</$text>]</paragraph>'
				);
			} );

			// https://github.com/ckeditor/ckeditor5/issues/11588
			it( 'should detect applied multiple inline styles (ignore basic styles)', () => {
				setData( model, '<paragraph>[foobar]</paragraph>' );

				model.change( writer => {
					writer.setAttribute( 'htmlSpan', { classes: [ 'marker' ] }, root.getChild( 0 ).getChild( 0 ) );
					writer.setAttribute( 'bold', true, root.getChild( 0 ).getChild( 0 ) );
				} );

				expect( command.value ).to.deep.equal( [ 'Marker' ] );
				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text bold="true" htmlSpan="{"classes":["marker"]}">foobar</$text>]</paragraph>'
				);
			} );
		} );
	} );

	describe( '#execute()', () => {
		it( 'should do nothing if the command is disabled', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.isEnabled = false;
			command.execute( { styleName: 'Marker' } );

			expect( getData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should warn if the command is executed with incorrect style name', () => {
			const stub = sinon.stub( console, 'warn' );

			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.execute( { styleName: 'Invalid style' } );

			expect( getData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
			sinon.assert.calledWithMatch( stub, 'style-command-executed-with-incorrect-style-name' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/11748
		it( 'should keep classes of removed style if other active styles also use them', () => {
			setData( model, '<codeBlock language="typescript">[]</codeBlock>' );

			// Add light and dark themes
			command.execute( { styleName: 'Code (bright)' } );
			command.execute( { styleName: 'Code (dark)' } );

			// Remove light theme
			command.execute( { styleName: 'Code (bright)' } );

			expect( getData( model, { withoutSelection: true } ) ).to.equal(
				'<codeBlock ' +
					'htmlPreAttributes="{"classes":["fancy-code","fancy-code-dark"]}" ' +
					'language="typescript"' +
				'>' +
				'</codeBlock>'
			);
		} );

		describe( 'inline styles', () => {
			it( 'should add htmlSpan attribute with proper class to the collapsed selection', () => {
				setData( model, '<paragraph>foobar[]</paragraph>' );

				command.execute( { styleName: 'Marker' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["marker"]}">[]</$text></paragraph>'
				);

				model.change( writer => {
					model.insertContent( writer.createText( 'baz', doc.selection.getAttributes() ), doc.selection );
				} );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["marker"]}">baz[]</$text></paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute with proper classes to the collapsed selection', () => {
				setData( model, '<paragraph>foobar[]</paragraph>' );

				command.execute( { styleName: 'Marker' } );
				command.execute( { styleName: 'Typewriter' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["marker","typewriter"]}">[]</$text></paragraph>'
				);

				model.change( writer => {
					model.insertContent( writer.createText( 'baz', doc.selection.getAttributes() ), doc.selection );
				} );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["marker","typewriter"]}">baz[]</$text></paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute with proper class to the selected text', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( { styleName: 'Marker' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["marker"]}">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute with proper classes to the selected text', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( { styleName: 'Marker' } );
				command.execute( { styleName: 'Typewriter' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["marker","typewriter"]}">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute classes to elements with other htmlSpan attribute existing', () => {
				// initial selection [foo b]ar baz.
				setData( model, '<paragraph>[foo b]ar baz</paragraph>' );

				command.execute( { styleName: 'Marker' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text htmlSpan="{"classes":["marker"]}">foo b</$text>]ar baz</paragraph>'
				);

				// set selection to [foo bar ba]z.
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getNodeByPath( [ 0 ] ), 0 ),
						writer.createPositionAt( root.getNodeByPath( [ 0 ] ), 10 )
					) );
				} );

				command.execute( { styleName: 'Typewriter' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>[' +
						'<$text htmlSpan="{"classes":["marker","typewriter"]}">foo b</$text>' +
						'<$text htmlSpan="{"classes":["typewriter"]}">ar ba</$text>]' +
						'z' +
					'</paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute to the selected text if definition specify multiple classes', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( { styleName: 'Multiple classes' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["class-one","class-two"]}">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute obly to nodes that allow it', () => {
				setData( model,
					'<paragraph>f[oo</paragraph>' +
					'<codeBlock language="plaintext">bar</codeBlock>' +
					'<paragraph>ba]z</paragraph>'
				);

				command.execute( { styleName: 'Marker' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>f[<$text htmlSpan="{"classes":["marker"]}">oo</$text></paragraph>' +
					'<codeBlock language="plaintext">bar</codeBlock>' +
					'<paragraph><$text htmlSpan="{"classes":["marker"]}">ba</$text>]z</paragraph>'
				);
			} );

			it( 'should remove class from htmlSpan attribute element', () => {
				setData( model, '<paragraph>foo[bar]</paragraph>' );

				command.execute( { styleName: 'Marker' } );
				command.execute( { styleName: 'Typewriter' } );
				command.execute( { styleName: 'Marker' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>foo[<$text htmlSpan="{"classes":["typewriter"]}">bar</$text>]</paragraph>'
				);
			} );

			it( 'should remove htmlSpan element when removing class attribute to the selection', () => {
				setData( model, '<paragraph>foo[bar]</paragraph>' );

				command.execute( { styleName: 'Marker' } );
				command.execute( { styleName: 'Marker' } );

				expect( getData( model ) ).to.equal(
					'<paragraph>foo[bar]</paragraph>'
				);
			} );

			it( 'should force adding style if the command was called with `forceValue=true`', () => {
				setData( model,
					'<paragraph>' +
						'fo' +
						'[<$text htmlSpan=\'{"classes":["marker"]}\'>ob</$text>' +
						'ar]' +
					'</paragraph>'
				);

				command.execute( { styleName: 'Marker', forceValue: true } );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["marker"]}">obar</$text>]</paragraph>'
				);
			} );

			it( 'should force removing style if the command was called with `forceValue=false`', () => {
				setData( model,
					'<paragraph>' +
					'[fo' +
					'<$text htmlSpan=\'{"classes":["marker"]}\'>ob</$text>]' +
					'ar' +
					'</paragraph>'
				);

				command.execute( { styleName: 'Marker', forceValue: false } );

				expect( getData( model ) ).to.equal(
					'<paragraph>[foob]ar</paragraph>'
				);
			} );
		} );

		describe( 'block styles', () => {
			it( 'should add htmlAttribute with proper class to the selected element', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				command.execute( { styleName: 'Big heading' } );

				expect( getData( model ) ).to.equal(
					'<heading1 htmlH2Attributes="{"classes":["big-heading"]}">foo[]bar</heading1>'
				);
			} );

			it( 'should add htmlAttribute with multiple classes to the selected element', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				command.execute( { styleName: 'Big heading' } );
				command.execute( { styleName: 'Red heading' } );

				expect( getData( model ) ).to.equal(
					'<heading1 htmlH2Attributes="{"classes":["big-heading","red"]}">foo[]bar</heading1>'
				);
			} );

			it( 'should add htmlAttribute only for matching element names', () => {
				setData( model,
					'<heading1>fo[o</heading1>' +
					'<paragraph>bar</paragraph>' +
					'<heading1>ba]z</heading1>'
				);

				command.execute( { styleName: 'Red heading' } );

				expect( getData( model ) ).to.equal(
					'<heading1 htmlH2Attributes="{"classes":["red"]}">fo[o</heading1>' +
					'<paragraph>bar</paragraph>' +
					'<heading1 htmlH2Attributes="{"classes":["red"]}">ba]z</heading1>'
				);
			} );

			it( 'should add (and remove) htmlDivAttribute for div as a container', () => {
				setData( model,
					'<htmlDiv>' +
						'<paragraph>foo[]</paragraph>' +
					'</htmlDiv>'
				);

				command.execute( { styleName: 'Div style' } );

				expect( getData( model ) ).to.equal(
					'<htmlDiv htmlDivAttributes="{"classes":["callout"]}">' +
						'<paragraph>foo[]</paragraph>' +
					'</htmlDiv>'
				);

				command.execute( { styleName: 'Div style' } );

				expect( getData( model ) ).to.equal(
					'<htmlDiv>' +
						'<paragraph>foo[]</paragraph>' +
					'</htmlDiv>'
				);
			} );

			it( 'should add (and remove) htmlDivAttribute for div as a block', () => {
				setData( model,
					'<htmlDivParagraph>foo[]</htmlDivParagraph>'
				);

				command.execute( { styleName: 'Div style' } );

				expect( getData( model ) ).to.equal(
					'<htmlDivParagraph htmlDivAttributes="{"classes":["callout"]}">foo[]</htmlDivParagraph>'
				);

				command.execute( { styleName: 'Div style' } );

				expect( getData( model ) ).to.equal(
					'<htmlDivParagraph>foo[]</htmlDivParagraph>'
				);
			} );

			it( 'should add htmlAttribute only to elements in the same widget element boundaries', () => {
				setData( model,
					'<blockQuote>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<blockQuote>' +
										'<paragraph>fo[]o</paragraph>' +
									'</blockQuote>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
					'</blockQuote>'
				);

				command.execute( { styleName: 'Side quote' } );

				expect( getData( model ) ).to.equal(
					'<blockQuote>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<blockQuote htmlBlockquoteAttributes="{"classes":["side-quote"]}">' +
										'<paragraph>fo[]o</paragraph>' +
									'</blockQuote>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
					'</blockQuote>'
				);
			} );

			it( 'should add htmlAttribute only to elements in the same widget element boundaries (table)', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<table>' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph>fo[]o</paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
								'</table>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { styleName: 'Table style' } );

				expect( getData( model ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<table htmlTableAttributes="{"classes":["example"]}">' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph>fo[]o</paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
								'</table>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should add style to view element that does not exist in model', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>[]</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { styleName: 'Figure' } );

				expect( getData( model ) ).to.equal(
					'<table htmlFigureAttributes="{"classes":["fancy-figure"]}">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>[]</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should remove style from view element that does not exist in model', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>[]</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { styleName: 'Figure' } );

				expect( getData( model ) ).to.equal(
					'<table htmlFigureAttributes="{"classes":["fancy-figure"]}">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>[]</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { styleName: 'Figure' } );

				expect( getData( model ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>[]</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should remove htmlAttribute from the selected element', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				command.execute( { styleName: 'Big heading' } );
				command.execute( { styleName: 'Big heading' } );

				expect( getData( model ) ).to.equal( '<heading1>foo[]bar</heading1>' );
			} );

			it( 'should force adding style if the command was called with `forceValue=true`', () => {
				setData( model,
					'<heading1>foo</heading1>' +
					'<heading1 htmlH2Attributes=\'{"classes":["red"]}\'>b[ar</heading1>' +
					'<heading1>ba]z</heading1>' );

				command.execute( { styleName: 'Red heading', forceValue: true } );

				expect( getData( model ) ).to.equal(
					'<heading1>foo</heading1>' +
					'<heading1 htmlH2Attributes="{"classes":["red"]}">b[ar</heading1>' +
					'<heading1 htmlH2Attributes="{"classes":["red"]}">ba]z</heading1>'
				);
			} );

			it( 'should not force adding a style on an element that cannot receive it', () => {
				sinon.stub( console, 'warn' );

				setData( model,
					'<paragraph>f[oo</paragraph>' +
					'<paragraph>ba]r</paragraph>' );

				command.execute( { styleName: 'Red heading', forceValue: true } );

				expect( getData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<paragraph>ba]r</paragraph>'
				);
			} );

			it( 'should force removing style if the command was called with `forceValue=false`', () => {
				setData( model,
					'<heading1>f[oo</heading1>' +
					'<heading1 htmlH2Attributes=\'{"classes":["red"]}\'>ba]r</heading1>' +
					'<heading1>baz</heading1>' );

				command.execute( { styleName: 'Red heading', forceValue: false } );

				expect( getData( model ) ).to.equal(
					'<heading1>f[oo</heading1>' +
					'<heading1>ba]r</heading1>' +
					'<heading1>baz</heading1>'
				);
			} );
		} );
	} );

	async function createEditor( styleDefinitions ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph, ImageBlock, ImageCaption, Heading, CodeBlock, BlockQuote, Table, HorizontalLine, GeneralHtmlSupport, Style
			],
			style: {
				definitions: styleDefinitions
			},
			htmlSupport: {
				allow: [
					{
						name: /^.*$/,
						styles: true,
						attributes: true,
						classes: true
					}
				]
			}
		} );

		model = editor.model;
		command = editor.commands.get( 'style' );
		doc = model.document;
		root = doc.getRoot();
	}
} );
