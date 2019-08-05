/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolistutils
 */

/* global document */

export function addTodoElementsToListItem( viewWriter, viewItem, modelItem, model ) {
	const isChecked = !!modelItem.getAttribute( 'listChecked' );

	viewWriter.addClass( 'todo-list', viewItem.parent );

	viewWriter.insert(
		viewWriter.createPositionAt( viewItem, 0 ),
		createCheckMarkElement( isChecked, viewWriter, isChecked => {
			model.change( writer => writer.setAttribute( 'listChecked', isChecked, modelItem ) );
		} )
	);
}

export function removeTodoElementsFromListItem( viewWriter, viewItem, modelItem, model ) {
	viewWriter.removeClass( 'todo-list', viewItem.parent );
	viewWriter.remove( viewItem.getChild( 0 ) );
	model.change( writer => writer.removeAttribute( 'listChecked', modelItem ) );
}

export function createCheckMarkElement( isChecked, viewWriter, onChange ) {
	const uiElement = viewWriter.createUIElement(
		'label',
		{
			class: 'todo-list__checkmark',
			contenteditable: false
		},
		function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			const checkbox = document.createElement( 'input' );

			checkbox.type = 'checkbox';
			checkbox.checked = isChecked;
			checkbox.addEventListener( 'change', evt => onChange( evt.target.checked ) );
			domElement.appendChild( checkbox );

			return domElement;
		}
	);

	if ( isChecked ) {
		viewWriter.addClass( 'todo-list__checkmark_checked', uiElement );
	}

	return uiElement;
}
