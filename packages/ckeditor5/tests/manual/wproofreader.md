# Wproofreader

Proofreader requires a valid license to work, otherwise it returns 403. Read on the [dev KB article](https://github.com/cksource/ckeditor5-knowledge-base/blob/master/testing-phase.md#wproofreader-samplemanual-test) to set it up locally.

Note: the plugin starts checking only **after focusing** the editor.

## Inline typo correction

1. Focus the editor.
1. Wait until typos are indicated.
1. Hover mouse cursor over "witth".
1. Pick "with" from appearing context menu.

## Inline grammar correction

1. Focus the editor.
1. Wait until typos are indicated.
1. Hover mouse cursor over (the first) "However".
1. Pick "However," from appearing context menu.

## Dialog checking

1. Focus the editor.
1. Hover a spell check icon in the bottom-right corner of the editable.
1. Click "Proofread in dialog" option.
1. Use it to fix a typo.
