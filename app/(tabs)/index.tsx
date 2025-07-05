import {SafeAreaView} from "react-native-safe-area-context";
import {
    FlatList,
    Image,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from "react-native";
import {Fragment, useState} from "react";
import cn from 'clsx';

import CartButton from "@/components/CartButton";
import {images, offers} from "@/constants";
import useAuthStore from "@/store/auth.store";

const cities = ["Charlotte", "Concord", "Matthews", "Huntersville", "Gastonia", "Cornelius", "Mint Hill"]; // You can edit this list

export default function Index() {
    const { user } = useAuthStore();
    const [selectedCity, setSelectedCity] = useState("Charlotte");
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FlatList
                data={offers}
                renderItem={({ item, index }) => {
                    const isEven = index % 2 === 0;

                    return (
                        <View>
                            <Pressable
                                className={cn("offer-card", isEven ? 'flex-row-reverse' : 'flex-row')}
                                style={{ backgroundColor: item.color }}
                                android_ripple={{ color: "#fffff22"}}
                            >
                                {({ pressed }) => (
                                    <Fragment>
                                        <View className={"h-full w-1/2"}>
                                            <Image source={item.image} className={"size-full"} resizeMode={"contain"} />
                                        </View>

                                        <View className={cn("offer-card__info", isEven ? 'pl-10': 'pr-10')}>
                                            <Text className="h1-bold text-white leading-tight">
                                                {item.title}
                                            </Text>
                                            <Image
                                                source={images.arrowRight}
                                                className="size-10"
                                                resizeMode="contain"
                                                tintColor="#ffffff"
                                            />
                                        </View>
                                    </Fragment>
                                )}
                            </Pressable>
                        </View>
                    )
                }}
                contentContainerClassName="pb-28 px-5"
                ListHeaderComponent={() => (
                    <View className="flex-between flex-row w-full my-5">
                        <View className="flex-start">
                            <Text className="small-bold text-primary">DELIVER TO</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                className="flex-center flex-row gap-x-1 mt-0.5"
                            >
                                <Text className="paragraph-bold text-dark-100">{selectedCity}</Text>
                                <Image source={images.arrowDown} className="size-3" resizeMode="contain" />
                            </TouchableOpacity>
                        </View>

                        <CartButton />

                        {/* Modal Dropdown */}
                        <Modal
                            transparent
                            visible={modalVisible}
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <TouchableOpacity
                                className="flex-1 justify-center items-center bg-black/30"
                                activeOpacity={1}
                                onPressOut={() => setModalVisible(false)}
                            >
                                <View className="bg-white w-4/5 rounded-xl p-4 max-h-[60%]">
                                    <Text className="h2-bold text-center mb-4">Select Delivery City</Text>
                                    <ScrollView>
                                        {cities.map((city, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                className="py-3 px-4 rounded-md hover:bg-gray-200"
                                                onPress={() => {
                                                    setSelectedCity(city);
                                                    setModalVisible(false);
                                                }}
                                            >
                                                <Text className="paragraph text-dark-100">{city}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
