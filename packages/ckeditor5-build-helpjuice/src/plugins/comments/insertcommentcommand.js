import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertCommentCommand extends Command {
    execute({ value }) {
        const editor = this.editor
        const selection = editor.model.document.selection

        editor.model.enqueueChange({ isUndoable: false }, writer => {
            const ranges = editor.model.schema.getValidRanges(selection.getRanges(), 'comment')

            for (const range of ranges) {
                writer.setAttribute('italic', true, range)
                writer.setAttribute('comment', value, range)
            }
        })
    }

    refresh() {
        const model = this.editor.model
        const selection = model.document.selection

        this.isEnabled = !selection.isCollapsed
    }
}
