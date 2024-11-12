import { View, Text, Image } from "react-native";
import React from "react";
import Button from "./Button";
import { router } from "expo-router";

interface EmptyStateProp {
  title: string;
  subTitle: string;
}

const EmptyState: React.FC<EmptyStateProp> = ({ title, subTitle }) => {
  return (
    <View className="flex justify-center items-center py-4">
      <Image
        source={require("../../assets/images/empty.png")}
        style={{ width: 300, height: 250, resizeMode: "contain" }}
      />

      <Text className="text-grey-100 font-poppinsMedium font-medium leading-[20px] text-[15px]">
        {title}
      </Text>

      <Text className="text-grey-100 font-poppinsMedium font-medium leading-[20px] text-[15px]">
        {subTitle}
      </Text>

      <Button title="" handlePress={() => router.push("/create")} />
    </View>
  );
};

export default EmptyState;
