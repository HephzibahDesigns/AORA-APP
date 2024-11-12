import { getAllPost } from "@/lib/appwrite";
import { toast } from "@/lib/toast";
import React, { useRef } from "react";
import {
  View,
  Image,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.48; // Adjust this if needed

const images = [
  { image: require("../../assets/images/image 1649.png") },
  { image: require("../../assets/images/image 1650.png") },
  { image: require("../../assets/images/image 16452.png") },
  { image: require("../../assets/images/image 1649.png") },
];

interface ImageItem {
  image: any;
}

const CarouselItem = ({
  item,
  index,
  scrollX,
}: {
  item: ImageItem;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, 20], // Move images down when they are not centered
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  // const { data: posts, refetch, isLoading } = useAppwrite(getAllPost);

  // console.log(posts);

  return (
    <Animated.View
      style={[
        {
          width: ITEM_WIDTH,
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
        },
        animatedStyle,
      ]}
    >
      <Image
        source={item.image}
        style={{
          width: ITEM_WIDTH, // Adjust width to fit better
          height: ITEM_WIDTH * (285 / 180), // Adjust height proportionally
          resizeMode: "cover",
          borderRadius: 20,
        }}
      />
    </Animated.View>
  );
};

const Trending = () => {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const paginationStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const scale = scrollX.value / ITEM_WIDTH;
      const currentPage = Math.floor(scale);
      const nextPage = currentPage + 1;

      const progress = scrollX.value / ITEM_WIDTH - currentPage;
      const isActive = index === currentPage || index === nextPage;

      let widthAnim = 8;
      let backgroundColor = "#CDCDE0"; // Default color for inactive dots
      if (isActive) {
        widthAnim =
          index === currentPage ? 8 + progress * 12 : 8 + (1 - progress) * 12;
        backgroundColor = "#FF9C01"; // Color for active dot
      }

      return {
        width: widthAnim,
        height: 8,
        borderRadius: 4,
        backgroundColor,
        marginHorizontal: 2, // Reduced horizontal margin
      };
    });
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        contentContainerStyle={{
          paddingHorizontal: ITEM_WIDTH / 2,
          paddingTop: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }} // Center items
        snapToInterval={ITEM_WIDTH} // Snap to item width
        renderItem={({ item, index }) => (
          <CarouselItem item={item} index={index} scrollX={scrollX} />
        )}
      />

      {/* Pagination */}
      <View
        style={{ flexDirection: "row", alignSelf: "center", marginTop: 22 }}
      >
        {images.map((_, index) => (
          <Animated.View
            key={index.toString()}
            style={paginationStyle(index)}
          />
        ))}
      </View>
    </View>
  );
};

export default Trending;
