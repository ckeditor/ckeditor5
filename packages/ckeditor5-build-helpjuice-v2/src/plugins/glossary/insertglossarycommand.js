import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertGlossaryCommand extends Command {
    execute({ id, definition, upvotes = '', downvotes = '', userid = '', username = '', range }) {
        const editor = this.editor
        const selection = editor.model.document.selection

        editor.model.enqueueChange({ isUndoable: false }, writer => {
			if (range) {
				this.createGlossaryAttribute(writer, id, definition, upvotes, downvotes, userid, username, range);
			} else {
				const ranges = editor.model.schema.getValidRanges(selection.getRanges(), 'glossary');
				for (const range of ranges) {
					this.createGlossaryAttribute(writer, id, definition, upvotes, downvotes, userid, username, range);
				}
			}
        })
    }

    refresh() {
        const model = this.editor.model
        const selection = model.document.selection
        this.isEnabled = !selection.isCollapsed
    }

	createGlossaryAttribute(writer, id, definition, upvotes, downvotes, userid, username, range) {
		writer.setAttribute('glossary', {
			class: 'hj-glossary-item',
			id: id,
			definition: definition,
			upvotes: upvotes,
			downvotes: downvotes,
			userid: userid,
			username: username
		}, range);
	}
}
