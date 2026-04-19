import {
  buildPublicReviewerLabel,
  looksLikeVietnamPhoneNumber,
  maskDisplayNameForReview,
  maskPhoneForReviewDisplay,
  normalizeVietnamPhone,
} from './review-public-label.util';

describe('normalizeVietnamPhone', () => {
  it('strips non-digits and maps 84 prefix to 0', () => {
    expect(normalizeVietnamPhone('84901234567')).toBe('0901234567');
    expect(normalizeVietnamPhone('090-123 45 67')).toBe('0901234567');
  });
});

describe('maskPhoneForReviewDisplay', () => {
  it('masks as first3 + *** + last3', () => {
    expect(maskPhoneForReviewDisplay('0901234567')).toBe('090***567');
    expect(maskPhoneForReviewDisplay('84901234567')).toBe('090***567');
  });
});

describe('maskDisplayNameForReview', () => {
  it('short names use *** + last char', () => {
    expect(maskDisplayNameForReview('An')).toBe('***n');
    expect(maskDisplayNameForReview('abcd')).toBe('***d');
  });

  it('longer names use prefix + *** + suffix', () => {
    expect(maskDisplayNameForReview('Nguyễn Văn Anh')).toBe('Ngu***nh');
  });
});

describe('buildPublicReviewerLabel', () => {
  it('returns anonymous label', () => {
    expect(
      buildPublicReviewerLabel({
        isAnonymous: true,
        displayName: 'Ignored',
        orderPhone: '0901234567',
      }),
    ).toBe('Ẩn danh');
  });

  it('combines masked name and phone', () => {
    expect(
      buildPublicReviewerLabel({
        isAnonymous: false,
        displayName: 'Nguyễn Văn Anh',
        orderPhone: '0901234567',
      }),
    ).toBe('Ngu***nh (090***567)');
  });
});

describe('looksLikeVietnamPhoneNumber', () => {
  it('detects digit-heavy strings', () => {
    expect(looksLikeVietnamPhoneNumber('0901234567')).toBe(true);
    expect(looksLikeVietnamPhoneNumber('Nguyễn')).toBe(false);
  });
});
