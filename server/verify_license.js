const axios = require('axios');

const API_URL = 'http://localhost:5000';
let projectId = null;
let publicId = null;
let licenseKey = null;
let licenseId = null;

async function run() {
    try {
        console.log('--- License System Verification ---');

        // 1. Get a Project
        console.log('\nScanning for project...');
        const projectsRes = await axios.get(`${API_URL}/api/projects`);
        if (projectsRes.data.length === 0) throw new Error('No projects found');
        projectId = projectsRes.data[0]._id;
        publicId = projectsRes.data[0].publicId;
        console.log(`Using Project: ${projectId} (${publicId})`);

        // 2. Generate License
        console.log('\nGenerating License...');
        const genRes = await axios.post(`${API_URL}/api/licenses/generate`, {
            projectId,
            holderName: 'Test User',
            email: 'test@example.com',
            type: 'lifetime'
        });
        licenseKey = genRes.data.key;
        licenseId = genRes.data._id;
        console.log(`Generated Key: ${licenseKey}`);

        // 3. Validate (First Use - Should Lock HWID)
        console.log('\nValidating (First Use - HWID: PC-1)...');
        const val1 = await axios.post(`${API_URL}/v1/validate-license`, {
            key: licenseKey,
            hwid: 'PC-1',
            publicId
        });
        console.log('Result:', val1.data);
        if (!val1.data.valid) throw new Error('First validation failed');

        // 4. Validate (Same HWID - Should Pass)
        console.log('\nValidating (Same HWID: PC-1)...');
        const val2 = await axios.post(`${API_URL}/v1/validate-license`, {
            key: licenseKey,
            hwid: 'PC-1',
            publicId
        });
        console.log('Result:', val2.data);
        if (!val2.data.valid) throw new Error('Same HWID validation failed');

        // 5. Validate (Different HWID - Should Fail)
        console.log('\nValidating (Different HWID: PC-2)...');
        try {
            await axios.post(`${API_URL}/v1/validate-license`, {
                key: licenseKey,
                hwid: 'PC-2',
                publicId
            });
            throw new Error('Different HWID validation SHOULD fail but passed');
        } catch (err) {
            console.log('Result (Expected Error):', err.response?.data?.message || err.message);
            if (err.response?.status !== 403) throw new Error('Expected 403 Forbidden');
        }

        // 6. Revoke License
        console.log('\nRevoking License...');
        await axios.patch(`${API_URL}/api/licenses/${licenseId}/revoke`);
        console.log('Revoked.');

        // 7. Validate (Revoked - Should Fail)
        console.log('\nValidating (Revoked)...');
        try {
            await axios.post(`${API_URL}/v1/validate-license`, {
                key: licenseKey,
                hwid: 'PC-1',
                publicId
            });
            throw new Error('Revoked license validation SHOULD fail but passed');
        } catch (err) {
            console.log('Result (Expected Error):', err.response?.data?.message || err.message);
        }

        console.log('\n--- VERIFICATION SUCCESSFUL ---');
    } catch (err) {
        console.error('\nXXX VERIFICATION FAILED XXX');
        console.error(err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err);
        }
    }
}

run();
