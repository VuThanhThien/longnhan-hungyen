import { Logger } from '@nestjs/common';

const DEFAULT_MAX_CHARS = 48_000;

const logger = new Logger('TruncateForLlm');

export function truncateForLlm(
  text: string,
  maxChars = DEFAULT_MAX_CHARS,
): string {
  if (text.length <= maxChars) {
    return text;
  }

  logger.warn(
    `Truncating markdown from ${text.length} to ${maxChars} chars for LLM input`,
  );

  return text.slice(0, maxChars);
}
