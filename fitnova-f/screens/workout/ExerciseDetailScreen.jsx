import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExerciseDetailScreen({ route, navigation }) {
  const { exercise } = route.params;

  return (
    <View className="flex-1 bg-[#EBF7F4]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* EXERCISE IMAGE/GIF */}
        <View className="relative">
          <Image
            source={{
              uri: exercise.gifUrl,
            }}
            className="h-96 w-full bg-[#EBF7F4]"
            resizeMode="cover"
          />

          {/* OVERLAY GRADIENT */}
          <View className="absolute inset-0 bg-black/10" />

          {/* BACK BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            className="absolute left-5 top-14 rounded-2xl border border-[#017374]/20 bg-white/90 p-3 shadow-md">
            <Ionicons name="arrow-back" size={22} color="#014041" />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <View className="px-6 pt-4">
          {/* TITLE */}
          <Text className="mt-2 text-3xl font-black capitalize text-[#014041]">{exercise.name}</Text>

          {/* DESCRIPTION */}
          {exercise.description && (
            <Text className="mt-3 text-sm leading-relaxed text-[#025C5D]">{exercise.description}</Text>
          )}

          {/* QUICK STATS GRID */}
          <View className="mt-6 flex-row flex-wrap justify-between">
            {/* TARGET */}
            <View className="mb-4 w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#017374]/15 border border-[#017374]/25">
                <MaterialCommunityIcons name="target" size={22} color="#017374" />
              </View>
              <Text className="mt-3 text-xs font-semibold text-[#3A7574]">Target Muscle</Text>
              <Text className="mt-0.5 text-base font-black capitalize text-[#014041]">{exercise.target}</Text>
            </View>

            {/* BODY PART */}
            <View className="mb-4 w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#D8F3EB] border border-[#017374]/20">
                <Ionicons name="body" size={22} color="#017374" />
              </View>
              <Text className="mt-3 text-xs font-semibold text-[#3A7574]">Body Part</Text>
              <Text className="mt-0.5 text-base font-black capitalize text-[#014041]">
                {exercise.bodyPart}
              </Text>
            </View>

            {/* EQUIPMENT */}
            <View className="mb-4 w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <MaterialCommunityIcons name="dumbbell" size={22} color="#F97316" />
              </View>
              <Text className="mt-3 text-xs font-semibold text-[#3A7574]">Equipment</Text>
              <Text className="mt-0.5 text-base font-black capitalize text-[#014041]">
                {exercise.equipment}
              </Text>
            </View>

            {/* DIFFICULTY */}
            <View className="mb-4 w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <Ionicons name="barbell" size={22} color="#A855F7" />
              </View>
              <Text className="mt-3 text-xs font-semibold text-[#3A7574]">Difficulty</Text>
              <Text className="mt-0.5 text-base font-black capitalize text-[#014041]">
                {exercise.difficulty || 'Intermediate'}
              </Text>
            </View>
          </View>

          {/* SECONDARY MUSCLES */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <View className="mt-4">
              <Text className="mb-3 text-lg font-bold text-[#014041]">Secondary Muscles</Text>
              <View className="flex-row flex-wrap">
                {exercise.secondaryMuscles.map((muscle, index) => (
                  <View key={index} className="mb-2 mr-2 rounded-xl border border-[#017374]/15 bg-white px-4 py-2 shadow-sm">
                    <Text className="text-xs font-bold capitalize text-[#017374]">{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* INSTRUCTIONS */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View className="mt-6 mb-8">
              <Text className="mb-4 text-xl font-bold text-[#014041]">Execution Steps</Text>

              {exercise.instructions.map((instruction, index) => (
                <View key={index} className="mb-3.5 flex-row rounded-2xl border border-[#017374]/15 bg-white p-4 shadow-sm">
                  {/* STEP NUMBER */}
                  <View className="mr-3.5 h-7 w-7 items-center justify-center rounded-xl bg-[#017374]">
                    <Text className="text-xs font-black text-white">{index + 1}</Text>
                  </View>

                  {/* TEXT */}
                  <View className="flex-1">
                    <Text className="text-sm leading-relaxed text-[#025C5D]">{instruction}</Text>
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
