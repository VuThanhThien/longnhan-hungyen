import { truncateForLlm } from './truncate-for-llm.util';

describe('truncateForLlm', () => {
  it('returns text unchanged when under limit', () => {
    const text = 'hello world';
    expect(truncateForLlm(text, 100)).toBe(text);
  });

  it('truncates text over limit', () => {
    const text = 'a'.repeat(100);
    expect(truncateForLlm(text, 50)).toBe('a'.repeat(50));
  });
});
