import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  ImageSourcePropType,
} from "react-native";
import { WebView } from "react-native-webview";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import EmptyState from "./EmptyState";

import useAppwrite from "../../lib/useAppwrite";
import { getAllPost } from "@/lib/appwrite";

interface Post {
  $id: string;
  title: string;
  author: string;
  thumbnail: string;
  pics: any; // Replace `any` with the correct type if you know it (e.g., `ImageSourcePropType`)
  icon: any;
  video: string;
  Creator?: string;
  videoResolution?: { width: number; height: number };
}

const icon: ImageSourcePropType = require("../../assets/icons/menu.png");
const video = require("../../assets/Videos/180074-863401733_tiny.mp4");

const { width } = Dimensions.get("window");

export default function FetchedData() {
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const [videoHeight, setVideoHeight] = useState<number>(width / (16 / 9)); // Default aspect ratio 16:9

  const { data: posts } = useAppwrite(getAllPost) as { data: Post[] };

  console.log(posts);

  const toggleMenu = (id: string) => {
    if (menuVisible === id) {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setMenuVisible(null));
    } else {
      // Show the menu with an animation
      setMenuVisible(id);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    // Check if video resolution is available in post data
    posts.forEach((post) => {
      if (post.videoResolution) {
        // Calculate aspect ratio and adjust video height accordingly
        const aspectRatio =
          post.videoResolution.width / post.videoResolution.height;
        setVideoHeight(width / aspectRatio);
      }
    });
  }, [posts]);

  return (
    <FlatList
      data={posts}
      style={{ paddingHorizontal: 15 }}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <View key={item.$id}>
          <View className="flex flex-row items-center justify-between my-9">
            <View className="flex flex-row items-center">
              <Image
                source={{ uri: item.thumbnail }}
                style={{ width: 40, height: 40 }}
              />
              <View className="ml-2">
                <Text className="font-poppinsMedium font-medium text-[14px] text-white">
                  {item.title}
                </Text>
                <Text className="font-poppinsRegular font-normal text-grey-100">
                  {item.Creator || "Unknown Creator"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleMenu(item.$id)}>
              <Image
                source={icon}
                style={{ width: 20, height: 20, resizeMode: "contain" }}
              />
            </TouchableOpacity>
          </View>

          {menuVisible === item.$id && (
            <Animated.View
              style={[
                styles.popupMenu,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: scaleAnim,
                },
              ]}
              className="space-y-2 flex items-start"
            >
              <TouchableOpacity
                onPress={() => toggleMenu(item.$id)}
                className="flex justify-center flex-row items-center space-x-2"
              >
                <Image
                  source={require("../../assets//icons/bookmark.png")}
                  style={{ width: 16, height: 16, resizeMode: "contain" }}
                />
                <Text className="text-grey-100 font-poppinsMedium font-medium text-[15px] ">
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleMenu(item.$id)}
                className="flex justify-center flex-row items-center space-x-1"
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={22}
                  color="#CDCDE0"
                  className="flex justify-center items-center"
                />
                <Text className="text-grey-100 font-poppinsMedium font-medium text-[15px]">
                  Delete
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View className="flex justify-center items-center flex-1 mb-5">
            <WebView
              source={video}
              style={[styles.video, { height: videoHeight }]} // Ensure a reasonable height
              javaScriptEnabled={true}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              domStorageEnabled={true}
            />
          </View>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState
          title="No Videos Found"
          subTitle="Be the first to upload a new video"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: width - 20,

    resizeMode: "contain",
  },

  popupMenu: {
    position: "absolute",
    right: 10,
    top: 90, // Adjust this value to control the popup's vertical position
    backgroundColor: "#1E1E2D",
    padding: 12,
    borderRadius: 5,
    zIndex: 2,
  },
  menuItem: {
    color: "#fff",
    paddingVertical: 8,
  },
});

//   {
//     id: "1",
//     title: "Woman walks down a Tokyo...",
//     author: "Brandon Etter",
//     pics: require("../../assets/images/avatar.png"),
//     icon: require("../../assets/icons/menu.png"),
//     video: require("../../assets/Videos/180074-863401733_tiny.mp4"),
//   },
//   {
