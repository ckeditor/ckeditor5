/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ListStyles from '../src/liststyles';
import ListStylesUI from '../src/liststylesui';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';

import bulletedListIcon from '../theme/icons/bulletedlist.svg';
import numberedListIcon from '../theme/icons/numberedlist.svg';

import listStyleDiscIcon from '../theme/icons/liststyledisc.svg';
import listStyleCircleIcon from '../theme/icons/liststylecircle.svg';
import listStyleSquareIcon from '../theme/icons/liststylesquare.svg';
import listStyleDecimalIcon from '../theme/icons/liststyledecimal.svg';
import listStyleDecimalWithLeadingZeroIcon from '../theme/icons/liststyledecimalleadingzero.svg';
import listStyleLowerRomanIcon from '../theme/icons/liststylelowerroman.svg';
import listStyleUpperRomanIcon from '../theme/icons/liststyleupperroman.svg';
import listStyleLowerLatinIcon from '../theme/icons/liststylelowerlatin.svg';
import listStyleUpperLatinIcon from '../theme/icons/liststyleupperlatin.svg';

describe( 'ListStylesUI', () => {
	let editorElement, editor, model, listStylesCommand;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph, BlockQuote, ListStyles ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				listStylesCommand = editor.commands.get( 'listStyles' );
				// numberedListCommand = editor.commands.get( 'numberedList' );
				// numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ListStylesUI.pluginName ).to.equal( 'ListStylesUI' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListStylesUI ) ).to.be.instanceOf( ListStylesUI );
	} );

	describe( 'init()', () => {
		describe( 'bulleted list dropdown', () => {
			let bulletedListCommand, bulletedListDropdown;

			beforeEach( () => {
				bulletedListCommand = editor.commands.get( 'bulletedList' );
				bulletedListDropdown = editor.ui.componentFactory.create( 'bulletedList' );
			} );

			it( 'should registered as "bulletedList" in the component factory', () => {
				expect( bulletedListDropdown ).to.be.instanceOf( DropdownView );
			} );

			it( 'should have #isEnabled bound to the "bulletedList" command state', () => {
				expect( bulletedListDropdown.isEnabled ).to.be.true;

				bulletedListCommand.isEnabled = true;
				expect( bulletedListDropdown.isEnabled ).to.be.true;

				bulletedListCommand.isEnabled = false;
				expect( bulletedListDropdown.isEnabled ).to.be.false;
			} );

			it( 'should have a specific CSS class', () => {
				expect( bulletedListDropdown.class ).to.equal( 'ck-list-styles-dropdown' );
			} );

			describe( 'main split button', () => {
				let mainButtonView;

				beforeEach( () => {
					mainButtonView = bulletedListDropdown.buttonView;
				} );

				it( 'should have a #label', () => {
					expect( mainButtonView.label ).to.equal( 'Bulleted List' );
				} );

				it( 'should have an #icon', () => {
					expect( mainButtonView.icon ).to.equal( bulletedListIcon );
				} );

				it( 'should have a #tooltip based on a label', () => {
					expect( mainButtonView.tooltip ).to.be.true;
				} );

				it( 'should be toggleable', () => {
					expect( mainButtonView.isToggleable ).to.be.true;
				} );

				it( 'should have the #isOn state bound to the value of the "bulletedList" command', () => {
					expect( mainButtonView.isOn ).to.be.false;

					bulletedListCommand.value = 'foo';
					expect( mainButtonView.isOn ).to.be.true;

					bulletedListCommand.value = null;
					expect( mainButtonView.isOn ).to.be.false;
				} );

				it( 'should execute the "bulletedList" command and focus the editing view when clicked', () => {
					sinon.spy( editor, 'execute' );
					sinon.spy( editor.editing.view, 'focus' );

					mainButtonView.fire( 'execute' );
					sinon.assert.calledWithExactly( editor.execute, 'bulletedList' );
					sinon.assert.calledOnce( editor.editing.view.focus );
					sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
				} );
			} );

			describe( 'toolbar with style buttons', () => {
				let toolbarView;

				beforeEach( () => {
					toolbarView = bulletedListDropdown.toolbarView;
				} );

				it( 'should be in the dropdown panel', () => {
					expect( bulletedListDropdown.panelView.children.get( 0 ) ).to.equal( toolbarView );
				} );

				it( 'should have a proper ARIA label', () => {
					expect( toolbarView.ariaLabel ).to.equal( 'Bulleted list styles toolbar' );
				} );

				it( 'should bring the "disc" list style button', () => {
					const buttonView = toolbarView.items.get( 0 );

					expect( buttonView.label ).to.equal( 'Toggle the disc list style' );
					expect( buttonView.tooltip ).to.equal( 'Disc' );
					expect( buttonView.icon ).to.equal( listStyleDiscIcon );
				} );

				it( 'should bring the "circle" list style button', () => {
					const buttonView = toolbarView.items.get( 1 );

					expect( buttonView.label ).to.equal( 'Toggle the circle list style' );
					expect( buttonView.tooltip ).to.equal( 'Circle' );
					expect( buttonView.icon ).to.equal( listStyleCircleIcon );
				} );

				it( 'should bring the "square" list style button', () => {
					const buttonView = toolbarView.items.get( 2 );

					expect( buttonView.label ).to.equal( 'Toggle the square list style' );
					expect( buttonView.tooltip ).to.equal( 'Square' );
					expect( buttonView.icon ).to.equal( listStyleSquareIcon );
				} );

				describe( 'style button', () => {
					let styleButtonView;

					beforeEach( () => {
						// "circle"
						styleButtonView = toolbarView.items.get( 1 );

						sinon.spy( editor, 'execute' );
						sinon.spy( editor.editing.view, 'focus' );
					} );

					it( 'should be instances of ButtonView', () => {
						expect( styleButtonView ).to.be.instanceOf( ButtonView );
					} );

					it( 'should change its #isOn state when the value of the "listStylesCommand" command changes', () => {
						expect( styleButtonView.isOn ).to.be.false;

						listStylesCommand.value = 'foo';
						expect( styleButtonView.isOn ).to.be.false;

						listStylesCommand.value = 'circle';
						expect( styleButtonView.isOn ).to.be.true;

						listStylesCommand.value = null;
						expect( styleButtonView.isOn ).to.be.false;
					} );

					it( 'should apply the new style if none was set', () => {
						setData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyles', { type: 'circle' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should apply the new style if a different one was set', () => {
						setData( model, '<listItem listType="bulleted" listStyle="square" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyles', { type: 'circle' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should remove (toggle) the style if the same style was set', () => {
						setData( model, '<listItem listType="bulleted" listStyle="circle" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyles', { type: 'default' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should execute the "bulletedList" command and apply the style if selection was not anchored in a list', () => {
						setData( model, '<paragraph>foo[]</paragraph>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyles', { type: 'circle' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );
				} );
			} );
		} );

		describe( 'numbered list dropdown', () => {
			let numberedListCommand, numberedListDropdown;

			beforeEach( () => {
				numberedListCommand = editor.commands.get( 'numberedList' );
				numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );
			} );

			it( 'should registered as "numberedList" in the component factory', () => {
				expect( numberedListDropdown ).to.be.instanceOf( DropdownView );
			} );

			it( 'should have #isEnabled bound to the "numberedList" command state', () => {
				expect( numberedListDropdown.isEnabled ).to.be.true;

				numberedListCommand.isEnabled = true;
				expect( numberedListDropdown.isEnabled ).to.be.true;

				numberedListCommand.isEnabled = false;
				expect( numberedListDropdown.isEnabled ).to.be.false;
			} );

			it( 'should have a specific CSS class', () => {
				expect( numberedListDropdown.class ).to.equal( 'ck-list-styles-dropdown' );
			} );

			describe( 'main split button', () => {
				let mainButtonView;

				beforeEach( () => {
					mainButtonView = numberedListDropdown.buttonView;
				} );

				it( 'should have a #label', () => {
					expect( mainButtonView.label ).to.equal( 'Numbered List' );
				} );

				it( 'should have an #icon', () => {
					expect( mainButtonView.icon ).to.equal( numberedListIcon );
				} );

				it( 'should have a #tooltip based on a label', () => {
					expect( mainButtonView.tooltip ).to.be.true;
				} );

				it( 'should be toggleable', () => {
					expect( mainButtonView.isToggleable ).to.be.true;
				} );

				it( 'should have the #isOn state bound to the value of the "numberedList" command', () => {
					expect( mainButtonView.isOn ).to.be.false;

					numberedListCommand.value = 'foo';
					expect( mainButtonView.isOn ).to.be.true;

					numberedListCommand.value = null;
					expect( mainButtonView.isOn ).to.be.false;
				} );

				it( 'should execute the "numberedList" command and focus the editing view when clicked', () => {
					sinon.spy( editor, 'execute' );
					sinon.spy( editor.editing.view, 'focus' );

					mainButtonView.fire( 'execute' );
					sinon.assert.calledWithExactly( editor.execute, 'numberedList' );
					sinon.assert.calledOnce( editor.editing.view.focus );
					sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
				} );
			} );

			describe( 'toolbar with style buttons', () => {
				let toolbarView;

				beforeEach( () => {
					toolbarView = numberedListDropdown.toolbarView;
				} );

				it( 'should be in the dropdown panel', () => {
					expect( numberedListDropdown.panelView.children.get( 0 ) ).to.equal( toolbarView );
				} );

				it( 'should have a proper ARIA label', () => {
					expect( toolbarView.ariaLabel ).to.equal( 'Numbered list styles toolbar' );
				} );

				it( 'should bring the "decimal" list style button', () => {
					const buttonView = toolbarView.items.get( 0 );

					expect( buttonView.label ).to.equal( 'Toggle the decimal list style' );
					expect( buttonView.tooltip ).to.equal( 'Decimal' );
					expect( buttonView.icon ).to.equal( listStyleDecimalIcon );
				} );

				it( 'should bring the "decimal-leading-zero" list style button', () => {
					const buttonView = toolbarView.items.get( 1 );

					expect( buttonView.label ).to.equal( 'Toggle the decimal with leading zero list style' );
					expect( buttonView.tooltip ).to.equal( 'Decimal with leading zero' );
					expect( buttonView.icon ).to.equal( listStyleDecimalWithLeadingZeroIcon );
				} );

				it( 'should bring the "lower-roman" list style button', () => {
					const buttonView = toolbarView.items.get( 2 );

					expect( buttonView.label ).to.equal( 'Toggle the lower–roman list style' );
					expect( buttonView.tooltip ).to.equal( 'Lower–roman' );
					expect( buttonView.icon ).to.equal( listStyleLowerRomanIcon );
				} );

				it( 'should bring the "upper-roman" list style button', () => {
					const buttonView = toolbarView.items.get( 3 );

					expect( buttonView.label ).to.equal( 'Toggle the upper–roman list style' );
					expect( buttonView.tooltip ).to.equal( 'Upper-roman' );
					expect( buttonView.icon ).to.equal( listStyleUpperRomanIcon );
				} );

				it( 'should bring the "lower–latin" list style button', () => {
					const buttonView = toolbarView.items.get( 4 );

					expect( buttonView.label ).to.equal( 'Toggle the lower–latin list style' );
					expect( buttonView.tooltip ).to.equal( 'Lower-latin' );
					expect( buttonView.icon ).to.equal( listStyleLowerLatinIcon );
				} );

				it( 'should bring the "upper–latin" list style button', () => {
					const buttonView = toolbarView.items.get( 5 );

					expect( buttonView.label ).to.equal( 'Toggle the upper–latin list style' );
					expect( buttonView.tooltip ).to.equal( 'Upper-latin' );
					expect( buttonView.icon ).to.equal( listStyleUpperLatinIcon );
				} );

				describe( 'style button', () => {
					let styleButtonView;

					beforeEach( () => {
						// "decimal-leading-zero""
						styleButtonView = toolbarView.items.get( 1 );

						sinon.spy( editor, 'execute' );
						sinon.spy( editor.editing.view, 'focus' );
					} );

					it( 'should be instances of ButtonView', () => {
						expect( styleButtonView ).to.be.instanceOf( ButtonView );
					} );

					it( 'should change its #isOn state when the value of the "listStylesCommand" command changes', () => {
						expect( styleButtonView.isOn ).to.be.false;

						listStylesCommand.value = 'foo';
						expect( styleButtonView.isOn ).to.be.false;

						listStylesCommand.value = 'decimal-leading-zero';
						expect( styleButtonView.isOn ).to.be.true;

						listStylesCommand.value = null;
						expect( styleButtonView.isOn ).to.be.false;
					} );

					it( 'should apply the new style if none was set', () => {
						setData( model, '<listItem listType="numbered" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyles', { type: 'decimal-leading-zero' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should apply the new style if a different one was set', () => {
						setData( model, '<listItem listType="numbered" listStyle="square" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyles', { type: 'decimal-leading-zero' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should remove (toggle) the style if the same style was set', () => {
						setData( model, '<listItem listType="numbered" listStyle="decimal-leading-zero" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyles', { type: 'default' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should execute the "numberedList" command and apply the style if selection was not anchored in a list', () => {
						setData( model, '<paragraph>foo[]</paragraph>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyles', { type: 'decimal-leading-zero' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );
				} );
			} );
		} );
	} );
} );
