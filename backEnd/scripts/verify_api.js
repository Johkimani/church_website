import axios from 'axios';

const baseUrl = 'http://localhost:3000/api/jumuiya-members';

async function runVerification() {
    try {
        console.log("Verifying St. Anthony Members...");
        const res1 = await axios.get(`${baseUrl}?jumuiya_id=st-anthony`);
        const anthonyMembers = res1.data.data.map(m => m.name);
        console.log("St. Anthony Members:", anthonyMembers);

        console.log("\nVerifying St. Augustine Members...");
        const res2 = await axios.get(`${baseUrl}?jumuiya_id=st-augustine`);
        const augustineMembers = res2.data.data.map(m => m.name);
        console.log("St. Augustine Members:", augustineMembers);

        console.log("\nVerifying Unregistered Members...");
        const res3 = await axios.get(`${baseUrl}/unregistered`);
        console.log("Unregistered Count:", res3.data.data.length);

        if (anthonyMembers.length > 0 && augustineMembers.length > 0 && anthonyMembers[0] !== augustineMembers[0]) {
            console.log("\nSUCCESS: Filtering is working correctly.");
        } else {
            console.warn("\nWARNING: Filtering might not be working as expected or data is empty.");
        }

    } catch (e) {
        console.error("Verification failed:", e.message);
    }
}

runVerification();
