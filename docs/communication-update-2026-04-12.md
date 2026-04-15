# Communication Update 2026-04-12

## What Changed

- Strengthened the personal instruction layer so long explanations should not end as plain chat text.
- Added a hard rule: if the explanation is longer than a short summary, write it to markdown and continue with `vscode_askQuestions`.
- Added a hard rule: do not ask vague filler questions like `如果你要，我可以...`.
- Added a hard rule: prefer option-based `vscode_askQuestions` over asking the user to type long replies.
- Added a harder clarification: apology, reflection, and "rules updated" responses must also end through `vscode_askQuestions`, not plain text.
- Added a harder clarification: if the user reports a communication/accessibility failure, update instruction and memory layers first.
- Synced the same constraints into long-term memory.
- Added a workspace reference file so future long explanations can be moved into markdown consistently.

## Files Updated

- Personal instruction layer outside the workspace
- Long-term memory outside the workspace
- [docs/copilot-user-communication-rules.md](docs/copilot-user-communication-rules.md)

## Behavior Expected Going Forward

- Short in-chat summary only
- Long details go to markdown
- End with `vscode_askQuestions`
- Give direct options instead of asking for open-ended text