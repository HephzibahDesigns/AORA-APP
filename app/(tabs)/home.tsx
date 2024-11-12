import {
  View,
  Text,
  Button,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  RefreshControl,
} from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllPost, useUser } from "@/lib/appwrite";

import SearchInput from "../component/SearchInput";
import Trending from "../component/Trending";
import FetchedData from "../component/FetchedData";

import useAppwrite from "../../lib/useAppwrite";

const Home = () => {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const { data: posts, refetch, isLoading } = useAppwrite(getAllPost);

  console.log(posts);

  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Show the spinner
    await refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView className="flex flex-1 bg-primary">
      <ScrollView
        className="mt-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh} // This triggers when you pull down
            colors={["#ff0000"]} // Color of the refresh indicator (Android)
            tintColor="#0000ff" // Color of the refresh indicator (iOS)
          />
        }
      >
        <View className="px-4 space-y-9">
          <View className="flex justify-between items-center flex-row ">
            <View className="flex space-y-1">
              <Text className="text-grey-100 font-medium font-poppinsMedium text-[14px] leading-[20px]">
                Welcome Back
              </Text>
              <Text className="text-white text-[24px] font-poppinsSemiBold leading-[32px]">
                {user?.name}
              </Text>
            </View>
            <View>
              <Image
                source={require("../../assets/icon2.png")}
                style={{ resizeMode: "contain", width: 50, height: 50 }}
              />
            </View>
          </View>

          <View>
            <SearchInput />
          </View>

          <View>
            <Text className=" text-grey-100 font-poppinsMedium font-[17px] leading-[20px]">
              Trending Videos
            </Text>
          </View>
        </View>
        <Trending />
        <View className="">
          <FetchedData />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
