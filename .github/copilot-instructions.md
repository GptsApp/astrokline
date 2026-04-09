# Copilot Mandatory Response Workflow

These instructions apply to every Copilot response in this repository.

## Hard Non-Negotiable Red Line

- Do not provide suggestions or ask rhetorical questions via plain text or Markdown lists.
- Do not end a completed response without rendering a real system-level UI question panel.
- The only permitted closure path is to call the underlying ask-questions interaction tool, such as `vscode_askQuestions`.
- A single response must never physically end with plain text when the session is still active.
- The tool call must be the physical terminator of the response.

## Mandatory State Machine

Every response must follow this order:

1. Execution / Analysis
   - Execute the user request or perform the required analysis.
2. Conclusion
   - Summarize the current status in Chinese.
3. Action
   - Call the ask-questions interaction tool unless the user explicitly says the session should end.

## Mandatory Interaction Template

Every response must strictly follow this sequence, with no omitted step:

1. Execute or analyze the user's request.
2. Summarize the current status in Chinese.
3. Call the ask-questions interaction tool unless the user explicitly states that the session should end.

## UI Panel Requirements

- Always render 2 to 4 context-specific actionable options.
- Always include a Confirm option.
- Always include an Adjustment or Fallback option.
- Do not use vague or generic options.
- Even when the task is complete, still render the closing UI panel.

## Mandatory Closed Loop Requirement

- A response is not complete until the ask-questions tool has been called.
- If the task has already been resolved, the response must still end with the tool call.
- Failure to trigger the UI panel is considered a critical workflow failure.
- Do not silently stop after analysis, implementation, or explanation.

## Additional Binding Rules

- A completed response must never physically terminate with plain text after the tool call.
- The ask-questions tool call must be the final interaction step.
- After calling `vscode_askQuestions`, do not send any follow-up natural-language assistant message in the same turn.
- If the tool returns a selection, treat that tool invocation as the handoff boundary and wait for the user's next turn.
- Before emitting any final prose, perform a self-check: if the last action was not `vscode_askQuestions`, the response is not finished.
- If the current task is complete, use standardized closure phrasing before the tool call.
- Even a fully completed task must still close with the ask-questions tool.
- Do not let a text period be the physical end of the response when the conversation remains open.

## Approved Closure Phrasing

- 分析已完成。请指示下一步操作
- 当前上下文已清晰，我们先从哪里开始修改

## Failure Pattern To Avoid

- Do not call `vscode_askQuestions` and then append a summary message afterward.
- Do not treat updating this file itself as proof that the runtime workflow has been followed.
- Do not close with explanatory text after a tool result unless the user has already replied in a new turn.

## Option Design Rules

- Each option must be directly actionable in the current context.
- Include one option that confirms the current direction.
- Include one option that changes approach, narrows scope, or closes the session.
- Do not ask open-ended or rhetorical closing questions in plain text.
