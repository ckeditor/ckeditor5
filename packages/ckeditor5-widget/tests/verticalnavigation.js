/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Table from '@ckeditor/ckeditor5-table/src/table';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';

import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { modelTable } from '@ckeditor/ckeditor5-table/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import env from '@ckeditor/ckeditor5-utils/src/env';

describe( 'Widget - vertical keyboard navigation near widgets', () => {
	let editorElement, editor, model;
	let leftArrowDomEvtDataStub, rightArrowDomEvtDataStub, upArrowDomEvtDataStub, downArrowDomEvtDataStub;

	const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAUCAQAAADRyVAeAAAAKklEQVR42u3PAQ0AAAwCI' +
		'O0f+u/hoAHNZUJFRERERERERERERERERLYiD9N4FAFj2iK6AAAAAElFTkSuQmCC';

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Table, Paragraph, Image, ImageCaption, HorizontalLine, BlockQuote ]
		} );

		model = editor.model;

		// The editing view must be focused because otherwise in Chrome the DOM selection will not contain
		// any ranges and jumpOverUiElement will crash (for the right arrow when shift is pressed).
		editor.editing.view.focus();

		leftArrowDomEvtDataStub = {
			keyCode: getCode( 'ArrowLeft' ),
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy(),
			domTarget: global.document.body
		};
		rightArrowDomEvtDataStub = {
			keyCode: getCode( 'ArrowRight' ),
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy(),
			domTarget: global.document.body
		};
		upArrowDomEvtDataStub = {
			keyCode: getCode( 'ArrowUp' ),
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy(),
			domTarget: global.document.body
		};
		downArrowDomEvtDataStub = {
			keyCode: getCode( 'ArrowDown' ),
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy(),
			domTarget: global.document.body
		};
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should do nothing if pressed left-arrow key', () => {
		setModelData( model,
			'<paragraph>foo</paragraph>' +
			'<paragraph>b[]ar</paragraph>' +
			'<paragraph>abc</paragraph>'
		);

		editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

		sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
		sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );

		assertEqualMarkup(
			getModelData( model ),
			'<paragraph>foo</paragraph>' +
			'<paragraph>b[]ar</paragraph>' +
			'<paragraph>abc</paragraph>'
		);
	} );

	it( 'should do nothing if pressed right-arrow key', () => {
		setModelData( model,
			'<paragraph>foo</paragraph>' +
			'<paragraph>b[]ar</paragraph>' +
			'<paragraph>abc</paragraph>'
		);

		editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

		sinon.assert.notCalled( rightArrowDomEvtDataStub.preventDefault );
		sinon.assert.notCalled( rightArrowDomEvtDataStub.stopPropagation );

		assertEqualMarkup(
			getModelData( model ),
			'<paragraph>foo</paragraph>' +
			'<paragraph>b[]ar</paragraph>' +
			'<paragraph>abc</paragraph>'
		);
	} );

	it( 'should do nothing if shrinking non-collapsed forward selection', () => {
		setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

		upArrowDomEvtDataStub.shiftKey = true;
		editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

		sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
		sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
	} );

	it( 'should do nothing if shrinking non-collapsed backward selection', () => {
		setModelData( model, '<paragraph>fo[ob]ar</paragraph>', { lastRangeBackward: true } );

		downArrowDomEvtDataStub.shiftKey = true;
		editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

		sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
		sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
	} );

	describe( 'with selection inside root content editable', () => {
		let styleElement;

		beforeEach( () => {
			styleElement = global.document.createElement( 'style' );
			styleElement.type = 'text/css';
			styleElement.appendChild( global.document.createTextNode(
				`
				* {
					font-size: 12px !important;
					font-family: serif !important;
					margin: 0 !important;
					padding: 0 !important;
					border: 0 !important
				}
				.ck-editor__editable:not(.ck-editor__nested-editable ) {
					width: 300px !important;
				}
				td { width: 30px !important; }
				tr:nth-child(2) td:nth-child(2) { width: 300px !important; }
				`
			) );
			global.document.querySelector( 'head' ).appendChild( styleElement );
		} );

		afterEach( () => {
			styleElement.remove();
		} );

		describe( 'single paragraph surrounded with objects', () => {
			describe( 'collapsed selection', () => {
				beforeEach( () => {
					setModelData( model,
						'<horizontalLine></horizontalLine>' +
						'<paragraph>foo[]bar</paragraph>' +
						'<horizontalLine></horizontalLine>'
					);
				} );

				it( 'should move caret to the position closest to object (navigating forward)', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ),
						'<horizontalLine></horizontalLine>' +
						'<paragraph>foobar[]</paragraph>' +
						'<horizontalLine></horizontalLine>'
					);
				} );

				it( 'should move caret to the position closest to object (navigating backward)', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ),
						'<horizontalLine></horizontalLine>' +
						'<paragraph>[]foobar</paragraph>' +
						'<horizontalLine></horizontalLine>'
					);
				} );
			} );

			describe( 'non-collapsed forward selection', () => {
				beforeEach( () => {
					setModelData( model,
						'<horizontalLine></horizontalLine>' +
						'<paragraph>fo[ob]ar</paragraph>' +
						'<horizontalLine></horizontalLine>'
					);
				} );

				it( 'should move caret to the position closest to object (navigating forward)', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ),
						'<horizontalLine></horizontalLine>' +
						'<paragraph>foobar[]</paragraph>' +
						'<horizontalLine></horizontalLine>'
					);
				} );

				it( 'should move caret to the position closest to object (navigating backward)', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ),
						'<horizontalLine></horizontalLine>' +
						'<paragraph>[]foobar</paragraph>' +
						'<horizontalLine></horizontalLine>'
					);
				} );

				describe( 'with shift pressed', () => {
					it( 'should expand the selection to the position closest to object (navigating forward)', () => {
						downArrowDomEvtDataStub.shiftKey = true;
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ),
							'<horizontalLine></horizontalLine>' +
							'<paragraph>fo[obar]</paragraph>' +
							'<horizontalLine></horizontalLine>'
						);
					} );

					it( 'should not prevent default browser behavior while navigating backward', () => {
						upArrowDomEvtDataStub.shiftKey = true;
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
					} );
				} );
			} );

			describe( 'non-collapsed backward selection', () => {
				beforeEach( () => {
					setModelData( model,
						'<horizontalLine></horizontalLine>' +
						'<paragraph>fo[ob]ar</paragraph>' +
						'<horizontalLine></horizontalLine>',
						{ lastRangeBackward: true }
					);
				} );

				it( 'should move caret to the position closest to object (navigating forward)', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ),
						'<horizontalLine></horizontalLine>' +
						'<paragraph>foobar[]</paragraph>' +
						'<horizontalLine></horizontalLine>'
					);
				} );

				it( 'should move caret to the position closest to object (navigating backward)', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ),
						'<horizontalLine></horizontalLine>' +
						'<paragraph>[]foobar</paragraph>' +
						'<horizontalLine></horizontalLine>'
					);
				} );

				describe( 'with shift pressed', () => {
					it( 'should not prevent default browser behavior while navigating forward', () => {
						downArrowDomEvtDataStub.shiftKey = true;
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should expand the selection to the position closest to object (navigating backward)', () => {
						upArrowDomEvtDataStub.shiftKey = true;
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ),
							'<horizontalLine></horizontalLine>' +
							'<paragraph>[foob]ar</paragraph>' +
							'<horizontalLine></horizontalLine>'
						);
					} );
				} );
			} );
		} );

		describe( 'multiple paragraphs with object inside', () => {
			describe( 'caret in the first paragraph', () => {
				beforeEach( () => {
					setModelData( model,
						'<paragraph>fo[]oo</paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<horizontalLine></horizontalLine>' +
						'<paragraph>FOO</paragraph>' +
						'<paragraph>BAR</paragraph>'
					);
				} );

				it( 'should not prevent default on forward navigation', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
				} );

				it( 'should not prevent default on backward navigation', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
				} );
			} );

			describe( 'caret in the second paragraph', () => {
				beforeEach( () => {
					setModelData( model,
						'<paragraph>foo</paragraph>' +
						'<paragraph>ba[]ar</paragraph>' +
						'<horizontalLine></horizontalLine>' +
						'<paragraph>FOO</paragraph>' +
						'<paragraph>BAR</paragraph>'
					);
				} );

				it( 'should move caret to the position closest to object on forward navigation', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ),
						'<paragraph>foo</paragraph>' +
						'<paragraph>baar[]</paragraph>' +
						'<horizontalLine></horizontalLine>' +
						'<paragraph>FOO</paragraph>' +
						'<paragraph>BAR</paragraph>'
					);
				} );

				it( 'should not prevent default on backward navigation', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
				} );
			} );

			describe( 'caret in the third paragraph', () => {
				beforeEach( () => {
					setModelData( model,
						'<paragraph>foo</paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<horizontalLine></horizontalLine>' +
						'<paragraph>FO[]OO</paragraph>' +
						'<paragraph>BAR</paragraph>'
					);
				} );

				it( 'should not prevent default on forward navigation', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
				} );

				it( 'should move caret to the position closest to object on backward navigation', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ),
						'<paragraph>foo</paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<horizontalLine></horizontalLine>' +
						'<paragraph>[]FOOO</paragraph>' +
						'<paragraph>BAR</paragraph>'
					);
				} );
			} );

			describe( 'caret in the forth paragraph', () => {
				beforeEach( () => {
					setModelData( model,
						'<paragraph>foo</paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<horizontalLine></horizontalLine>' +
						'<paragraph>FOO</paragraph>' +
						'<paragraph>BA[]AR</paragraph>'
					);
				} );

				it( 'should not prevent default on backward navigation', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
				} );

				it( 'should not prevent default on forward navigation', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
				} );
			} );
		} );

		it( 'should integrate with the blockquote (forward navigation)', () => {
			setModelData( model,
				'<blockQuote>' +
					'<paragraph>f[]oo</paragraph>' +
				'</blockQuote>' +
				'<horizontalLine></horizontalLine>' +
				'<paragraph>bar</paragraph>'
			);

			editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

			sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
			sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

			assertEqualMarkup( getModelData( model ),
				'<blockQuote>' +
					'<paragraph>foo[]</paragraph>' +
				'</blockQuote>' +
				'<horizontalLine></horizontalLine>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'should integrate with the blockquote (backward navigation)', () => {
			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<horizontalLine></horizontalLine>' +
				'<blockQuote>' +
					'<paragraph>ba[]r</paragraph>' +
				'</blockQuote>'
			);

			editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

			sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
			sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

			assertEqualMarkup( getModelData( model ),
				'<paragraph>foo</paragraph>' +
				'<horizontalLine></horizontalLine>' +
				'<blockQuote>' +
					'<paragraph>[]bar</paragraph>' +
				'</blockQuote>'
			);
		} );
	} );

	describe( 'with selection inside nested content editable', () => {
		let styleElement;

		beforeEach( () => {
			styleElement = global.document.createElement( 'style' );
			styleElement.type = 'text/css';
			styleElement.appendChild( global.document.createTextNode(
				`
					* {
						font-size: 12px !important;
						font-family: serif !important;
						margin: 0 !important;
						padding: 0 !important;
						border: 0 !important
					}
					td { width: 30px !important; }
					tr:nth-child(2) td:nth-child(2) { width: 300px !important; }
					`
			) );
			global.document.querySelector( 'head' ).appendChild( styleElement );
		} );

		afterEach( () => {
			styleElement.remove();
		} );

		describe( 'simple cell text content', () => {
			describe( 'with collapsed selection', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'foo[]bar', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move caret to the beginning of the cell content', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '[]foobar', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move caret to the end of the cell content', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'foobar[]', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				describe( 'when shift key is pressed', () => {
					beforeEach( () => {
						upArrowDomEvtDataStub.shiftKey = true;
						downArrowDomEvtDataStub.shiftKey = true;
					} );

					it( 'should expand selection to the beginning of the cell content', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[foo]bar', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should expand selection to the end of the cell content', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', 'foo[bar]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );
			} );

			describe( 'with non-collapsed forward selection', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'fo[ob]ar', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move caret to the beginning of the cell content', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '[]foobar', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move caret to the end of the cell content', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'foobar[]', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				describe( 'when shift key is pressed', () => {
					beforeEach( () => {
						upArrowDomEvtDataStub.shiftKey = true;
						downArrowDomEvtDataStub.shiftKey = true;
					} );

					it( 'should not prevent default browser behavior on arrow up press', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', 'fo[ob]ar', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should expand selection to the end of the cell content', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', 'fo[obar]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );
			} );

			describe( 'with non-collapsed backward selection', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'fo[ob]ar', '12' ],
						[ '20', '21', '22' ]
					] ), { lastRangeBackward: true } );
				} );

				it( 'should move caret to the beginning of the cell content', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '[]foobar', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move caret to the end of the cell content', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'foobar[]', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				describe( 'when shift key is pressed', () => {
					beforeEach( () => {
						upArrowDomEvtDataStub.shiftKey = true;
						downArrowDomEvtDataStub.shiftKey = true;
					} );

					it( 'should expand selection to the beginning of the cell content', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[foob]ar', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not prevent default browser behavior on arrow down press', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', 'fo[ob]ar', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );
			} );
		} );

		describe( 'selection inside paragraph', () => {
			const text = new Array( 20 ).fill( 0 ).map( () => 'word' ).join( ' ' );

			it( 'should not prevent default browser behavior if caret is in the middle line of a text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', text + '[] ' + text, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
			} );

			it( 'should move caret to beginning of cell content if caret is in the first line of a text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', 'word[] word' + text, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', '[]word word' + text, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should move caret to end of cell content if caret is in the last line of a text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', text + 'word[] word', '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', text + 'word word[]', '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			describe( 'when shift key is pressed', () => {
				beforeEach( () => {
					upArrowDomEvtDataStub.shiftKey = true;
					downArrowDomEvtDataStub.shiftKey = true;
				} );

				it( 'should not prevent default browser behavior for the up arrow in the middle lines of the cell text', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + '[] ' + text, '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
				} );

				it( 'should not prevent default browser behavior for the down arrow in the middle lines of cell text', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + '[] ' + text, '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
				} );

				it( 'should expand collapsed selection to the beginning of the cell content', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'word[] word' + text, '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '[word] word' + text, '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should not prevent default browser behavior for shrinking selection (up arrow)', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'word [word]' + text, '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
				} );

				it( 'should expand not collapsed selection to the beginning of the cell content from the selection anchor', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'word [word]' + text, '12' ],
						[ '20', '21', '22' ]
					] ), { lastRangeBackward: true } );

					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '[word word]' + text, '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should expand collapsed selection to the end of the cell content', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + 'word[] word', '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + 'word[ word]', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should not prevent default browser behavior for shrinking selection (down arrow)', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + '[word] word', '12' ],
						[ '20', '21', '22' ]
					] ), { lastRangeBackward: true } );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
				} );

				it( 'should expand not collapsed selection to the end of the cell content from the selection anchor', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + '[word] word', '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + '[word word]', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );
			} );
		} );

		if ( !env.isGecko ) {
			// These tests fails on Travis. They work correctly when started on local machine.
			// Issue is probably related to text rendering and wrapping.

			describe( 'with selection in the wrap area', () => {
				const text = new Array( 10 ).fill( 0 ).map( () => 'word' ).join( ' ' );

				it( 'should move the caret to end if the caret is after the last space in the line next to the last one', () => {
					// This is also first position in the last line.
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + ' []word word word', '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + ' word word word[]', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move the caret to end if the caret is at the last space in the line next to last one', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + '[] word word word', '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', text + ' word word word[]', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should not move the caret if it\'s just before the last space in the line next to last one', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', text.substring( 0, text.length - 1 ) + '[]d word word word', '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
				} );

				describe( 'when shift key is pressed', () => {
					beforeEach( () => {
						upArrowDomEvtDataStub.shiftKey = true;
						downArrowDomEvtDataStub.shiftKey = true;
					} );

					it( 'should expand collapsed selection to the end of the cell content', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + '[] word word word', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + '[ word word word]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should expand not collapsed selection to the end of the cell content from the selection anchor', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + '[ word] word word', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + '[ word word word]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );
			} );
		}

		describe( 'with multiple paragraphs of text', () => {
			const text = new Array( 100 ).fill( 0 ).map( () => 'word' ).join( ' ' );

			it( 'should not prevent default browser behavior if caret is in the middle of a line of text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>${ text }[]${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
			} );

			it( 'should move the caret to the beginning of a cell content if the caret is in the first line of text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>word[]${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>[]word${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should not move the caret to the end of a cell content if the caret is not in the last line of text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>${ text }word []word</paragraph><paragraph>foobar</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
				sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
			} );

			it( 'should move the caret to end of a cell content if the caret is in the last line of text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>foobar</paragraph><paragraph>${ text }word []word</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>foobar</paragraph><paragraph>${ text }word word[]</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			describe( 'when shift key is pressed', () => {
				beforeEach( () => {
					upArrowDomEvtDataStub.shiftKey = true;
					downArrowDomEvtDataStub.shiftKey = true;
				} );

				it( 'should expand selection to the beginning of the cell content', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', `<paragraph>word[] ${ text }</paragraph><paragraph>${ text }</paragraph>`, '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', `<paragraph>[word] ${ text }</paragraph><paragraph>${ text }</paragraph>`, '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should expand selection to the end of the cell content', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', `<paragraph>${ text }</paragraph><paragraph>${ text } []word</paragraph>`, '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', `<paragraph>${ text }</paragraph><paragraph>${ text } [word]</paragraph>`, '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );
			} );
		} );

		describe( 'with horizontal line widget', () => {
			const text = new Array( 100 ).fill( 0 ).map( () => 'word' ).join( ' ' );

			it( 'should not navigate if the caret is in the middle line of text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<horizontalLine></horizontalLine><paragraph>${ text }[]${ text }</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
			} );

			it( 'should move the caret to the beginning of cell non-object content if the caret is in the first line of text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<horizontalLine></horizontalLine><paragraph>word[] ${ text }</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<horizontalLine></horizontalLine><paragraph>[]word ${ text }</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should move the caret to the end of cell non-object content if the caret is in the last line of text', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>${ text } word []word</paragraph><horizontalLine></horizontalLine>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>${ text } word word[]</paragraph><horizontalLine></horizontalLine>`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should not move the caret to the end of cell content if widget is selected in middle of a cell content', () => {
				const paragraph = `<paragraph>${ text }</paragraph>`;
				const hr = '<horizontalLine></horizontalLine>';

				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `${ paragraph }[${ hr }]${ paragraph }${ hr }`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				// Note: Two keydowns are necessary because the first one is handled by the WidgetTypeAround plugin
				// to activate the "fake caret".
				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );
				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `${ paragraph }${ hr }<paragraph>[]${ text }</paragraph>${ hr }`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should not move the caret to the end of cell content if widget is next to the selection', () => {
				const paragraph = `<paragraph>${ text }</paragraph>`;
				const hr = '<horizontalLine></horizontalLine>';

				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `${ paragraph }[]${ hr }`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `${ paragraph }[${ hr }]`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			describe( 'when shift key is pressed', () => {
				beforeEach( () => {
					upArrowDomEvtDataStub.shiftKey = true;
					downArrowDomEvtDataStub.shiftKey = true;
				} );

				it( 'should expand selection to the beginning of the cell content', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '<horizontalLine></horizontalLine><paragraph>foo[]bar</paragraph>', '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '<horizontalLine></horizontalLine><paragraph>[foo]bar</paragraph>', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should expand selection to the end of the cell content', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '<paragraph>foo[]bar</paragraph><horizontalLine></horizontalLine>', '12' ],
						[ '20', '21', '22' ]
					] ) );

					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '<paragraph>foo[bar]</paragraph><horizontalLine></horizontalLine>', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );
			} );
		} );

		describe( 'contains image widget with caption and selection inside the caption', () => {
			it( 'should move caret to the closest limit boundary', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>foo</paragraph><image src="${ imageUrl }"><caption>bar[]baz</caption></image>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>foo</paragraph><image src="${ imageUrl }"><caption>[]barbaz</caption></image>`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should not prevent default browser behavior when caret at the beginning of nested editable', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<paragraph>foo</paragraph><image src="${ imageUrl }"><caption>[]barbaz</caption></image>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
			} );

			it( 'should move the caret to the first position of the image caption', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<image src="${ imageUrl }"><caption>bar[]baz</caption></image><paragraph>foo</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

				sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<image src="${ imageUrl }"><caption>[]barbaz</caption></image><paragraph>foo</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should move caret to the end of image caption', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<image src="${ imageUrl }"><caption>bar[]baz</caption></image><paragraph>foo</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<image src="${ imageUrl }"><caption>barbaz[]</caption></image><paragraph>foo</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should move caret to the end of image caption when caret is on the position next to the last one', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<image src="${ imageUrl }"><caption>barba[]z</caption></image><paragraph>foo</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
				sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<image src="${ imageUrl }"><caption>barbaz[]</caption></image><paragraph>foo</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should not prevent default browser behavior when caret inside image caption when followed by a paragraph', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', `<image src="${ imageUrl }"><caption>barbaz[]</caption></image><paragraph>foo</paragraph>`, '12' ],
					[ '20', '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

				sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
				sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
			} );
		} );
	} );
} );
