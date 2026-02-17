/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    if (!email || email.trim() === '') return false;

    // Standard email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validate priority is a number between 1 and 10
 */
export function validatePriority(value: string): boolean {
    if (!value || value.trim() === '') return false;

    const num = parseInt(value.trim(), 10);
    return !isNaN(num) && num >= 1 && num <= 10;
}

/**
 * Validate required field is not empty
 */
export function validateRequired(value: string): boolean {
    return value !== undefined && value.trim().length > 0;
}

/**
 * Validate phone number format (optional field)
 * Accepts international format with country code
 */
export function validatePhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return true; // Optional field

    // Remove spaces and dashes for validation
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Must start with + and have at least 8 digits
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    return phoneRegex.test(cleaned);
}
