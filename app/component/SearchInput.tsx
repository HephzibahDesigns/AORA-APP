import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";

const SearchInput = () => {
  const [search, setSearch] = useState("");
  return (
    <View className="border-2 border-black-200 w-[320px] h-[58px] rounded-lg px-4 py-2 focus:border-secondary">
      <TextInput
        className="text-white flex-1 font-poppinsMedium text-[16px] leading-[22px] items-center"
        value={search}
        onChangeText={(text: string) => setSearch(text)}
        placeholder="Search for a video topic"
        placeholderTextColor="#7B7B8B"
      />

      <TouchableOpacity
        onPress={() => setSearch("")}
        className="absolute right-4 top-[50%] transform -translate-y-1/2"
      >
        <Image
          source={require("../../assets/icons/search.png")}
          style={{ width: 16, height: 16, tintColor: "white" }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
