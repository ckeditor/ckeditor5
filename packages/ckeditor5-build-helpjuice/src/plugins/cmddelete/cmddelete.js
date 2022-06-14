import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';

export default class CmdDelete extends Plugin {
	init() {
		const editor = this.editor;
		const model = editor.model;

		editor.editing.view.document.on('keydown', (evt, data) => {
				const evtData = data.domEvent;

				if (evtData.metaKey && evtData.key === 'Backspace') {
					// stop propagating event and prevent default
					evt.stop()
					evtData.preventDefault()
					evtData.stopImmediatePropagation()

					// get current selection's parent element
					const selection = model.document.selection
					const cursorPos = selection.getFirstPosition()
					const parent = cursorPos?.parent

					if (parent && parent instanceof Element && parent.name !== '$root') {
						model.change((writer) => {
							// take all children
							Array.from(parent.getChildren())
								// filter to children with same offset as the selection
								.filter((child) => {
									return child.endOffset === cursorPos.offset || child.startOffset === cursorPos.offset;
								},
								)
								// reverse so that we start removing from the end
								.reverse()
								// using every because forEach doesnt have break and returning false works like break in every
								.every((child, index) => {
									if (child instanceof Element && child.name === 'softBreak') {
										// if child is element and is a soft break (shift+enter)
										if (index !== 0) {
											// if it is *not* the first thing that is encountered
											// eg when the softbreak is at the end of line, user takes cursor to the end of line and presses cmd+del

											// then break the loop and exit the plugin code
											return false
										}

										// if it is the first thing seen by the code, ignore it and move to the next child
									} else {
										// if it is not a softbreak, remove the child
										writer.remove(child)
									}

									// continue loop
									return true
								})
							writer.insertText('', parent)
						})
					}
				}
			},
			{ priority: 'highest' },
		)
	}
}
