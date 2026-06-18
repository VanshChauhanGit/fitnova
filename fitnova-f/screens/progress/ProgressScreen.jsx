import { View, Text, Dimensions, ScrollView } from 'react-native';

import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  return (
    <ScrollView className="flex-1 bg-[#071e00] px-5 pt-16">
      <Text className="text-4xl font-bold text-white">Progress</Text>

      <Text className="mt-2 text-gray-400">Your fitness analytics</Text>

      <View className="mt-8 rounded-3xl bg-[#112b0a] p-4">
        <Text className="mb-6 text-xl font-bold text-white">Weight Progress</Text>

        <LineChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets: [
              {
                data: [72, 72.5, 73, 73.4, 74],
              },
            ],
          }}
          width={screenWidth - 60}
          height={220}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundGradientFrom: '#112b0a',
            backgroundGradientTo: '#112b0a',
            decimalPlaces: 1,

            color: (opacity = 1) => `rgba(62, 254, 24, ${opacity})`,

            labelColor: () => '#fff',
          }}
          bezier
          style={{
            borderRadius: 20,
          }}
        />
      </View>

      <View className="h-32" />
    </ScrollView>
  );
}
