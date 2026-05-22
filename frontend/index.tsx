import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { api, Place } from '@/lib/api';
import { colors, spacing, fontSizes } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

// Simple filter chip component
function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: selected ? colors.primary : colors.card, borderColor: colors.primary }
      ]}
      onPress={onPress}
    >
      <Text style={{ color: selected ? colors.background : colors.primary, fontSize: fontSizes.sm }}>{label}</Text>
    </TouchableOpacity>
  );
}

// Placeholder skeleton while loading
function LoadingSkeleton() {
  return (
    <View style={{ padding: spacing.md }}>
      {[...Array(5)].map((_, index) => (
        <View
          key={index}
          style={{ height: 80, backgroundColor: colors.card, marginBottom: spacing.sm, borderRadius: 8 }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'cheap', label: 'Cheap Food' },
    { id: 'hidden', label: 'Hidden Gems' },
    { id: 'hostel', label: 'Hostels' },
    { id: 'hotel', label: 'Hotels' },
    { id: 'auto', label: 'Auto Service' }
  ];

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);
      try {
        const res = await api.getPlaces();
        setPlaces(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, []);

  const filtered = selectedCategory
    ? places.filter((p) => p.category_id === selectedCategory)
    : places;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: spacing.md }}>
        <Text style={{ color: colors.primary, fontSize: fontSizes.lg, fontWeight: 'bold' }}>PaydMap</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Discover hidden gems and cheap eats</Text>
      </View>
      {/* Filter Chips */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        style={{ marginBottom: spacing.sm }}
        renderItem={({ item }) => (
          <FilterChip
            label={item.label}
            selected={selectedCategory === item.id}
            onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
          />
        )}
      />
      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={{ color: colors.error, marginTop: spacing.sm }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <Link href={`/places/${item.id}`} asChild>
              <TouchableOpacity style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.cardSubtitle} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
                    <Ionicons name="star" size={14} color={colors.primary} />
                    <Text style={{ color: colors.primary, marginLeft: 4 }}>
                      {item.rating?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600'
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: 4
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: spacing.sm
  }
});