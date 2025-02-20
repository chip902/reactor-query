'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
    Form, TextField, InlineAlert, Checkbox, Button, Text
} from '@adobe/react-spectrum';
import RotateCWBold from '@spectrum-icons/workflow/RotateCWBold';
import './styles.css';
import { useAnalytics } from '@/app/hooks/useAnalytics';
import Link from 'next/link';

const CreateAccount: React.FC = () => {
    const { createAccount } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tos, setTos] = useState(false);
    const [hasViewedPrivacy, setHasViewedPrivacy] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false
    });

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
    const [accountCreating, setAccountCreating] = useState(false);
    const { event } = useAnalytics();

    useEffect(() => {
        const isValid =
            Boolean(email) &&
            !Boolean(emailError) &&
            Boolean(password) &&
            !Boolean(passwordError) &&
            Boolean(confirmPassword) &&
            !Boolean(confirmPasswordError) &&
            Boolean(tos);

        setIsSubmitEnabled(isValid);
    }, [email, emailError, password, passwordError, confirmPassword, confirmPasswordError, tos]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitEnabled(false);
        setAccountCreating(true);
        // Validate TOS
        if (!tos) {
            setFormError('You must agree to the Terms of Service.');
            setAccountCreating(false);
            setIsSubmitEnabled(true);
            return;
        }

        // Final Validation for Confirm Password
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
            setAccountCreating(false);
            setIsSubmitEnabled(true);
            return;
        }

        try {
            const { success, message } = await createAccount(email, password);
            event({ action: 'createAccount', category: 'engagement', label: 'success', value: 1 });
            if (!success) {
                setFormError(message);
            }
        } catch (err) {
            console.error(err)
            event({ action: 'createAccount', category: 'engagement', label: 'failure', value: 1 });
            setFormError('An error occurred while creating your account. Please try again.');
        } finally {
            setAccountCreating(false);
            setIsSubmitEnabled(true);
        }
    };

    const validateEmail = (value: string) => {
        setEmail(value);
        if (!value) {
            setEmailError('Email is required.');
        } else if (!value.match(/^\S+@\S+\.\S+$/)) {
            setEmailError('Enter a valid email address.');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = (value: string) => {
        setPassword(value);

        // Update password criteria
        const criteria = {
            length: value.length >= 12,
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            number: /\d/.test(value)
        };
        setPasswordCriteria(criteria);

        if (!value) {
            setPasswordError('Password is required.');
        } else if (!Object.values(criteria).every(Boolean)) {
            setPasswordError('Password does not meet all requirements.');
        } else {
            setPasswordError('');
        }
    };

    const validateConfirmPassword = (value: string) => {
        setConfirmPassword(value);
        if (value !== password) {
            setConfirmPasswordError('Passwords do not match.');
        } else {
            setConfirmPasswordError('');
        }
    };

    return (
        <div className="auth-container">
            <Form onSubmit={handleSubmit} maxWidth="size-3600">
                <h1 className='text-3xl font-bold mb-4'>Create Account</h1>
                {formError ? <InlineAlert variant="negative">{formError}</InlineAlert> : <></>}

                <TextField
                    label="Email"
                    value={email}
                    autoFocus
                    onChange={validateEmail}
                    errorMessage={emailError}
                    isRequired
                />

                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={validatePassword}
                    validationState={passwordError ? 'invalid' : undefined}
                    errorMessage={passwordError}
                    isRequired
                />

                <div className="password-requirements">
                    <Text>Password Requirements:</Text>
                    <div className={`requirement ${passwordCriteria.length ? 'met' : ''}`}>
                        <Text>• At least 12 characters</Text>
                    </div>
                    <div className={`requirement ${passwordCriteria.uppercase ? 'met' : ''}`}>
                        <Text>• At least 1 uppercase letter</Text>
                    </div>
                    <div className={`requirement ${passwordCriteria.lowercase ? 'met' : ''}`}>
                        <Text>• At least 1 lowercase letter</Text>
                    </div>
                    <div className={`requirement ${passwordCriteria.number ? 'met' : ''}`}>
                        <Text>• At least 1 number</Text>
                    </div>
                </div>

                <TextField
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={validateConfirmPassword}
                    validationState={confirmPasswordError ? 'invalid' : undefined}
                    errorMessage={confirmPasswordError}
                    isRequired
                />

                <div className="flex flex-col gap-1 mb-4">
                    <Checkbox 
                        isSelected={tos} 
                        onChange={(checked) => {
                            if (!hasViewedPrivacy && checked) {
                                alert('Please view the privacy policy first');
                                return;
                            }
                            setTos(checked);
                        }}
                        isDisabled={!hasViewedPrivacy}
                    >
                        I have reviewed the privacy policy
                    </Checkbox>
                    {!hasViewedPrivacy && (
                        <span className="text-sm ml-6">
                            Please review the {' '}
                            <Link 
                                href="/privacy" 
                                target='_blank' 
                                className='text-blue-500 hover:underline'
                                onClick={() => setHasViewedPrivacy(true)}
                            >
                                privacy policy
                            </Link>
                            {' '}first
                        </span>
                    )}
                </div>

                <Button
                    variant='accent'
                    type="submit"
                    isDisabled={!isSubmitEnabled || accountCreating}
                    UNSAFE_className='hover:cursor-pointer' marginTop={'size-300'}
                >
                    {accountCreating && (
                        <div style={{ animation: 'spin 2s linear infinite', marginRight: '0.5rem' }}>
                            <RotateCWBold />
                        </div>
                    )}
                    {accountCreating ? 'Creating Account...' : 'Create Account'}

                </Button>
            </Form>
        </div>
    );
};

export default CreateAccount;
