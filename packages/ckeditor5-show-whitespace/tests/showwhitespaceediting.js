/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global, env, keyCodes } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { ShowWhitespaceEditing } from '../src/showwhitespaceediting.js';
import { ShowWhitespaceCommand } from '../src/showwhitespacecommand.js';

describe( 'ShowWhitespaceEditing', () => {
	let editor, domElement;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Bold,
				Essentials,
				ShowWhitespaceEditing
			]
		} );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( ShowWhitespaceEditing.pluginName ).to.equal( 'ShowWhitespaceEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ShowWhitespaceEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ShowWhitespaceEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should register the "showWhitespace" command', () => {
		expect( editor.commands.get( 'showWhitespace' ) ).to.be.instanceOf( ShowWhitespaceCommand );
	} );

	it( 'should register the Ctrl+Shift+8 keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );
		const keyEventData = {
			keyCode: keyCodes[ '8' ],
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			shiftKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		const wasHandled = editor.keystrokes.press( keyEventData );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
	} );

	it( 'should define default config', () => {
		expect( editor.config.get( 'showWhitespace' ) ).to.deep.equal( {
			spaces: true,
			nbsp: true,
			tabs: true,
			softBreaks: true,
			paragraphMarks: true,
			trailingSpaces: true
		} );
	} );

	describe( 'text converter', () => {
		it( 'should not alter view when feature is off', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			// Feature is off by default — no whitespace spans.
			expect( paragraph.childCount ).to.equal( 1 );
			expect( paragraph.getChild( 0 ).data ).to.equal( 'foo bar' );
		} );

		it( 'should wrap spaces in spans when feature is on', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			// "foo" + <span> + "bar" = at least 3 children.
			expect( paragraph.childCount ).to.be.greaterThan( 1 );

			// Find the span wrapping the space.
			let foundSpaceSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-space' ) ) {
					foundSpaceSpan = true;
				}
			}

			expect( foundSpaceSpan ).to.be.true;
		} );

		it( 'should unwrap spaces when feature is toggled off', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );
			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			// After toggling off, should be back to plain text.
			expect( paragraph.childCount ).to.equal( 1 );
			expect( paragraph.getChild( 0 ).data ).to.equal( 'foo bar' );
		} );

		it( 'should not affect getData() output', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			expect( editor.getData() ).to.equal( '<p>foo bar</p>' );
		} );

		it( 'should handle multiple consecutive spaces', () => {
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( writer.createRangeIn( root ) );

				const paragraph = writer.createElement( 'paragraph' );

				writer.insertText( 'foo  bar', paragraph );
				writer.insert( paragraph, root, 0 );
			} );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			// Each space should be in its own span (unique id prevents merging).
			let spaceSpanCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-space' ) ) {
					spaceSpanCount++;
				}
			}

			expect( spaceSpanCount ).to.equal( 2 );
		} );

		it( 'should mark trailing spaces with additional class', () => {
			setModelText( editor, 'foo   ' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-trailing' ) ) {
					trailingCount++;
				}
			}

			expect( trailingCount ).to.equal( 3 );
		} );

		it( 'should not mark non-trailing spaces as trailing', () => {
			_setModelData( editor.model, '<paragraph>foo   bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-trailing' ) ) {
					trailingCount++;
				}
			}

			expect( trailingCount ).to.equal( 0 );
		} );

		it( 'should mark only the last group of spaces as trailing when mixed', () => {
			setModelText( editor, 'foo   bar   ' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;
			let totalSpaceCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-space' ) ) {
					totalSpaceCount++;

					if ( child.hasClass( 'ck-whitespace-trailing' ) ) {
						trailingCount++;
					}
				}
			}

			// "foo   bar   " = 3 spaces after foo + 3 trailing after bar = 6 total.
			// Only the last 3 should be trailing.
			expect( totalSpaceCount ).to.equal( 6 );
			expect( trailingCount ).to.equal( 3 );
		} );

		it( 'should mark a single trailing space', () => {
			setModelText( editor, 'foo ' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-trailing' ) ) {
					trailingCount++;
				}
			}

			expect( trailingCount ).to.equal( 1 );
		} );

		it( 'should mark all spaces as trailing when paragraph contains only spaces', () => {
			setModelText( editor, '   ' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;
			let totalSpaceCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-space' ) ) {
					totalSpaceCount++;

					if ( child.hasClass( 'ck-whitespace-trailing' ) ) {
						trailingCount++;
					}
				}
			}

			expect( totalSpaceCount ).to.equal( 3 );
			expect( trailingCount ).to.equal( 3 );
		} );

		it( 'should not mark spaces as trailing when followed by bold text', () => {
			_setModelData( editor.model, '<paragraph>foo   <$text bold="true">bar</$text></paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-trailing' ) ) {
					trailingCount++;
				}
			}

			expect( trailingCount ).to.equal( 0 );
		} );

		it( 'should not mark trailing spaces when trailingSpaces config is false', async () => {
			domElement.remove();
			await editor.destroy();

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Paragraph, Essentials, ShowWhitespaceEditing ],
				showWhitespace: { trailingSpaces: false }
			} );

			setModelText( editor, 'foo   ' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-trailing' ) ) {
					trailingCount++;
				}
			}

			expect( trailingCount ).to.equal( 0 );
		} );
	} );

	describe( 'nbsp converter', () => {
		it( 'should wrap non-breaking spaces in spans with ck-whitespace-nbsp class when feature is on', () => {
			_setModelData( editor.model, '<paragraph>foo\u00A0bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundNbspSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-nbsp' ) ) {
					foundNbspSpan = true;
				}
			}

			expect( foundNbspSpan ).to.be.true;
		} );

		it( 'should not wrap nbsp when feature is off', () => {
			_setModelData( editor.model, '<paragraph>foo\u00A0bar</paragraph>' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundNbspSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-nbsp' ) ) {
					foundNbspSpan = true;
				}
			}

			expect( foundNbspSpan ).to.be.false;
		} );

		it( 'should not affect getData() when nbsp is wrapped', () => {
			_setModelData( editor.model, '<paragraph>foo\u00A0bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			// Nbsp is preserved as &nbsp; in data output — this is correct CKEditor behavior.
			expect( editor.getData() ).to.equal( '<p>foo&nbsp;bar</p>' );
		} );
	} );

	describe( 'tab converter', () => {
		it( 'should wrap tab characters in spans with ck-whitespace-tab class when feature is on', () => {
			setModelText( editor, 'foo\tbar' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundTabSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-tab' ) ) {
					foundTabSpan = true;
				}
			}

			expect( foundTabSpan ).to.be.true;
		} );

		it( 'should not wrap tab when feature is off', () => {
			setModelText( editor, 'foo\tbar' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundTabSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-tab' ) ) {
					foundTabSpan = true;
				}
			}

			expect( foundTabSpan ).to.be.false;
		} );
	} );

	describe( 'soft break converter', () => {
		it( 'should insert a marker span before <br> when feature is on', () => {
			_setModelData( editor.model, '<paragraph>foo<softBreak></softBreak>bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundSoftBreakMarker = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'uiElement' ) && child.hasClass( 'ck-whitespace-soft-break' ) ) {
					foundSoftBreakMarker = true;
				}
			}

			expect( foundSoftBreakMarker ).to.be.true;
		} );

		it( 'should not insert a marker when feature is off', () => {
			_setModelData( editor.model, '<paragraph>foo<softBreak></softBreak>bar</paragraph>' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundSoftBreakMarker = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'uiElement' ) && child.hasClass( 'ck-whitespace-soft-break' ) ) {
					foundSoftBreakMarker = true;
				}
			}

			expect( foundSoftBreakMarker ).to.be.false;
		} );

		it( 'should still render a <br> alongside the marker', () => {
			_setModelData( editor.model, '<paragraph>foo<softBreak></softBreak>bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundBr = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'emptyElement' ) && child.name === 'br' ) {
					foundBr = true;
				}
			}

			expect( foundBr ).to.be.true;
		} );

		it( 'should not affect getData()', () => {
			_setModelData( editor.model, '<paragraph>foo<softBreak></softBreak>bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			expect( editor.getData() ).to.equal( '<p>foo<br>bar</p>' );
		} );
	} );

	describe( 'config', () => {
		it( 'should not wrap spaces when spaces config is false', async () => {
			domElement.remove();
			await editor.destroy();

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Paragraph, Essentials, ShowWhitespaceEditing ],
				showWhitespace: { spaces: false }
			} );

			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundSpaceSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-space' ) ) {
					foundSpaceSpan = true;
				}
			}

			expect( foundSpaceSpan ).to.be.false;
		} );

		it( 'should not wrap nbsp when nbsp config is false', async () => {
			domElement.remove();
			await editor.destroy();

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Paragraph, Essentials, ShowWhitespaceEditing ],
				showWhitespace: { nbsp: false }
			} );

			_setModelData( editor.model, '<paragraph>foo\u00A0bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundNbspSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-nbsp' ) ) {
					foundNbspSpan = true;
				}
			}

			expect( foundNbspSpan ).to.be.false;
		} );

		it( 'should still wrap spaces when nbsp config is false', async () => {
			domElement.remove();
			await editor.destroy();

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Paragraph, Essentials, ShowWhitespaceEditing ],
				showWhitespace: { nbsp: false }
			} );

			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundSpaceSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-space' ) ) {
					foundSpaceSpan = true;
				}
			}

			expect( foundSpaceSpan ).to.be.true;
		} );

		it( 'should not insert soft break marker when softBreaks config is false', async () => {
			domElement.remove();
			await editor.destroy();

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Paragraph, Essentials, ShowWhitespaceEditing ],
				showWhitespace: { softBreaks: false }
			} );

			_setModelData( editor.model, '<paragraph>foo<softBreak></softBreak>bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundSoftBreakMarker = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'uiElement' ) && child.hasClass( 'ck-whitespace-soft-break' ) ) {
					foundSoftBreakMarker = true;
				}
			}

			expect( foundSoftBreakMarker ).to.be.false;
		} );

		it( 'should skip text converter entirely when all whitespace types are disabled', async () => {
			domElement.remove();
			await editor.destroy();

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Paragraph, Essentials, ShowWhitespaceEditing ],
				showWhitespace: { spaces: false, nbsp: false, tabs: false }
			} );

			setModelText( editor, 'foo\u00A0bar\tbaz' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let foundAnyWhitespaceSpan = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && (
					child.hasClass( 'ck-whitespace-space' ) ||
					child.hasClass( 'ck-whitespace-nbsp' ) ||
					child.hasClass( 'ck-whitespace-tab' )
				) ) {
					foundAnyWhitespaceSpan = true;
				}
			}

			expect( foundAnyWhitespaceSpan ).to.be.false;
		} );

		it( 'should mark trailing spaces before a softBreak', () => {
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( writer.createRangeIn( root ) );

				const paragraph = writer.createElement( 'paragraph' );

				writer.insertText( 'foo   ', paragraph );
				writer.insert( writer.createElement( 'softBreak' ), paragraph, 'end' );
				writer.insert( paragraph, root, 0 );
			} );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-trailing' ) ) {
					trailingCount++;
				}
			}

			expect( trailingCount ).to.equal( 3 );
		} );

		it( 'should not mark spaces as trailing when more than one item follows after text', () => {
			// "foo   " + softBreak + softBreak — text is NOT at end (2 items follow, not 0 or 1).
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( writer.createRangeIn( root ) );

				const paragraph = writer.createElement( 'paragraph' );

				writer.insertText( 'foo   ', paragraph );
				writer.insert( writer.createElement( 'softBreak' ), paragraph, 'end' );
				writer.insert( writer.createElement( 'softBreak' ), paragraph, 'end' );
				writer.insert( paragraph, root, 0 );
			} );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			let trailingCount = 0;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'attributeElement' ) && child.hasClass( 'ck-whitespace-trailing' ) ) {
					trailingCount++;
				}
			}

			expect( trailingCount ).to.equal( 0 );
		} );

		it( 'should handle softBreak when consumable is already consumed', () => {
			// Register a competing converter at highest priority that consumes softBreak
			// AND creates the <br> element (so the mapper stays intact).
			editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
				dispatcher.on( 'insert:softBreak', ( evt, data, conversionApi ) => {
					if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
						return;
					}

					const viewWriter = conversionApi.writer;
					const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
					const br = viewWriter.createEmptyElement( 'br' );

					viewWriter.insert( viewPosition, br );
					conversionApi.mapper.bindElements( data.item, br );
				}, { priority: 'highest' } );
			} );

			_setModelData( editor.model, '<paragraph>foo<softBreak></softBreak>bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.getRoot();
			const paragraph = root.getChild( 0 );

			// Our converter should have returned early — no marker span.
			let foundSoftBreakMarker = false;

			for ( const child of paragraph.getChildren() ) {
				if ( child.is( 'uiElement' ) && child.hasClass( 'ck-whitespace-soft-break' ) ) {
					foundSoftBreakMarker = true;
				}
			}

			expect( foundSoftBreakMarker ).to.be.false;
		} );

		it( 'should handle text insertion when consumable is already consumed', () => {
			// Register a competing converter at even higher priority that consumes text first.
			editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
				dispatcher.on( 'insert:$text', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'insert' );
				}, { priority: 'highest' } );
			} );

			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			// Should not throw — our converter returns early when consume fails.
			const root = editor.editing.view.document.getRoot();

			expect( root ).to.not.be.undefined;
		} );

		it( 'should respect merged config with defaults', async () => {
			domElement.remove();
			await editor.destroy();

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Paragraph, Essentials, ShowWhitespaceEditing ],
				showWhitespace: { tabs: false }
			} );

			// Other defaults should still be true.
			const config = editor.config.get( 'showWhitespace' );

			expect( config.spaces ).to.be.true;
			expect( config.tabs ).to.be.false;
		} );
	} );
} );

/**
 * Helper that inserts text into a single paragraph via the model writer,
 * preserving exact whitespace (unlike _setModelData which normalizes it).
 */
function setModelText( editor, text ) {
	editor.model.change( writer => {
		const root = editor.model.document.getRoot();

		writer.remove( writer.createRangeIn( root ) );

		const paragraph = writer.createElement( 'paragraph' );

		writer.insertText( text, paragraph );
		writer.insert( paragraph, root, 0 );
	} );
}
