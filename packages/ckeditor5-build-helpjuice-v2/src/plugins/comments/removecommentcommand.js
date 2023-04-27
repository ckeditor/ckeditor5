import Command from '@ckeditor/ckeditor5-core/src/command';

export default class RemoveCommentCommand extends Command {
    execute({ value }) {
        const editor = this.editor

        editor.model.enqueueChange({ isUndoable: false }, writer => {
            this._findComment(editor.model.document.getRoot(), value).forEach(el => {
                writer.removeAttribute('comment', el)
                writer.removeAttribute('italic', el)
            });
        })
    }

    _findComment(root, id) {
        let result = []

        if (root.getAttribute('comment') === id) {
            result.push(root)
            return result
        }

        if (!root.childCount) {
            return result
        }

        for (const child of root.getChildren()) {
            result.push(...this._findComment(child, id))
        }

        return result;
    }
}
