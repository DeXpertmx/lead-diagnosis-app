const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('RESEND_API_KEY not found in .env.local');
        return;
    }

    const resend = new Resend(apiKey);
    const consultantEmail = process.env.CONSULTANT_EMAIL || 'hvcab@hotmail.com';

    console.log('Testing Resend with API Key:', apiKey.substring(0, 10) + '...');
    console.log('Target email:', consultantEmail);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Volkern Test <onboarding@resend.dev>',
            to: [consultantEmail],
            subject: 'Test Email from Volkern Diagnosis App',
            html: '<p>If you receive this, Resend is working correctly!</p>'
        });

        if (error) {
            console.error('Resend Error:', error);
        } else {
            console.log('Resend Success!', data);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testResend();
