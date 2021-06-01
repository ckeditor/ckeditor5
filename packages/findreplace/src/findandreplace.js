import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FindAndReplaceUI from "./findandreplaceui";
import FindAndReplaceEditing from "./findandreplaceediting";
import FindAndReplaceFormEditing from "./findandreplaceformediting";

export default class FindAndReplace extends Plugin {
  static get requires() {
    return [FindAndReplaceUI, FindAndReplaceEditing, FindAndReplaceFormEditing];
  }

  static get pluginName() {
    return "FindAndReplace";
  }
}
