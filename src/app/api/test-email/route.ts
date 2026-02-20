import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';

export async function GET() {
    try {
        const consultantEmail = process.env.CONSULTANT_EMAIL || 'hvcab@hotmail.com';

        console.log(`[Test] Sending test email to ${consultantEmail}...`);

        await sendEmail({
            to: consultantEmail,
            subject: 'Volkern Diagnosis - TEST EMAIL',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1>Prueba de Resend</h1>
                    <p>Si recibes esto, la configuración de Resend en <strong>lead-diagnosis-app</strong> está funcionando correctamente.</p>
                    <p>Fecha: ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: `Test email sent to ${consultantEmail}`
        });
    } catch (error) {
        console.error('[Test Error]', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
