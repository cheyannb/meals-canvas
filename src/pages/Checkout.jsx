import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Checkout() {
    const [email, setEmail] = useState(() => localStorage.getItem('userEmail') || '');
    const [loading, setLoading] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (sessionId && email) {
            localStorage.setItem('hasSubscription', 'true');
            setHasSubscription(true);
            setChecking(false);
        } else if (email) {
            checkSubscription(email);
        } else {
            setChecking(false);
        }
    }, []);

    const checkSubscription = async (emailToCheck) => {
        setChecking(true);
        try {
            const response = await base44.functions.invoke('checkSubscription', { email: emailToCheck });
            if (response.data.hasActiveSubscription) {
                setHasSubscription(true);
                localStorage.setItem('hasSubscription', 'true');
            }
        } catch (error) {
            console.error('Subscription check failed:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleSubscribe = async () => {
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        if (window.self !== window.top) {
            alert('Checkout works only from a published app. Please open the app in a new tab.');
            return;
        }

        setLoading(true);
        try {
            localStorage.setItem('userEmail', email);
            const response = await base44.functions.invoke('createCheckoutSession', { email });
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed. Please try again.');
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="max-w-md mx-auto p-6 mt-20">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                        <p className="mt-4 text-gray-600">Checking subscription...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (hasSubscription) {
        return (
            <div className="max-w-md mx-auto p-6 mt-20">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
                        <p className="text-gray-600 mb-6">Your subscription is active. You can now save unlimited recipes.</p>
                        <Button 
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                            Start Generating Recipes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 mt-20">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Subscribe to Recipe Saver</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-center mb-4">
                            <div className="text-3xl font-bold text-orange-600">$2.99</div>
                            <div className="text-sm text-gray-600">per month</div>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Unlimited recipe generation
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Save your favorite recipes
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                AI-generated recipe images
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Cancel anytime
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="text-lg py-6"
                            autoFocus
                        />
                    </div>

                    <Button 
                        onClick={handleSubscribe}
                        disabled={loading || !email || !email.includes('@')}
                        className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Subscribe Now'
                        )}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                        Secure checkout powered by Stripe
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}