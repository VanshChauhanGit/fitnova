import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExerciseDetailScreen({ route, navigation }) {
  const { exercise } = route.params;

  return (
    <ScrollView className="flex-1 bg-[#071e00]">
      {/* EXERCISE IMAGE/GIF */}
      <View className="relative">
        <Image
          source={{
            uri: exercise.gifUrl,
          }}
          className="h-96 w-full"
          resizeMode="cover"
        />

        {/* OVERLAY */}
        <View className="absolute inset-0 bg-black/30" />

        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute left-5 top-16 rounded-2xl bg-black/50 p-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View className="px-6 pb-20">
        {/* TITLE */}
        <Text className="mt-6 text-4xl font-bold capitalize text-white">{exercise.name}</Text>

        {/* DESCRIPTION */}
        <Text className="mt-4 text-base leading-7 text-gray-400">{exercise.description}</Text>

        {/* QUICK STATS */}
        <View className="mt-8 flex-row flex-wrap justify-between">
          {/* TARGET */}
          <View className="mb-4 w-[48%] rounded-3xl bg-[#112b0a] p-5">
            <MaterialCommunityIcons name="target" size={28} color="#3efe18" />

            <Text className="mt-4 text-gray-400">Target Muscle</Text>

            <Text className="mt-1 text-lg font-bold capitalize text-white">{exercise.target}</Text>
          </View>

          {/* BODY PART */}
          <View className="mb-4 w-[48%] rounded-3xl bg-[#112b0a] p-5">
            <Ionicons name="body" size={28} color="#3efe18" />

            <Text className="mt-4 text-gray-400">Body Part</Text>

            <Text className="mt-1 text-lg font-bold capitalize text-white">
              {exercise.bodyPart}
            </Text>
          </View>

          {/* EQUIPMENT */}
          <View className="mb-4 w-[48%] rounded-3xl bg-[#112b0a] p-5">
            <MaterialCommunityIcons name="dumbbell" size={28} color="#3efe18" />

            <Text className="mt-4 text-gray-400">Equipment</Text>

            <Text className="mt-1 text-lg font-bold capitalize text-white">
              {exercise.equipment}
            </Text>
          </View>

          {/* DIFFICULTY */}
          <View className="mb-4 w-[48%] rounded-3xl bg-[#112b0a] p-5">
            <Ionicons name="barbell" size={28} color="#3efe18" />

            <Text className="mt-4 text-gray-400">Difficulty</Text>

            <Text className="mt-1 text-lg font-bold capitalize text-white">
              {exercise.difficulty}
            </Text>
          </View>
        </View>

        {/* CATEGORY */}
        <View className="mt-2 rounded-3xl bg-[#112b0a] p-5">
          <Text className="text-gray-400">Category</Text>

          <Text className="mt-2 text-xl font-bold capitalize text-white">{exercise.category}</Text>
        </View>

        {/* SECONDARY MUSCLES */}
        <View className="mt-10">
          <Text className="mb-5 text-2xl font-bold text-white">Secondary Muscles</Text>

          <View className="flex-row flex-wrap">
            {exercise.secondaryMuscles?.map((muscle, index) => (
              <View key={index} className="mb-3 mr-3 rounded-2xl bg-[#112b0a] px-5 py-3">
                <Text className="font-semibold capitalize text-[#3efe18]">{muscle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* INSTRUCTIONS */}
        <View className="mt-10">
          <Text className="mb-5 text-2xl font-bold text-white">Instructions</Text>

          {exercise.instructions?.map((instruction, index) => (
            <View key={index} className="mb-5 flex-row">
              {/* STEP NUMBER */}
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-[#3efe18]">
                <Text className="font-bold text-black">{index + 1}</Text>
              </View>

              {/* TEXT */}
              <View className="flex-1">
                <Text className="text-base leading-7 text-gray-300">{instruction}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* START BUTTON */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ActiveWorkout', {
              exercise,
            })
          }
          className="mt-12 rounded-3xl bg-[#3efe18] py-5">
          <Text className="text-center text-lg font-bold text-black">Start Workout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
