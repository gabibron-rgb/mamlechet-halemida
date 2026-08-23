export function studentTitleDisplayLabel(labelHe: string): string {
  const clean = labelHe.trim();
  const quoted = clean.match(/^התואר\s+[“\"](.+)[”\"]$/);
  if (quoted?.[1]) return quoted[1].trim();

  return clean.replace(/^התואר\s+/, '').replace(/^[“\"]|[”\"]$/g, '').trim();
}
