import {View, Text, Button, Alert, Image} from 'react-native'
import {Link, router} from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {useState} from "react";
import {signIn} from "@/lib/appwrite";
import * as Sentry from '@sentry/react-native'
import useAuthStore from "@/store/auth.store";
import ConfettiCannon from 'react-native-confetti-cannon';


const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [showConfetti, setShowConfetti] = useState(false);


    const submit = async () => {
        const { email, password } = form;

        if (!email || !password) return Alert.alert("🔐Oops! You're missing ingredients 👨‍🍳", "We need both your email and password to cook up your order.");


        setIsSubmitting(true);

        try {
            await signIn({ email, password });

            // Small delay to allow session persistence
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Fetch and confirm authenticated user
            const user = await useAuthStore.getState().fetchAuthenticatedUser();

            if (user) {
                Alert.alert("🍟 Order Received!", "Welcome back, foodie! Your cravings are in good hands.");
                router.push({ pathname: '/', params: { justLoggedIn: 'true' } });
            }
            else {
                setShowConfetti(true); // 🎉 Trigger confetti!
                Alert.alert("🍗 Cluck Yeah!", "Your account’s crispy and golden. Time to feast like a champ!");
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
            Sentry.captureEvent(error);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (

        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                label="Email"
                keyboardType="email-address"
            />
            <CustomInput
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                label="Password"
                secureTextEntry={true}
            />

            <CustomButton
                title="Sign In"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-100">
                    Don&apos;t have an account?
                </Text>
                <Link href="/sign-up" className="base-bold text-primary">
                    Sign Up
                </Link>
                <View><Image
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Hamburger.png"
                    alt="Hamburger" width="25" height="25"/></View>

            </View>
        </View>
    )
}

export default SignIn