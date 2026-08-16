import { View, Text, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  return (
    <ScrollView className="flex-1 bg-[#0B0E14] px-5 pt-16">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-black text-white">Analytics</Text>
          <Text className="mt-1 text-xs font-semibold text-slate-400">Track your overall growth</Text>
        </View>
        <View className="rounded-2xl bg-[#10B981]/10 px-3.5 py-1.5 border border-[#10B981]/20">
          <Text className="text-xs font-bold uppercase text-[#10B981]">THIS WEEK</Text>
        </View>
      </View>

      {/* CHART CARD */}
      <View className="mt-6 rounded-3xl border border-slate-800 bg-[#151B26] p-5 shadow-xl">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-lg font-bold text-white">Body Weight</Text>
            <Text className="text-xs font-medium text-slate-400">Target: 75.0 kg</Text>
          </View>
          <View className="flex-row items-center rounded-xl bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text className="ml-1 text-xs font-bold text-[#10B981]">+2.0 kg</Text>
          </View>
        </View>

        <LineChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                data: [72.0, 72.3, 72.8, 73.1, 73.5, 73.8, 74.0],
              },
            ],
          }}
          width={screenWidth - 64}
          height={210}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundGradientFrom: '#151B26',
            backgroundGradientTo: '#151B26',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: () => '#94A3B8',
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#10B981',
              fill: '#0B0E14',
            },
          }}
          bezier
          style={{
            borderRadius: 16,
            marginVertical: 8,
          }}
        />
      </View>

      {/* METRICS GRID */}
      <Text className="mt-8 mb-4 text-xl font-bold text-white">Performance Metrics</Text>
      
      <View className="flex-row flex-wrap justify-between">
        {/* Metric 1 */}
        <View className="mb-4 w-[48%] rounded-3xl border border-slate-800 bg-[#151B26] p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-slate-400">Total Workouts</Text>
            <View className="rounded-xl bg-emerald-500/10 p-2">
              <MaterialCommunityIcons name="dumbbell" size={20} color="#10B981" />
            </View>
          </View>
          <Text className="mt-3 text-3xl font-black text-white">18</Text>
          <Text className="mt-1 text-xs text-slate-400">This month</Text>
        </View>

        {/* Metric 2 */}
        <View className="mb-4 w-[48%] rounded-3xl border border-slate-800 bg-[#151B26] p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-slate-400">Total Volume</Text>
            <View className="rounded-xl bg-cyan-500/10 p-2">
              <MaterialCommunityIcons name="weight-kilogram" size={20} color="#06B6D4" />
            </View>
          </View>
          <Text className="mt-3 text-3xl font-black text-white">12.4t</Text>
          <Text className="mt-1 text-xs text-cyan-400">Cumulative weight</Text>
        </View>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
}
