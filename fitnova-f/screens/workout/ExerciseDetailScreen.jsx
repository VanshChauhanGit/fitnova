import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExerciseDetailScreen({ route, navigation }) {
  const { exercise } = route.params;

  return (
    <View className="flex-1 bg-[#121417]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* EXERCISE IMAGE/GIF */}
        <View className="relative">
          <Image
            source={{
              uri: exercise.gifUrl,
            }}
            className="h-96 w-full bg-[#121417]"
            resizeMode="cover"
          />

          {/* OVERLAY GRADIENT */}
          <View className="absolute inset-0 bg-black/20" />

          {/* BACK BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            className="absolute left-5 top-14 rounded-2xl border border-[#2D333B] bg-[#1F2328]/90 p-3 shadow-md">
            <Ionicons name="arrow-back" size={22} color="#E8EAED" />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <View className="px-6 pt-4">
          {/* TITLE */}
          <Text className="mt-2 text-3xl font-black capitalize text-[#E8EAED]">{exercise.name}</Text>

          {/* DESCRIPTION */}
          {exercise.description && (
            <Text className="mt-3 text-sm leading-relaxed text-[#9AA0A6]">{exercise.description}</Text>
          )}

          {/* QUICK STATS GRID */}
          <View className="mt-6 flex-row flex-wrap justify-between">
            {/* TARGET */}
            <View className="mb-4 w-[48%] rounded-3xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#2D9CDB]/15 border border-[#2D9CDB]/25">
                <MaterialCommunityIcons name="target" size={22} color="#2D9CDB" />
              </View>
              <Text className="mt-3 text-xs font-semibold text-[#9AA0A6]">Target Muscle</Text>
              <Text className="mt-0.5 text-base font-black capitalize text-[#E8EAED]">{exercise.target}</Text>
            </View>

            {/* BODY PART */}
            <View className="mb-4 w-[48%] rounded-3xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#16191E] border border-[#2D333B]">
                <Ionicons name="body" size={22} color="#2D9CDB" />
              </View>
              <Text className="mt-3 text-xs font-semibold text-[#9AA0A6]">Body Part</Text>
              <Text className="mt-0.5 text-base font-black capitalize text-[#E8EAED]">
                {exercise.bodyPart}
              </Text>
            </View>

            {/* EQUIPMENT */}
            <View className="mb-4 w-[48%] rounded-3xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#F2C94C]/15 border border-[#F2C94C]/25">
                <MaterialCommunityIcons name="dumbbell" size={22} color="#F2C94C" />
              </View>
              <Text className="mt-3 text-xs font-semibold text-[#9AA0A6]">Equipment</Text>
              <Text className="mt-0.5 text-base font-black capitalize text-[#E8EAED]">
                {exercise.equipment}
              </Text>
            </View>

            {/* DIFFICULTY */}
            <View className="mb-4 w-[48%] rounded-3xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#2D9CDB]/15 border border-[#2D9CDB]/25">
                <Ionicons name="barbell" size={22} color="#2D9CDB" />
              </View>
              <Text className="mt-3 text-xs font-semibold text-[#9AA0A6]">Difficulty</Text>
              <Text className="mt-0.5 text-base font-black capitalize text-[#E8EAED]">
                {exercise.difficulty || 'Intermediate'}
              </Text>
            </View>
          </View>

          {/* SECONDARY MUSCLES */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <View className="mt-4">
              <Text className="mb-3 text-lg font-bold text-[#E8EAED]">Secondary Muscles</Text>
              <View className="flex-row flex-wrap">
                {exercise.secondaryMuscles.map((muscle, index) => (
                  <View key={index} className="mb-2 mr-2 rounded-xl border border-[#2D333B] bg-[#1F2328] px-4 py-2 shadow-sm">
                    <Text className="text-xs font-bold capitalize text-[#2D9CDB]">{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* INSTRUCTIONS */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View className="mt-6 mb-8">
              <Text className="mb-4 text-xl font-bold text-[#E8EAED]">Execution Steps</Text>

              {exercise.instructions.map((instruction, index) => (
                <View key={index} className="mb-3.5 flex-row rounded-2xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
                  {/* STEP NUMBER */}
                  <View className="mr-3.5 h-7 w-7 items-center justify-center rounded-xl bg-[#2D9CDB]">
                    <Text className="text-xs font-black text-[#121417]">{index + 1}</Text>
                  </View>

                  {/* TEXT */}
                  <View className="flex-1">
                    <Text className="text-sm leading-relaxed text-[#9AA0A6]">{instruction}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
