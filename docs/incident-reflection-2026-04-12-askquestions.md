# Incident Reflection 2026-04-12

## What Went Wrong

The workflow stopped after an option-based interaction instead of continuing the authorized work.

Later in the same date, the assistant repeated a related accessibility failure by drifting back to plain chat text instead of ending through `vscode_askQuestions`.

Two concrete mistakes happened:

- an empty final message was emitted after an ask-questions interaction
- a returned option was treated like a stop point instead of a continue signal
- a later response about completed work/rule updates still ended as plain chat text instead of an ask-questions interaction

For this user, both are high-severity communication failures because the user has reading difficulties and explicitly prefers short option-based interaction instead of freeform back-and-forth.

## Root Cause

The response pattern was treated too mechanically:

- ask-questions was used
- but the answer from ask-questions was not treated as new actionable input inside the same turn
- and the rule was interpreted too narrowly, as if only "next-step choices" required ask-questions while apology/reflection/update messages did not

That created a false stop.

## Why This Is Bad

- it looks like the assistant paused or froze
- it forces the user to recover context manually
- it breaks the accessibility rule that the final interaction should be short, clear, and directed
- it wastes the user’s selection because the chosen option should have immediately driven the next action

## Hard Rules Added

- Never send an empty, blank, or placeholder final message after `vscode_askQuestions`.
- If `vscode_askQuestions` already returns a clear choice in the same turn, continue the work immediately.
- Do not stop after option selection unless the task is actually complete.
- Keep long explanations in markdown and use short ask-questions prompts for the user-facing end.
- Apply the same ask-questions ending rule to apology, reflection, and "rules updated" responses.
- If the user reports a communication/accessibility violation, update persistent instructions and memory before doing other work.

## Expected Behavior Going Forward

Correct pattern:

1. Do the work.
2. If a choice is needed, use `vscode_askQuestions`.
3. If the tool returns an answer immediately, keep working in the same turn.
4. Only stop when the task is truly complete or genuinely blocked.