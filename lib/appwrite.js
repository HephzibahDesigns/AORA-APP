import {
  Client,
  Databases,
  Account,
  ID,
  Avatars,
  Storage,
} from "react-native-appwrite";
import { toast } from "./toast";
import { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";

import * as FileSystem from "expo-file-system";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.hephzibah.aora",
  projectId: "66b9e2f50024dc0f7ff6",
  databaseId: "66b9e5bd00322c6c1b88",
  userCollectionId: "66b9e5fd0007abea2ab8",
  profileCollectionId: "66e9982900263c4a321b",
  videoCollectionId: "66b9e64d000c7b1b11b4",
  profileStorageId: "66e1b34500354dc2fc89",
  storageId: "66ba6fb2000ad994ff7a",
};

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

export const storage = new Storage(client);

// get post for the Home Page
export const getAllPost = async () => {
  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId
    );
    return post.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadImage = async (currentFileUri) => {
  if (!currentFileUri) throw new Error("No image URI provided");

  try {
    // Read the file from the URI
    const fileInfo = await FileSystem.getInfoAsync(currentFileUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    // Create a FormData object
    const formData = new FormData();
    formData.append("file", {
      uri: currentFileUri,
      name: "profile-pic.jpg",
      type: "image/jpeg",
    });

    // Perform the upload using Appwrite's API
    const response = await fetch(
      `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.profileStorageId}/files`,
      {
        method: "POST",
        headers: {
          "X-Appwrite-Project": appwriteConfig.projectId,
        },
        body: formData,
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to upload the file");
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// export const uploadProfilePicture = async (file) => {
//   try {
//     // Upload the image to the Appwrite storage bucket
//     const response = await storage.createFile(
//       appwriteConfig.profileStorageId, // Bucket ID
//       ID.unique(), // Creates a unique ID for the new file
//       file // The file to upload
//     );

//     // Construct the URL for accessing the file
//     const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.profileStorageId}/files/${response.$id}/view?project=${appwriteConfig.projectId}`;

//     console.log(response);

//     // Return the uploaded file's ID and URL
//     return {
//       fileId: response.$id,
//       fileUrl,
//     };
//   } catch (error) {
//     console.error("Error uploading file:", error.message, error);
//     throw error;
//   }
// };

// Function to get image URL from Appwrite storage

export const getImageUrlFromAppwrite = async () => {
  try {
    // Fetch all files in the bucket (you might need to use pagination or filters if there are many files)
    const response = await storage.listFiles(appwriteConfig.profileStorageId);

    // Return the list of file URLs
    return response.files.map((file) => ({
      fileId: file.$id,
      fileUrl: `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.profileStorageId}/files/${file.$id}/view?project=${appwriteConfig.projectId}`,
    }));
  } catch (error) {
    console.error("Error fetching image URL:", error.message, error);
    throw error;
  }
};

export const deleteFileFromAppwrite = async (fileId) => {
  try {
    if (!fileId) {
      throw new Error("File ID is required to delete the image");
    }

    // Delete the old file from the bucket
    await storage.deleteFile(appwriteConfig.profileStorageId, fileId);
  } catch (error) {
    console.error("Error deleting old profile picture:", error.message, error);
    throw error;
  }
};

export const updateProfilePicture = async (userId, file, currentFileId) => {
  try {
    // Step 1: Upload the new profile picture
    const { fileId, fileUrl } = await uploadProfilePicture(file);

    // Step 2: If there's an old profile picture, delete it
    if (currentFileId) {
      await deleteFileFromAppwrite(currentFileId);
      console.log("Old profile picture deleted successfully");
    }

    // Step 3: Optionally update the user's profile with the new fileId (if you need to associate it)
    // This part depends on how your app manages user profiles

    return { fileId, fileUrl };
  } catch (error) {
    console.error("Error updating profile picture:", error.message, error);
    throw error;
  }
};

// Create Context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const createUser = async (email, password, username) => {
    try {
      console.log("Creating user with email:", email);

      const newAccount = await account.create(
        ID.unique(),
        email, // Ensure the email is passed here
        password, // Ensure the password is passed here
        username
      );

      if (!newAccount) throw new Error("Failed to create account");

      const avatarUrl = avatars.getInitials(username);
      console.log("Generated avatar URL:", avatarUrl);

      await login(email, password);

      // create new user in the database
      const newUser = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          accountID: newAccount.$id,
          email,
          username,
          avatar: avatarUrl,
        }
      );

      toast("Account created");
      console.log("New user created:", newUser);
      setUser(newUser);
      // return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      toast(error.message);
      throw new Error(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      const currentSession = await account.getSession("current");
      setUser(currentSession);
      toast("You're already logged in.");
    } catch (error) {
      try {
        const newSession = await account.createEmailPasswordSession(
          email,
          password
        );
        setUser(newSession);
        toast("Welcome back!");
        // Optionally fetch user data again to ensure state is correct
        await fetchUser();
      } catch (err) {
        toast("Login failed: " + err.message);
        throw err;
      }
    }
  };

  const logout = async () => {
    try {
      const deleteSession = await account.deleteSession("current");

      if (deleteSession) {
        console.log("session deleted");
        setUser(null);
        toast("Logged out successfully");
      }
    } catch (error) {
      console.error(error);
      toast(error.message);
      throw new Error(error.message);
    }
  };

  const fetchUser = async () => {
    try {
      const currentSession = await account.get();
      setUser(currentSession);
      toast("Welcome back. You are logged in");
      router.push("/home");
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        createUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
