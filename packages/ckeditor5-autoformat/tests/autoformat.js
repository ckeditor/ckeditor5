/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Autoformat from '../src/autoformat';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListEngine from '@ckeditor/ckeditor5-list/src/listengine';
import HeadingEngine from '@ckeditor/ckeditor5-heading/src/headingengine';
import BoldEngine from '@ckeditor/ckeditor5-basic-styles/src/boldengine';
import ItalicEngine from '@ckeditor/ckeditor5-basic-styles/src/italicengine';
import BlockQuoteEngine from '@ckeditor/ckeditor5-block-quote/src/blockquoteengine';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Command from '@ckeditor/ckeditor5-core/src/command';

testUtils.createSinonSandbox();

describe( 'Autoformat', () => {
	let editor, doc, batch;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Enter, Paragraph, Autoformat, ListEngine, HeadingEngine, BoldEngine, ItalicEngine, BlockQuoteEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
				batch = doc.batch();
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'Bulleted list', () => {
		it( 'should replace asterisk with bulleted list item', () => {
			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">[]</listItem>' );
		} );

		it( 'should replace minus character with bulleted list item', () => {
			setData( doc, '<paragraph>-[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">[]</listItem>' );
		} );

		it( 'should not replace minus character when inside bulleted list item', () => {
			setData( doc, '<listItem indent="0" type="bulleted">-[]</listItem>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">- []</listItem>' );
		} );
	} );

	describe( 'Numbered list', () => {
		it( 'should replace digit with numbered list item', () => {
			setData( doc, '<paragraph>1.[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="numbered">[]</listItem>' );
		} );

		it( 'should not replace digit character when inside numbered list item', () => {
			setData( doc, '<listItem indent="0" type="numbered">1.[]</listItem>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="numbered">1. []</listItem>' );
		} );
	} );

	describe( 'Heading', () => {
		it( 'should replace hash character with heading', () => {
			setData( doc, '<paragraph>#[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<heading1>[]</heading1>' );
		} );

		it( 'should replace two hash characters with heading level 2', () => {
			setData( doc, '<paragraph>##[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<heading2>[]</heading2>' );
		} );

		it( 'should not replace hash character when inside heading', () => {
			setData( doc, '<heading1>#[]</heading1>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<heading1># []</heading1>' );
		} );

		it( 'should work with heading1-heading6 commands regardless of the config of the heading feature', () => {
			const spy1 = sinon.spy();
			const spy6 = sinon.spy();

			class Heading6 extends Command {
				execute() {
					spy6();
				}
			}
			class Heading1 extends Command {
				execute() {
					spy1();
				}
			}

			function HeadingPlugin( editor ) {
				editor.commands.add( 'heading1', new Heading1( editor ) );
				editor.commands.add( 'heading6', new Heading6( editor ) );
			}

			return VirtualTestEditor
				.create( {
					plugins: [
						Paragraph, Autoformat, HeadingPlugin
					]
				} )
				.then( editor => {
					const doc = editor.document;

					setData( doc, '<paragraph>#[]</paragraph>' );
					doc.enqueueChanges( () => {
						doc.batch().insert( doc.selection.getFirstPosition(), ' ' );
					} );

					expect( spy1.calledOnce ).to.be.true;

					setData( doc, '<paragraph>######[]</paragraph>' );
					doc.enqueueChanges( () => {
						doc.batch().insert( doc.selection.getFirstPosition(), ' ' );
					} );

					expect( spy6.calledOnce ).to.be.true;

					return editor.destroy();
				} );
		} );
	} );

	describe( 'Block quote', () => {
		it( 'should replace greater-than character with heading', () => {
			setData( doc, '<paragraph>>[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
		} );

		it( 'should not replace greater-than character when inside heading', () => {
			setData( doc, '<heading1>>[]</heading1>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<heading1>> []</heading1>' );
		} );

		it( 'should not replace greater-than character when inside numbered list', () => {
			setData( doc, '<listItem indent="0" type="numbered">1. >[]</listItem>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="numbered">1. > []</listItem>' );
		} );

		it( 'should not replace greater-than character when inside buletted list', () => {
			setData( doc, '<listItem indent="0" type="bulleted">1. >[]</listItem>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">1. > []</listItem>' );
		} );
	} );

	describe( 'Inline autoformat', () => {
		it( 'should replace both `**` with bold', () => {
			setData( doc, '<paragraph>**foobar*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'should replace both `*` with italic', () => {
			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'nothing should be replaces when typing `*`', () => {
			setData( doc, '<paragraph>foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>foobar*[]</paragraph>' );
		} );

		it( 'should format inside the text', () => {
			setData( doc, '<paragraph>foo **bar*[] baz</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text>[] baz</paragraph>' );
		} );
	} );

	describe( 'without commands', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Enter, Paragraph, Autoformat ]
				} )
				.then( newEditor => {
					editor = newEditor;
					doc = editor.document;
					batch = doc.batch();
				} );
		} );

		it( 'should not replace asterisk with bulleted list item', () => {
			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>* []</paragraph>' );
		} );

		it( 'should not replace minus character with bulleted list item', () => {
			setData( doc, '<paragraph>-[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>- []</paragraph>' );
		} );

		it( 'should not replace digit with numbered list item', () => {
			setData( doc, '<paragraph>1.[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>1. []</paragraph>' );
		} );

		it( 'should not replace hash character with heading', () => {
			setData( doc, '<paragraph>#[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph># []</paragraph>' );
		} );

		it( 'should not replace two hash characters with heading level 2', () => {
			setData( doc, '<paragraph>##[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>## []</paragraph>' );
		} );

		it( 'should not replace both `**` with bold', () => {
			setData( doc, '<paragraph>**foobar*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should not replace both `*` with italic', () => {
			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
		} );

		it( 'should not replace `>` with block quote', () => {
			setData( doc, '<paragraph>>[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>> []</paragraph>' );
		} );

		it( 'should use only configured headings', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Enter, Paragraph, Autoformat, ListEngine, HeadingEngine ],
					heading: {
						options: [
							{ modelElement: 'paragraph' },
							{ modelElement: 'heading1', viewElement: 'h2' }
						]
					}
				} )
				.then( editor => {
					doc = editor.document;
					batch = doc.batch();

					setData( doc, '<paragraph>##[]</paragraph>' );
					doc.enqueueChanges( () => {
						batch.insert( doc.selection.getFirstPosition(), ' ' );
					} );

					expect( getData( doc ) ).to.equal( '<paragraph>## []</paragraph>' );
				} );
		} );
	} );
} );
