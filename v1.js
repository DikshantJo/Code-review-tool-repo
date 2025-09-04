/**
 * Generates a random token with specified options
 * @param {Object} options - Configuration options
 * @param {number} options.length - Length of the token (default: 32)
 * @param {boolean} options.includeUppercase - Include uppercase letters (default: true)
 * @param {boolean} options.includeLowercase - Include lowercase letters (default: true)
 * @param {boolean} options.includeNumbers - Include numbers (default: true)
 * @param {boolean} options.includeSpecialChars - Include special characters (default: false)
 * @returns {string} Generated random token
 */ 
asdasdasdkahfsjdhfasf
asdasdasdasdasd
function generateToken(options = {}) {
    const {/**
 * Generates a random token with specified options
 * @param {Object} options - Configuration options
 * @param {number} options.length - Length of the token (default: 32)
 * @param {boolean} options.includeUppercase - Include uppercase letters (default: true)
 * @param {boolean} options.includeLowercase - Include lowercase letters (default: true)
 * @param {boolean} options.includeNumbers - Include numbers (default: true)
 * @param {boolean} options.includeSpecialChars - Include special characters (default: false)
 * @returns {string} Generated random token
 */ 
asdasdasdkahfsjdhfasf
asdasdasdasdasd
function generateToken(options = {}) {
    const {
        length = 32,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSpecialChars = false
    } = options;

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUppercase) chars += uppercaseChars;
    if (includeLowercase) chars += lowercaseChars;
    if (includeNumbers) chars += numberChars;
    if (includeSpecialChars) chars += specialChars;

    if (chars === '') {
        throw new Error('At least one character set must be included');
    }

    let token = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        token += chars[array[i] % chars.length];
    }

    return token;
}

// Example usage:
console.log('Default token (32 chars):', generateToken());
console.log('Short numeric token:', generateToken({ length: 6, includeUppercase: false, includeLowercase: false, includeSpecialChars: false }));
console.log('Secure token with special chars:', generateToken({ length: 16, includeSpecialChars: true }));

        length = 32,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSpecialChars = false
    } = options;

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUppercase) chars += uppercaseChars;
    if (includeLowercase) chars += lowercaseChars;
    if (includeNumbers) chars += numberChars;
    if (includeSpecialChars) chars += specialChars;

    if (chars === '') {
        throw new Error('At least one character set must be included');
    }

    let token = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        token += chars[array[i] % chars.length];
    }

    return token;
}

// Example usage:
console.log('Default token (32 chars):', generateToken());
console.log('Short numeric token:', generateToken({ length: 6, includeUppercase: false, includeLowercase: false, includeSpecialChars: false }));
console.log('Secure token with special chars:', generateToken({ length: 16, includeSpecialChars: true }));

/**
 * Generates a random token with specified options
 * @param {Object} options - Configuration options
 * @param {number} options.length - Length of the token (default: 32)
 * @param {boolean} options.includeUppercase - Include uppercase letters (default: true)
 * @param {boolean} options.includeLowercase - Include lowercase letters (default: true)
 * @param {boolean} options.includeNumbers - Include numbers (default: true)
 * @param {boolean} options.includeSpecialChars - Include special characters (default: false)
 * @returns {string} Generated random token
 */ 
asdasdasdkahfsjdhfasf
asdasdasdasdasd
function generateToken(options = {}) {
    const {/**
 * Generates a random token with specified options
 * @param {Object} options - Configuration options
 * @param {number} options.length - Length of the token (default: 32)
 * @param {boolean} options.includeUppercase - Include uppercase letters (default: true)
 * @param {boolean} options.includeLowercase - Include lowercase letters (default: true)
 * @param {boolean} options.includeNumbers - Include numbers (default: true)
 * @param {boolean} options.includeSpecialChars - Include special characters (default: false)
 * @returns {string} Generated random token
 */ 
asdasdasdkahfsjdhfasf
asdasdasdasdasd
function generateToken(options = {}) {
    const {
        length = 32,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSpecialChars = false
    } = options;

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUppercase) chars += uppercaseChars;
    if (includeLowercase) chars += lowercaseChars;
    if (includeNumbers) chars += numberChars;
    if (includeSpecialChars) chars += specialChars;

    if (chars === '') {
        throw new Error('At least one character set must be included');
    }

    let token = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        token += chars[array[i] % chars.length];
    }

    return token;
}

// Example usage:
console.log('Default token (32 chars):', generateToken());
console.log('Short numeric token:', generateToken({ length: 6, includeUppercase: false, includeLowercase: false, includeSpecialChars: false }));
console.log('Secure token with special chars:', generateToken({ length: 16, includeSpecialChars: true }));

        length = 32,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSpecialChars = false
    } = options;

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUppercase) chars += uppercaseChars;
    if (includeLowercase) chars += lowercaseChars;
    if (includeNumbers) chars += numberChars;
    if (includeSpecialChars) chars += specialChars;

    if (chars === '') {
        throw new Error('At least one character set must be included');
    }

    let token = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        token += chars[array[i] % chars.length];
    }

    return token;
}

// Example usage:
console.log('Default token (32 chars):', generateToken());
console.log('Short numeric token:', generateToken({ length: 6, includeUppercase: false, includeLowercase: false, includeSpecialChars: false }));
console.log('Secure token with special chars:', generateToken({ length: 16, includeSpecialChars: true }));
