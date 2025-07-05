import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Button } from 'react-native';
import { getCurrentUser, account } from '@/lib/appwrite'; // adjust path as needed

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
            // Navigate to login screen or update state here
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>No user found. Please log in.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : null}
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>

            <View style={styles.logoutButton}>
                <Button title="Log Out" onPress={handleLogout} />
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
