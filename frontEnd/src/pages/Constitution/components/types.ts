export interface ConstitutionReaderProps {
  /**
   * Notifies the parent when the reader leaves the cover letter.
   * `true`  -> the reader is past the cover (focus mode)
   * `false` -> the reader is back on the cover letter
   */
  onReadingChange?: (isReading: boolean) => void;
}
