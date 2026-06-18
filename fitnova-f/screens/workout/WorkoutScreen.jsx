import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import { useEffect, useState } from 'react';

import exerciseAPI from '../../api/exerciseApi';

const bodyParts = [
  'all',
  'chest',
  'back',
  'shoulders',
  'upper arms',
  'lower arms',
  'upper legs',
  'lower legs',
  'waist',
  'cardio',
];

export default function WorkoutScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [selectedBodyPart, setSelectedBodyPart] = useState('all');

  const fetchExercises = async () => {
    try {
      const res = await exerciseAPI.get('/exercises?limit=300');

      setExercises(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#071e00]">
        <ActivityIndicator size="large" color="#3efe18" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#071e00] px-5 pt-16">
      <Text className="text-4xl font-bold text-white">Exercises</Text>

      <Text className="mt-2 text-gray-400">
        {
          exercises.filter((exercise) =>
            selectedBodyPart === 'all' ? true : exercise.bodyPart === selectedBodyPart
          ).length
        }{' '}
        exercises found
      </Text>

      <TextInput
        placeholder="Search exercise..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
        className="mt-6 rounded-2xl bg-[#112b0a] p-5 text-white"
      />

      {/* BODY PART FILTER */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-6">
        {bodyParts.map((part) => {
          const selected = selectedBodyPart === part;

          return (
            <TouchableOpacity
              key={part}
              onPress={() => setSelectedBodyPart(part)}
              className={`mr-3 rounded-2xl px-6 py-3 ${
                selected ? 'bg-[#3efe18]' : 'bg-[#112b0a]'
              }`}>
              <Text
                className={`font-semibold capitalize ${selected ? 'text-black' : 'text-white'}`}>
                {part}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {exercises
        .filter((exercise) => {
          // SEARCH FILTER
          const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());

          // BODY PART FILTER
          const matchesBodyPart =
            selectedBodyPart === 'all' ? true : exercise.bodyPart === selectedBodyPart;

          return matchesSearch && matchesBodyPart;
        })
        .map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            onPress={() =>
              navigation.navigate('ExerciseDetail', {
                exercise,
              })
            }
            className="mt-5 flex-row rounded-3xl bg-[#112b0a] p-4">
            {/* GIF */}
            <Image
              source={{
                uri: exercise.gifUrl,
              }}
              className="h-28 w-28 rounded-2xl"
              resizeMode="cover"
            />

            {/* DETAILS */}
            <View className="ml-4 flex-1 justify-center">
              <Text className="text-xl font-bold capitalize text-white">{exercise.name}</Text>

              {/* BODY PART */}
              <View className="mt-3 flex-row">
                <View className="mr-2 rounded-xl bg-[#1d3d13] px-3 py-1">
                  <Text className="text-xs capitalize text-[#3efe18]">{exercise.bodyPart}</Text>
                </View>

                <View className="rounded-xl bg-[#1d3d13] px-3 py-1">
                  <Text className="text-xs capitalize text-[#3efe18]">{exercise.target}</Text>
                </View>
              </View>

              {/* DIFFICULTY */}
              <Text className="mt-3 capitalize text-gray-400">
                {exercise.difficulty} • {exercise.category}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

      {exercises.filter((exercise) => {
        const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());

        const matchesBodyPart =
          selectedBodyPart === 'all' ? true : exercise.bodyPart === selectedBodyPart;

        return matchesSearch && matchesBodyPart;
      }).length === 0 && (
        <View className="mt-20 items-center">
          <Text className="text-lg text-gray-400">No exercises found</Text>
        </View>
      )}

      <View className="h-32" />
    </ScrollView>
  );
}
