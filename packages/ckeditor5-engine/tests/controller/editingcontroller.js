/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals setTimeout, document */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

import EditingController from '../../src/controller/editingcontroller';

import View from '../../src/view/view';

import Mapper from '../../src/conversion/mapper';
import DowncastDispatcher from '../../src/conversion/downcastdispatcher';

import { downcastElementToElement, downcastMarkerToHighlight } from '../../src/conversion/downcast-converters';

import Model from '../../src/model/model';
import ModelPosition from '../../src/model/position';
import ModelRange from '../../src/model/range';
import ModelDocumentFragment from '../../src/model/documentfragment';

import { getData as getModelData, setData as modelSetData, parse } from '../../src/dev-utils/model';
import { getData as getViewData } from '../../src/dev-utils/view';

describe( 'EditingController', () => {
	describe( 'constructor()', () => {
		let model, editing;

		beforeEach( () => {
			model = new Model();
			editing = new EditingController( model );
		} );

		afterEach( () => {
			editing.destroy();
		} );

		it( 'should create controller with properties', () => {
			expect( editing ).to.have.property( 'model' ).that.equals( model );
			expect( editing ).to.have.property( 'view' ).that.is.instanceof( View );
			expect( editing ).to.have.property( 'mapper' ).that.is.instanceof( Mapper );
			expect( editing ).to.have.property( 'downcastDispatcher' ).that.is.instanceof( DowncastDispatcher );

			editing.destroy();
		} );

		it( 'should be observable', () => {
			const spy = sinon.spy();

			editing.on( 'change:foo', spy );
			editing.set( 'foo', 'bar' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should bind view roots to model roots', () => {
			expect( model.document.roots ).to.length( 1 ); // $graveyard
			expect( editing.view.document.roots ).to.length( 0 );

			const modelRoot = model.document.createRoot();

			expect( model.document.roots ).to.length( 2 );
			expect( editing.view.document.roots ).to.length( 1 );
			expect( editing.view.document.getRoot().document ).to.equal( editing.view.document );

			expect( editing.view.document.getRoot().name ).to.equal( modelRoot.name ).to.equal( '$root' );
		} );
	} );

	describe( 'conversion', () => {
		let model, modelRoot, viewRoot, domRoot, editing, listener;

		beforeEach( () => {
			listener = Object.create( EmitterMixin );

			model = new Model();
			modelRoot = model.document.createRoot();

			editing = new EditingController( model );

			domRoot = document.createElement( 'div' );
			domRoot.contentEditable = true;

			document.body.appendChild( domRoot );

			viewRoot = editing.view.document.getRoot();
			editing.view.attachDomRoot( domRoot );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			downcastElementToElement( { model: 'paragraph', view: 'p' } )( editing.downcastDispatcher );
			downcastElementToElement( { model: 'div', view: 'div' } )( editing.downcastDispatcher );
			downcastMarkerToHighlight( { model: 'marker', view: {} } )( editing.downcastDispatcher );

			// Note: The below code is highly overcomplicated due to #455.
			model.change( writer => {
				writer.setSelection( null );
			} );

			modelRoot._removeChildren( 0, modelRoot.childCount );

			viewRoot._removeChildren( 0, viewRoot.childCount );

			const modelData = new ModelDocumentFragment( parse(
				'<paragraph>foo</paragraph>' +
				'<paragraph></paragraph>' +
				'<paragraph>bar</paragraph>',
				model.schema
			)._children );

			model.change( writer => {
				writer.insert( modelData, model.document.getRoot() );

				writer.setSelection( ModelRange.createFromParentsAndOffsets(
					modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 )
				);
			} );
		} );

		afterEach( () => {
			document.body.removeChild( domRoot );
			listener.stopListening();
			editing.destroy();
		} );

		it( 'should convert insertion', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert split', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.change( writer => {
				writer.split( model.document.selection.getFirstPosition() );

				writer.setSelection(
					ModelRange.createFromParentsAndOffsets(	modelRoot.getChild( 1 ), 0, modelRoot.getChild( 1 ), 0 )
				);
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>f</p><p>{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert rename', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.change( writer => {
				writer.rename( modelRoot.getChild( 0 ), 'div' );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<div>f{}oo</div><p></p><p>bar</p>' );
		} );

		it( 'should convert delete', () => {
			model.change( writer => {
				writer.remove(
					ModelRange.createFromPositionAndShift( model.document.selection.getFirstPosition(), 1 )
				);

				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 )
				);
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>f{}o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert selection from view to model', done => {
			listener.listenTo( editing.view.document, 'selectionChange', () => {
				setTimeout( () => {
					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>b[a]r</paragraph>'
					);

					done();
				}, 1 );
			} );

			editing.view.document.isFocused = true;
			editing.view.render();

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			const domBar = domRoot.childNodes[ 2 ].childNodes[ 0 ];
			const domRange = document.createRange();
			domRange.setStart( domBar, 1 );
			domRange.setEnd( domBar, 2 );
			domSelection.addRange( domRange );
		} );

		it( 'should convert collapsed selection', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 1 )
				);
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );
		} );

		it( 'should convert not collapsed selection', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 2 )
				);
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{a}r</p>' );
		} );

		it( 'should clear previous selection', () => {
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 1 )
				);
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );

			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 2, modelRoot.getChild( 2 ), 2 )
				);
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>ba{}r</p>' );
		} );

		it( 'should convert adding marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oo</span></p><p></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert removing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.removeMarker( 'marker' );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert changing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			const range2 = new ModelRange( new ModelPosition( modelRoot, [ 0, 0 ] ), new ModelPosition( modelRoot, [ 0, 2 ] ) );

			model.change( writer => {
				writer.updateMarker( 'marker', { range: range2 } );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p><span>fo</span>o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert insertion into marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
				writer.insertText( 'xyz', new ModelPosition( modelRoot, [ 1, 0 ] ) );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oo</span></p><p><span>xyz</span></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert move to marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 2, 2 ] ), new ModelPosition( modelRoot, [ 2, 3 ] ) ),
					new ModelPosition( modelRoot, [ 0, 3 ] )
				);
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oor</span></p><p></p><p><span>ba</span></p>' );
		} );

		it( 'should convert move from marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) ),
					new ModelPosition( modelRoot, [ 2, 3 ] )
				);
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f</p><p></p><p><span>ba</span>roo</p>' );
		} );

		it( 'should convert the whole marker move', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 0, 0 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) ),
					new ModelPosition( modelRoot, [ 1, 0 ] )
				);
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p></p><p>f<span>oo</span></p><p>bar</p>' );
		} );
	} );

	describe( 'post fixers', () => {
		describe( 'selection post fixer', () => {
			let model, modelRoot, viewRoot, domRoot, editing;

			beforeEach( () => {
				model = new Model();
				modelRoot = model.document.createRoot();

				editing = new EditingController( model );

				domRoot = document.createElement( 'div' );
				domRoot.contentEditable = true;

				document.body.appendChild( domRoot );

				viewRoot = editing.view.document.getRoot();
				editing.view.attachDomRoot( domRoot );

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'table', {
					allowWhere: '$block',
					isObject: true,
					isLimit: true
				} );

				model.schema.register( 'tableRow', {
					allowIn: 'table',
					isLimit: true
				} );

				model.schema.register( 'tableCell', {
					allowIn: 'tableRow',
					allowContentOf: '$block',
					isLimit: true
				} );

				downcastElementToElement( { model: 'paragraph', view: 'p' } )( editing.downcastDispatcher );
				downcastElementToElement( { model: 'table', view: 'table' } )( editing.downcastDispatcher );
				downcastElementToElement( { model: 'tableRow', view: 'tr' } )( editing.downcastDispatcher );
				downcastElementToElement( { model: 'tableCell', view: 'td' } )( editing.downcastDispatcher );

				// Note: The below code is highly overcomplicated due to #455.
				model.change( writer => {
					writer.setSelection( null );
				} );

				modelRoot._removeChildren( 0, modelRoot.childCount );

				viewRoot._removeChildren( 0, viewRoot.childCount );

				const modelData = new ModelDocumentFragment( parse(
					'<paragraph>foo</paragraph>' +
					'<table><tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow></table>' +
					'<paragraph>bar</paragraph>',
					model.schema
				)._children );

				model.change( writer => {
					writer.insert( modelData, model.document.getRoot() );

					writer.setSelection( ModelRange.createFromParentsAndOffsets(
						modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 )
					);
				} );
			} );

			it( 'should not crash if there is no correct position for model selection', () => {
				modelSetData( model, '' );

				expect( getModelData( model ) ).to.equal( '[]' );
			} );

			describe( 'not collapsed selection', () => {
				it( 'should fix #1', () => {
					model.change( writer => {
						writer.setSelection( ModelRange.createFromParentsAndOffsets(
							modelRoot.getChild( 0 ), 1,
							modelRoot.getChild( 1 ).getChild( 0 ), 1
						) );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>f{oo</p>' +
						'<table><tr><td>aaa</td><td>bbb</td></tr></table>]' +
						'<p>bar</p>'
					);
				} );

				it( 'should fix #2', () => {
					model.change( writer => {
						writer.setSelection( ModelRange.createFromParentsAndOffsets(
							modelRoot.getChild( 1 ).getChild( 0 ), 1,
							modelRoot.getChild( 2 ), 1
						) );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>foo</p>' +
						'[<table><tr><td>aaa</td><td>bbb</td></tr></table>' +
						'<p>b}ar</p>'
					);
				} );

				it( 'should fix #3', () => {
					model.change( writer => {
						writer.setSelection( ModelRange.createFromParentsAndOffsets(
							modelRoot.getChild( 0 ), 1,
							modelRoot.getChild( 1 ), 0
						) );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>f{oo</p>' +
						'<table><tr><td>aaa</td><td>bbb</td></tr></table>]' +
						'<p>bar</p>'
					);
				} );

				it( 'should fix #4', () => {
					model.change( writer => {
						writer.setSelection( ModelRange.createFromParentsAndOffsets(
							modelRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 1,
							modelRoot.getChild( 1 ).getChild( 0 ).getChild( 1 ), 2
						) );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>foo</p>' +
						'[<table><tr><td>aaa</td><td>bbb</td></tr></table>]' +
						'<p>bar</p>'
					);
				} );

				it( 'should fix #5', () => {
					modelSetData( model, '' );

					const modelData = new ModelDocumentFragment( parse(
						'<paragraph>foo</paragraph>' +
						'<table><tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow></table>' +
						'<table><tableRow><tableCell>xxx</tableCell><tableCell>yyy</tableCell></tableRow></table>' +
						'<paragraph>baz</paragraph>',
						model.schema
					)._children );

					model.change( writer => {
						writer.insert( modelData, model.document.getRoot() );

						writer.setSelection( ModelRange.createFromParentsAndOffsets(
							modelRoot.getChild( 2 ), 0,
							modelRoot.getChild( 2 ), 0
						) );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>foo</p>' +
						'[<table><tr><td>aaa</td><td>bbb</td></tr></table>]' +
						'<table><tr><td>xxx</td><td>yyy</td></tr></table>' +
						'<p>baz</p>'
					);
				} );

				it( 'should not fix #1', () => {
					modelSetData( model, '' );

					const modelData = new ModelDocumentFragment( parse(
						'<paragraph>foo</paragraph>' +
						'<table><tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow></table>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph>baz</paragraph>',
						model.schema
					)._children );

					model.change( writer => {
						writer.insert( modelData, model.document.getRoot() );

						writer.setSelection( ModelRange.createFromParentsAndOffsets(
							modelRoot.getChild( 2 ), 1,
							modelRoot.getChild( 3 ), 2
						) );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>foo</p>' +
						'<table><tr><td>aaa</td><td>bbb</td></tr></table>' +
						'<p>b{ar</p>' +
						'<p>ba}z</p>'
					);
				} );

				it( 'should fix multiple ranges #1', () => {
					model.change( writer => {
						const ranges = [
							new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 1, 0 ] ) ),
							new ModelRange( new ModelPosition( modelRoot, [ 1, 0, 0, 0 ] ), new ModelPosition( modelRoot, [ 1, 1 ] ) )
						];
						writer.setSelection( ranges );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>f{oo</p>' +
						'<table><tr><td>aaa</td><td>bbb</td></tr></table>]' +
						'<p>bar</p>'
					);
				} );

				it( 'should fix multiple ranges #2', () => {
					model.change( writer => {
						const ranges = [
							new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 1, 0 ] ) ),
							new ModelRange( new ModelPosition( modelRoot, [ 1, 0, 0, 0 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) )
						];

						writer.setSelection( ranges );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>f{oo</p>' +
						'<table><tr><td>aaa</td><td>bbb</td></tr></table>' +
						'<p>ba}r</p>'
					);
				} );

				it( 'should fix multiple ranges #3', () => {
					modelSetData( model, '' );

					const modelData = new ModelDocumentFragment( parse(
						'<paragraph>foo</paragraph>' +
						'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'</table>' +
						'<paragraph>baz</paragraph>',
						model.schema
					)._children );

					model.change( writer => {
						writer.insert( modelData, model.document.getRoot() );

						const ranges = [
							new ModelRange( new ModelPosition( modelRoot, [ 1, 0, 0, 0 ] ), new ModelPosition( modelRoot, [ 1, 1 ] ) ),
							new ModelRange( new ModelPosition( modelRoot, [ 1, 1, 0, 0 ] ), new ModelPosition( modelRoot, [ 1, 2 ] ) ),
							new ModelRange( new ModelPosition( modelRoot, [ 1, 2, 0, 0 ] ), new ModelPosition( modelRoot, [ 1, 3 ] ) ),
							new ModelRange( new ModelPosition( modelRoot, [ 1, 3, 0, 0 ] ), new ModelPosition( modelRoot, [ 2, 1 ] ) )
						];

						writer.setSelection( ranges );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>foo</p>' +
						'[<table>' +
						'<tr><td>aaa</td><td>bbb</td></tr>' +
						'<tr><td>aaa</td><td>bbb</td></tr>' +
						'<tr><td>aaa</td><td>bbb</td></tr>' +
						'<tr><td>aaa</td><td>bbb</td></tr>' +
						'</table>' +
						'<p>b}az</p>'
					);
				} );

				it( 'should fix multiple ranges #4', () => {
					model.change( writer => {
						const ranges = [
							new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 1, 0 ] ) ),
							new ModelRange( new ModelPosition( modelRoot, [ 1, 0, 0, 0 ] ), new ModelPosition( modelRoot, [ 2, 1 ] ) ),
							new ModelRange( new ModelPosition( modelRoot, [ 2, 2 ] ), new ModelPosition( modelRoot, [ 2, 3 ] ) )
						];

						writer.setSelection( ranges );
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>f{oo</p>' +
						'<table><tr><td>aaa</td><td>bbb</td></tr></table>' +
						'<p>b}a{r}</p>'
					);
				} );
			} );

			describe( 'collapsed selection', () => {
				it( 'should fix #1', () => {
					model.change( writer => {
						writer.setSelection(
							ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 1 ), 0, modelRoot.getChild( 1 ), 0 )
						);
					} );

					expect( getViewData( editing.view ) ).to.equal(
						'<p>foo{}</p><table><tr><td>aaa</td><td>bbb</td></tr></table><p>bar</p>'
					);
				} );
			} );

			afterEach( () => {
				editing.destroy();
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should remove listenters', () => {
			const model = new Model();
			model.document.createRoot();
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			const editing = new EditingController( model );

			const spy = sinon.spy();

			editing.downcastDispatcher.on( 'insert:$element', spy );

			editing.destroy();

			model.change( writer => {
				const modelData = parse( '<paragraph>foo</paragraph>', model.schema ).getChild( 0 );

				writer.insert( modelData, model.document.getRoot() );
			} );

			expect( spy.called ).to.be.false;

			editing.destroy();
		} );

		it( 'should destroy view', () => {
			const model = new Model();
			model.document.createRoot();
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			const editing = new EditingController( model );

			const spy = sinon.spy( editing.view, 'destroy' );

			editing.destroy();

			expect( spy.called ).to.be.true;
		} );
	} );
} );
