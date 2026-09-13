import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
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

// Memoized Exercise Item to prevent unnecessary re-renders on scroll
const ExerciseCard = memo(({ item, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => onPress(item)}
    className="mb-4 flex-row items-center rounded-3xl border border-[#017374]/15 bg-white p-3.5 shadow-sm">
    {/* GIF THUMBNAIL */}
    <Image
      source={{ uri: item.gifUrl }}
      className="h-24 w-24 rounded-2xl bg-[#EBF7F4]"
      resizeMode="cover"
    />

    {/* DETAILS */}
    <View className="ml-4 flex-1 justify-center">
      <Text className="text-base font-bold capitalize text-[#014041]" numberOfLines={1}>
        {item.name}
      </Text>

      {/* BODY PART & TARGET PILLS */}
      <View className="mt-2 flex-row flex-wrap">
        <View className="mr-2 rounded-lg bg-[#017374]/15 px-2.5 py-0.5 border border-[#017374]/25">
          <Text className="text-[10px] font-bold capitalize text-[#017374]">
            {item.bodyPart}
          </Text>
        </View>

        <View className="rounded-lg bg-[#D8F3EB] px-2.5 py-0.5 border border-[#017374]/20">
          <Text className="text-[10px] font-bold capitalize text-[#017374]">
            {item.target}
          </Text>
        </View>
      </View>

      <Text className="mt-2 text-xs font-medium capitalize text-[#025C5D]">
        {item.difficulty || 'Intermediate'} • {item.category || 'Strength'}
      </Text>
    </View>

    <Ionicons name="chevron-forward" size={20} color="#3A7574" className="mr-2" />
  </TouchableOpacity>
));

export default function WorkoutScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');

  const fetchExercises = async () => {
    try {
      const res = await exerciseAPI.get('/exercises?limit=500');
      setExercises(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleSelectExercise = useCallback(
    (exercise) => {
      navigation?.navigate('ExerciseDetail', { exercise });
    },
    [navigation]
  );

  const filteredExercises = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    if (!Array.isArray(exercises)) return [];
    return exercises.filter((exercise) => {
      if (!exercise) return false;
      const matchesSearch =
        !searchLower || (exercise.name && exercise.name.toLowerCase().includes(searchLower));
      const itemBodyPart = (exercise.bodyPart || '').toLowerCase();
      const matchesBodyPart =
        selectedBodyPart === 'all'
          ? true
          : itemBodyPart === selectedBodyPart.toLowerCase();
      return matchesSearch && matchesBodyPart;
    });
  }, [exercises, search, selectedBodyPart]);

  const renderItem = useCallback(
    ({ item }) => <ExerciseCard item={item} onPress={handleSelectExercise} />,
    [handleSelectExercise]
  );

  const keyExtractor = useCallback((item) => String(item.id || item._id || item.name), []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EBF7F4]">
        <ActivityIndicator size="large" color="#017374" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#EBF7F4]">
      <FlatList
        data={filteredExercises}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 110 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          <View className="mb-5">
            {/* TITLE & HEADER */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-black text-[#014041]">Exercise Library</Text>
                <Text className="mt-1 text-xs font-semibold text-[#3A7574]">
                  {filteredExercises.length} exercises found
                </Text>
              </View>
              <View className="rounded-2xl bg-[#017374]/15 px-3.5 py-1.5 border border-[#017374]/25">
                <Text className="text-xs font-bold uppercase text-[#017374]">PRO</Text>
              </View>
            </View>

            {/* SEARCH BAR */}
            <View className="mt-6 flex-row items-center rounded-2xl border border-[#017374]/20 bg-white px-4 py-1 shadow-sm">
              <Ionicons name="search-outline" size={20} color="#3A7574" />
              <TextInput
                placeholder="Search exercise by name..."
                placeholderTextColor="#3A7574"
                value={search}
                onChangeText={setSearch}
                className="flex-1 py-3 text-md text-[#014041] ml-3"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#3A7574" />
                </TouchableOpacity>
              )}
            </View>

            {/* BODY PART FILTER */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-5 flex-row">
              {bodyParts.map((part) => {
                const selected = selectedBodyPart === part;
                return (
                  <TouchableOpacity
                    key={part}
                    activeOpacity={0.8}
                    onPress={() => setSelectedBodyPart(part)}
                    className={`mr-2.5 rounded-2xl px-5 py-2.5 border ${
                      selected
                        ? 'border-[#017374] bg-[#017374]'
                        : 'border-[#017374]/20 bg-white shadow-sm'
                    }`}>
                    <Text
                      className={`text-xs font-bold capitalize ${
                        selected ? 'text-white' : 'text-[#025C5D]'
                      }`}>
                      {part}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View className="mt-16 items-center">
            <Ionicons name="search-disagree" size={48} color="#3A7574" />
            <Text className="mt-4 text-base font-semibold text-[#025C5D]">No exercises found</Text>
            <Text className="mt-1 text-xs text-[#3A7574]">Try searching for a different term</Text>
          </View>
        }
      />
    </View>
  );
}
