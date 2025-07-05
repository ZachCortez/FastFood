import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, Pressable } from 'react-native';
import { getCurrentUser, account } from '@/lib/appwrite';
import { useRouter } from 'expo-router';

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            router.replace('/sign-in'); // Change to your login route
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-6">
                <Text className="text-lg font-semibold text-center text-red-500">
                    No user found. Please log in.
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white items-center justify-center px-6">
            {user.avatar && (
                <Image
                    source={{ uri: user.avatar }}
                    className="w-28 h-28 rounded-full mb-5"
                    resizeMode="cover"
                />
            )}
            <Text className="text-2xl font-bold text-dark-100 mb-1">{user.name}</Text>
            <Text className="text-base text-gray-500">{user.email}</Text>

            <Pressable
                onPress={handleLogout}
                className="mt-8 bg-red-500 px-6 py-3 rounded-xl w-full"
            >
                <Text className="text-white text-center font-semibold text-base">Log Out</Text>
            </Pressable>
        </View>
    );
};

export default Profile;
