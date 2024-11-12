import {
  View,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  appwriteConfig,
  useUser,
  // uploadProfilePicture,
  getImageUrlFromAppwrite,
  updateProfilePicture,
  uploadImage,
  // deleteFileFromAppwrite,
  // updateUserProfilePicture,
} from "@/lib/appwrite";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { toast } from "@/lib/toast";
// import { Alert } from "react-native";

const Profile = ({ fileId }: { fileId: string }) => {
  const { logout, user } = useUser();
  const [imageUri, setImageUri] = useState<
    { fileId: string; fileUrl: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const defaultImageUri = require("../../assets/icons/ProfilePics 2.png");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await getImageUrlFromAppwrite();
        setImageUri(response);
        console.log(response);
      } catch (error) {
        if (error instanceof Error) {
          toast(`Error: ${error.message}`);
        } else {
          toast("An unknown error occurred");
        }
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // const pickImage = async () => {
  //   const permissionResult =
  //     await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (!permissionResult.granted) {
  //     alert("Permission to access camera roll is required!");
  //     return;
  //   }

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 0.8,
  //   });

  //   if (!result.canceled && result.assets[0]?.uri) {
  //     const pickedImageUri = result.assets[0].uri;
  //     setImageUri(pickedImageUri);

  //     try {
  //       const response = await fetch(pickedImageUri);
  //       if (!response.ok) throw new Error("Failed to fetch image data");

  //       const blob = await response.blob();
  //       const file = new File(
  //         [blob],
  //         result.assets[0].fileName || "image.jpg",
  //         { type: blob.type }
  //       );

  //       const uploadResponse = await uploadProfilePicture(file);
  //       if (uploadResponse) {
  //         const newFileId = uploadResponse.$id;
  //         console.log("Image uploaded successfully:", uploadResponse);
  //         toast("Success, Image uploaded successfully!");

  //         await updateUserProfilePicture(user.$id, newFileId);
  //         toast("Profile picture updated successfully!");

  //         const imageUrl = await getImageUrlFromAppwrite(newFileId);
  //         setImageUri(imageUrl);

  //         if (currentFileId) {
  //           await deleteFileFromAppwrite(currentFileId);
  //           console.log("Old image deleted successfully");
  //         }

  //         setCurrentFileId(newFileId);
  //       } else {
  //         console.error("Upload response is undefined.");
  //         toast("Failed to upload image.");
  //       }
  //     } catch (error) {
  //       console.error("Error uploading image:", error);
  //       toast("Error uploading image: " + error);
  //     }
  //   }
  // };

  const pickImage = async () => {
    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const pickedImageUri = result.assets[0].uri;
      setCurrentFileId(pickedImageUri); // Set the image URI

      // Proceed to upload the image
      try {
        setUploading(true);
        const uploadResult = await uploadImage(pickedImageUri); // Use the API service function
        console.log("File uploaded successfully", uploadResult.$id);
        // Optionally, set some state with the result
        // e.g., setUploadedFileId(uploadResult.$id)
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#FF8E01"
        className="flex-1 flex justify-center items-center bg-primary"
      />
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView className="flex flex-1 bg-primary">
      <TouchableOpacity
        onPress={handleLogout}
        className="flex justify-center items-end px-4 py-4"
      >
        <Image
          source={require("../../assets/icons/logout.png")}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      <View className="flex justify-center items-center space-y-6">
        <TouchableOpacity
          onPress={pickImage}
          className="flex justify-center items-center w-[150px] h-[150px] border-2 rounded-full border-secondary-200 overflow-hidden"
        >
          {/* Always render the Image with a fallback to default */}
          {imageUri.length > 0 ? (
            imageUri.map((image) => (
              <Image
                key={image.fileId} // Use index or a unique id if available
                source={{ uri: image.fileUrl }}
                style={{
                  width: 150,
                  height: 150,
                  resizeMode: "cover",
                }}
                className="flex justify-center items-center"
              />
            ))
          ) : (
            <Image
              source={defaultImageUri}
              style={{
                width: 150,
                height: 150,
                resizeMode: "cover",
              }}
              className="flex justify-center items-center"
            />
          )}
        </TouchableOpacity>

        {uploading && <Text>Uploading...</Text>}

        <Text className="text-white font-poppinsSemiBold text-[18px] leading-[20px]">
          {user?.name || "Hello User"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
