import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { COMMAND_NAME } from "./findandreplaceui";
import FindAndReplaceCommand from "./findandreplacecommand";

export default class FindAndReplaceEditing extends Plugin {
  init() {
    const { editor } = this;

    editor.commands.add(COMMAND_NAME, new FindAndReplaceCommand(editor));
  }
}
