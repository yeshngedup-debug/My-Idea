/**
 * Agreement template download — generates a simple PDF on the fly.
 * GET /founder/shortlists/agreement
 */
import { buildPdf } from '@/lib/pdf';

const TITLE = 'SHORTLIST SERVICE AGREEMENT (TEMPLATE)';

const LINES = [
  'This template is provided for the MVP. Edit the placeholders and confirm',
  'terms with both parties before use. This is not legal advice.',
  '',
  '1. PARTIES',
  '   Service Provider: Bhutan Tech Connect ("the Platform")',
  '   Client: [Founder Name], [Startup Name] ("the Client")',
  '   Date: [Date]',
  '',
  '2. SERVICE',
  '   The Platform will provide the Client a manually curated and ranked',
  '   shortlist of verified college students matching the requirements of',
  '   [Project Title / general hiring needs].',
  '',
  '3. PACKAGE AND FEE',
  '   Package selected: [Basic / Full Support]',
  '   Fee: Nu [Amount], payable by bank transfer or mBoB to',
  '   Bhutan Tech Connect before delivery of the shortlist.',
  '',
  '4. DELIVERY',
  '   The shortlist (student names, skills, college, contact email and CV',
  '   links) will be delivered within 2 working days of payment confirmation.',
  '',
  '5. HIRING AND PAYMENT TO STUDENTS',
  '   Any engagement, contract, and payment between the Client and a',
  '   shortlisted student is arranged directly between those parties.',
  '   The Platform is not a party to that engagement.',
  '',
  '6. CONFIDENTIALITY',
  '   Student information shared in the shortlist is for hiring evaluation',
  '   only and must not be redistributed or published.',
  '',
  '7. REPLACEMENT (FULL SUPPORT ONLY)',
  '   If a shortlisted student becomes unavailable, the Platform will',
  '   provide one replacement student at no extra cost.',
  '',
  '8. TERMINATION',
  '   Either party may cancel in writing before delivery of the shortlist;',
  '   fees already paid for delivered work are non-refundable.',
  '',
  '9. SIGNATURES',
  '   Platform: ______________________  Date: ____________',
  '   Client:   ______________________  Date: ____________',
];

export async function GET() {
  const pdf = buildPdf(TITLE, LINES);

  return new Response(pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="shortlist-agreement-template.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
