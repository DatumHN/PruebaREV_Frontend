import { MUSEO_SANS_FONT_FAMILY, MUSEO_SANS_WEIGHTS } from './shared-fonts';

describe('SharedFonts', () => {
  it('should export font constants', () => {
    expect(MUSEO_SANS_FONT_FAMILY).toBeDefined();
    expect(MUSEO_SANS_WEIGHTS).toBeDefined();
  });
});
