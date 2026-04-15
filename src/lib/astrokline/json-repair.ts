function buildBalancedJsonCandidate(input: string): string {
  let normalized = '';
  const stack: Array<'{' | '['> = [];
  let inString = false;
  let escaping = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inString) {
      if (escaping) {
        normalized += char;
        escaping = false;
        continue;
      }

      if (char === '\\') {
        normalized += char;
        escaping = true;
        continue;
      }

      if (char === '"') {
        normalized += char;
        inString = false;
        continue;
      }

      if (char === '\n' || char === '\r') {
        normalized += '\\n';
        continue;
      }

      normalized += char;
      continue;
    }

    if (char === '"') {
      normalized += char;
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(char);
      normalized += char;
      continue;
    }

    if (char === '}' || char === ']') {
      const top = stack[stack.length - 1];
      const isMatchingCloser = (char === '}' && top === '{') || (char === ']' && top === '[');

      if (isMatchingCloser) {
        stack.pop();
        normalized += char;
      }
      continue;
    }

    normalized += char;
  }

  if (escaping) {
    normalized = normalized.slice(0, -1);
  }

  if (inString) {
    normalized += '"';
  }

  let balanced = normalized
    .replace(/,\s*$/u, '')
    .replace(/,\s*([}\]])/gu, '$1');

  while (stack.length > 0) {
    balanced += stack.pop() === '{' ? '}' : ']';
  }

  return balanced.replace(/,\s*([}\]])/gu, '$1');
}

function findTailTrimIndex(input: string): number | null {
  const trimmedInput = input.trimEnd();
  const danglingOpenerMatch = trimmedInput.match(/[[{]\s*$/u);
  let inString = false;
  let escaping = false;
  let rootIndex = -1;
  let lastCommaIndex = -1;
  const openerIndexes: number[] = [];

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }

      if (char === '\\') {
        escaping = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      if (rootIndex === -1) {
        rootIndex = index;
      }
      openerIndexes.push(index);
      continue;
    }

    if (char === ',') {
      lastCommaIndex = index;
    }
  }

  if (danglingOpenerMatch && openerIndexes.length > 1) {
    return openerIndexes[openerIndexes.length - 1];
  }

  if (lastCommaIndex !== -1) {
    return lastCommaIndex + 1;
  }

  if (openerIndexes.length > 1) {
    return openerIndexes[openerIndexes.length - 1];
  }

  if (rootIndex !== -1) {
    return rootIndex + 1;
  }

  return null;
}

function findMismatchedCloserTrimIndex(input: string): number | null {
  const trimmedInput = input.trimEnd();
  const stack: Array<{ char: '{' | '['; index: number }> = [];
  let inString = false;
  let escaping = false;

  for (let index = 0; index < trimmedInput.length; index += 1) {
    const char = trimmedInput[index];

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }

      if (char === '\\') {
        escaping = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push({ char, index });
      continue;
    }

    if (char === '}' || char === ']') {
      const top = stack[stack.length - 1];
      const isMatchingCloser =
        (char === '}' && top?.char === '{') || (char === ']' && top?.char === '[');

      if (isMatchingCloser) {
        stack.pop();
        continue;
      }

      if (top) {
        return top.index;
      }
    }
  }

  return null;
}

export function repairTruncatedJsonText(input: string): string {
  const text = input.trim();
  if (!text) {
    return text;
  }

  let candidate = text;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const mismatchedCloserTrimIndex = findMismatchedCloserTrimIndex(candidate);
    if (mismatchedCloserTrimIndex !== null && mismatchedCloserTrimIndex < candidate.length) {
      candidate = candidate.slice(0, mismatchedCloserTrimIndex).trimEnd();
    }

    const trimmedCandidate = candidate.trimEnd();
    if (/[[{]\s*$/u.test(trimmedCandidate)) {
      const trimIndex = findTailTrimIndex(candidate);
      if (trimIndex !== null && trimIndex < trimmedCandidate.length) {
        candidate = candidate.slice(0, trimIndex).trimEnd();
      }
    }

    const balanced = buildBalancedJsonCandidate(candidate);

    try {
      JSON.parse(balanced);
      return balanced;
    } catch {
      const trimIndex = findTailTrimIndex(candidate);
      if (trimIndex === null || trimIndex >= candidate.length) {
        break;
      }
      candidate = candidate.slice(0, trimIndex).trimEnd();
    }
  }

  const trimIndex = findTailTrimIndex(text);
  const fallback = buildBalancedJsonCandidate(
    trimIndex === null ? text : text.slice(0, trimIndex).trimEnd()
  );

  JSON.parse(fallback);
  return fallback;
}