/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Widget from '../src/widget';
import MouseObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import { toWidget } from '../src/utils';
import ViewContainer from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewEditable from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import AttributeContainer from '@ckeditor/ckeditor5-engine/src/view/attributeelement';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/* global document */

describe( 'Widget', () => {
	let editor, doc, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create( { plugins: [ Widget ] } )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
				viewDocument = editor.editing.view;

				doc.schema.registerItem( 'widget', '$block' );
				doc.schema.objects.add( 'widget' );
				doc.schema.registerItem( 'paragraph', '$block' );
				doc.schema.registerItem( 'inline', '$inline' );
				doc.schema.objects.add( 'inline' );
				doc.schema.registerItem( 'nested' );
				doc.schema.limits.add( 'nested' );
				doc.schema.allow( { name: '$inline', inside: 'nested' } );
				doc.schema.allow( { name: 'nested', inside: 'widget' } );
				doc.schema.registerItem( 'editable' );
				doc.schema.allow( { name: '$inline', inside: 'editable' } );
				doc.schema.allow( { name: 'editable', inside: 'widget' } );
				doc.schema.allow( { name: 'editable', inside: '$root' } );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'paragraph' )
					.toElement( 'p' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'widget' )
					.toElement( () => {
						const b = new AttributeContainer( 'b' );
						const div = new ViewContainer( 'div', null, b );

						return toWidget( div, { label: 'element label' } );
					} );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'inline' )
					.toElement( 'figure' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'nested' )
					.toElement( () => new ViewEditable( 'figcaption', { contenteditable: true } ) );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'editable' )
					.toElement( () => new ViewEditable( 'figcaption', { contenteditable: true } ) );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Widget ) ).to.be.instanceOf( Widget );
	} );

	it( 'should add MouseObserver', () => {
		expect( editor.editing.view.getObserver( MouseObserver ) ).to.be.instanceof( MouseObserver );
	} );

	it( 'should create selection over clicked widget', () => {
		setModelData( doc, '[]<widget></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = {
			target: viewDiv,
			preventDefault: sinon.spy()
		};

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( doc ) ).to.equal( '[<widget></widget>]' );
		sinon.assert.calledOnce( domEventDataMock.preventDefault );
	} );

	it( 'should create selection when clicked in nested element', () => {
		setModelData( doc, '[]<widget></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const viewB = viewDiv.getChild( 0 );
		const domEventDataMock = {
			target: viewB,
			preventDefault: sinon.spy()
		};

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( doc ) ).to.equal( '[<widget></widget>]' );
		sinon.assert.calledOnce( domEventDataMock.preventDefault );
	} );

	it( 'should do nothing if clicked inside nested editable', () => {
		setModelData( doc, '[]<widget><nested>foo bar</nested></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const viewFigcaption = viewDiv.getChild( 0 );

		const domEventDataMock = {
			target: viewFigcaption,
			preventDefault: sinon.spy()
		};

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.notCalled( domEventDataMock.preventDefault );
	} );

	it( 'should do nothing if clicked in non-widget element', () => {
		setModelData( doc, '<paragraph>[]foo bar</paragraph><widget></widget>' );
		const viewP = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = {
			target: viewP,
			preventDefault: sinon.spy()
		};

		viewDocument.focus();
		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( doc ) ).to.equal( '<paragraph>[]foo bar</paragraph><widget></widget>' );
		sinon.assert.notCalled( domEventDataMock.preventDefault );
	} );

	it( 'should not focus editable if already is focused', () => {
		setModelData( doc, '<widget></widget>' );
		const widget = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = {
			target: widget,
			preventDefault: sinon.spy()
		};
		const focusSpy = sinon.spy( viewDocument, 'focus' );

		viewDocument.isFocused = true;
		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.calledOnce( domEventDataMock.preventDefault );
		sinon.assert.notCalled( focusSpy );
		expect( getModelData( doc ) ).to.equal( '[<widget></widget>]' );
	} );

	it( 'should apply fake view selection if model selection is on widget element', () => {
		setModelData( doc, '[<widget>foo bar</widget>]' );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<div class="ck-widget ck-widget_selected" contenteditable="false">foo bar<b></b></div>]'
		);
		expect( viewDocument.selection.isFake ).to.be.true;
	} );

	it( 'should use element\'s label to set fake selection if one is provided', () => {
		setModelData( doc, '[<widget>foo bar</widget>]' );

		expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'element label' );
	} );

	it( 'fake selection should be empty if widget is not selected', () => {
		setModelData( doc, '<paragraph>foo</paragraph><widget>foo bar</widget>' );

		expect( viewDocument.selection.fakeSelectionLabel ).to.equal( '' );
	} );

	it( 'should toggle selected class', () => {
		setModelData( doc, '<paragraph>foo</paragraph>[<widget>foo</widget>]' );

		expect( getViewData( viewDocument ) ).to.equal(
			'<p>foo</p>[<div class="ck-widget ck-widget_selected" contenteditable="false">foo<b></b></div>]'
		);

		doc.enqueueChanges( () => {
			doc.selection.removeAllRanges();
		} );

		expect( getViewData( viewDocument ) ).to.equal(
			'<p>{}foo</p><div class="ck-widget" contenteditable="false">foo<b></b></div>'
		);
	} );

	it( 'should do nothing when selection is placed in other editable', () => {
		setModelData( doc, '<widget><editable>foo bar</editable></widget><editable>[baz]</editable>' );

		expect( getViewData( viewDocument ) ).to.equal(
			'<div class="ck-widget" contenteditable="false">' +
				'<figcaption contenteditable="true">foo bar</figcaption>' +
				'<b></b>' +
			'</div>' +
			'<figcaption contenteditable="true">{baz}</figcaption>'
		);
	} );

	describe( 'keys handling', () => {
		describe( 'delete and backspace', () => {
			test(
				'should select widget when backspace is pressed',
				'<widget></widget><paragraph>[]foo</paragraph>',
				keyCodes.backspace,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should remove empty element after selecting widget when backspace is pressed',
				'<widget></widget><paragraph>[]</paragraph>',
				keyCodes.backspace,
				'[<widget></widget>]'
			);

			test(
				'should select widget when delete is pressed',
				'<paragraph>foo[]</paragraph><widget></widget>',
				keyCodes.delete,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should remove empty element after selecting widget when delete is pressed',
				'<paragraph>[]</paragraph><widget></widget>',
				keyCodes.delete,
				'[<widget></widget>]'
			);

			test(
				'should not respond to other keys',
				'<widget></widget><paragraph>[]foo</paragraph>',
				65,
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should do nothing on non-collapsed selection',
				'<widget></widget><paragraph>[f]oo</paragraph>',
				keyCodes.backspace,
				'<widget></widget><paragraph>[f]oo</paragraph>'
			);

			test(
				'should do nothing on non-object elements',
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>',
				keyCodes.backspace,
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>'
			);

			test(
				'should work correctly with modifier key: backspace + ctrl',
				'<widget></widget><paragraph>[]foo</paragraph>',
				{ keyCode: keyCodes.backspace, ctrlKey: true },
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: backspace + alt',
				'<widget></widget><paragraph>[]foo</paragraph>',
				{ keyCode: keyCodes.backspace, altKey: true },
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: backspace + shift',
				'<widget></widget><paragraph>[]foo</paragraph>',
				{ keyCode: keyCodes.backspace, shiftKey: true },
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: delete + ctrl',
				'<paragraph>foo[]</paragraph><widget></widget>',
				{ keyCode: keyCodes.delete, ctrlKey: true },
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should work correctly with modifier key: delete + alt',
				'<paragraph>foo[]</paragraph><widget></widget>',
				{ keyCode: keyCodes.delete, altKey: true },
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should work correctly with modifier key: delete + shift',
				'<paragraph>foo[]</paragraph><widget></widget>',
				{ keyCode: keyCodes.delete, shiftKey: true },
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should not modify backspace default behaviour in single paragraph boundaries',
				'<paragraph>[]foo</paragraph>',
				keyCodes.backspace,
				'<paragraph>[]foo</paragraph>'
			);

			test(
				'should not modify delete default behaviour in single paragraph boundaries',
				'<paragraph>foo[]</paragraph>',
				keyCodes.delete,
				'<paragraph>foo[]</paragraph>'
			);

			test(
				'should do nothing on selected widget preceded by a paragraph - backspace',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				keyCodes.backspace,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should do nothing on selected widget preceded by another widget - backspace',
				'<widget></widget>[<widget></widget>]',
				keyCodes.backspace,
				'<widget></widget>[<widget></widget>]'
			);

			test(
				'should do nothing on selected widget before paragraph - backspace',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				keyCodes.backspace,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should do nothing on selected widget before another widget - backspace',
				'[<widget></widget>]<widget></widget>',
				keyCodes.backspace,
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should do nothing on selected widget between paragraphs - backspace',
				'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>',
				keyCodes.backspace,
				'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should do nothing on selected widget between other widgets - backspace',
				'<widget></widget>[<widget></widget>]<widget></widget>',
				keyCodes.backspace,
				'<widget></widget>[<widget></widget>]<widget></widget>'
			);

			test(
				'should do nothing on selected widget preceded by a paragraph - delete',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				keyCodes.delete,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should do nothing on selected widget preceded by another widget - delete',
				'<widget></widget>[<widget></widget>]',
				keyCodes.delete,
				'<widget></widget>[<widget></widget>]'
			);

			test(
				'should do nothing on selected widget before paragraph - delete',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				keyCodes.delete,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should do nothing on selected widget before another widget - delete',
				'[<widget></widget>]<widget></widget>',
				keyCodes.delete,
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should do nothing on selected widget between paragraphs - delete',
				'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>',
				keyCodes.delete,
				'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should do nothing on selected widget between other widgets - delete',
				'<widget></widget>[<widget></widget>]<widget></widget>',
				keyCodes.delete,
				'<widget></widget>[<widget></widget>]<widget></widget>'
			);

			test(
				'should select inline objects - backspace',
				'<paragraph>foo<inline></inline>[]bar</paragraph>',
				keyCodes.backspace,
				'<paragraph>foo[<inline></inline>]bar</paragraph>'
			);

			test(
				'should select inline objects - delete',
				'<paragraph>foo[]<inline></inline>bar</paragraph>',
				keyCodes.delete,
				'<paragraph>foo[<inline></inline>]bar</paragraph>'
			);

			test(
				'should do nothing on selected inline objects - backspace',
				'<paragraph>foo[<inline></inline>]bar</paragraph>',
				keyCodes.backspace,
				'<paragraph>foo[<inline></inline>]bar</paragraph>'
			);

			test(
				'should do nothing on selected inline objects - delete',
				'<paragraph>foo[<inline></inline>]bar</paragraph>',
				keyCodes.delete,
				'<paragraph>foo[<inline></inline>]bar</paragraph>'
			);

			test(
				'should do nothing if selection is placed after first letter - backspace',
				'<paragraph>a[]</paragraph>',
				keyCodes.backspace,
				'<paragraph>a[]</paragraph>'
			);

			test(
				'should do nothing if selection is placed before first letter - delete',
				'<paragraph>[]a</paragraph>',
				keyCodes.delete,
				'<paragraph>[]a</paragraph>'
			);

			it( 'should prevent default behaviour and stop event propagation', () => {
				const keydownHandler = sinon.spy();
				const domEventDataMock = {
					keyCode: keyCodes.delete,
					preventDefault: sinon.spy(),
				};
				setModelData( doc, '<paragraph>foo[]</paragraph><widget></widget>' );
				viewDocument.on( 'keydown', keydownHandler );

				viewDocument.fire( 'keydown', domEventDataMock );

				expect( getModelData( doc ) ).to.equal( '<paragraph>foo</paragraph>[<widget></widget>]' );
				sinon.assert.calledOnce( domEventDataMock.preventDefault );
				sinon.assert.notCalled( keydownHandler );
			} );
		} );

		describe( 'arrows', () => {
			test(
				'should move selection forward from selected object - right arrow',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				keyCodes.arrowright,
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should move selection forward from selected object - down arrow',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				keyCodes.arrowdown,
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should move selection backward from selected object - left arrow',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				keyCodes.arrowleft,
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should move selection backward from selected object - up arrow',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				keyCodes.arrowup,
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should move selection to next widget - right arrow',
				'[<widget></widget>]<widget></widget>',
				keyCodes.arrowright,
				'<widget></widget>[<widget></widget>]'
			);

			test(
				'should move selection to next widget - down arrow',
				'[<widget></widget>]<widget></widget>',
				keyCodes.arrowdown,
				'<widget></widget>[<widget></widget>]'
			);

			test(
				'should move selection to previous widget - left arrow',
				'<widget></widget>[<widget></widget>]',
				keyCodes.arrowleft,
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should move selection to previous widget - up arrow',
				'<widget></widget>[<widget></widget>]',
				keyCodes.arrowup,
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should do nothing on non-collapsed selection next to object - right arrow',
				'<paragraph>ba[r]</paragraph><widget></widget>',
				keyCodes.arrowright,
				'<paragraph>ba[r]</paragraph><widget></widget>'
			);

			test(
				'should do nothing on non-collapsed selection next to object - down arrow',
				'<paragraph>ba[r]</paragraph><widget></widget>',
				keyCodes.arrowdown,
				'<paragraph>ba[r]</paragraph><widget></widget>'
			);

			test(
				'should do nothing on non-collapsed selection next to object - left arrow',
				'<widget></widget><paragraph>[b]ar</paragraph>',
				keyCodes.arrowleft,
				'<widget></widget><paragraph>[b]ar</paragraph>'
			);

			test(
				'should do nothing on non-collapsed selection next to object - up arrow',
				'<widget></widget><paragraph>[b]ar</paragraph>',
				keyCodes.arrowup,
				'<widget></widget><paragraph>[b]ar</paragraph>'
			);

			test(
				'should not move selection if there is no correct location - right arrow',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				keyCodes.arrowright,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should not move selection if there is no correct location - down arrow',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				keyCodes.arrowdown,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should not move selection if there is no correct location - left arrow',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				keyCodes.arrowleft,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should not move selection if there is no correct location - up arrow',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				keyCodes.arrowup,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			it( 'should prevent default behaviour when there is no correct location - document end', () => {
				const keydownHandler = sinon.spy();
				const domEventDataMock = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
				};
				setModelData( doc, '<paragraph>foo</paragraph>[<widget></widget>]' );
				viewDocument.on( 'keydown', keydownHandler );

				viewDocument.fire( 'keydown', domEventDataMock );

				expect( getModelData( doc ) ).to.equal( '<paragraph>foo</paragraph>[<widget></widget>]' );
				sinon.assert.calledOnce( domEventDataMock.preventDefault );
				sinon.assert.notCalled( keydownHandler );
			} );

			it( 'should prevent default behaviour when there is no correct location - document start', () => {
				const keydownHandler = sinon.spy();
				const domEventDataMock = {
					keyCode: keyCodes.arrowleft,
					preventDefault: sinon.spy(),
				};
				setModelData( doc, '[<widget></widget>]<paragraph>foo</paragraph>' );
				viewDocument.on( 'keydown', keydownHandler );

				viewDocument.fire( 'keydown', domEventDataMock );

				expect( getModelData( doc ) ).to.equal( '[<widget></widget>]<paragraph>foo</paragraph>' );
				sinon.assert.calledOnce( domEventDataMock.preventDefault );
				sinon.assert.notCalled( keydownHandler );
			} );

			test(
				'should move selection to object element - right arrow',
				'<paragraph>foo[]</paragraph><widget></widget>',
				keyCodes.arrowright,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should move selection to object element - down arrow',
				'<paragraph>foo[]</paragraph><widget></widget>',
				keyCodes.arrowdown,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should move selection to object element - left arrow',
				'<widget></widget><paragraph>[]foo</paragraph>',
				keyCodes.arrowleft,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should move selection to object element - up arrow',
				'<widget></widget><paragraph>[]foo</paragraph>',
				keyCodes.arrowup,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'do nothing on non objects - right arrow',
				'<paragraph>foo[]</paragraph><paragraph>bar</paragraph>',
				keyCodes.arrowright,
				'<paragraph>foo[]</paragraph><paragraph>bar</paragraph>'
			);

			test(
				'do nothing on non objects - down arrow',
				'<paragraph>foo[]</paragraph><paragraph>bar</paragraph>',
				keyCodes.arrowdown,
				'<paragraph>foo[]</paragraph><paragraph>bar</paragraph>'
			);

			test(
				'do nothing on non objects - left arrow',
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>',
				keyCodes.arrowleft,
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>'
			);

			test(
				'do nothing on non objects - up arrow',
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>',
				keyCodes.arrowup,
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>'
			);

			test(
				'should work correctly with modifier key: right arrow + ctrl',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				{ keyCode: keyCodes.arrowright, ctrlKey: true },
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: right arrow + alt',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				{ keyCode: keyCodes.arrowright, altKey: true },
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: right arrow + shift',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				{ keyCode: keyCodes.arrowright, shiftKey: true },
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: down arrow + ctrl',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				{ keyCode: keyCodes.arrowdown, ctrlKey: true },
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: down arrow + alt',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				{ keyCode: keyCodes.arrowdown, altKey: true },
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: down arrow + shift',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				{ keyCode: keyCodes.arrowdown, shiftKey: true },
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: left arrow + ctrl',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				{ keyCode: keyCodes.arrowleft, ctrlKey: true },
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: left arrow + alt',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				{ keyCode: keyCodes.arrowleft, altKey: true },
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: left arrow + shift',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				{ keyCode: keyCodes.arrowleft, shiftKey: true },
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: up arrow + ctrl',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				{ keyCode: keyCodes.arrowup, ctrlKey: true },
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: up arrow + alt',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				{ keyCode: keyCodes.arrowup, altKey: true },
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: up arrow + shift',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				{ keyCode: keyCodes.arrowup, shiftKey: true },
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should do nothing if there is more than one selection in model',
				'<paragraph>[foo]</paragraph><widget></widget><paragraph>[bar]</paragraph>',
				keyCodes.arrowright,
				'<paragraph>[foo]</paragraph><widget></widget><paragraph>[bar]</paragraph>'
			);
		} );

		describe( 'Ctrl+A', () => {
			test(
				'should select the entire content of the nested editable',
				'<widget><nested>foo[]</nested></widget><paragraph>bar</paragraph>',
				{ keyCode: keyCodes.a, ctrlKey: true },
				'<widget><nested>[foo]</nested></widget><paragraph>bar</paragraph>'
			);

			test(
				'should not change the selection if outside of the nested editable',
				'<widget><nested>foo</nested></widget><paragraph>[]bar</paragraph>',
				{ keyCode: keyCodes.a, ctrlKey: true },
				'<widget><nested>foo</nested></widget><paragraph>[]bar</paragraph>'
			);
		} );

		function test( name, data, keyCodeOrMock, expected ) {
			it( name, () => {
				const domEventDataMock = ( typeof keyCodeOrMock == 'object' ) ? keyCodeOrMock : {
					keyCode: keyCodeOrMock
				};

				setModelData( doc, data );
				viewDocument.fire( 'keydown', new DomEventData(
					viewDocument,
					{ target: document.createElement( 'div' ), preventDefault: () => {} },
					domEventDataMock
				) );

				expect( getModelData( doc ) ).to.equal( expected );
			} );
		}
	} );
} );
