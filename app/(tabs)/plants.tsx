import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, Leaf } from 'lucide-react-native';
import { usePlants } from '@/hooks/usePlants';
import { PlantCard } from '@/components/PlantCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function PlantsScreen() {
  const router = useRouter();
  const { plants, loading, error, loadPlants } = usePlants();

  useFocusEffect(
    useCallback(() => {
      loadPlants();
    }, [loadPlants])
  );

  useEffect(() => {
    loadPlants();
    const interval = setInterval(loadPlants, 5000);
    return () => clearInterval(interval);
  }, [loadPlants]);

  const renderItem = useCallback(
    ({ item }: any) => (
      <PlantCard
        plant={item}
        onPress={() => router.push(`/plant/${item.id}`)}
      />
    ),
    [router]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Plants</Text>
          <Text style={styles.subtitle}>
            {plants.length} plant{plants.length !== 1 ? 's' : ''} in your garden
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/add-plant')}
          activeOpacity={0.8}
        >
          <Plus size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {loading && plants.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary[500]}
          style={styles.loader}
        />
      ) : plants.length === 0 ? (
        <EmptyState
          icon={<Leaf size={36} color={Colors.primary[400]} />}
          title="No plants yet"
          subtitle="Add your first plant and attach a smart device to start monitoring."
          action={
            <Button
              label="Add Your First Plant"
              onPress={() => router.push('/add-plant')}
              icon={<Plus size={16} color={Colors.white} />}
            />
          }
        />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadPlants}
              tintColor={Colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.muted,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { flex: 1 },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
});
