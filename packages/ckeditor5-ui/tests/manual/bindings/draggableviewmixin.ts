/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { View } from '../../../src/index.js';
import DraggableViewMixin, { type DraggableView } from '../../../src/bindings/draggableviewmixin.js';

class DraggableTestView extends /* #__PURE__ */ DraggableViewMixin( View ) implements DraggableView {
	declare public top: number;
	declare public left: number;

	constructor() {
		super();

		const bind = this.bindTemplate;

		this.set( {
			top: 0,
			left: 0
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: 'draggable',
				style: {
					top: bind.to( 'top', value => `${ value }px` ),
					left: bind.to( 'left', value => `${ value }px` )
				}
			}
		} );

		this.on( 'drag', ( evt, data ) => {
			this.top += data.deltaY;
			this.left += data.deltaX;
		} );
	}
}

class DraggableByHandleView extends DraggableTestView {
	public render(): void {
		super.render();

		const dragHandle = document.createElement( 'div' );
		dragHandle.textContent = 'Handle to drag me!';
		this.element!.appendChild( dragHandle );
	}

	public override get dragHandleElement(): HTMLElement | null {
		if ( !this.element ) {
			return null;
		}

		return this.element.firstChild! as HTMLElement;
	}
}

class DraggableAsWholeView extends DraggableTestView {
	public render(): void {
		super.render();

		this.element!.textContent = 'Drag me!';
	}

	public override get dragHandleElement(): HTMLElement | null {
		if ( !this.element ) {
			return null;
		}

		return this.element;
	}
}

const draggableByHandleView = new DraggableByHandleView();
const draggableAsWholeView = new DraggableAsWholeView();

draggableByHandleView.top = 100;
draggableByHandleView.left = 100;
draggableAsWholeView.top = 100;
draggableAsWholeView.left = 420;

draggableByHandleView.render();
draggableAsWholeView.render();

document.body.appendChild( draggableByHandleView.element! );
document.body.appendChild( draggableAsWholeView.element! );
