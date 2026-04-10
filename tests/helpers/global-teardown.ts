import { generateReport } from './report';

export default async function globalTeardown() {
  try {
    generateReport();
  } catch (e) {
    console.error('Failed to generate comparison report:', e);
  }
}
