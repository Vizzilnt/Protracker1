
/**
 * Email Service
 * Handles the logic for sending emails.
 * Can switch between a "Simulation Mode" (frontend only) and "Real Mode" (connecting to backend_server_example.js).
 */

// CONFIGURATION
// Set this to true when you have the backend_server_example.js running
const USE_REAL_BACKEND = false; 
const BACKEND_URL = 'http://localhost:3000/api/send-otp';

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
    
    if (USE_REAL_BACKEND) {
        // --- REAL BACKEND MODE ---
        try {
            console.log(`Connecting to backend at ${BACKEND_URL}...`);
            
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                return true;
            } else {
                console.error('Backend Error:', data.message);
                throw new Error(data.message || 'Failed to send email');
            }
        } catch (error) {
            console.error('Network Error:', error);
            // Fallback to simulation if backend is down, just so the user isn't stuck
            console.warn('Falling back to simulation mode due to connection error.');
            return await simulateEmailSend(email, otp);
        }
    } else {
        // --- SIMULATION MODE ---
        return await simulateEmailSend(email, otp);
    }
};

const simulateEmailSend = async (email: string, otp: string): Promise<boolean> => {
    console.group("📧 [Email Service Simulation]");
    console.log("Connecting to SMTP Server: mail.vizzil.net (Simulated)");
    console.log(`Authentication: info@vizzil.net`);
    console.log(`Sending to: ${email}`);
    console.log(`Subject: Reset Your Password`);
    console.log(`Content: Your OTP is ${otp}`);
    console.groupEnd();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return true;
};
