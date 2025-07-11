import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    Pressable,
    Alert, Button,

} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon'; // <-- import this
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, account, updateUserAvatar, updateUserAddress } from '@/lib/appwrite';
import { useRouter } from 'expo-router';

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [showConfetti, setShowConfetti] = useState(false); // <--- New confetti state
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                if (userData?.avatar) {
                    setAvatarUrl(`${userData.avatar}&t=${Date.now()}`);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Allow access to your gallery to upload a photo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            try {
                setUploading(true);
                const uri = result.assets[0].uri;

                const updatedUser = await updateUserAvatar(uri);
                setUser(updatedUser);

                if (updatedUser.avatar) {
                    setAvatarUrl(`${updatedUser.avatar}&t=${Date.now()}`);
                }

                // Trigger confetti
                setShowConfetti(true);

                Alert.alert('Success', 'Profile picture updated!');
            } catch (error) {
                console.error('Failed to update avatar:', error);
                Alert.alert('Error', 'Could not update profile picture.');
            } finally {
                setUploading(false);
            }
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#f43f5e" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-6">
                <Text className="text-lg font-semibold text-center text-red-500 mb-4">
                    No user found. Please log in.
                </Text>
                <View className="w-full gap-y-3">
                    <Pressable
                        onPress={() => router.replace('/(auth)/sign-in')}
                        className="bg-orange-500 py-3 rounded-xl"
                    >
                        <Text className="text-white text-center font-semibold text-base">
                            Go to Sign In
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.replace('/(auth)/sign-up')}
                        className="border border-orange-300 py-3 rounded-xl"
                    >
                        <Text className="text-orange-500 text-center font-semibold text-base">
                            Go to Sign Up
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }


    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            router.replace('/sign-in'); // Change to your login route
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View className="flex-1 bg-white px-6 pt-16 items-center">
            <Pressable onPress={handleImagePick} className="relative">
                <View className="w-32 h-32 rounded-full border-4 border-pink-500 overflow-hidden justify-center items-center">
                    {avatarLoading && (
                        <ActivityIndicator
                            size="large"
                            color="#f43f5e"
                            className="absolute z-10"
                        />
                    )}
                    <Image
                        source={{ uri: avatarUrl || 'https://placehold.co/120x120?text=User' }}
                        className="w-32 h-32 rounded-full"
                        onLoadStart={() => setAvatarLoading(true)}
                        onLoadEnd={() => setAvatarLoading(false)}
                    />
                </View>
                <View className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full shadow-md">
                    <Text className="text-white text-xs font-bold">Edit</Text>
                </View>
            </Pressable>

            {/* Confetti cannon component */}
            {showConfetti && (
                <ConfettiCannon
                    count={100}
                    origin={{ x: -10, y: 0 }}
                    fadeOut={true}
                    onAnimationEnd={() => setShowConfetti(false)}
                />
            )}

            {/* rest of your UI */}
            <Text className="text-2xl font-extrabold text-neutral-800 mt-4">{user.name}</Text>
            <Text className="text-base text-gray-500">{user.email}</Text>

            {/* ... your address editing and logout buttons ... */}
            <View style={styles.logoutButton}>
                <Pressable
                    onPress={handleLogout}
                    className="mt-8 bg-red-500 px-6 py-3 rounded-xl w-full"
                >
                    <Text className="text-white text-center font-semibold text-base">Log Out</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default Profile;


const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
    },
    name: {
        fontSize: 26,
        fontWeight: '600',
        marginBottom: 8,
    },
    email: {
        fontSize: 18,
        color: 'gray',
    },
    logoutButton: {
        marginTop: 30,
        width: '100%',
    },
});