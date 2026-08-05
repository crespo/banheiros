type PinSubmission = { type: "pin"; name: string; address: string };

export function extractText(submission: PinSubmission): string {
  return `${submission.name} ${submission.address}`;
}
