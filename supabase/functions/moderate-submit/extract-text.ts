type PinSubmission = { type: "pin"; name: string; address: string };
type ReviewSubmission = { type: "review"; comment: string };

export function extractText(submission: PinSubmission | ReviewSubmission): string {
  if (submission.type === "pin") return `${submission.name} ${submission.address}`;
  return submission.comment;
}
