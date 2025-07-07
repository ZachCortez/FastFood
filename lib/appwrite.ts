import {Account, Avatars, Client, Databases, ID, Query, Storage} from "react-native-appwrite";
import {CreateUserParams, GetMenuParams, SignInParams} from "@/type";
import * as FileSystem from 'expo-file-system';
import useAuthStore from "@/store/auth.store";


export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    avatarId: process.env.EXPO_PUBLIC_APPWRITE_AVATAR!,
    platform: "com.saturnbay.fastfood",
    databaseId: '6865e73900059dfb18fe',
    bucketId: '6869c8bf0003dff1d827',
    userCollectionId: '6868b16b00227ccbbad2',
    categoriesCollectionId: '6869ba610017d0fc0026',
    menuCollectionId: '6869bd0b0006915fc30c',
    customizationsCollectionId: '6869c362000b16f1a5de',
    menuCustomizationsCollectionId: '6869c7680033939fc949'
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        // Create Appwrite account
        const newAccount = await account.create(ID.unique(), email, password, name);
        if (!newAccount) throw new Error('Account creation failed.');

        // Sign in to create session
        await signIn({ email, password });

        // Generate avatar URL from initials
        const avatarUrl = avatars.getInitialsURL(name);

        // Create user document in database
        const userDoc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                email,
                name,
                accountId: newAccount.$id,
                avatar: avatarUrl,
            }
        );

        return userDoc;
    } catch (e: any) {
        throw new Error(e?.message || 'Failed to create user');
    }
};


export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session; // Return the session info if needed
    } catch (e: any) {
        throw new Error(e?.message || 'Sign-in failed');
    }
}


export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: string[] = [];

        if(category) queries.push(Query.equal('categories', category));
        if(query) queries.push(Query.search('name', query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const updateUserAvatar = async (fileUri: string) => {
    try {
        const currentAccount = await account.get();
        const userId = currentAccount.$id;
        const fileId = `avatar-${userId}`;

        // Delete existing file to allow overwrite
        try {
            await storage.deleteFile(appwriteConfig.bucketId, fileId);
        } catch (error) {
            console.log('No existing avatar to delete or error deleting:', error);
        }

        const uploadUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files`;

        // Check file existence
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) throw new Error('File does not exist');

        const formData = new FormData();
        formData.append('file', {
            uri: fileUri,
            name: `${fileId}.jpg`,
            type: 'image/jpeg',
        } as any);
        formData.append('fileId', fileId);

        const res = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'X-Appwrite-Project': appwriteConfig.projectId,
            },
            body: formData,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Upload failed');

        const uploadedFileId = result.$id;
        const timestamp = Date.now();
        const avatarUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${uploadedFileId}/view?project=${appwriteConfig.projectId}&t=${timestamp}`;


        // Update user document in DB
        const userDoc = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', userId)]
        );

        if (!userDoc.documents[0]) throw new Error('User document not found');
        const docId = userDoc.documents[0].$id;

        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            docId,
            { avatar: avatarUrl }
        );

        return updatedUser;
    } catch (e) {
        console.error('updateUserAvatar error:', e);
        throw e;
    }
};



