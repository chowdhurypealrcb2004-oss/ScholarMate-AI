process.env.NODE_ENV = 'test';
import http from 'http';
import app from './src/server.js';

console.log('--- Starting Audited Module 4 End-to-End API Test ---');

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const postJSON = (path, data) => {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(data);
      const req = http.request(
        `${baseUrl}${path}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(body) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: body });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  };

  try {
    // 1. Test POST /api/evaluate with complete eligible profile (Ayesha Rahman)
    const res1 = await postJSON('/api/evaluate', {
      name: 'Ayesha Rahman',
      department: 'CSE',
      cgpa: 3.85,
      gender: 'Female',
      needBased: true,
      hasPortfolio: true,
      hasVolunteerHours: true,
    });

    console.log(`[PASS] POST /api/evaluate status: ${res1.status}`);
    if (res1.status !== 200 || !res1.data.success) {
      throw new Error(`Expected 200 OK, got ${res1.status}`);
    }
    console.log(`[PASS] Evaluated Ayesha: ${res1.data.summary.eligibleCount} Eligible (81), ${res1.data.summary.potentiallyEligibleCount} Potentially Eligible (14), ${res1.data.summary.notEligibleCount} Ineligible (41)`);
    if (res1.data.summary.eligibleCount !== 81 || res1.data.summary.potentiallyEligibleCount !== 14 || res1.data.summary.notEligibleCount !== 41) {
      throw new Error(`Unexpected counts in E2E for Ayesha: ${res1.data.summary.eligibleCount}, ${res1.data.summary.potentiallyEligibleCount}, ${res1.data.summary.notEligibleCount}`);
    }
    console.log(`[PASS] AI Advisor context provided: ${Boolean(res1.data.aiAdvisorContext)}`);

    // 2A. Test POST /api/evaluate with missing-CGPA profile: Nusrat Jahan (BBA, Female, Need-Based)
    const res2A = await postJSON('/api/evaluate', {
      name: 'Nusrat Jahan',
      department: 'BBA',
      cgpa: '', // Missing CGPA
      gender: 'Female',
      needBased: true,
    });

    console.log(`[PASS] Nusrat (BBA, Female, Need-Based, Missing CGPA): Potentially Eligible = ${res2A.data.summary.potentiallyEligibleCount} (Expected: 81)`);
    if (res2A.data.summary.potentiallyEligibleCount !== 81) {
      throw new Error(`Expected 81 for Nusrat missing CGPA, got ${res2A.data.summary.potentiallyEligibleCount}`);
    }

    // 2B. Test POST /api/evaluate with missing-CGPA profile: Tanvir Hossain (EEE, Male, Merit-Only)
    const res2B = await postJSON('/api/evaluate', {
      name: 'Tanvir Hossain',
      department: 'EEE',
      cgpa: '', // Missing CGPA
      gender: 'Male',
      needBased: false,
    });

    console.log(`[PASS] Tanvir (EEE, Male, Merit-Only, Missing CGPA): Potentially Eligible = ${res2B.data.summary.potentiallyEligibleCount} (Expected: 47)`);
    if (res2B.data.summary.potentiallyEligibleCount !== 47) {
      throw new Error(`Expected 47 for Tanvir missing CGPA, got ${res2B.data.summary.potentiallyEligibleCount}`);
    }

    // 3. Test POST /api/evaluate with ineligible profile (Karim Ullah)
    const res3 = await postJSON('/api/evaluate', {
      name: 'Karim Ullah',
      department: 'English',
      cgpa: 2.10,
      gender: 'Male',
      needBased: false,
    });

    console.log(`[PASS] Ineligible profile evaluated: ${res3.data.summary.eligibleCount} Eligible (0), ${res3.data.summary.notEligibleCount} Not Eligible (136)`);
    if (res3.data.summary.eligibleCount !== 0 || res3.data.summary.notEligibleCount !== 136) {
      throw new Error('Ineligible profile should have 0 eligible scholarships and 136 ineligible');
    }

    // 4. Test validation rejection for completely malformed payload
    const res4 = await postJSON('/api/evaluate', {
      name: '',
      department: 'UNKNOWN',
      gender: 'INVALID',
    });

    console.log(`[PASS] Invalid payload rejected with status: ${res4.status}`);
    if (res4.status !== 400 || res4.data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res4.status}`);
    }

    // 5. Test existing Module 3 POST /api/match backward compatibility
    const res5 = await postJSON('/api/match', {
      name: 'Tanvir Hossain',
      department: 'EEE',
      cgpa: 3.55,
      gender: 'Male',
      needBased: false,
    });

    console.log(`[PASS] Existing POST /api/match status: ${res5.status}`);
    if (res5.status !== 200 || !res5.data.success) {
      throw new Error(`Expected 200 OK for /api/match, got ${res5.status}`);
    }

    console.log('\n--- ALL AUDITED END-TO-END API TESTS PASSED SUCCESSFULLY! ---');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('[FAIL] End-to-end API test error:', err);
    process.exit(1);
  }
});
