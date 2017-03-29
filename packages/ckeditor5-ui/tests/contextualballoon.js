/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ContextualBalloon from '../src/contextualballoon';
import BalloonPanelView from '../src/panel/balloon/balloonpanelview';
import View from '../src/view';
import Template from '../src/template';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'ContextualBalloon', () => {
	let balloon, viewA, viewB;

	beforeEach( () => {
		balloon = new ContextualBalloon();
		balloon.view = new BalloonPanelView();

		viewA = new ViewA();
		viewB = new ViewB();

		// We don't need to test attachTo method of BalloonPanel it's enough to check if was called with proper data.
		sinon.stub( balloon.view, 'attachTo', () => {} );
	} );

	afterEach( () => {
		balloon.view.attachTo.restore();
	} );

	describe( 'isPanelInStack()', () => {
		it( 'should return true when panel of given view is in stack', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			expect( balloon.isPanelInStack( viewA ) ).to.true;
		} );

		it( 'should return true when panel of given view is in stack but is not visible', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			expect( balloon.visible.view === viewB ).to.true;
			expect( balloon.isPanelInStack( viewA ) ).to.true;
		} );

		it( 'should return false when panel of given view is not in stack', () => {
			expect( balloon.isPanelInStack( viewA ) ).to.false;
		} );
	} );

	describe( 'add()', () => {
		it( 'should add panel to the stack and display in balloon', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			expect( balloon.view.content.length ).to.equal( 1 );
			expect( balloon.view.content.get( 0 ) ).to.deep.equal( viewA );
			expect( balloon.view.attachTo.calledOnce ).to.true;
			expect( balloon.view.attachTo.firstCall.args[ 0 ] ).to.deep.equal( { target: 'fake' } );
		} );

		it( 'should throw an error when try to add the same panel more than once', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			expect( () => {
				balloon.add( {
					view: viewA,
					position: { target: 'fake' }
				} );
			} ).to.throw( CKEditorError, /^contextualballoon-add-panel-exist/ );
		} );

		it( 'should add multiple panels to he stack and display last one', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			expect( balloon.view.content.length ).to.equal( 1 );
			expect( balloon.view.content.get( 0 ) ).to.deep.equal( viewB );
		} );

		it( 'should add multiple panels to the stack and keep balloon in the same position', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake', foo: 'bar' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake', bar: 'biz' }
			} );

			expect( balloon.view.attachTo.calledTwice ).to.true;

			expect( balloon.view.attachTo.firstCall.args[ 0 ] ).to.deep.equal( {
				target: 'fake',
				foo: 'bar'
			} );

			expect( balloon.view.attachTo.secondCall.args[ 0 ] ).to.deep.equal( {
				target: 'fake',
				foo: 'bar'
			} );
		} );
	} );

	describe( 'visible', () => {
		it( 'should return data of currently visible panel', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			expect( balloon.visible ).to.deep.equal( {
				view: viewA,
				position: { target: 'fake' }
			} );
		} );

		it( 'should return data of currently visible panel when there is more than one in the stack', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			expect( balloon.visible ).to.deep.equal( {
				view: viewB,
				position: { target: 'fake' }
			} );
		} );

		it( 'should return `null` when the stack is empty', () => {
			expect( balloon.visible ).to.null;
		} );
	} );

	describe( 'remove()', () => {
		it( 'should remove panel of given view and hide balloon when there is no other panel to display', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.remove( viewA );

			expect( balloon.visible ).to.null;
		} );

		it( 'should remove panel of given view and set previous in the stack as visible when removed panel was visible', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			balloon.remove( viewB );

			expect( balloon.visible ).to.deep.equal( {
				view: viewA,
				position: { target: 'fake' }
			} );
		} );

		it( 'should remove given panel from the stack when panel is not visible', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			balloon.remove( viewA );

			expect( balloon.visible ).to.deep.equal( {
				view: viewB,
				position: { target: 'fake' }
			} );
		} );

		it( 'should throw an error when there is no panel of given view in the stack', () => {
			expect( () => {
				balloon.remove( viewA );
			} ).to.throw( CKEditorError, /^contextualballoon-remove-panel-not-exist/ );
		} );
	} );

	describe( 'updatePosition()', () => {
		it( 'should attach balloon to the target using the same position options as currently set', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.view.attachTo.reset();

			balloon.updatePosition();

			expect( balloon.view.attachTo.calledOnce );
			expect( balloon.view.attachTo.firstCall.args[ 0 ] ).to.deep.equal( { target: 'fake' } );
		} );

		it( 'should attach balloon to the target using the same position options as currently set when there is more than one panel', () => {
			balloon.add( {
				view: viewA,
				position: {
					target: 'fake',
					foo: 'bar'
				}
			} );

			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					bar: 'biz'
				}
			} );

			balloon.view.attachTo.reset();

			balloon.updatePosition();

			expect( balloon.view.attachTo.calledOnce );
			expect( balloon.view.attachTo.firstCall.args[ 0 ] ).to.deep.equal( {
				target: 'fake',
				foo: 'bar'
			} );
		} );

		it( 'should remove given panel from the stack when panel is not visible', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			balloon.remove( viewA );

			expect( balloon.visible ).to.deep.equal( {
				view: viewB,
				position: { target: 'fake' }
			} );
		} );

		it( 'should throw an error when there is no panel of given view in the stack', () => {
			expect( () => {
				balloon.remove( viewA );
			} ).to.throw( CKEditorError, /^contextualballoon-remove-panel-not-exist/ );
		} );
	} );
} );

class ViewA extends View {
	constructor( locale ) {
		super( locale );

		this.template = new Template( {
			tag: 'div'
		} );
	}
}

class ViewB extends View {
	constructor( locale ) {
		super( locale );

		this.template = new Template( {
			tag: 'div'
		} );
	}
}
